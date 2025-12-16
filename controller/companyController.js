const Companies = require("../model/companies");
const ValidationService = require("../utils/validation");
const logger = require("../utils/logger");
const companyImportService = require("../services/companyImportService");

exports.getAllCompanies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        limit = limit > 50 ? 50 : limit;

        const skip = (page - 1) * limit;


        const [companies, total] = await Promise.all([
            Companies.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Companies.countDocuments()
        ]);

        return res.status(200).json({
            status: true,
            message: "Companies fetched successfully",
            data: companies,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        logger.error("Get companies error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to fetch companies"
        });
    }
};

exports.addSingleCompany = async (req, res) => {
    try {
        const companyData = req.body;

        const validationError = ValidationService.validateCompanyData(companyData);
        if (validationError) {
            return res.status(422).json(validationError);
        }

        const existingCompany = await Companies.findOne({
            GSTNumber: companyData.GSTNumber
        });

        if (existingCompany) {
            return res.status(409).json({
                status: false,
                message: "Company with this GST number already exists."
            });
        }

        const createdCompany = await Companies.create(companyData);

        logger.info(`Company created successfully`)
        return res.status(201).json({
            status: true,
            message: "Company created successfully.",
            data: createdCompany
        });

    } catch (error) {
        logger.error("Error creating company:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to create company.",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : "Internal server error"
        });
    }
};

exports.addCompanisWithCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "CSV file is required"
            });
        }

        const result = await companyImportService.importCompaniesFromCSV(
            req.file.path
        )

        // If the service resolves, it means processing completed (success or partial success)
        // If it rejects, it goes to catch block.

        return res.status(200).json({
            status: true,
            message: result.message || "CSV processed successfully",
            data: {
                insertedCount: result.insertedCount,
                errorCount: result.errorCount,
                errors: result.errors
            }
        });
    }
    catch (error) {
        logger.error("CSV upload error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to upload CSV",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : "Internal server error"
        });
    }
}

exports.editCompanyDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Validating the body 
        const validationError =
            ValidationService.validateCompanyUpdateData(data);

        if (validationError) {
            return res.status(422).json(validationError);
        }

        // Build update object (only provided fields)
        const updateData = {};

        if (data.name) updateData.name = data.name;
        if (data.GSTNumber) updateData.GSTNumber = data.GSTNumber.toUpperCase();
        if (data.apob) updateData.apob = data.apob;
        if (data.city) updateData.city = data.city;
        if (data.country) updateData.country = data.country;
        if (data.contact) updateData.contact = data.contact;
        if (data.address) updateData.address = data.address;

        //  Nothing to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status: false,
                message: "No fields provided to update"
            });
        }

        //  Update company
        const updatedCompany = await Companies.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        //  Company not found
        if (!updatedCompany) {
            return res.status(404).json({
                status: false,
                message: "Company not found"
            });
        }

        // Success
        return res.status(200).json({
            status: true,
            message: "Company details updated successfully",
            data: updatedCompany
        });

    } 
    catch (error) {
        // Duplicate GST
        if (error.code === 11000) {
            return res.status(400).json({
                status: false,
                message: "GST number already exists"
            });
        }

        logger.error("Edit company error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to update company"
        });
    }
}


exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Companies.findByIdAndDelete(id);

        //  Company not found
        if (!company) {
            logger.info("No company found");
            return res.status(404).json({
                status: false,
                message: "No company found"
            });
        }
        

        return res.status(200).json({
            status: true,
            message: "Company deleted successfully"
        });

    } catch (error) {
        logger.error("Error deleting company", error);

        return res.status(500).json({
            status: false,
            message: "Failed to delete company"
        });
    }
};
