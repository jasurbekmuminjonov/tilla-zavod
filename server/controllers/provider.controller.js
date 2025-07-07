const Provider = require("../models/provider.model");

exports.createProvider = async (req, res) => {
  try {
    req.body.factory_id = req.user.factory_id;
    await Provider.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
  return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ factory_id: req.user.factory_id });
    return res.status(200).json(providers);
  } catch (err) {
    console.log(err.message);
   return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
