const Warehouse = require("../models/warehouse.model");
const User = require("../models/user.model");

exports.createTool = async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    const { warehouse_id } = req.body;
    if (!user.attached_warehouses.includes(warehouse_id)) {
      return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
    }
    const warehouse = await Warehouse.findById(warehouse_id);
    warehouse.tools.push(req.body);
    await warehouse.save();
    return res.status(201).end();
  } catch (err) {
    console.log(err.message);
    return response.error(res, "Serverda xatolik", 500);
  }
};

exports.getAllToolTypes = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({
      factory_id: req.user.factory_id,
    });

    const toolNamesSet = new Set();

    warehouses.forEach((warehouse) => {
      warehouse.tools.forEach((tool) => {
        if (tool.tool_name) {
          toolNamesSet.add(tool.tool_name);
        }
      });
    });

    const uniqueToolNames = Array.from(toolNamesSet);

    return res.status(200).json(uniqueToolNames);
  } catch (err) {
    console.log(err.message);
    return response.error(res, "Serverda xatolik", 500);
  }
};
