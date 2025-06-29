const ProcessType = require("../models/processType.model");
const User = require("../models/user.model");

exports.createProcessType = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    req.body.factory_id = factory_id;
    const user = await User.findById(user_id);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    await ProcessType.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.getProcessTypes = async (req, res) => {
  try {
    const { factory_id } = req.user;
    const processTypes = await ProcessType.find({ factory_id });

    return res.status(200).json(processTypes);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.getProcessTypesByUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await User.findById(user_id).populate(
      "allowed_process_types"
    );
    return res.status(200).json(user.allowed_process_types);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.editProcessTypeById = async (req, res) => {
  try {
    const admin = await User.findById(req.user.user_id);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    const { id } = req.params;
    await ProcessType.findOneAndUpdate(id, {
      process_name: req.body.process_name,
      weight_loss: req.body.weight_loss,
      purity_change: req.body.purity_change,
      split_to_product: req.body.split_to_product,
      loss_limit_per_gramm: req.body.loss_limit_per_gramm,
    });
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.deleteProcessTypeById = async (req, res) => {
  try {
    const admin = await User.findById(req.user.user_id);
    const { id } = req.params;
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    await ProcessType.findByIdAndDelete(id);
    await User.updateMany(
      { allowed_process_types: id },
      { $pull: { allowed_process_types: id } }
    );
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};
