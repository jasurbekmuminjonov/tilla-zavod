// const User = require("../models/user.model");
// const Warehouse = require("../models/warehouse.model");
// const Process = require("../models/process.model");
// const ProductType = require("../models/productType.model");

// const mongoose = require("mongoose");
// exports.createGold = async (req, res) => {
//   try {
//     const { user_id } = req.user;
//     const user = await User.findById(user_id);
//     const { warehouse_id } = req.params;
//     if (!user.attached_warehouses.includes(warehouse_id)) {
//       return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
//     }
//     const warehouse = await Warehouse.findById(warehouse_id);
//     req.body.ratio = req.body.gold_purity / req.body.product_purity;
//     warehouse.gold.push(req.body);
//     await warehouse.save();
//     return res.status(201).end();
//   } catch (err) {
//     console.log(err.message);
//     return res.status(500).json({ message: "Serverda xatolik", err });
//   }
// };

// const getProcessChain = async (endProcessId) => {
//   const chain = [];
//   if (!endProcessId) return chain;

//   let current = await Process.findById(endProcessId).populate(
//     "process_type_id"
//   );
//   while (current) {
//     chain.unshift(current);
//     current = await Process.findOne({
//       end_gold_id: current.start_gold_id,
//     }).populate("process_type_id");
//   }

//   return chain;
// };

// exports.getGold = async (req, res) => {
//   try {
//     const factoryId = req.user.factory_id;

//     const users = await User.find({ factory_id: factoryId }).lean();
//     const warehouses = await Warehouse.find({ factory_id: factoryId }).lean();

//     const allGolds = [];

//     for (const user of users) {
//       for (const gold of user.gold || []) {
//         const processes = await getProcessChain(gold.process_id);

//         const transportions = await Transportion.find({
//           gold_id: gold._id,
//           factory_id: factoryId,
//         })
//           .populate("from_id")
//           .populate("to_id")
//           .sort({ createdAt: -1 })
//           .lean();

//         allGolds.push({
//           user_id: user,
//           warehouse_id: null,
//           gramm: gold.gramm,
//           gold_purity: gold.gold_purity,
//           product_purity: gold.product_purity,
//           ratio: gold.ratio,
//           description: gold.description,
//           date: gold.date,
//           processes,
//           transportions,
//           _id: gold._id,
//         });
//       }
//     }

//     for (const warehouse of warehouses) {
//       for (const gold of warehouse.gold || []) {
//         const processes = await getProcessChain(gold.process_id);

//         const transportions = await Transportion.find({
//           gold_id: gold._id,
//           factory_id: factoryId,
//         })
//           .populate("from_id")
//           .populate("to_id")
//           .sort({ createdAt: -1 })
//           .lean();

//         allGolds.push({
//           user_id: null,
//           warehouse_id: warehouse,
//           gramm: gold.gramm,
//           gold_purity: gold.gold_purity,
//           product_purity: gold.product_purity,
//           ratio: gold.ratio,
//           description: gold.description,
//           date: gold.date,
//           processes,
//           transportions,
//         });
//       }
//     }

//     res.json(allGolds);
//   } catch (error) {
//     console.error("getGold error:", error);
//     res.status(500).json({ message: "Server xatosi" });
//   }
// };

// exports.searchGoldFromAnyWhere = async (req, res) => {
//   try {
//     const { gold_id } = req.params;
//     const factoryId = req.user.factory_id;

//     if (!mongoose.Types.ObjectId.isValid(gold_id)) {
//       return res.status(400).json({ message: "Noto‘g‘ri ID format" });
//     }

//     const users = await User.find({ factory_id: factoryId }).lean();

//     for (const user of users) {
//       const gold = user.gold.find((g) => g._id.toString() === gold_id);
//       if (gold) {
//         return res.status(200).json({
//           location: "user",
//           owner: { _id: user._id, name: user.name },
//           gold,
//         });
//       }
//     }

//     const warehouses = await Warehouse.find({ factory_id: factoryId }).lean();

//     for (const warehouse of warehouses) {
//       const gold = warehouse.gold.find((g) => g._id.toString() === gold_id);
//       if (gold) {
//         return res.status(200).json({
//           location: "warehouse",
//           owner: { _id: warehouse._id, name: warehouse.warehouse_name },
//           gold,
//         });
//       }
//     }

//     return res.status(404).json({ message: "Bunday gold topilmadi" });
//   } catch (err) {
//     console.log(err.message);
//     res.status(500).json({ message: "Server xatosi" });
//   }
// };

const Gold = require("../models/gold.model");
const User = require("../models/user.model");
const Transportion = require("../models/transportion.model");
const Process = require("../models/process.model");

exports.createGold = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user.create_gold) {
      return res
        .status(400)
        .json({ message: "Sizda bunday huquq mavjud emas" });
    }
    req.body.user_id = req.user.user_id;
    req.body.factory_id = req.user.factory_id;
    req.body.ratio = req.body.purity / 585;
    console.log(Number(req.body.ratio?.toFixed(3)))
    req.body.gramm = req.body.entered_gramm * Number(req.body.ratio?.toFixed(3));
    await Gold.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getGold = async (req, res) => {
  try {
    const gold = await Gold.find({ factory_id: req.user.factory_id })
      .populate("user_id")
      .populate("provider_id");
    return res.status(200).json(gold);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getAllLosses = async (req, res) => {
  try {
    const { factory_id } = req.user;
    const allLosses = [];

    // === 1. Transportion losses with owner name ===
    const transportions = await Transportion.find({
      factory_id,
      status: "completed",
    })
      .populate("from_id")
      .populate("to_id")
      .lean();

    transportions.forEach((t) => {
      if (t.lost_gramm > 0) {
        allLosses.push({
          loss_type: "transportion",
          lost_gramm: t.lost_gramm,
          owner: t.from_id?.name,
          date: t.get_time,
          data: t,
        });
      }
    });

    // === 2. Process losses with owner name ===
    const processes = await Process.find({
      factory_id,
      status: "active",
    })
      .populate("process_type_id", "process_name")
      .populate("user_id", "name")
      .lean();

    processes.forEach((p) => {
      if (p.lost_gramm > 0) {
        allLosses.push({
          loss_type: "process",
          lost_gramm: p.lost_gramm,
          owner: p.user_id?.name || "Noma'lum user",
          date: p.end_time,
          data: p,
        });
      }
    });

    // === 3. Product losses with owner name ===
    // const users = await User.find({ factory_id })
    //   .populate("products.product_type_id", "product_name")
    //   .lean();

    // users.forEach((user) => {
    //   (user.products || []).forEach((product) => {
    //     if (product.total_lost_gramm && product.total_lost_gramm > 0) {
    //       allLosses.push({
    //         loss_type: "product",
    //         lost_gramm: product.total_lost_gramm,
    //         owner: user.name || "Noma'lum user",
    //         date: product.date,
    //         data: {
    //           ...product,
    //           user_id: user._id,
    //           user_name: user.name,
    //           product_type: product.product_type_id,
    //         },
    //       });
    //     }
    //   });
    // });

    // === Sort all by date descending ===
    allLosses.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json(allLosses);
  } catch (err) {
    console.error("getAllLosses error:", err.message);
    return res
      .status(500)
      .json({ message: "Serverda xatolik", error: err.message });
  }
};
