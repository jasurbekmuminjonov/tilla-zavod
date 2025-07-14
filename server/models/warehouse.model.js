const mongoose = require("mongoose");

const WarehouseSchema = new mongoose.Schema(
  {
    warehouse_name: {
      type: String,
      required: true,
      trim: true,
    },
    tools: {
      type: [
        {
          tool_name: {
            type: String,
            trim: true,
            required: true,
          },
          unit: {
            type: String,
            required: true,
            enum: ["piece", "package", "box", "gr", "ml", "sm"],
          },
          quantity: {
            type: Number,
            required: true,
            min: 0,
          },
          buy_price: {
            type: Number,
            required: true,
            min: 0,
          },
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    gold: {
      type: [
        {
          provider_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Provider",
            required: true,
          },
          process_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Process",
            required: false,
            default: null,
          },
          gold_purity: {
            type: Number,
            min: 1,
            required: true,
          },
          product_purity: {
            // gold purity / ratio = product purity
            type: Number,
            min: 1,
            required: true,
          },
          ratio: {
            type: Number,
            required: true,
            min: 0,
          },
          description: {
            type: String,
            default: "",
          },
          gramm: {
            type: Number,
            required: true,
            min: 0,
          },
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
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
          purity: {
            type: Number,
            min: 1,
            required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warehouse", WarehouseSchema);
