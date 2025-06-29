const User = require("../models/user.model");
const ProductType = require("../models/productType.model");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../services/user.service");

exports.createUser = async (req, res) => {
  try {
    const { factory_id, user_id } = req.user;
    req.body.factory_id = factory_id;
    req.body.password = await hashPassword(req.body.password);
    const admin = await User.findById(user_id);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    await User.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { factory_id } = req.user;

    const users = await User.find({ factory_id })
      .populate("allowed_process_types")
      .populate("attached_warehouses")
      .populate({ path: "gold.provider_id" })
      .populate({ path: "gold.process_id" })
      .lean();

    const allTypeIds = users.flatMap((user) =>
      user.products.flatMap((entry) =>
        entry.products.map((p) => p.product_type_id?.toString())
      )
    );
    const uniqueTypeIds = [...new Set(allTypeIds.filter(Boolean))];

    const productTypes = await ProductType.find({
      _id: { $in: uniqueTypeIds },
    })
      .select("_id product_name description")
      .lean();

    users.forEach((user) => {
      user.products.forEach((entry) => {
        entry.products.forEach((p) => {
          const matched = productTypes.find(
            (pt) => pt._id.toString() === p.product_type_id?.toString()
          );
          if (matched) {
            p.product_type_id = matched;
          }
        });
      });
    });

    return res.status(200).json(users);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};

exports.editUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const { allowed_process_types, name, phone, role } = req.body;
    const admin = await User.findById(user_id);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    await User.findByIdAndUpdate(id, {
      allowed_process_types,
      name,
      phone,
    });

    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.editUserPassword = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    req.body.password = await hashPassword(req.body.password);
    const admin = await User.findById(user_id);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    await User.findByIdAndUpdate(id, { password: req.body.password });

    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.editAdminPassword = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { password } = req.body;
    const admin = await User.findById(user_id);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    req.body.password = await hashPassword(password);
    await User.findByIdAndUpdate(user_id, { password: req.body.password });
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Parol noto'g'ri" });
    }
    const token = generateToken(user);
    return res.status(200).json({ user, token });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const admin = await User.findById(user_id);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    await User.findByIdAndDelete(id);
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.getUserByUserId = async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await User.findById(user_id)
      .populate("allowed_process_types")
      .populate("attached_warehouses")
      .populate({ path: "gold.provider_id" })
      .populate({ path: "gold.process_id" });

    return res.status(200).json(user);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};
