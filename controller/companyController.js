const Companies = require("../model/companies");
const ValidationService = require("../utils/validation");
const logger = require("../utils/logger");
const companyImportService = require("../services/companyImportService");

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

exports.addCompanisWithCSV = async(req,res) =>{
    try{
        if(!req.file){
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
    catch(error){
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
