const validator = require('validator');

class ValidationService {

    static validateLoginData(email, password) {
        const errors = {};

        // Email validation
        if (!email || !email.trim()) {
            errors.email = ["The email field is required."];
        } else if (!validator.isEmail(email.trim())) {
            errors.email = ["The email must be a valid email address."];
        }

        // Password validation
        if (!password) {
            errors.password = ["The password field is required."];
        } else if (password.length < 8) {
            errors.password = ["The password must be at least 8 characters."];
        }

        if (Object.keys(errors).length > 0) {
            return {
                status: false,
                message: "Validation error.",
                errors
            };
        }

        return null;
    }

    static validateCompanyData(companyData) {
        const errors = {};

        // Name
        if (!companyData.name || !companyData.name.trim()) {
            errors.name = ['Company name is required.'];
        } else if (companyData.name.length < 5) {
            errors.name = ['Company name must be at least 5 characters.'];
        }

        // GST Number
        if (!companyData.GSTNumber) {
            errors.GSTNumber = ['GST number is required.'];
        } else if (
            !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                companyData.GSTNumber
            )
        ) {
            errors.GSTNumber = ['Invalid GST number format.'];
        }

        // City
        if (!companyData.city || !companyData.city.trim()) {
            errors.city = ['City is required.'];
        }

        // Contact
        if (!companyData.contact) {
            errors.contact = ['Contact number is required.'];
        } else if (!/^[6-9]\d{9}$/.test(companyData.contact)) {
            errors.contact = ['Invalid contact number.'];
        }

        if (Object.keys(errors).length > 0) {
            return {
                status: false,
                message: 'Validation error.',
                errors
            };
        }

        return null;
    }
}

module.exports = ValidationService