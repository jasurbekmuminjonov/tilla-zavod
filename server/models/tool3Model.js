const { model } = require("mongoose");
const createInventoryBaseSchema = require("./_inventoryBase.schema");

module.exports = model("Tool3", createInventoryBaseSchema());
