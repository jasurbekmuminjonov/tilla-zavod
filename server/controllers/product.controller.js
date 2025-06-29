const User = require("../models/user.model");

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
    user.products.push(req.body);
    await user.save();
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};
