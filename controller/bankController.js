const Banks = require('../model/banks');
const ValidationService = require('../utils/validation');
const logger = require('../utils/logger');

exports.getBanks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        limit = limit > 50 ? 50 : limit;

        const skip = (page - 1) * limit;

        const [banks, total] = await Promise.all([
            Banks.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Banks.countDocuments()
        ]);

        return res.status(200).json({
            status: true,
            message: "Banks fetched successfully",
            data: banks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        logger.error("cannot get banks error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to fetch banks"
        });
    }
};

exports.addBank = async (req, res) => {
    try {
        
        const data = req.body
        // Validate request body
        const validationError = ValidationService.validateBankData(data);
        if (validationError) {
            return res.status(422).json(validationError);
        }

        const {
            bankName,
            IFSC_code,
            AD_code,
            Account_Number,
            Address
        } = req.body;

        // Fast duplicate check
        const exists = await Banks.findOne({
            $or: [
                { IFSC_code: IFSC_code.trim().toUpperCase() },
                { AD_code: AD_code.trim().toUpperCase() },
                { Account_Number }
            ]
        });

        if (exists) {
            return res.status(409).json({
                status: false,
                message: "Bank already exists with same IFSC, AD code or account number.",
            });
        }

        // Create bank
        const bank = await Banks.create({
            bankName,
            IFSC_code,
            AD_code,
            Account_Number,
            Address
        });

        return res.status(201).json({
            status: true,
            message: "Bank added successfully.",
            data: bank
        });

    } catch (error) {
        logger.error("Add Bank Error:", error);

        // Mongo unique constraint fallback
        if (error.code === 11000) {
            return res.status(409).json({
                status: false,
                message: "Duplicate bank entry detected.",
            });
        }

        return res.status(500).json({
            status: false,
            message: "Internal server error.",
        });
    }
};

exports.editBank = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Mongo ID (FAST)
        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Invalid bank ID.",
            });
        }

        // Validate request body
        const validationError = ValidationService.validateBankUpdateData(req.body);
        if (validationError) {
            return res.status(422).json(validationError);
        }

        // Prepare update payload (only allowed fields)
        const updateData = {};
        const allowedFields = [
            "bankName",
            "IFSC_code",
            "AD_code",
            "Account_Number",
            "Address"
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Nothing to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status: false,
                message: "No valid fields provided for update.",
            });
        }

        // Fast duplicate check (only when needed)
        if (updateData.IFSC_code || updateData.AD_code || updateData.Account_Number) {
            const duplicate = await Banks.exists({
                _id: { $ne: id },
                $or: [
                    updateData.IFSC_code ? { IFSC_code: updateData.IFSC_code.trim().toUpperCase() } : null,
                    updateData.AD_code ? { AD_code: updateData.AD_code.trim().toUpperCase() } : null,
                    updateData.Account_Number ? { Account_Number: updateData.Account_Number } : null,
                ].filter(Boolean)
            });

            if (duplicate) {
                return res.status(409).json({
                    status: false,
                    message: "Another bank already exists with same IFSC, AD code or account number.",
                });
            }
        }

        // SINGLE DB CALL (fast)
        const updatedBank = await Banks.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedBank) {
            return res.status(404).json({
                status: false,
                message: "Bank not found.",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Bank updated successfully.",
            data: updatedBank,
        });

    } catch (error) {
        logger.error("Edit Bank Error:", error);

        // Mongo unique index fallback
        if (error.code === 11000) {
            return res.status(409).json({
                status: false,
                message: "Duplicate bank entry detected.",
            });
        }

        return res.status(500).json({
            status: false,
            message: "Internal server error.",
        });
    }
};

exports.deleteBank = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Mongo ID (prevents DB hit)
        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Invalid bank ID.",
            });
        }

        const deletedBank = await Banks.findByIdAndDelete(id);

        if (!deletedBank) {
            return res.status(404).json({
                status: false,
                message: "Bank not found.",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Bank deleted successfully.",
        });

    } catch (error) {
        logger.error("Delete Bank Error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error.",
        });
    }
};