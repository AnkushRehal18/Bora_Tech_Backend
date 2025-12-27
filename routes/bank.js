const express = require('express');
const bankRouter = express.Router();
const {requireAdmin} = require('../middleware/auth');
const bankController = require('../controller/bankController');

bankRouter.get('/getBanks', requireAdmin, bankController.getBanks);
bankRouter.post('/addBank', requireAdmin, bankController.addBank);
bankRouter.put('/editBankDetails/:id', requireAdmin, bankController.editBank);
bankRouter.delete('/deleteBank/:id', requireAdmin, bankController.deleteBank);


module.exports = bankRouter;