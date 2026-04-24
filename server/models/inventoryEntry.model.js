const { Schema, model } = require("mongoose");

const inventoryEntrySchema = new Schema(
  {
    entity: { type: String, required: true, enum: ["tool2", "tool3"], index: true },
    itemId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: [true, "Nomi majburiy"] },
    nameNormalized: { type: String, required: true, index: true },
    from: { type: String, default: "" },
    price: { type: Number, default: 0 },
    quantity: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    source: { type: String, enum: ["create", "legacy"], default: "create" },
  },
  { timestamps: true },
);

module.exports = model("InventoryEntry", inventoryEntrySchema);
