const mongoose = require("mongoose");

/**
 * ITEM SCHEMA (Line Items)
 */
const itemSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    hsn_sac: {
      type: String,
      required: true,
      trim: true,
    },

    made_in: {
      type: String,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * PI SCHEMA
 */
const PISchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies", // fixed typo
      required: true,
    },

    voucher_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    consignee: {
      type: String,
      required: true,
      trim: true,
    },

    buyer: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Pending", "Approved", "Cancelled"],
      default: "Draft",
    },

    // 🔥 MULTIPLE ITEMS
    items: {
      type: [itemSchema],
      required: true,
      validate: [
        {
          validator: (v) => v.length > 0,
          message: "At least one item is required",
        },
      ],
    },

    total_quantity: {
      type: Number,
      default: 0,
    },

    total_amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PI", PISchema);
