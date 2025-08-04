const mongoose = require("mongoose");

const ToolSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tool_name: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tool", ToolSchema);
