const Warehouse = require("../models/warehouse.model");

exports.createWarehouse = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    req.body.factory_id = factory_id;
    const admin = await User.findById(user_id);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    await Warehouse.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.editWarehouse = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const admin = await User.findById(user_id);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    await Warehouse.findByIdAndUpdate(id, {
      warehouse_name: req.body.warehouse_name,
    });
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.deleteWarehouse = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const admin = await User.findById(user_id);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    await Warehouse.findByIdAndDelete(id);
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.getWarehouses = async (req, res) => {
  try {
    const { factory_id } = req.user;
    const warehouses = await Warehouse.find({ factory_id })
      .populate({ path: "gold.provider_id" })
      .populate({ path: "gold.process_id" })
      .populate({ path: "products.product_type_id" });
    return res.status(200).json(warehouses);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};
