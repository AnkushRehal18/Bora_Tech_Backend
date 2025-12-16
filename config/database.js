const mongoose = require('mongoose')
const logger = require('../utils/logger')

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.DB_CONNECT_SECRET)
        logger.info("MongoDB connected succesfully")
    }
    catch(err){
        logger.info(`MongoDB connection failed ${err}`)
    }
}

module.exports = connectDB