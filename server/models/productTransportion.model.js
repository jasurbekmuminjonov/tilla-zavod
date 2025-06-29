const mongoose = require("mongoose");

const ProductTransportionSchema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          product_type_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductType",
            required: true,
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
          gramm_per_quantity: {
            type: Number,
            required: true,
            min: 0,
          },
          total_lost_gramm: {
            type: Number,
            required: true,
            min: 0,
          },
          date: {
            type: Date,
            default: Date.now,
          },
          gold_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
        },
      ],
      default: [],
    },
    warehouse_id: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "canceled"],
      default: "pending",
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ProductTransportion",
  ProductTransportionSchema
);
