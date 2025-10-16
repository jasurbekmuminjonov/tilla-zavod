const mongoose = require("mongoose");

const ToolTransportionSchema = new mongoose.Schema(
  {
    tool_id: {
      type: mongoose.Types.ObjectId,
      ref: "Tool",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    user_name: {
      type: String,
      default: null,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
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
