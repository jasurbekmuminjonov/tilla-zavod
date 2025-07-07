const User = require("../models/user.model");
const Warehouse = require("../models/warehouse.model");
const Process = require("../models/process.model");
const Transportion = require("../models/transportion.model");

exports.createGold = async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    const { warehouse_id } = req.params;
    if (!user.attached_warehouses.includes(warehouse_id)) {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    const warehouse = await Warehouse.findById(warehouse_id);
    req.body.ratio = req.body.gold_purity / req.body.product_purity;
    warehouse.gold.push(req.body);
    await warehouse.save();
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

const getProcessChain = async (startProcessId) => {
  const chain = [];

  let current = startProcessId;

  while (current) {
    const process = await Process.findById(current).populate("process_type_id");
    if (!process) break;
    chain.push(process);
    current = process.process_id;
    current = process?.process_id || null;
  }

  return chain.reverse();
};

exports.getGold = async (req, res) => {
  try {
    const factoryId = req.user.factory_id;

    const users = await User.find({ factory_id: factoryId }).lean();
    const warehouses = await Warehouse.find({ factory_id: factoryId }).lean();

    const allGolds = [];

    for (const user of users) {
      for (const gold of user.gold || []) {
        const processes = await getProcessChain(gold.process_id);

        const transportions = await Transportion.find({
          gold_id: gold._id,
          factory_id: factoryId,
        })
          .populate("from_id")
          .populate("to_id")
          .sort({ createdAt: -1 })
          .lean();

        allGolds.push({
          user_id: user,
          warehouse_id: null,
          gramm: gold.gramm,
          gold_purity: gold.gold_purity,
          product_purity: gold.product_purity,
          ratio: gold.ratio,
          description: gold.description,
          date: gold.date,
          processes,
          transportions,
        });
      }
    }

    for (const warehouse of warehouses) {
      for (const gold of warehouse.gold || []) {
        const processes = await getProcessChain(gold.process_id);

        const transportions = await Transportion.find({
          gold_id: gold._id,
          factory_id: factoryId,
        })
          .populate("from_id")
          .populate("to_id")
          .sort({ createdAt: -1 })
          .lean();

        allGolds.push({
          user_id: null,
          warehouse_id: warehouse,
          gramm: gold.gramm,
          gold_purity: gold.gold_purity,
          product_purity: gold.product_purity,
          ratio: gold.ratio,
          description: gold.description,
          date: gold.date,
          processes,
          transportions,
        });
      }
    }

    res.json(allGolds);
  } catch (error) {
    console.error("getGold error:", error);
    res.status(500).json({ message: "Server xatosi" });
  }
};
