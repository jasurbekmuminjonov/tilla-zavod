const Astatka = require("../models/astatka.model");
const User = require("../models/user.model");
const Gold = require("../models/gold.model");
const Product = require("../models/product.model");
const Process = require("../models/process.model");
const Transportion = require("../models/transportion.model");
const mongoose = require("mongoose");

exports.createAstatka = async (req, res) => {
  try {
    const {
      total_import,
      total_export,
      total_losses,
      total_product,
      real_astatka,
      calculated_astatka,
    } = req.body;
    const { factory_id } = req.user;

    const difference = calculated_astatka - real_astatka;
    req.body.factory_id = factory_id;
    req.body.difference = difference;
    await Astatka.create(req.body);
    res.json({ message: "Astatka saqlandi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getAstatka = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const user = await User.findById(user_id);
    let data;
    if (user.role === "admin") {
      data = await Astatka.find({ factory_id })
        .populate("user_id")
        .sort("-createdAt");
    } else {
      data = await Astatka.find({ factory_id, user_id })
        .populate("user_id")
        .sort("-createdAt");
    }
    res.json(data);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getAstatkaLatestSummary = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const user = await User.findById(user_id);

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Faqat admin ko‘ra oladi" });
    }

    const factoryObjectId = new mongoose.Types.ObjectId(factory_id);

    const [
      goldAgg,
      productAgg,
      processAgg,
      givedAgg,
      getAgg,
      users,
    ] = await Promise.all([
      Gold.aggregate([
        {
          $match: {
            factory_id: factoryObjectId,
            user_id: { $ne: null },
          },
        },
        { $group: { _id: "$user_id", total: { $sum: "$gramm" } } },
      ]),
      Product.aggregate([
        { $match: { factory_id: factoryObjectId } },
        { $group: { _id: "$user_id", total: { $sum: "$total_gramm" } } },
      ]),
      Process.aggregate([
        { $match: { factory_id: factoryObjectId } },
        {
          $group: {
            _id: "$user_id",
            total: { $sum: { $ifNull: ["$lost_gramm", 0] } },
          },
        },
      ]),
      Transportion.aggregate([
        { $match: { factory_id: factoryObjectId } },
        { $group: { _id: "$from_id", total: { $sum: "$gramm" } } },
      ]),
      Transportion.aggregate([
        { $match: { factory_id: factoryObjectId } },
        { $group: { _id: "$to_id", total: { $sum: "$gramm" } } },
      ]),
      User.find({ factory_id, role: "user" }).select("_id name"),
    ]);

    const mapById = (rows) =>
      new Map(rows.map((r) => [String(r._id), r.total || 0]));

    const goldMap = mapById(goldAgg);
    const productMap = mapById(productAgg);
    const lossMap = mapById(processAgg);
    const givedMap = mapById(givedAgg);
    const getMap = mapById(getAgg);

    const data = users.map((u) => {
      const id = String(u._id);
      const kirgan = goldMap.get(id) || 0;
      const gived = givedMap.get(id) || 0;
      const get = getMap.get(id) || 0;
      const totalLoss = lossMap.get(id) || 0;
      const tovar = productMap.get(id) || 0;

      const real_astatka = kirgan - (gived - get) - totalLoss - tovar;

      return {
        user_id: u._id,
        user_name: u.name,
        real_astatka,
        total_import: kirgan,
        total_export: gived,
        total_get: get,
        total_losses: totalLoss,
        total_product: tovar,
      };
    });

    return res.status(200).json(data);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.editAstatka = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const user = await User.findById(user_id);
    if (user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Astatkani faqat admin tahrirlay oladi" });
    }
    await Astatka.findByIdAndUpdate(id, req.body);
    res.json({ message: "Tahrirlandi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
exports.deleteAstatka = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const user = await User.findById(user_id);
    if (user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Astatkani faqat admin o'chira oladi" });
    }
    await Astatka.findByIdAndDelete(id);
    res.json({ message: "O'chirildi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

