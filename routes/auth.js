const express = require('express')
const authRouter = express.Router();
const authController = require('../controller/authController');
const {userAuth} = require('../middleware/auth')
//Public Routes

authRouter.post('/login', authController.login);

//Protected Route
authRouter.post('/logout',userAuth, authController.logout);

module.exports= authRouter