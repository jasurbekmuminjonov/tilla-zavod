const mongoose = require("mongoose");

const ProcessTypeSchema = new mongoose.Schema(
  {
    process_name: {
      type: String,
      required: true,
      trim: true,
    },
    process_suffix: {
      type: String,
      required: true,
      trim: true,
    },
    weight_loss: {
      type: Boolean,
      default: false,
    },
    purity_change: {
      type: Boolean,
      default: false,
    },
    split_to_product: {
      type: Boolean,
      default: false,
    },
    loss_limit_per_gramm: {
      type: Number,
      default: 0,
      min: 0,
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProcessType", ProcessTypeSchema);
