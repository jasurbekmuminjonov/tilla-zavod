const User = require("../models/user.model");
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
    return response.error(res, "Serverda xatolik", 500);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { factory_id } = req.user;
    const users = await User.find({ factory_id })
      .populate("permitted_process_types")
      .populate({ path: "gold.provider_id" })
      .populate({ path: "gold.carried_processes" });

    return res.status(200).json(users);
  } catch (err) {
    console.log(err.message);
    return response.error(res, "Serverda xatolik", 500);
  }
};

exports.editUser = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const { permitted_process_types, name, phone, role } = req.body;
    const admin = await User.findById(user_id);
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    await User.findByIdAndUpdate(id, {
      permitted_process_types,
      name,
      phone,
    });

    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return response.error(res, "Serverda xatolik", 500);
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
    return response.error(res, "Serverda xatolik", 500);
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
    return response.error(res, "Serverda xatolik", 500);
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
    return response.error(res, "Serverda xatolik", 500);
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
    return response.error(res, "Serverda xatolik", 500);
  }
};
