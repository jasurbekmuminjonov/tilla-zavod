const mongoose = require("mongoose");

const ProcessSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    start_gold_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    end_gold_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      default: null,
    },
    start_gramm: {
      type: Number,
      required: true,
      min: 0,
    },
    end_purity: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
      default: null,
    },
    end_product_purity: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
      default: null,
    },
    end_gramm: {
      type: Number,
      required: true,
      min: 0,
      default: null,
    },
    lost_gramm: {
      type: Number,
      required: true,
      min: 0,
      default: null,
    },
    lost_per_gramm: {
      type: Number,
      required: true,
      min: 0,
      default: null,
    },
    start_time: {
      type: Date,
      default: null,
    },
    end_time: {
      type: Date,
      default: null,
    },
    process_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcessType",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "failed"],
      default: "pending",
      required: true,
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Process", ProcessSchema);
