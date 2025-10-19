const mongoose = require("mongoose");

const ToolCreatingSchema = new mongoose.Schema(
  {
    tool_id: {
      type: mongoose.Types.ObjectId,
      ref: "Tool",
      required: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
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
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ToolCreatingSchema.virtual("total_usd").get(function () {
  if (this.usd_price == null) return null;
  return this.usd_price * this.quantity;
});

ToolCreatingSchema.virtual("total_uzs").get(function () {
  if (this.uzs_price == null) return null;
  return this.uzs_price * this.quantity;
});

module.exports = mongoose.model("ToolCreating", ToolCreatingSchema);
