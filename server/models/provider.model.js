const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema(
  {
    provider_name: {
      type: String,
      required: true,
      trim: true,
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Provider", ProviderSchema);
