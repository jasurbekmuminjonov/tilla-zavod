const Process = require("../models/process.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

exports.createProcess = async (req, res) => {
  try {
    req.body.user_id = req.user.user_id;
    req.body.factory_id = req.user.factory_id;

    const user = await User.findById(req.user.user_id);

    if (!user.allowed_process_types.includes(req.body.process_type_id)) {
      return res
        .status(400)
        .json({ message: "Sizda bunday huquq mavjud emas" });
    }

    await Process.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getProcesses = async (req, res) => {
  try {
    const processes = await Process.find({ factory_id: req.user.factory_id });
    return res.status(200).json(processes);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.endProcess = async (req, res) => {
  try {
    const process = await Process.findById(req.params.process_id).populate(
      "process_type_id"
    );

    const {
      astatka_gramm = 0,
      end_quantity = 0,
      end_gramm = process.start_gramm,
    } = req.body;
    const lostGramm = process.start_gramm - astatka_gramm - end_gramm;
    const lostPerGramm = lostGramm / end_gramm;
    const endPurity =
      ((process.start_gramm - astatka_gramm) * process.start_purity) /
      end_gramm;

    process.end_gramm = end_gramm;
    process.astatka_gramm = astatka_gramm;
    req.body.quantity_difference = end_quantity - process.quantity;
    process.end_quantity = end_quantity;
    if (req.body.quantity) {
      process.quantity = req.body.quantity;
    }
    process.lost_gramm = lostGramm;
    process.lost_per_gramm = lostPerGramm;
    process.end_purity = process.process_type_id.purity_change
      ? endPurity
      : 585;
    process.end_time = Date.now();

    await process.save();
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
    // const user = await User.findById(process.user_id);
    // const userGold = user.gold.find(
    //   (item) => item._id.toString() === process.start_gold_id.toString()
    // );
    // userGold.gramm += process.start_gramm;
    if (process.user_id.toString() !== user_id) {
      return res
        .status(400)
        .json({ message: "Siz bunday huquqqa ega emassiz" });
    }
    process.status = "inactive";
    // await user.save();
    await process.deleteOne();
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getProcessByUserId = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    const process = await Process.find({
      factory_id: req.user.factory_id,
      ...(user.role === "user" && { user_id: req.user.user_id }),
    })
      .populate("process_type_id")
      .populate("user_id");

    return res
      .status(200)
      .json(
        process.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getLossesSummary = async (req, res) => {
  try {
    const { user_id } = req.query;

    const result = await Process.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          lost_gramm: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$process_type_id",
          total_lost: { $sum: "$lost_gramm" },
        },
      },
      {
        $lookup: {
          from: "processtypes",
          localField: "_id",
          foreignField: "_id",
          as: "process_type_id",
        },
      },
      {
        $unwind: "$process_type_id",
      },
      {
        $project: {
          total_lost: 1,
          process_type_id: 1,
        },
      },
    ]);

    res.status(200).json(result);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
