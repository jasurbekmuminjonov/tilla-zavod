const User = require("../models/user.model");
const Tool2 = require("../models/tool2Model");
const ToolDistribution = require("../models/toolDistribution.model");

exports.createDistribution = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { productId, employeeId, quantity } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    const product = await Tool2.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Mahsulot topilmadi" });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Hodim topilmadi" });
    }

    // tekshirish: omborda yetarli miqdor bormi
    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({ message: "Noto'g'ri miqdor" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Omborda yetarli mahsulot yo'q" });
    }

    // ombordagi miqdorni kamaytirish
    product.quantity = product.quantity - quantity;
    await product.save();

    const distribution = await ToolDistribution.create({
      productId,
      employeeId,
      quantity,
    });

    // Emit socket event to the employee - simple text message
    const io = req.app.get("socket");
    if (io) {
      io.emit(`distribution:new:${employeeId}`, "Sizga yangi ehtiyot qism berildi");
    }

    res.status(201).json({ message: "Ma'lumot saqlandi", data: distribution });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getDistributions = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      employeeId,
      productId,
      productName,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (employeeId) filter.employeeId = employeeId;
    if (productId) filter.productId = productId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = e;
      }
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);

    let distributions = await ToolDistribution.find(filter)
      .populate("productId")
      .populate("employeeId", "name")
      .sort("-createdAt");

    // Filter by product name if provided
    if (productName) {
      const lowerName = productName.toLowerCase();
      distributions = distributions.filter((d) =>
        d.productId?.name?.toLowerCase().includes(lowerName),
      );
    }

    const total = distributions.length;
    distributions = distributions.slice(
      (pageNum - 1) * pageSize,
      pageNum * pageSize,
    );

    res.status(200).json({ data: distributions, total });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getDistributionById = async (req, res) => {
  try {
    const { id } = req.params;

    const distribution = await ToolDistribution.findById(id)
      .populate("productId")
      .populate("employeeId", "name");

    if (!distribution) {
      return res.status(404).json({ message: "Taqsimlash topilmadi" });
    }

    res.status(200).json(distribution);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.updateDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const distribution = await ToolDistribution.findById(id);
    if (!distribution) {
      return res.status(404).json({ message: "Taqsimlash topilmadi" });
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({ message: "Noto'g'ri miqdor" });
    }

    // yuklanayotgan mahsulotni topamiz
    const product = await Tool2.findById(distribution.productId);
    if (!product) {
      return res.status(404).json({ message: "Mahsulot topilmadi" });
    }

    const oldQty = distribution.quantity;
    const diff = quantity - oldQty; // ijobiy bo'lsa ombordan kamaytirish kerak

    if (diff > 0) {
      if (product.quantity < diff) {
        return res
          .status(400)
          .json({ message: "Omborda yetarli mahsulot yo'q" });
      }
      product.quantity = product.quantity - diff;
    } else if (diff < 0) {
      product.quantity = product.quantity + Math.abs(diff);
    }

    distribution.quantity = quantity;

    await product.save();
    await distribution.save();

    res
      .status(200)
      .json({ message: "Taqsimlash yangilandi", data: distribution });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.deleteDistribution = async (req, res) => {
  try {
    const { id } = req.params;

    const distribution = await ToolDistribution.findById(id);
    if (!distribution) {
      return res.status(404).json({ message: "Taqsimlash topilmadi" });
    }

    const product = await Tool2.findById(distribution.productId);
    if (product) {
      product.quantity = (product.quantity || 0) + distribution.quantity;
      await product.save();
    }

    await ToolDistribution.findByIdAndDelete(id);

    // Emit socket event to the employee - notify them of deletion
    const io = req.app.get("socket");
    if (io) {
      io.emit(`distribution:deleted:${distribution.employeeId}`, "Mahsulot taqsimlanishi bekor qilindi");
    }

    res.status(200).json({ message: "Taqsimlash o'chirildi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

// Return meta info: distinct products and employees present in distributions
exports.getDistributionMeta = async (req, res) => {
  try {
    // distinct productIds and employeeIds
    const productIds = await ToolDistribution.distinct("productId");
    const employeeIds = await ToolDistribution.distinct("employeeId");

    // fetch product and employee docs
    const products = await Tool2.find({ _id: { $in: productIds } }).select(
      "name",
    );
    const employees = await User.find({ _id: { $in: employeeIds } }).select(
      "name",
    );

    // build employees per product map
    const employeesByProduct = {};
    for (const pid of productIds) {
      const eIds = await ToolDistribution.distinct("employeeId", {
        productId: pid,
      });
      const docs = await User.find({ _id: { $in: eIds } }).select("name");
      employeesByProduct[pid] = docs;
    }

    res.status(200).json({ products, employees, employeesByProduct });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
