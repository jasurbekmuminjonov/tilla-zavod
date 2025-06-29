const ToolTransportion = require("../models/toolTransportion.model");
const Warehouse = require("../models/warehouse.model");
const User = require("../models/user.model");

exports.createToolTransportion = async (req, res) => {
  try {
    const { tools, warehouse_id } = req.body;
    req.body.factory_id = req.user.factory_id;

    const warehouse = await Warehouse.findById(warehouse_id);
    if (!warehouse) return res.status(404).json({ message: "Ombor topilmadi" });

    tools.forEach((tool) => {
      const existingTool = warehouse.tools.find(
        (t) => t._id.toString() === tool.tool_id
      );

      if (!existingTool || existingTool.quantity < tool.quantity) {
        throw new Error(
          `Omborda yetarli miqdorda ${tool.tool_name} mavjud emas`
        );
      }

      existingTool.quantity -= tool.quantity;
    });

    await warehouse.save();

    const newTransportion = await ToolTransportion.create(req.body);

    res.status(201).json(newTransportion);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Yaratishda xatolik", error: error.message });
  }
};

exports.getToolTransportion = async (req, res) => {
  try {
    const { factory_id, user_id } = req.user;
    const user = await User.findById(user_id);
    if (user.role !== "admin") {
      return res.status(400).json({ message: "Sizda bunday huquq yo'q" });
    }
    const data = await ToolTransportion.find({ factory_id });
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ma'lumotlarni olishda xatolik", error: error.message });
  }
};

exports.getSentToolTransportion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const data = await ToolTransportion.find().filter((item) =>
      user.attached_warehouses.some(
        (w) => w.toString() === item.warehouse_id.toString()
      )
    );

    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ma'lumotlarni olishda xatolik", error: error.message });
  }
};

exports.getGetToolTransportions = async (req, res) => {
  try {
    const user_id = req.user._id;
    const data = await ToolTransportion.find({ user_id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Qabul qilingan transportlarni olishda xatolik",
      error: error.message,
    });
  }
};

exports.completeToolTransportion = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await ToolTransportion.findById(id);
    if (!transport || transport.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Transport topilmadi yoki allaqachon yakunlangan" });
    }

    const user = await User.findById(transport.user_id);
    if (!user)
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    transport.tools.forEach((tool) => {
      user.tools.push(tool);
    });

    await user.save();
    transport.status = "completed";
    await transport.save();

    res.status(200).json({ message: "Transport qabul qilindi", transport });
  } catch (error) {
    res.status(500).json({
      message: "Transportni qabul qilishda xatolik",
      error: error.message,
    });
  }
};

exports.cancelToolTransportion = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await ToolTransportion.findById(id);
    if (!transport || transport.status !== "pending") {
      return res.status(400).json({
        message: "Transport topilmadi yoki allaqachon qayta ishlangan",
      });
    }

    const warehouse = await Warehouse.findById(transport.warehouse_id);
    if (!warehouse) return res.status(404).json({ message: "Ombor topilmadi" });

    transport.tools.forEach((tool) => {
      const existingTool = warehouse.tools.find(
        (t) => t._id.toString() === tool.tool_id
      );

      existingTool.quantity += tool.quantity;
    });

    await warehouse.save();
    transport.status = "canceled";
    await transport.save();

    res.status(200).json({ message: "Transport bekor qilindi", transport });
  } catch (error) {
    res.status(500).json({
      message: "Transportni bekor qilishda xatolik",
      error: error.message,
    });
  }
};
