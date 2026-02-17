const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: { type: String, required: true },
    from: { type: String },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

module.exports = model("Tool2", schema);
