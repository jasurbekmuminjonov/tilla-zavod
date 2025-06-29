const User = require("../models/user.model");
const Warehouse = require("../models/warehouse.model");

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
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};
