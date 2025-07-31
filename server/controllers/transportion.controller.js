const Transportion = require("../models/transportion.model");
const User = require("../models/user.model");

exports.createTransportion = async (req, res) => {
  try {
    let io = req.app.get("socket");
    req.body.factory_id = req.user.factory_id;
    req.body.from_id = req.user.user_id;
    const { from_id, to_id } = req.body;
    const from = await User.findById(from_id);
    const to = await User.findById(to_id);
    await Transportion.create(req.body);
    io.emit("goldTransportion", {
      to,
      from,
      type: "gold",
    });
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getTransportions = async (req, res) => {
  try {
    const transportions = await Transportion.find({
      factory_id: req.user.factory_id,
    })
      .populate("from_id")
      .populate("to_id");
    return res.status(200).json(transportions);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getSentTransportions = async (req, res) => {
  try {
    const transportions = await Transportion.find({
      from_id: req.user.user_id,
    })
      .populate("from_id")
      .populate("to_id");
    return res.status(200).json(transportions);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getGetTransportions = async (req, res) => {
  try {
    const transportions = await Transportion.find({
      to_id: req.user.user_id,
    })
      .populate("from_id")
      .populate("to_id");
    return res.status(200).json(transportions);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.completeTransportion = async (req, res) => {
  try {
    const { transportion_id } = req.params;
    const transportion = await Transportion.findById(transportion_id);
    transportion.status = "completed";
    transportion.get_time = Date.now();
    await transportion.save();
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.cancelTransportion = async (req, res) => {
  try {
    const { transportion_id } = req.params;
    const transportion = await Transportion.findById(transportion_id);
    if (transportion.to_id.toString() !== req.user.user_id) {
      return res.status(400).json({
        message: "O'tkazmani faqat unga yuborilgan odam bekor qila oladi",
      });
    }
    await transportion.deleteOne();
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getReportsFromUserId = async (req, res) => {
  try {
    const gived = await Transportion.find({ from_id: req.user.user_id });
    const get = await Transportion.find({ to_id: req.user.user_id });
    res.status(200).json({
      gived,
      get,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
