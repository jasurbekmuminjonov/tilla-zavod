const mongoose = require("mongoose");

const ToolTransportionSchema = new mongoose.Schema(
  {
    tool_id: {
      //warehouse.tools[n]._id
      type: mongoose.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
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
