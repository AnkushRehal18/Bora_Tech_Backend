const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      minlength: [5, 'Company name must be at least 5 characters'],
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      trim: true
    },

    GSTNumber: {
      type: String,
      required: [true, 'GST number is required'],
      unique: true,
      index: true,
      uppercase: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        'Invalid GST number format'
      ]
    },

    apob: {
      type: String,
      maxlength: [100, 'APOB cannot exceed 100 characters'],
      trim: true
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },

    country: {
      type: String,
      default: 'India',
      trim: true
    },

    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^[6-9]\d{9}$/, 'Invalid Indian mobile number'],
      index: true
    },

    address: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('companies', companySchema);
