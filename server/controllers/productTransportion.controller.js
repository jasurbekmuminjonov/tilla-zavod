const ProductTransportion = require("../models/productTransportion.model");
const Warehouse = require("../models/warehouse.model");
const User = require("../models/user.model");

exports.createProductTransportion = async (req, res) => {
  try {
    let io = req.app.get("socket");

    const { products, warehouse_id } = req.body;
    req.body.factory_id = req.user.factory_id;
    req.body.user_id = req.user.user_id;
    const to = await Warehouse.findById(warehouse_id);
    const from = await User.findById(req.user.user_id);

    const user = await User.findById(req.user.user_id);
    if (!user)
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    products.forEach((product) => {
      const userProduct = user.products.find(
        (p) =>
          p.product_type_id.toString() === product.product_type_id &&
          p.gold_id.toString() === product.gold_id
      );

      if (!userProduct || userProduct.quantity < product.quantity) {
        throw new Error(
          `Foydalanuvchida yetarli mahsulot mavjud emas: ${product.product_type_id}`
        );
      }

      userProduct.quantity -= product.quantity;
      userProduct.total_gramm -= product.total_gramm;

      if (userProduct.quantity <= 0) {
        user.products = user.products.filter(
          (p) =>
            !(
              p.product_type_id.toString() === product.product_type_id &&
              p.gold_id.toString() === product.gold_id
            )
        );
      }
    });

    await user.save();

    const newTransport = await ProductTransportion.create(req.body);

    io.emit("productTransportion", {
      to,
      to_type: "Warehouse",
      from,
      from_type: "User",
      user,
      type: "product",
    });
    res.status(201).json(newTransport);
  } catch (error) {
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
    const data = await ProductTransportion.find({ factory_id })
      .populate("warehouse_id")
      .populate("user_id");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Olishda xatolik", error: error.message });
  }
};

exports.getSentProductTransportion = async (req, res) => {
  try {
    const data = await ProductTransportion.find({ user_id: req.user.user_id })
      .populate("warehouse_id")
      .populate("user_id");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Olishda xatolik", error: error.message });
  }
};

exports.getReceivedProductTransportions = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    const allTransportions = await ProductTransportion.find()
      .populate("warehouse_id")
      .populate("user_id");

    const filtered = allTransportions.filter((item) =>
      user.attached_warehouses.some(
        (w) => w.toString() === item.warehouse_id._id.toString()
      )
    );

    res.status(200).json(filtered);
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

    const warehouse = await Warehouse.findById(transport.warehouse_id);
    if (!warehouse) {
      return res.status(404).json({ message: "Ombor topilmadi" });
    }

    transport.products.forEach((product) => {
      warehouse.products.push({
        product_type_id: product.product_type_id,
        gramm_per_quantity: product.gramm_per_quantity,
        purity: product.purity,
        user_id: transport.user_id,
        gold_id: product.gold_id,
        quantity: product.quantity,
        total_gramm: product.total_gramm,
      });
    });

    await warehouse.save();

    transport.status = "completed";
    transport.get_time = new Date();
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

    const user = await User.findById(transport.user_id);
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    transport.products.forEach((product) => {
      const userProduct = user.products.find(
        (p) =>
          p.product_type_id.toString() === product.product_type_id &&
          p.gold_id.toString() === product.gold_id
      );

      if (userProduct) {
        userProduct.quantity += product.quantity;
        userProduct.total_gramm += product.total_gramm;
      } else {
        user.products.push({
          product_type_id: product.product_type_id,
          quantity: product.quantity,
          total_gramm: product.total_gramm,
          gramm_per_quantity: product.gramm_per_quantity,
          purity: product.purity,
          total_lost_gramm: product.total_lost_gramm || 0,
          date: new Date(),
          gold_id: product.gold_id,
          user_id: user._id,
        });
      }
    });

    await user.save();

    transport.status = "canceled";
    transport.get_time = new Date();
    await transport.save();

    res.status(200).json({ message: "Transport bekor qilindi", transport });
  } catch (error) {
    res.status(500).json({
      message: "Transportni bekor qilishda xatolik",
      error: error.message,
    });
  }
};
