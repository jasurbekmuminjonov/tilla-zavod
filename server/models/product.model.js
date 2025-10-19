const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    product_type_id: {
      type: mongoose.Types.ObjectId,
      ref: "ProductType",
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    total_gramm: {
      type: Number,
      required: true,
      min: 0,
    },
    ratio: {
      type: Number,
      required: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    factory_id: {
      type: mongoose.Types.ObjectId,
      ref: "Factory", 
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
