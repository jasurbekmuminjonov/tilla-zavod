const mongoose = require("mongoose");

const ToolSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tool_name: {
      type: String,
      required: true,
    },
    usd_price: {
      type: Number,
      default: null,
    },
    uzs_price: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ToolSchema.virtual("total_usd").get(function () {
  if (this.usd_price == null) return null;
  return this.usd_price * this.stock;
});

ToolSchema.virtual("total_uzs").get(function () {
  if (this.uzs_price == null) return null;
  return this.uzs_price * this.stock;
});

module.exports = mongoose.model("Tool", ToolSchema);
