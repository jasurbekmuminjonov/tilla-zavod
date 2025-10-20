const ProductType = require("../models/productType.model");
const Product = require("../models/product.model");

exports.createProductType = async (req, res) => {
  try {
    req.body.factory_id = req.user.factory_id;
    await ProductType.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getProductTypes = async (req, res) => {
  try {
    const productTypes = await ProductType.find({
      factory_id: req.user.factory_id,
    }).sort({ createdAt: -1 });
    return res.status(200).json(productTypes);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.editProductType = async (req, res) => {
  try {
    const { id } = req.params;
    await ProductType.findByIdAndUpdate(id, {
      product_name: req.body.product_name,
    });
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.deleteProductType = async (req, res) => {
  try {
    const { id } = req.params;
    await ProductType.findByIdAndDelete(id);
    await Product.deleteMany({ product_type_id: id });
    return res.status(200).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
