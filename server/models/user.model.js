const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
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
    permitted_process_types: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProcessType",
        },
      ],
      default: [],
    },
    attached_warehouses: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Warehouse",
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
