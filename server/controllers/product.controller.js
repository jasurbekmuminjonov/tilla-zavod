const User = require("../models/user.model");
const Warehouse = require("../models/warehouse.model");
const mongoose = require("mongoose");

exports.createProduct = async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    const userGold = user.gold.find(
      (g) => g._id.toString() === req.body.gold_id
    );
    if (!userGold) {
      return res
        .status(400)
        .json({ message: "Siz bundan huquqqa ega emassiz" });
    }

    req.body.products.forEach((p) => {
      p.total_gramm = p.quantity * p.gramm_per_quantity;
      p.user_id = user_id;
      p.gold_id = req.body.gold_id;
      p.date = new Date();
    });

    const totalLost = req.body.products.reduce(
      (acc, p) => acc + p.total_lost_gramm,
      0
    );
    const totalProductGramm = req.body.products.reduce(
      (acc, p) => acc + p.total_gramm,
      0
    );

    userGold.gramm -= totalLost + totalProductGramm;

    user.products.push(...req.body.products);
    await user.save();

    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const user = await User.findById(user_id);
    let products = [];

    let userMap = {};
    let warehouseMap = {};

    if (user.role === "admin") {
      const warehouses = await Warehouse.find({ factory_id });
      const users = await User.find({ factory_id });

      // 🗺️ Xaritaga joylash
      users.forEach((u) => (userMap[u._id.toString()] = u));
      warehouses.forEach((w) => (warehouseMap[w._id.toString()] = w));

      for (const wh of warehouses) {
        for (const p of wh.products) {
          products.push({
            ...p.toObject(),
            warehouse_id: warehouseMap[wh._id.toString()],
            user_id: userMap[p.user_id?.toString()],
            from: "warehouse",
          });
        }
      }

      for (const u of users) {
        for (const p of u.products) {
          products.push({
            ...p.toObject(),
            user_id: userMap[u._id.toString()],
            from: "user",
          });
        }
      }
    } else {
      const objectIds = user.attached_warehouses.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      const warehouses = await Warehouse.find({ _id: { $in: objectIds } });

      // 🗺️ faqat kerakli omborlar va bitta user
      warehouseMap = Object.fromEntries(
        warehouses.map((w) => [w._id.toString(), w])
      );
      userMap[user._id.toString()] = user;

      for (const wh of warehouses) {
        for (const p of wh.products) {
          products.push({
            ...p.toObject(),
            warehouse_id: warehouseMap[wh._id.toString()],
            user_id: userMap[p.user_id?.toString()],
            from: "warehouse",
          });
        }
      }

      for (const p of user.products) {
        products.push({
          ...p.toObject(),
          user_id: userMap[user._id.toString()],
          from: "user",
        });
      }
    }

    products.sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.status(200).json(products);
  } catch (err) {
    console.error("getProducts xatolik:", err.message);
    return res.status(500).json({ message: "Serverda xatolik", error: err });
  }
};
