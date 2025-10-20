const mongoose = require("mongoose");

const ExternalTransportionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    provider_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Provider",
    },
    gramm: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      enum: ["import", "export"],
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ExternalTransportion",
  ExternalTransportionSchema
);
