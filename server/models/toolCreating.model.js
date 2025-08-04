const mongoose = require("mongoose");

const ToolCreatingSchema = new mongoose.Schema(
  {
    tool_id: {
      type: mongoose.Types.ObjectId,
      ref: "Tool",
      required: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ToolCreating", ToolCreatingSchema);
