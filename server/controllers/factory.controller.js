const Factory = require("../models/factory.model");

exports.createFactory = async (req, res) => {
  try {
    await Factory.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};

exports.getFactory = async (req, res) => {
  try {
    const factory = await Factory.findById(req.user.factory_id);
    return res.status(200).json(factory);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({message:"Serverda xatolik", err})
  }
};
