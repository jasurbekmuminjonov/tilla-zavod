const mongoose = require("mongoose");

const TransportionSchema = new mongoose.Schema(
  {
    from_type: {
      type: String,
      required: true,
      enum: ["User", "Warehouse"],
    },
    to_type: {
      type: String,
      required: true,
      enum: ["User", "Warehouse"],
    },
    from_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "from_type",
    },
    to_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "from_type",
    },
    gold_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
      default: Date.now,
    },
    get_gramm: {
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
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "cancelled"],
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
