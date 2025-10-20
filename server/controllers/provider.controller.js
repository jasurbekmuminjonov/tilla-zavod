const Provider = require("../models/provider.model");
const User = require("../models/user.model");
const ExtTransportion = require("../models/externalTransportion.model");
const Gold = require("../models/gold.model");

exports.createProvider = async (req, res) => {
  try {
    req.body.factory_id = req.user.factory_id;
    await Provider.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ factory_id: req.user.factory_id });
    return res.status(200).json(providers);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.editProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    if (user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Hamkorni faqat admin tahrirlay oladi" });
    }
    await Provider.findByIdAndUpdate(id, req.body);
    res.json({ message: "Tahrirlandi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
exports.deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    if (user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Hamkorni faqat admin o'chira oladi" });
    }
    await Provider.findByIdAndDelete(id);
    await ExtTransportion.deleteMany({ provider_id: id });
    await Gold.deleteMany({ provider_id: id });
    res.json({ message: "O'chirildi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
