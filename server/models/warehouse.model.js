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
          carried_processes: {
            type: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Process",
              },
            ],
            default: [],
          },
          gold_purity: {
            type: Number,
            max: 1000,
            min: 1,
            required: true,
          },
          product_purity: {
            // gold purity / ratio = product purity
            type: Number,
            max: 1000,
            min: 1,
            required: true,
          },
          ratio: {
            type: Number,
            required: true,
            min: 0,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warehouse", WarehouseSchema);
