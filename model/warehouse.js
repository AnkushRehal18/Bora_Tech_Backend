const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
    {
        warehouseName: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            default: "India",
            trim: true
        },
        contactDetails: {
            type: String,
            required: true,
            unique: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Warehouse", warehouseSchema);
