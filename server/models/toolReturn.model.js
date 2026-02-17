const { Schema, model } = require("mongoose");

const toolReturnSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // qaysi distributiondagi qaysi itemdan qaytyapti
    distributionId: {
      type: Schema.Types.ObjectId,
      ref: "ToolDistribution",
      required: true,
    },
    itemId: { type: Schema.Types.ObjectId, required: true }, // products ichidagi item _id
    productId: { type: Schema.Types.ObjectId, ref: "Tool2", required: true },

    quantity: { type: Number, required: true },
    note: { type: String, default: "" },

    status: { type: String, enum: ["pending", "accepted"], default: "pending" },
    acceptedAt: { type: Date, default: null },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

module.exports = model("ToolReturn", toolReturnSchema);
