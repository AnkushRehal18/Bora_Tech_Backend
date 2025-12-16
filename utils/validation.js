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

    static validateCompanyUpdateData(companyData) {
        const errors = {};

        if (companyData.name !== undefined) {
            if (!companyData.name.trim()) {
                errors.name = ['Company name cannot be empty.'];
            }
        }

        if (companyData.GSTNumber !== undefined) {
            if (
                !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                    companyData.GSTNumber
                )
            ) {
                errors.GSTNumber = ['Invalid GST number format.'];
            }
        }

        if (companyData.city !== undefined) {
            if (!companyData.city.trim()) {
                errors.city = ['City cannot be empty.'];
            }
        }

        if (companyData.contact !== undefined) {
            if (!/^[6-9]\d{9}$/.test(companyData.contact)) {
                errors.contact = ['Invalid contact number.'];
            }
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

    static validateWarehouseData(data) {
        const errors = {};

        // Warehouse Name
        if (!data.warehouseName || !data.warehouseName.trim()) {
            errors.warehouseName = ["Warehouse name is required."];
        } else if (data.warehouseName.length < 3) {
            errors.warehouseName = ["Warehouse name must be at least 3 characters."];
        }

        // Address
        if (!data.address || !data.address.trim()) {
            errors.address = ["Address is required."];
        }

        // City
        if (!data.city || !data.city.trim()) {
            errors.city = ["City is required."];
        }

        // Contact Details
        if (!data.contactDetails) {
            errors.contactDetails = ["Contact number is required."];
        } else if (!/^[6-9]\d{9}$/.test(data.contactDetails)) {
            errors.contactDetails = ["Invalid contact number."];
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

    static validateWarehouseUpdateData(data) {
        const errors = {};

        // Warehouse Name (optional)
        if (data.warehouseName !== undefined) {
            if (!data.warehouseName.trim()) {
                errors.warehouseName = ["Warehouse name cannot be empty."];
            } else if (data.warehouseName.length < 3) {
                errors.warehouseName = ["Warehouse name must be at least 3 characters."];
            }
        }

        // Address (optional)
        if (data.address !== undefined) {
            if (!data.address.trim()) {
                errors.address = ["Address cannot be empty."];
            }
        }

        // City (optional)
        if (data.city !== undefined) {
            if (!data.city.trim()) {
                errors.city = ["City cannot be empty."];
            }
        }

        // Contact Details (optional)
        if (data.contactDetails !== undefined) {
            if (!/^[6-9]\d{9}$/.test(data.contactDetails)) {
                errors.contactDetails = ["Invalid contact number."];
            }
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

}

module.exports = ValidationService