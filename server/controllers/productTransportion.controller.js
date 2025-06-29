const ProductTransportion = require("../models/productTransportion.model");
const Warehouse = require("../models/warehouse.model");
const User = require("../models/user.model");

exports.createProductTransportion = async (req, res) => {
  try {
    const { products, warehouse_id } = req.body;
    req.body.factory_id = req.user.factory_id;

    const warehouse = await Warehouse.findById(warehouse_id);
    if (!warehouse) return res.status(404).json({ message: "Ombor topilmadi" });

    products.forEach((product) => {
      const existing = warehouse.products.find(
        (p) =>
          p.product_type_id.toString() === product.product_type_id &&
          p.gold_id.toString() === product.gold_id
      );

      if (!existing || existing.quantity < product.quantity) {
        throw new Error(
          `Omborda yetarli miqdorda mahsulot mavjud emas: ${product.product_type_id}`
        );
      }

      existing.quantity -= product.quantity;
      existing.total_gramm -= product.total_gramm;
    });

    await warehouse.save();
    const newTransport = await ProductTransportion.create(req.body);
    res.status(201).json(newTransport);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Yaratishda xatolik", error: error.message });
  }
};

exports.getProductTransportion = async (req, res) => {
  try {
    const { factory_id, user_id } = req.user;
    const user = await User.findById(user_id);
    if (user.role !== "admin") {
      return res.status(400).json({ message: "Sizda bunday huquq yo'q" });
    }
    const data = await ProductTransportion.find({ factory_id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Olishda xatolik", error: error.message });
  }
};

exports.getSentProductTransportion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const data = await ProductTransportion.find().filter((item) =>
      user.attached_warehouses.some(
        (w) => w.toString() === item.warehouse_id.toString()
      )
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Olishda xatolik", error: error.message });
  }
};

exports.getReceivedProductTransportions = async (req, res) => {
  try {
    const user_id = req.user._id;
    const data = await ProductTransportion.find({ user_id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Qabul qilingan transportlarni olishda xatolik",
      error: error.message,
    });
  }
};

exports.completeProductTransportion = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await ProductTransportion.findById(id);
    if (!transport || transport.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Transport topilmadi yoki allaqachon yakunlangan" });
    }

    const user = await User.findById(transport.user_id);
    if (!user)
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    transport.products.forEach((product) => {
      const userProductEntry = {
        date: product.date,
        gold_id: product.gold_id,
        products: [
          {
            product_type_id: product.product_type_id,
            quantity: product.quantity,
            total_gramm: product.total_gramm,
            gramm_per_quantity: product.gramm_per_quantity,
            total_lost_gramm: product.total_lost_gramm,
          },
        ],
      };
      user.products.push(userProductEntry);
    });

    await user.save();
    transport.status = "completed";
    await transport.save();

    res.status(200).json({ message: "Transport qabul qilindi", transport });
  } catch (error) {
    res.status(500).json({
      message: "Transportni qabul qilishda xatolik",
      error: error.message,
    });
  }
};

exports.cancelProductTransportion = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await ProductTransportion.findById(id);
    if (!transport || transport.status !== "pending") {
      return res.status(400).json({
        message: "Transport topilmadi yoki allaqachon qayta ishlangan",
      });
    }

    const warehouse = await Warehouse.findById(transport.warehouse_id);
    if (!warehouse) return res.status(404).json({ message: "Ombor topilmadi" });

    transport.products.forEach((product) => {
      const existing = warehouse.products.find(
        (p) =>
          p.product_type_id.toString() === product.product_type_id &&
          p.gold_id.toString() === product.gold_id
      );

      if (existing) {
        existing.quantity += product.quantity;
        existing.total_gramm += product.total_gramm;
      }
    });

    await warehouse.save();
    transport.status = "canceled";
    await transport.save();

    res.status(200).json({ message: "Transport bekor qilindi", transport });
  } catch (error) {
    res.status(500).json({
      message: "Transportni bekor qilishda xatolik",
      error: error.message,
    });
  }
};
