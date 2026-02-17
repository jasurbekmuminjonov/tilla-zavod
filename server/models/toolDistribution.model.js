const { Schema, model, Types } = require("mongoose");

const productItemSchema = new Schema(
  {
    productRef: {
      type: String,
      required: true,
      enum: ["Tool2", "Tool3"], // qaysi model
    },
    productId: {
      type: Types.ObjectId,
      required: true,
      refPath: "products.productRef", // ✅ dynamic populate
    },
    quantity: { type: Number, required: true },
  },
  { timestamps: true },
);

const schema = new Schema(
  {
    entity: {
      type: String,
      required: true,
      enum: ["tool2", "tool3"], // ✅ qaysi ombor ekanligi
      index: true,
    },

    employeeId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    products: [productItemSchema],

    closed: { type: Boolean, default: false, index: true },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = model("ToolDistribution", schema);
