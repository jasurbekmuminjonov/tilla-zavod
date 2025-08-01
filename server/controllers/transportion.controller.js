const Transportion = require("../models/transportion.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

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

exports.getTransportionReport = async (req, res) => {
  try {
    const { first_user, second_user } = req.query;

    if (!first_user) {
      return res.status(400).json({ message: "first_user kerak" });
    }

    const firstUserId = new mongoose.Types.ObjectId(first_user);

    let gived = 0;
    let get = 0;

    if (second_user && second_user.trim() !== "") {
      const secondUserId = new mongoose.Types.ObjectId(second_user);

      const givedAgg = await Transportion.aggregate([
        {
          $match: {
            from_id: firstUserId,
            to_id: secondUserId,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$gramm" },
          },
        },
      ]);

      gived = givedAgg[0]?.total || 0;

      const getAgg = await Transportion.aggregate([
        {
          $match: {
            from_id: secondUserId,
            to_id: firstUserId,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$gramm" },
          },
        },
      ]);

      get = getAgg[0]?.total || 0;
    } else {
      const givedAgg = await Transportion.aggregate([
        {
          $match: {
            from_id: firstUserId,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$gramm" },
          },
        },
      ]);

      gived = givedAgg[0]?.total || 0;

      const getAgg = await Transportion.aggregate([
        {
          $match: {
            to_id: firstUserId,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$gramm" },
          },
        },
      ]);

      get = getAgg[0]?.total || 0;
    }

    res.json({
      gived,
      get,
      difference: gived - get,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
};

exports.getSummaryGived = async (req, res) => {
  try {
    const { user_id } = req.query;
    console.log(user_id);
    const allTransportions = await Transportion.find();
    console.log(allTransportions);

    const summary = await Transportion.aggregate([
      {
        $match: { from_id: new mongoose.Types.ObjectId(user_id) },
      },
      {
        $group: {
          _id: "$to_id",
          totalGramm: { $sum: "$gramm" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "to_user",
        },
      },
      {
        $unwind: "$to_user",
      },
      {
        $project: {
          _id: 0,
          to_id: "$to_user",
          totalGramm: 1,
        },
      },
    ]);

    return res.status(200).json(summary);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getSummaryGet = async (req, res) => {
  try {
    const { user_id } = req.query;

    const summary = await Transportion.aggregate([
      {
        $match: { to_id: new mongoose.Types.ObjectId(user_id) },
      },
      {
        $group: {
          _id: "$from_id",
          totalGramm: { $sum: "$gramm" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "from_user",
        },
      },
      {
        $unwind: "$from_user",
      },
      {
        $project: {
          _id: 0,
          from_id: "$from_user",
          totalGramm: 1,
        },
      },
    ]);

    return res.status(200).json(summary);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
