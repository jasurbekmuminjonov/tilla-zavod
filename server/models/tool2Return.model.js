const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    toolId: { type: Schema.Types.ObjectId, ref: "Tool2", required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, default: "" },

    // kim vazvrat qildi (siz bo'lasiz)
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

module.exports = model("Tool2Return", schema);
