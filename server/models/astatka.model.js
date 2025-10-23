const mongoose = require("mongoose");

const AstaktaSchema = new mongoose.Schema(
  {
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_import: {
      type: Number,
      required: true,
    },
    total_get: {
      type: Number,
      required: true,
      default: null,
    },
    total_export: {
      type: Number,
      required: true,
    },
    total_losses: {
      type: Number,
      required: true,
    },
    total_product: {
      type: Number,
      required: true,
    },
    calculated_astatka: {
      type: Number,
      required: true,
    },
    real_astatka: {
      type: Number,
      required: true,
    },
    difference: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Astakta", AstaktaSchema);
