
const jwt = require("jsonwebtoken");
const User = require("../model/users");
const logger = require("../utils/logger");
const config = require("../config/config");

const userAuth = async (req, res, next) => {
    //Read the token from the request cookies
    try {
        let token = null;

        const cookies = req.cookies;
        if (cookies && cookies.token) {
            token = cookies.token;
        }

        // If no token in cookies, check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }


        if (!token) {
            return res.status(401).json({
                status: false,
                message: "Authentication required. Please login."
            });
        }

        const decodedObj = await jwt.verify(token, config.jwt.secret);
        const userId = decodedObj;

        const user = await User.findOne({ _id: userId })

        if (!user) {
            return res.status(401).json({
                status: false,
                message: "User not found or account deactivated"
            });
        }

        req.user = user;
        next();
    }
    catch (error) {
        logger.error('Authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: false,
                message: "Invalid token"
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: false,
                message: "Token expired"
            });
        }

        return res.status(500).json({
            status: false,
            message: "Authentication failed",
            error: error.message
        });
    }
};

const requireAdmin = async (req, res, next) => {
    try {
        let token = null;

        // Check for token in cookies first
        const cookies = req.cookies;
        if (cookies && cookies.token) {
            token = cookies.token;
        }

        // If no token in cookies, check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }

        if (!token) {
            return res.status(401).json({
                status: false,
                message: "Authentication required. Please login."
            });
        }

        const decodedObj = await jwt.verify(token, config.jwt.secret);

        if (decodedObj.role !== "ADMIN") {
            return res.status(403).json({
                status: false,
                message: "Access denied: Admin privileges required"
            });
        }
        const userId = decodedObj.id;
        const user = await User.findOne({ _id: userId });

        req.user = user;
        next();
    }
    catch (error) {
        logger.error('Admin authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: false,
                message: "Invalid token"
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: false,
                message: "Token expired"
            });
        }

        return res.status(500).json({
            status: false,
            message: "Authentication failed",
            error: error.message
        });
    }
}
module.exports = {
    userAuth, requireAdmin
}
