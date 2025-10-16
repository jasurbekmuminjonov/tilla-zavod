const User = require("../models/user.model");
const Tool = require("../models/tool.model");
const ToolCreating = require("../models/toolCreating.model");

exports.createTool = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const { tool_name, stock } = req.body;
    const user = await User.findById(user_id);
    if (!user.create_tool) {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    const tool = await Tool.findOne({ tool_name, user_id });
    if (tool) {
      tool.stock += stock;
      await tool.save();
      await ToolCreating.create({
        tool_id: tool._id,
        quantity: stock,
        user_id,
        factory_id,
      });
    } else {
      req.body.user_id = user_id;
      req.body.factory_id = factory_id;
      const createdTool = await Tool.create(req.body);
      await ToolCreating.create({
        tool_id: createdTool._id,
        quantity: stock,
        user_id,
        factory_id,
      });
    }
    res.status(201).json({
      message: "Запчасть kirim qilindi",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getTools = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const user = await User.findById(user_id);
    const isAdmin = user.role === "admin";
    let tools;
    if (isAdmin) {
      tools = await Tool.find({ factory_id });
    } else {
      tools = await Tool.find({ factory_id, user_id });
    }
    res.status(200).json(tools);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.getToolCreatings = async (req, res) => {
  try {
    const { user_id, factory_id } = req.user;
    const user = await User.findById(user_id);
    const isAdmin = user.role === "admin";
    let tools;
    if (isAdmin) {
      tools = await ToolCreating.find({ factory_id }).populate("tool_id");
    } else {
      tools = await ToolCreating.find({ factory_id, user_id }).populate(
        "tool_id"
      );
    }
    res.status(200).json(tools);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.deleteTool = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { id } = req.params;

    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({ message: "Zapchast topilmadi" });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    if (user.role !== "admin" && tool.user_id?.toString() !== user_id) {
      return res.status(400).json({
        message: "Zapchastni faqat admin yoki uni kiritgan xodim o‘chira oladi",
      });
    }

    await tool.deleteOne();

    await ToolCreating.deleteMany({ tool_id: id });

    res
      .status(200)
      .json({ message: "Zapchast va unga bog‘langan hujjatlar o‘chirildi" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};
