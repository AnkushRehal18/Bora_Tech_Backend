const User = require("../model/users");
const logger = require("../utils/logger")
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const ValidationService = require('../utils/validation');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        logger.info(`Login attempt for email: ${email}`);

        // Validate input
        const validationError = ValidationService.validateLoginData(email, password);
        if (validationError) {
            logger.warn(`Validation failed for email: ${email}`, validationError);
            return res.status(400).json(validationError);
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            res.status(404).json({
                status: false,
                message: "User not found"
            })
        }

        const isPasswordValid = await user.validatePassword(password);

        if (!isPasswordValid) {
            logger.warn(`Password mismatch for email: ${email}`);
            return res.status(401).json({
                status: false,
                message: "Invalid credentials."
            });
        }
        const token = await jwt.sign(
            { _id: user._id, role: user.role },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
        logger.info(`JWT token generated for user: ${email}`);

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: config.server.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        logger.info(`User successfully logged in: ${email}`);

        return res.status(200).json({
            status: true,
            message: "Login successful.",
            data: {
                id: user._id,
                email: user.email,
                role: user.role,
                token: token
            }
        });
    }
    catch (error) {
        logger.error(`Login error for email: ${req.body.email}`, error);
        return res.status(500).json({
            status: false,
            message: "Login failed.",
            error: config.server.nodeEnv === 'development' ? error.message : 'Internal server error'
        });
    }
}

exports.logout = (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            secure: config.server.nodeEnv === 'production',
            sameSite: 'strict',
            expires: new Date(0)
        });

        logger.info(`User logged out: ${req.user?.email || 'unknown'}`);

        return res.status(200).json({
            status: true,
            message: "Logout successful."
        });
    } catch (error) {
        logger.error('Logout error:', error);
        return res.status(500).json({
            status: false,
            message: "Logout failed.",
            error: config.server.nodeEnv === 'development' ? error.message : 'Internal server error'
        });
    }
};