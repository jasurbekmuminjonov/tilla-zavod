const mongoose = require("mongoose");
const ToolReturn = require("../models/toolReturn.model");
const ToolDistribution = require("../models/toolDistribution.model");
const Tool2 = require("../models/tool2Model");
const Tool3 = require("../models/tool3Model");

const { getInventoryModel } = require("../inventory/inventory.registry");

exports.createReturnRequest = async (req, res) => {
  try {
    const { user_id } = req.user; // hodim
    const { distributionId, itemId, quantity, note = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(distributionId)) {
      return res.status(400).json({ message: "distributionId noto'g'ri" });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "itemId noto'g'ri" });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Noto'g'ri miqdor" });
    }

    // item haqiqatdan shu hodimniki va ochiq distribution ichidami tekshiramiz
    const dist = await ToolDistribution.findOne({
      _id: distributionId,
      employeeId: user_id,
      closed: false,
      "products._id": itemId,
    });

    if (!dist) {
      return res.status(404).json({ message: "Ochiq item topilmadi" });
    }

    const item = dist.products.id(itemId);
    if (!item) return res.status(404).json({ message: "Item topilmadi" });

    if (Number(item.quantity) < qty) {
      return res
        .status(400)
        .json({ message: "Qaytarish miqdori mavjud miqdordan katta" });
    }

    const doc = await ToolReturn.create({
      employeeId: user_id,
      distributionId,
      itemId,
      productId: item.productId,
      quantity: qty,
      note,
      status: "pending",
    });

    // (ixtiyoriy) adminlarga socket xabar
    const io = req.app.get("socket");
    if (io) io.emit("toolReturn:new", "Yangi qaytarish so'rovi keldi");

    return res.status(201).json({ message: "So'rov yuborildi", data: doc });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

exports.getReturnRequests = async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 20, 1);

    const filter = {};
    if (status) filter.status = status;

    const data = await ToolReturn.find(filter)
      .populate("employeeId", "name")
      .populate("productId", "name price")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);

    const total = await ToolReturn.countDocuments(filter);

    return res
      .status(200)
      .json({ data, total, page: pageNum, limit: pageSize });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

exports.acceptReturnRequest = async (req, res) => {
  try {
    const { user_id } = req.user; // admin
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "id noto'g'ri" });
    }

    const ret = await ToolReturn.findOne({ _id: id, status: "pending" });
    if (!ret)
      return res.status(404).json({ message: "Pending so'rov topilmadi" });

    let distrubution = await ToolDistribution.findOne({
      _id: ret.distributionId,
      employeeId: ret.employeeId,
      closed: false,
      "products._id": ret.itemId,
    });
    if (!distrubution)
      return res.status(404).json({ message: "Distribution topilmadi" });

    let ombor = await getInventoryModel(distrubution.entity);
    // 1) omborni ko'paytirish
    await ombor.findByIdAndUpdate(ret.productId, {
      $inc: { quantity: ret.quantity },
    });

    // 2) hodim distribution itemidan qty kamaytirish yoki o'chirish
    const dist = await ToolDistribution.findOne({
      _id: ret.distributionId,
      employeeId: ret.employeeId,
      closed: false,
      "products._id": ret.itemId,
    });

    if (dist) {
      const item = dist.products.id(ret.itemId);
      if (item) {
        const oldQty = Number(item.quantity || 0);
        if (ret.quantity >= oldQty) {
          item.deleteOne(); // itemni o'chiramiz
        } else {
          item.quantity = oldQty - ret.quantity;
        }
        await dist.save();
      }
    }

    // 3) so'rovni accepted qilish
    ret.status = "accepted";
    ret.acceptedAt = new Date();
    ret.acceptedBy = user_id;
    await ret.save();

    // socket: hodimga xabar
    const io = req.app.get("socket");
    if (io) {
      io.emit(
        `toolReturn:accepted:${ret.employeeId}`,
        "Qaytarish so'rovingiz qabul qilindi",
      );
    }

    return res.status(200).json({ message: "Qabul qilindi", data: ret });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};

exports.cancelReturnRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "id noto'g'ri" });
    }

    const ret = await ToolReturn.findOneAndDelete({
      _id: id,
      status: "pending",
    });
    if (!ret)
      return res.status(404).json({ message: "Pending so'rov topilmadi" });

    // socket: hodimga xabar (ixtiyoriy)
    const io = req.app.get("socket");
    if (io)
      io.emit(
        `toolReturn:cancelled:${ret.employeeId}`,
        "Qaytarish so'rovingiz rad etildi",
      );

    return res
      .status(200)
      .json({ message: "So'rov bekor qilindi (o'chirildi)" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", err: err?.message });
  }
};
