const mongoose = require("mongoose");

const TransportionSchema = new mongoose.Schema(
  {
    from_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    to_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    sent_gramm: {
      type: Number,
      required: true,
      min: 0,
    },
    sent_time: {
      type: Date,
      default: Date.now,
    },
    get_time: {
      type: Date,
      default: null,
    },
    get_gramm: {
      type: Number,
      required: false,
      min: 0,
      default: null,
    },
    returned_gramm: {
      type: Number,
      required: false,
      min: 0,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "canceled"],
      default: "pending",
    },
    factory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transportion", TransportionSchema);
