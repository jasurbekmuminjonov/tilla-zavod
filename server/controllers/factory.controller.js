const Factory = require("../models/factory.model");

exports.createFactory = async (req, res) => {
  try {
    await Factory.create(req.body);
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return response.error(res, "Serverda xatolik", 500);
  }
};

exports.getFactory = async (req, res) => {
  try {
    const factory = await Factory.findById(req.user.factory_id);
    return res.status(200).json(factory);
  } catch (err) {
    console.log(err.message);
    return response.error(res, "Serverda xatolik", 500);
  }
};
