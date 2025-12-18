require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const config = require('./config/config');
const connectDB = require('./config/database');
const app = express();
const authRouter = require('./routes/auth');
const companyRouter = require('./routes/companies');
const warehouseRouter = require('./routes/warehouse');
app.use(express.json());


app.use("/api/auth", authRouter);
app.use("/api/companies", companyRouter);
app.use("/api/warehouse", warehouseRouter);

const startServer = async () => {
    try {
        await connectDB();
        app.listen(config.server.port, () => {
            logger.info(`Server is running on port ${config.server.port} in ${config.server.nodeEnv} mode`);
        });
    }
    catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    startServer();
}