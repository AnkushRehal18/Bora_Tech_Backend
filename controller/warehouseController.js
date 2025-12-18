const Warehouse = require("../model/warehouse");
const ValidationService = require('../utils/validation');


exports.getAllWarehouses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        limit = limit > 50 ? 50 : limit;

        const skip = (page - 1) * limit;


        const [warehouses, total] = await Promise.all([
            Warehouse.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Warehouse.countDocuments()
        ]);

        return res.status(200).json({
            status: true,
            message: "Companies fetched successfully",
            data: warehouses,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        logger.error("cannot get warehouses error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to fetch warehouses"
        });
    }
};

exports.addWarehouse = async (req, res) => {
    try {
        const data = req.body;

        const validationError =
            ValidationService.validateWarehouseData(data);

        if (validationError) {
            return res.status(422).json(validationError);
        }

        const warehouse = await Warehouse.create({
            warehouseName: data.warehouseName,
            address: data.address,
            city: data.city,
            country: data.country || "India",
            contactDetails: data.contactDetails
        });

        return res.status(201).json({
            status: true,
            message: "Warehouse added successfully",
            data: warehouse
        });

    } catch (error) {
        // Duplicate warehouse name or contact
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                status: false,
                message: `${field} already exists`
            });
        }

        console.error("Add warehouse error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to add warehouse"
        });
    }
};

exports.editWarehouse = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Validate edit data
        const validationError =
            ValidationService.validateWarehouseUpdateData(data);

        if (validationError) {
            return res.status(422).json(validationError);
        }

        //  Build update object
        const updateData = {};
        if (data.warehouseName) updateData.warehouseName = data.warehouseName;
        if (data.address) updateData.address = data.address;
        if (data.city) updateData.city = data.city;
        if (data.country) updateData.country = data.country;
        if (data.contactDetails) updateData.contactDetails = data.contactDetails;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status: false,
                message: "No fields provided to update"
            });
        }

        const updatedWarehouse = await Warehouse.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedWarehouse) {
            return res.status(404).json({
                status: false,
                message: "Warehouse not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Warehouse updated successfully",
            data: updatedWarehouse
        });

    } catch (error) {
        // Duplicate name or contact
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                status: false,
                message: `${field} already exists`
            });
        }

        console.error("Edit warehouse error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to update warehouse"
        });
    }
};
