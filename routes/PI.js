const express = require('express');
const PIRouter = express.Router();
const PIController = require('../controller/PIController');
const { requireAdmin } = require('../middleware/auth');

PIRouter.post('/createPi', requireAdmin , PIController.createPI);
PIRouter.get('/getPi', requireAdmin , PIController.getPIList);
PIRouter.get('/getSinglePi/:id', requireAdmin, PIController.getSinglePiDetail);
PIRouter.delete('/deletePi/:id', requireAdmin, PIController.deleteSinglePI );

module.exports = PIRouter;