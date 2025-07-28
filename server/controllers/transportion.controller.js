const Transportion = require("../models/transportion.model");
// const Warehouse = require("../models/warehouse.model");
const User = require("../models/user.model");

exports.createTransportion = async (req, res) => {
  try {
    let io = req.app.get("socket");
    req.body.factory_id = req.user.factory_id;
    req.body.from_id = req.user.user_id;
    const { from_id, to_id } = req.body;
    const from = await User.findById(from_id);
    const to = await User.findById(to_id);
    // if (from_type === "Warehouse") {
    //   from = await Warehouse.findById(from_id);
    // } else {
    //   from = await User.findById(from_id);
    // }
    // if (to_type === "Warehouse") {
    //   to = await Warehouse.findById(to_id);
    // } else {
    //   to = await User.findById(to_id);
    // }
    // const transportingGold = from.gold.find(
    //   (item) => item._id.toString() === gold_id
    // );
    // if (sent_gramm <= 0) {
    //   return res.status(400).json({
    //     message: "Yuborilayotgan gramm manfiy yoki 0 bo'lmasligi kerak",
    //   });
    // }
    // if (transportingGold.gramm < sent_gramm) {
    //   return res.status(400).json({
    //     message:
    //       "Tanlangan oltin grammi yuborish uchun yetmaydi. Agar ko'proq oltin yubormoqchi bo'lsangiz 2 marta o'tkazma yarating",
    //   });
    // }
    // transportingGold.gramm -= sent_gramm;
    // await from.save();
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
    }).populate("from_id").populate("to_id");
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
    // const user = await User.findById(user_id);
    // const allTransportions = await Transportion.find({ factory_id })
    //   .populate("from_id")
    //   .populate("to_id");

    // const userSentTransportions = allTransportions.filter(
    //   (t) =>
    //     user.attached_warehouses.includes(t.from_id._id) ||
    //     t.from_id._id.toString() === user._id.toString()
    // );
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
    // const user = await User.findById(user_id);
    // const allTransportions = await Transportion.find({ factory_id })
    //   .populate("from_id")
    //   .populate("to_id");
    // const userGetTransportions = allTransportions.filter(
    //   (t) =>
    //     user.attached_warehouses.includes(t.to_id._id) ||
    //     t.to_id._id.toString() === user._id.toString()
    // );
    return res.status(200).json(transportions);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

// exports.completeTransportion = async (req, res) => {
//   try {
//     const { transportion_id } = req.params;
//     const { get_gramm } = req.body;
//     const { user_id } = req.user;

//     const user = await User.findById(user_id);
//     const transportion = await Transportion.findById(transportion_id);

//     let to;
//     let from;
//     if (transportion.to_type === "Warehouse") {
//       to = await Warehouse.findById(transportion.to_id);
//     } else {
//       to = await User.findById(transportion.to_id);
//     }

//     if (transportion.from_type === "Warehouse") {
//       from = await Warehouse.findById(transportion.from_id);
//     } else {
//       from = await User.findById(transportion.from_id);
//     }
//     if (
//       !user.attached_warehouses.includes(transportion.to_id.toString()) &&
//       user._id.toString() !== transportion.to_id.toString()
//     ) {
//       return res
//         .status(400)
//         .json({ message: "O'tkazma boshqa foydalanuvchi yoki ombor uchun" });
//     }
//     to.gold.push({
//       provider_id: from.gold.find(
//         (p) => p._id.toString() === transportion.gold_id.toString()
//       ).provider_id,
//       process_id: from.gold.find(
//         (p) => p._id.toString() === transportion.gold_id.toString()
//       ).process_id,
//       gold_purity: from.gold.find(
//         (p) => p._id.toString() === transportion.gold_id.toString()
//       ).gold_purity,
//       product_purity: from.gold.find(
//         (p) => p._id.toString() === transportion.gold_id.toString()
//       ).product_purity,
//       ratio: from.gold.find(
//         (p) => p._id.toString() === transportion.gold_id.toString()
//       ).ratio,
//       description: from.gold.find(
//         (p) => p._id.toString() === transportion.gold_id.toString()
//       ).description,
//       gramm: get_gramm,
//     });
//     await to.save();
//     transportion.get_gramm = get_gramm;
//     transportion.lost_gramm = transportion.sent_gramm - get_gramm;
//     transportion.status = "completed";
//     transportion.get_time = Date.now();

//     transportion.save();
//     return res.status(200).end();
//   } catch (err) {
//     console.log(err.message);
//     return res.status(500).json({ message: "Serverda xatolik", err });
//   }
// };



exports.completeTransportion = async (req, res) => {
  try {
    const { transportion_id } = req.params;
    // const { get_gramm } = req.body;
    const transportion = await Transportion.findById(transportion_id);
    // transportion.get_gramm = transportion.sent_gramm - get_gramm;
    // transportion.returned_gramm = get_gramm;
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
    if (transportion.from_id.toString() !== req.user.user_id) {
      return res.status(400).json({
        message: "O'tkazmani faqat uni yuborgan odam bekor qila oladi",
      });
    }
    transportion.status = "canceled";
    await transportion.save();
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.returnTransportion = async (req, res) => {
  try {
    const { transportion_id } = req.params;
    const transportion = await Transportion.findById(transportion_id);

    if (transportion.from_id.toString() !== req.user.user_id) {
      return res.status(400).json({
        message: "O'tkazmani faqat uni yuborgan odam qaytarib olishi mumkin",
      });
    }
    transportion.returned_gramm = req.body.returned_gramm;
    await transportion.save();
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

// exports.cancelTransportion = async (req, res) => {
//   try {
//     const { transportion_id } = req.params;
//     const { user_id } = req.user;
//     const user = await User.findById(user_id);
//     const transportion = await Transportion.findById(transportion_id);

//     if (
//       !user.attached_warehouses.includes(transportion.to_id.toString()) &&
//       user._id.toString() !== transportion.to_id.toString() &&
//       !user.attached_warehouses.includes(transportion.from_id.toString()) &&
//       user._id.toString() !== transportion.from_id.toString()
//     ) {
//       return res
//         .status(400)
//         .json({ message: "O'tkazma boshqa foydalanuvchi yoki ombor uchun" });
//     }
//     let from;
//     if (transportion.from_type === "Warehouse") {
//       from = await Warehouse.findById(transportion.from_id);
//     } else {
//       from = await User.findById(transportion.from_id);
//     }
//     // const sentUser = await User.findById(transportion.from_id);
//     const sentGold = from.gold.find(
//       (item) => item._id.toString() === transportion.gold_id.toString()
//     );
//     sentGold.gramm += transportion.sent_gramm;
//     await from.save();
//     transportion.status = "canceled";
//     transportion.get_time = Date.now();
//     await transportion.save();
//     return res.status(200).end();
//   } catch (err) {
//     console.log(err.message);
//     return res.status(500).json({ message: "Serverda xatolik", err });
//   }
// };
