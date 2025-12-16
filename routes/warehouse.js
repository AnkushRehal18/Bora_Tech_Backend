const express = require('express');
const warehouseRouter = express.Router();
const {requireAdmin} = require('../middleware/auth');
const warehouseController = require('../controller/warehouseController');

warehouseRouter.get('/getWarehouses', requireAdmin, warehouseController.getAllWarehouses);
warehouseRouter.post('/createWarehouse', requireAdmin, warehouseController.addWarehouse);
warehouseRouter.put('/editWarehouseData/:id', requireAdmin, warehouseController.editWarehouse);

module.exports = warehouseRouter;