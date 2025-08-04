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
    allowed_process_types: {
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
    allow_production: {
      type: Boolean,
      default: false,
    },
    create_gold: {
      type: Boolean,
      default: false,
    },
    create_tool: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
