const mongoose = require("mongoose");

const ToolTransportionSchema = new mongoose.Schema(
  {
    tools: {
      type: [
        {
          tool_id: { //warehouse.tools[n]._id
            type: mongoose.Types.ObjectId,
            required: true,
          },
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

module.exports = mongoose.model("ToolTransportion", ToolTransportionSchema);
