const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/database');
const { parseAndSavePIFromCSV } = require('./services/PiImportService');
const Companies = require('./model/companies');
const PI = require('./model/PI');

const runTest = async () => {
    try {
        await connectDB();
        
        // 1. Create a test company
        const testGST = "29ABCDE1234F1Z5";
        await Companies.deleteMany({ GSTNumber: testGST });
        
        const company = await Companies.create({
            name: "Test PI Company",
            GSTNumber: testGST,
            apob: "Test APOB",
            city: "Bangalore",
            country: "India",
            contact: "9876543210",
            address: "Test Address"
        });
        
        console.log("Created Company:", company._id, company.GSTNumber);

        // 2. Create a test CSV
        // Assuming the CSV uses 'company_code' which matches GSTNumber? 
        // Or maybe it expects a field 'code' which doesn't exist?
        // Let's try passing GSTNumber as company_code
        const csvContent = `company_code,voucher_no,date,consignee,buyer,status,product_id,product_name,sku,category,brand,hsn_sac,made_in,quantity,rate
${testGST},VOUCHER001,2023-10-01,Consignee A,Buyer A,Draft,PROD001,Test Product,SKU001,Cat1,BrandX,123456,India,10,100`;
        
        const filePath = path.join(__dirname, 'test_pi.csv');
        fs.writeFileSync(filePath, csvContent);
        
        console.log("Running PI import...");
        const count = await parseAndSavePIFromCSV(filePath);
        console.log("Imported PIs:", count);
        
        if (count === 0) {
            console.log("Import failed to process any rows.");
        } else {
            console.log("Import successful.");
        }

        // Cleanup
        await PI.deleteMany({ voucher_no: "VOUCHER001" });
        await Companies.deleteOne({ _id: company._id });
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        
    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();