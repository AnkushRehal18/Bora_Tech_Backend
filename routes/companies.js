const express = require('express');
const companyRouter = express.Router();
const companyController = require('../controller/companyController');
const {requireAdmin} = require('../middleware/auth');
const uploadCSV = require('../middleware/uploadCsv');

companyRouter.get('/getCompanyData', requireAdmin, companyController.getAllCompanies);
companyRouter.post('/addSingleCompany', requireAdmin, companyController.addSingleCompany);
companyRouter.post('/addCompaniesBulk', requireAdmin, uploadCSV.single('file'), companyController.addCompanisWithCSV)
companyRouter.put('/editCompanyData/:id', requireAdmin, companyController.editCompanyDetails);
companyRouter.delete('/deleteCompany/:id', requireAdmin, companyController.deleteCompany);


module.exports = companyRouter;