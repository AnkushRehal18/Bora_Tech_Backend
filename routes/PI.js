const express = require('express');
const PIRouter = express.Router();
const PIController = require('../controller/PIController');
const { requireAdmin } = require('../middleware/auth');
const uploadCSV = require('../middleware/uploadCsv');

PIRouter.post('/createPi', requireAdmin, PIController.createPI);
PIRouter.get('/getPi', requireAdmin, PIController.getPIList);
PIRouter.get('/getSinglePi/:id', requireAdmin, PIController.getSinglePiDetail);
PIRouter.delete('/deletePi/:id', requireAdmin, PIController.deleteSinglePI);
PIRouter.delete('/bulk-delete', requireAdmin, PIController.bulkDeletePI);
PIRouter.post('/bulk-insert', requireAdmin, uploadCSV.single('file'), PIController.uploadPICSV);
PIRouter.put('/pi-update/:id', requireAdmin, PIController.updatePI);

module.exports = PIRouter;