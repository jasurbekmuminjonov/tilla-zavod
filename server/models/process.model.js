const mongoose = require("mongoose");

const ProcessSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // start_gold_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    // },
    // end_gold_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: false,
    //   default: null,
    // },
    start_gramm: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    astatka_gramm: {
      type: Number,
      required: false,
      default: null,
      min: 0,
    },
    start_purity: {
      type: Number,
      required: false,
      min: 0,
      default: 585,
    },
    end_purity: {
      type: Number,
      required: false,
      default: null,
    },
    // end_product_purity: {
    //   type: Number,
    //   required: false,
    //   min: 0,
    //   default: null,
    // },
    end_gramm: {
      type: Number,
      required: false,
      min: 0,
      default: null,
    },
    quantity: {
      type: Number,
      // required: true,
      default: null,
    },
    lost_gramm: {
      type: Number,
      required: false,
      default: null,
    },
    lost_per_gramm: {
      type: Number,
      required: false,
      default: null,
    },
    start_time: {
      type: Date,
      default: Date.now,
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
      enum: ["active", "inactive"],
      default: "active",
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
