const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Tool2",
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model("ToolDistribution", schema);
