const mongoose = require('mongoose');
const validator = require('validator');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                logger.info("Invalid Email value being entered")
                throw new Error("Invalid Email address" + value)
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                logger.info("A strong password is required")
                throw new Error("Enter a strong Password" + value)
            }
        }

    },
    role: {
        type: String,
        enum: ['ADMIN', 'REGULAR'],
        default: 'REGULAR',
    }

})

userSchema.methods.validatePassword = async function (passwordInpuByUser) {
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = bcrypt.compare(passwordInpuByUser, passwordHash)

    return isPasswordValid
}

module.exports = mongoose.model('User', userSchema)