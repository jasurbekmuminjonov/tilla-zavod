const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    entity: { type: String, required: true }, // masalan: "tool2", "tool3"
    itemId: { type: Schema.Types.ObjectId, required: true }, // ombor item _id

    quantity: { type: Number, required: true },
    reason: { type: String, default: "" },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

schema.index({ entity: 1, itemId: 1, createdAt: -1 });

module.exports = model("InventoryReturn", schema);
