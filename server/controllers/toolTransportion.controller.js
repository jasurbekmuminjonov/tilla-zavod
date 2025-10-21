const ToolTransportion = require("../models/toolTransportion.model");
const User = require("../models/user.model");
const Tool = require("../models/tool.model");

exports.createToolTransportion = async (req, res) => {
  try {
    const { tool_id, user_name, quantity, user_id } = req.body;
    req.body.factory_id = req.user.factory_id;
    const tool = await Tool.findById(tool_id);
    if (tool.stock - quantity < 0) {
      return res
        .status(400)
        .json({ message: "Склад da yetarli запчасть mavjud emas" });
    }
    tool.stock -= quantity;

    await ToolTransportion.create({
      tool_id,
      quantity,
      user_name,
      factory_id: req.body.factory_id,
      user_id,
    });
    await tool.save();

    res.status(201).json({
      message: "Запчасть chiqim qilindi",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Yaratishda xatolik",
      error: error.message,
    });
  }
};

exports.getToolTransportion = async (req, res) => {
  try {
    const { factory_id, user_id } = req.user;
    const user = await User.findById(user_id);
    const isAdmin = user.role === "admin";

    let toolTransportions = await ToolTransportion.find({
      factory_id,
    })
      .populate({
        path: "tool_id",
        select: "user_id tool_name",
      })
      .populate("user_id");

    if (!isAdmin) {
      toolTransportions = toolTransportions.filter(
        (t) => t.tool_id?.user_id?.toString() === user_id.toString()
      );
    }

    res.status(200).json(toolTransportions);
  } catch (error) {
    res.status(500).json({
      message: "Ma'lumotlarni olishda xatolik",
      error: error.message,
    });
  }
};

exports.deleteToolTransportion = async (req, res) => {
  try {
    const { id } = req.params;
    const toolTransportion = await ToolTransportion.findById(id);
    const tool = await Tool.findById(toolTransportion.tool_id);
    tool.stock += toolTransportion.quantity;
    await tool.save();
    await ToolTransportion.findByIdAndDelete(id);
    res.status(200).json({ message: "Запчасть chiqim o'chirildi" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
