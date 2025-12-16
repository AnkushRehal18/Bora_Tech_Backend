const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/database');
const companyImportService = require('./services/companyImportService');
const Companies = require('./model/companies');

const runTest = async () => {
    try {
        await connectDB();
        
        // Create a test CSV file
        const csvContent = `name,GSTNumber,apob,city,country,contact,address
Test Company 1,27ABCDE1234F1Z5,Test APOB,Pune,India,9876543210,Test Address
Test Company 2,27ABCDE1234F1Z6,,Mumbai,India,919876543211,
Invalid Company,INVALID_GST,,Delhi,India,123,`;
        
        const filePath = path.join(__dirname, 'test_companies.csv');
        fs.writeFileSync(filePath, csvContent);
        
        console.log("Test CSV created at:", filePath);
        
        console.log("Running import...");
        const result = await companyImportService.importCompaniesFromCSV(filePath);
        
        console.log("Import Result:", JSON.stringify(result, null, 2));
        
        // Cleanup DB
        console.log("Cleaning up inserted test data...");
        await Companies.deleteMany({ name: { $regex: /^Test Company/ } });
        console.log("Cleanup done.");
        
    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();