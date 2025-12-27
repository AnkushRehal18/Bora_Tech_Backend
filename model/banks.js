const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    IFSC_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    AD_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    Account_Number: {
      type: Number,
      required: true,
      unique: true,
    },

    Address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bank", bankSchema);