const mongoose = require("mongoose");

const FactorySchema = new mongoose.Schema(
  {
    factory_name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Factory", FactorySchema);
  