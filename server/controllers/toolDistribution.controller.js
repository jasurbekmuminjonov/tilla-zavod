const Tool2 = require("../models/tool2Model");
const Tool3 = require("../models/tool3Model"); // ✅
const ToolDistribution = require("../models/toolDistribution.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

const INVENTORY = {
  tool2: { model: Tool2, ref: "Tool2" },
  tool3: { model: Tool3, ref: "Tool3" },
};

function getInv(entity) {
  const inv = INVENTORY[String(entity || "").toLowerCase()];
  return inv || null;
}

exports.createDistribution = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { entity } = req.params; // ✅ tool2/tool3
    const inv = getInv(entity);

    if (!inv)
      return res
        .status(400)
        .json({ message: "entity noto'g'ri (tool2/tool3)" });

    const { productId, employeeId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ message: "productId noto'g'ri" });

    if (!mongoose.Types.ObjectId.isValid(employeeId))
      return res.status(400).json({ message: "employeeId noto'g'ri" });

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0)
      return res.status(400).json({ message: "Noto'g'ri miqdor" });

    const user = await User.findById(user_id);
    if (!user)
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Hodim topilmadi" });

    // ✅ 1) Ombordan kamaytirish (Tool2 yoki Tool3)
    const updatedProduct = await inv.model.findOneAndUpdate(
      { _id: productId, quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(400).json({ message: "Omborda yetarli mahsulot yo'q" });
    }

    // ✅ 2) Hodimning ochiq distributioni (entity bo‘yicha alohida)
    const distribution = await ToolDistribution.findOneAndUpdate(
      { employeeId, entity: String(entity), closed: false },
      {
        $setOnInsert: {
          employeeId,
          entity: String(entity),
          closed: false,
          closedAt: null,
        },
        $push: {
          products: {
            productId,
            productRef: inv.ref, // ✅ "Tool2" yoki "Tool3"
            quantity: qty,
          },
        },
      },
      { new: true, upsert: true },
    )
      .populate("employeeId", "name")
      .populate("products.productId");

    // socket
    const io = req.app.get("socket");
    if (io) {
      io.emit(
        `distribution:new:${employeeId}`,
        "Sizga yangi ehtiyot qism berildi",
      );
    }

    return res.status(201).json({
      message: "Ma'lumot saqlandi",
      data: distribution,
      productLeft: updatedProduct.quantity,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

exports.getDistributions = async (req, res) => {
  try {
    const { entity } = req.params;
    const inv = getInv(entity);
    if (!inv)
      return res
        .status(400)
        .json({ message: "entity noto'g'ri (tool2/tool3)" });

    const {
      employeeId,
      page = 1,
      limit = 10,
      productName,
      startDate,
      endDate,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);

    const filter = { closed: false, entity: String(entity) };

    if (employeeId) {
      if (!mongoose.Types.ObjectId.isValid(employeeId))
        return res.status(400).json({ message: "employeeId noto'g'ri" });
      filter.employeeId = new mongoose.Types.ObjectId(employeeId);
    }

    // date filter: products.createdAt
    if (startDate || endDate) {
      const range = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        range.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        range.$lte = e;
      }
      filter["products.createdAt"] = range;
    }

    // productName -> inventory model’dan topamiz (Tool2 yoki Tool3)
    if (productName && String(productName).trim()) {
      const q = String(productName).trim().replace(/["']/g, "");
      const matched = await inv.model
        .find({ name: { $regex: q, $options: "i" } })
        .select("_id");

      const ids = matched.map((p) => p._id);
      if (ids.length === 0) {
        return res
          .status(200)
          .json({ data: [], total: 0, page: pageNum, limit: pageSize });
      }
      filter["products.productId"] = { $in: ids };
      filter["products.productRef"] = inv.ref; // ✅ xavfsizlik
    }

    const data = await ToolDistribution.find(filter)
      .populate("employeeId", "name")
      .populate("products.productId") // ✅ refPath ishlaydi
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);

    const total = await ToolDistribution.countDocuments(filter);

    const invCollection = inv.model.collection.name; // ✅ Tool2 yoki Tool3 collection nomi

    const totalPriceAgg = await ToolDistribution.aggregate([
      { $match: filter }, // ✅ aynan shu filter bilan hisobla
      { $unwind: "$products" },

      // xavfsizlik (agar aralash bo'lib ketgan bo'lsa)
      { $match: { "products.productRef": inv.ref } },

      {
        $lookup: {
          from: invCollection,
          localField: "products.productId",
          foreignField: "_id",
          as: "p",
        },
      },
      { $unwind: { path: "$p", preserveNullAndEmptyArrays: true } },

      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: [
                "$products.quantity",
                {
                  // narx fieldingiz qaysi bo'lsa shuni qoldiring:
                  // price bo'lsa "$p.price", sellPrice bo'lsa "$p.sellPrice"
                  $ifNull: ["$p.price", { $ifNull: ["$p.sellPrice", 0] }],
                },
              ],
            },
          },
        },
      },
    ]);

    const totalPrice = totalPriceAgg?.[0]?.total || 0;

    return res.status(200).json({
      data,
      total,
      page: pageNum,
      limit: pageSize,
      totalPrice,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

exports.getDistributionById = async (req, res) => {
  try {
    const { id } = req.params;

    const distribution = await ToolDistribution.findById(id)
      .populate("employeeId", "name")
      .populate("products.productId"); // ✅ endi shu kerak

    if (!distribution) {
      return res.status(404).json({ message: "Taqsimlash topilmadi" });
    }

    return res.status(200).json(distribution);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

exports.updateDistributionItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const newQty = Number(quantity);
    if (!Number.isFinite(newQty) || newQty <= 0) {
      return res.status(400).json({ message: "Noto'g'ri miqdor" });
    }

    // 1) distribution + eski itemni topamiz
    const dist = await ToolDistribution.findOne(
      { "products._id": itemId },
      { employeeId: 1, products: 1 },
    );

    if (!dist) return res.status(404).json({ message: "Item topilmadi" });

    const item = dist.products.id(itemId);
    if (!item) return res.status(404).json({ message: "Item topilmadi" });

    const oldQty = Number(item.quantity || 0);
    const diff = newQty - oldQty; // + bo'lsa ombordan kamayadi, - bo'lsa omborga qaytadi

    // 2) ombor update (atomik)
    if (diff > 0) {
      const updatedProduct = await Tool2.findOneAndUpdate(
        { _id: item.productId, quantity: { $gte: diff } },
        { $inc: { quantity: -diff } },
        { new: true },
      );
      if (!updatedProduct) {
        return res
          .status(400)
          .json({ message: "Omborda yetarli mahsulot yo'q" });
      }
    } else if (diff < 0) {
      await Tool2.findByIdAndUpdate(item.productId, {
        $inc: { quantity: Math.abs(diff) },
      });
    }

    // 3) item quantity ni yangilash
    item.quantity = newQty;
    await dist.save();

    return res.status(200).json({
      message: "Taqsimlash item yangilandi",
      data: { distributionId: dist._id, itemId, quantity: newQty },
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

exports.deleteDistributionItem = async (req, res) => {
  try {
    const { entity, distributionId, itemId } = req.params;
    const inv = getInv(entity);
    if (!inv)
      return res
        .status(400)
        .json({ message: "entity noto'g'ri (tool2/tool3)" });

    if (!mongoose.Types.ObjectId.isValid(distributionId))
      return res.status(400).json({ message: "distributionId noto'g'ri" });

    if (!mongoose.Types.ObjectId.isValid(itemId))
      return res.status(400).json({ message: "itemId noto'g'ri" });

    const dist = await ToolDistribution.findOne({
      _id: distributionId,
      entity: String(entity),
      closed: false,
      "products._id": itemId,
    });

    if (!dist)
      return res.status(404).json({ message: "Item topilmadi yoki yopilgan" });

    const item = dist.products.id(itemId);
    if (!item) return res.status(404).json({ message: "Item topilmadi" });

    // ✅ faqat shu entity modeliga qaytariladi
    if (String(item.productRef) !== inv.ref) {
      return res
        .status(400)
        .json({ message: "Item bu entityga tegishli emas" });
    }

    const qty = Number(item.quantity || 0);
    if (!Number.isFinite(qty) || qty <= 0)
      return res.status(400).json({ message: "Item quantity noto'g'ri" });

    const productId = item.productId;

    // itemni o'chiramiz
    item.deleteOne();

    if (dist.products.length === 0) {
      await ToolDistribution.findByIdAndDelete(dist._id);
    } else {
      await dist.save();
    }

    // ✅ omborga qaytarish
    await inv.model.findByIdAndUpdate(productId, { $inc: { quantity: qty } });

    const io = req.app.get("socket");
    if (io) {
      io.emit(
        `distribution:deleted:${String(dist.employeeId)}`,
        "Mahsulot taqsimlanishi bekor qilindi",
      );
    }

    return res.status(200).json({
      message: "Item o'chirildi va omborga qaytarildi",
      returned: { productId, quantity: qty },
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

// Return meta info: distinct products and employees present in distributions
exports.getDistributionMeta = async (req, res) => {
  try {
    const productIds = await ToolDistribution.distinct("products.productId");
    const employeeIds = await ToolDistribution.distinct("employeeId");

    const products = await Tool2.find({ _id: { $in: productIds } }).select(
      "name",
    );
    const employees = await User.find({ _id: { $in: employeeIds } }).select(
      "name",
    );

    const employeesByProduct = {};
    for (const pid of productIds) {
      const eIds = await ToolDistribution.distinct("employeeId", {
        "products.productId": pid,
      });
      const docs = await User.find({ _id: { $in: eIds } }).select("name");
      employeesByProduct[String(pid)] = docs;
    }

    return res.status(200).json({ products, employees, employeesByProduct });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

exports.closeDistribution = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "distribution id noto'g'ri" });
    }

    const updated = await ToolDistribution.findOneAndUpdate(
      { _id: id, closed: false },
      { $set: { closed: true, closedAt: new Date() } },
      { new: true },
    )
      .populate("employeeId", "name")
      .populate("products.productId");

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Ochiq item topilmadi yoki allaqachon yopilgan" });
    }

    // socket (ixtiyoriy)
    const io = req.app.get("socket");
    if (io) {
      io.emit(
        `distribution:closed:${updated.employeeId?._id || updated.employeeId}`,
        "Ochiq item yopildi",
      );
    }

    return res.status(200).json({ message: "Item yopildi", data: updated });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

exports.deleteDistributionItem = async (req, res) => {
  try {
    const { distributionId, itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(distributionId)) {
      return res.status(400).json({ message: "distributionId noto'g'ri" });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "itemId noto'g'ri" });
    }

    // 1) Distributionni topamiz (faqat open bo'lsa)
    const dist = await ToolDistribution.findOne({
      _id: distributionId,
      closed: false,
      "products._id": itemId,
    });

    if (!dist) {
      return res.status(404).json({ message: "Item topilmadi yoki yopilgan" });
    }

    // 2) itemni ajratib olamiz
    const item = dist.products.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item topilmadi" });
    }

    const productId = item.productId;
    const qty = Number(item.quantity || 0);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "productId noto'g'ri" });
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Item quantity noto'g'ri" });
    }

    // 3) Itemni distdan o'chiramiz
    item.deleteOne();

    // 4) Agar products bo'sh qolsa => distributionni o'chiramiz (yoki yopamiz)
    let deletedDistribution = false;

    if (dist.products.length === 0) {
      await ToolDistribution.findByIdAndDelete(dist._id);
      deletedDistribution = true;
    } else {
      await dist.save();
    }

    // 5) Omborga qaytarish (+qty)
    await Tool2.findByIdAndUpdate(productId, { $inc: { quantity: qty } });

    // 6) socket (ixtiyoriy) - hodimga bildirishnoma
    const io = req.app.get("socket");
    if (io) {
      io.emit(
        `distribution:deleted:${String(dist.employeeId)}`,
        "Mahsulot taqsimlanishi bekor qilindi",
      );
    }

    return res.status(200).json({
      message: "Item o'chirildi va omborga qaytarildi",
      deletedDistribution,
      returned: { productId, quantity: qty },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Serverda xatolik",
      err: err?.message,
    });
  }
};
