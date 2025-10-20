const ExtTransportion = require("../models/externalTransportion.model");
const User = require("../models/user.model");

exports.createExtTransportion = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const user = await User.findById(user_id);
    if (!user.create_gold) {
      return res
        .status(400)
        .json({ message: "Siz bunday huquqqa ega emassiz" });
    }
    req.body.user_id = user_id;
    req.body.factory_id = factory_id;
    await ExtTransportion.create(req.body);
    res.json({ message: "Tashqi oldi-berdi yaratildi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getExtTransportion = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const user = await User.findById(user_id);
    let data;
    if (user.role === "admin") {
      data = await ExtTransportion.find({ factory_id })
        .populate("provider_id")
        .populate("user_id")
        .sort("-createdAt");
    } else {
      data = await ExtTransportion.find({ factory_id, user_id })
        .populate("provider_id")
        .populate("user_id")
        .sort("-createdAt");
    }
    res.json(data);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.deleteExtTransportion = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    if (user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Oldi-berdini faqat admin o'chira oladi" });
    }
    await ExtTransportion.findByIdAndDelete(id);
    res.json({ message: "O'chirildi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
