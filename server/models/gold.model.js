const mongoose = require("mongoose");

const GoldSchema = new mongoose.Schema(
  {
    entered_gramm: {
      type: Number,
      required: true,
      min: 0,
    },
    gramm: {
      type: Number,
      required: true,
      min: 0,
    },
    ratio: {
      type: Number,
      required: true,
      min: 0,
    },
    purity: {
      type: Number,
      required: true,
      min: 0,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    factory_id: {
      type: mongoose.Types.ObjectId,
      ref: "Factory",
    },
    provider_id: {
      type: mongoose.Types.ObjectId,
      ref: "Provider",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gold", GoldSchema);
