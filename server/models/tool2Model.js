const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: { type: String, required: true },
    from: { type: String },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

module.exports = model("Tool2", schema);
