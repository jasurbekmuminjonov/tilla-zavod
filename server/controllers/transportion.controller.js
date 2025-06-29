const Transportion = require("../models/transportion.model");
const Warehouse = require("../models/warehouse.model");
const User = require("../models/user.model");

exports.createTransportion = async (req, res) => {
  try {
    req.body.factory_id = req.user.factory_id;
    const { from_type, from_id, to_type, to_id, gold_id, sent_gramm } =
      req.body;
    let from;
    let to;
    if (from_type === "Warehouse") {
      from = await Warehouse.findById(from_id);
    } else {
      from = await User.findById(from_id);
    }
    if (to_type === "Warehouse") {
      to = await Warehouse.findById(to_id);
    } else {
      to = await User.findById(to_id);
    }
    const transportingGold = from.gold.find(
      (item) => item._id.toString() === gold_id
    );
    transportingGold.gramm -= sent_gramm;
    await from.save();
    await Transportion.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.getTransportions = async (req, res) => {
  try {
    const transportions = await Transportion.find({
      factory_id: req.user.factory_id,
    });
    return res.status(200).json(transportions);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.getSentTransportions = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const user = await User.findById(user_id);
    const allTransportions = await Transportion.find({ factory_id });
    const userSentTransportions = allTransportions.filter(
      (t) =>
        user.attached_warehouses.includes(t.from_id) ||
        t.from_id.toString() === user._id.toString()
    );
    return res.status(200).json(userSentTransportions);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.getGetTransportions = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const user = await User.findById(user_id);
    const allTransportions = await Transportion.find({ factory_id });
    const userGetTransportions = allTransportions.filter(
      (t) =>
        user.attached_warehouses.includes(t.to_id) ||
        t.to_id.toString() === user._id.toString()
    );
    return res.status(200).json(userGetTransportions);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.completeTransportion = async (req, res) => {
  try {
    const { transportion_id } = req.params;
    const { get_gramm } = req.body;
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    const transportion = await Transportion.findById(transportion_id);
    if (
      !user.attached_warehouses.includes(transportion.to_id) ||
      user._id !== transportion.to_id
    ) {
      return res
        .status(400)
        .json({ message: "O'tkazma boshqa foydalanuvchi yoki ombor uchun" });
    }
    transportion.get_gramm = get_gramm;
    transportion.lost_gramm = transportion.sent_gramm - get_gramm;
    transportion.status = "completed";
    transportion.get_time = Date.now;
    transportion.save();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.cancelTransportion = async (req, res) => {
  try {
    const { transportion_id } = req.params;
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    const transportion = await Transportion.findById(transportion_id);
    if (
      !user.attached_warehouses.includes(transportion.to_id) ||
      user._id !== transportion.to_id
    ) {
      return res
        .status(400)
        .json({ message: "O'tkazma boshqa foydalanuvchi yoki ombor uchun" });
    }
    const sentUser = await User.findById(transportion.from_id);
    const sentGold = sentUser.gold.find(
      (item) => item._id.toString() === transportion.gold_id.toString()
    );
    sentGold.gramm += transportion.sent_gramm;
    await sentUser.save();
    transportion.status = "cancelled";
    transportion.get_time = Date.now;
    await transportion.save();
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};
