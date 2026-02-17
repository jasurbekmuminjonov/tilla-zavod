const { Schema } = require("mongoose");

module.exports = function createInventoryBaseSchema() {
  return new Schema(
    {
      name: { type: String, required: true },
      from: { type: String, default: "" },
      price: { type: Number, default: 0 },
      quantity: { type: Number, default: 0 },
      deleted: { type: Boolean, default: false },
    },
    { timestamps: true },
  );
};
