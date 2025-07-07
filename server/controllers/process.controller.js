const ProcessType = require("../models/processType.model");
const Process = require("../models/process.model");
const User = require("../models/user.model");

exports.createProcess = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const { start_gold_id, start_gramm } = req.body;
    const user = await User.findById(user_id);
    const userGold = user.gold.find(
      (item) => item._id.toString() === start_gold_id
    );
    userGold.gramm -= start_gramm;
    req.body.user_id = user_id;
    req.body.factory_id = factory_id;
    await user.save();
    await Process.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.startProcess = async (req, res) => {
  try {
    const { process_id } = req.params;
    const { user_id } = req.user;
    const process = await Process.findById(process_id);
    if (process.user_id.toString() !== user_id) {
      return res
        .status(400)
        .json({ message: "Siz bundan huquqqa ega emassiz" });
    }
    process.start_time = Date.now();
    process.status = "in_progress";
    await process.save();
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.endProcess = async (req, res) => {
  try {
    const { process_id } = req.params;
    const { user_id } = req.user;
    const process = await Process.findById(process_id);
    const processType = await ProcessType.findById(process.process_type_id);
    const user = await User.findById(process.user_id);
    const userGold = user.gold.find(
      (item) => item._id.toString() === process.start_gold_id.toString()
    );
    if (process.user_id.toString() !== user_id) {
      return res
        .status(400)
        .json({ message: "Siz bundan huquqqa ega emassiz" });
    }
    let differenceGramm;
    let differencePerGramm;
    if (processType.weight_loss) {
      differenceGramm = process.start_gramm - req.body.end_gramm;
      differencePerGramm = differenceGramm / process.start_gramm;
    }
    let endPurity;
    let endProductPurity;
    if (processType.purity_change) {
      endPurity =
        (userGold.gold_purity * process.start_gramm) / req.body.end_gramm;
      endProductPurity =
        (userGold.product_purity * process.start_gramm) / req.body.end_gramm;
    }
    console.log(userGold);
    console.log(process);
    console.log(req.body);

    console.log(endPurity);

    const newGold = {
      gramm: req.body.end_gramm,
      gold_purity: endPurity,
      product_purity: endProductPurity,
      ratio: userGold.ratio,
      provider_id: userGold.provider_id,
      process_id,
    };
    user.gold.push(newGold);
    const updatedUser = await User.findById(user_id);
    const updatedGold = updatedUser.gold.slice(-1)[0];
    process.end_gold_id = updatedGold._id;
    process.lost_gramm = differenceGramm;
    process.lost_per_gramm = differencePerGramm;
    process.end_purity = endPurity;
    process.end_product_purity = endProductPurity;
    process.end_gramm = req.body.end_gramm;
    process.end_time = Date.now();
    process.status = "completed";
    await process.save();
    await user.save();
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.cancelProcess = async (req, res) => {
  try {
    const { process_id } = req.params;
    const { user_id } = req.user;
    const process = await Process.findById(process_id);
    const user = await User.findById(process.user_id);
    const userGold = user.gold.find(
      (item) => item._id.toString() === process.start_gold_id.toString()
    );
    userGold.gramm += process.start_gramm;
    if (process.user_id.toString() !== user_id) {
      return res
        .status(400)
        .json({ message: "Siz bunday huquqqa ega emassiz" });
    }
    process.status = "failed";
    await user.save();
    await process.save();
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getProcess = async (req, res) => {
  try {
    const process = await Process.find({ factory_id: req.user.factory_id });
    return res.status(200).json(process);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
