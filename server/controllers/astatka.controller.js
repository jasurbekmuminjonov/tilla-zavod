const Astatka = require("../models/astatka.model");
const User = require("../models/user.model");

exports.createAstatka = async (req, res) => {
  try {
    const {
      total_import,
      total_export,
      total_losses,
      total_product,
      real_astatka,
    } = req.body;
    const { factory_id } = req.user;

    const calculated_astatka =
      total_import - total_export - total_losses - total_product;
    const difference = calculated_astatka - real_astatka;
    req.body.factory_id = factory_id;
    req.body.calculated_astatka = calculated_astatka;
    req.body.difference = difference;
    await Astatka.create(req.body);
    res.json({ message: "Astatka saqlandi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getAstatka = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const user = await User.findById(user_id);
    let data;
    if (user.role === "admin") {
      data = await Astatka.find({ factory_id })
        .populate("user_id")
        .sort("-createdAt");
    } else {
      data = await Astatka.find({ factory_id, user_id })
        .populate("user_id")
        .sort("-createdAt");
    }
    res.json(data);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.editAstatka = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const user = await User.findById(user_id);
    if (user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Astatkani faqat admin tahrirlay oladi" });
    }
    await Astatka.findByIdAndUpdate(id, req.body);
    res.json({ message: "Tahrirlandi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
exports.deleteAstatka = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;
    const user = await User.findById(user_id);
    if (user.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Astatkani faqat admin o'chira oladi" });
    }
    await Astatka.findByIdAndDelete(id);
    res.json({ message: "O'chirildi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
