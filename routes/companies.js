const express = require('express')
const companyRouter = express.Router();
const companyController = require('../controller/companyController');
const {requireAdmin} = require('../middleware/auth');
const uploadCSV = require('../middleware/uploadCsv');

companyRouter.post('/addSingleCompany', requireAdmin, companyController.addSingleCompany);
companyRouter.post('/addCompaniesBulk', requireAdmin, uploadCSV.single('file'), companyController.addCompanisWithCSV)


module.exports = companyRouter;