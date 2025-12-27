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

    static validateBankData(data) {
        const errors = {};

        // Bank Name
        if (!data.bankName || !data.bankName.trim()) {
            errors.bankName = ["Bank name is required."];
        } else if (data.bankName.length < 3) {
            errors.bankName = ["Bank name must be at least 3 characters."];
        }

        // IFSC Code
        if (!data.IFSC_code || !data.IFSC_code.trim()) {
            errors.IFSC_code = ["IFSC code is required."];
        } else if (
            !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.IFSC_code.trim().toUpperCase())
        ) {
            errors.IFSC_code = ["Invalid IFSC code format."];
        }

        // AD Code
        if (!data.AD_code || !data.AD_code.trim()) {
            errors.AD_code = ["AD code is required."];
        } else if (!/^[A-Z0-9]{3,15}$/.test(data.AD_code.trim().toUpperCase())) {
            errors.AD_code = ["Invalid AD code format."];
        }

        // Account Number
        if (!data.Account_Number) {
            errors.Account_Number = ["Account number is required."];
        } else if (!/^\d{9,18}$/.test(String(data.Account_Number))) {
            errors.Account_Number = ["Account number must be between 9 to 18 digits."];
        }

        // Address (optional)
        if (data.Address !== undefined && !data.Address.trim()) {
            errors.Address = ["Address cannot be empty."];
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

    static validateBankUpdateData(data) {
        const errors = {};

        // Bank Name (optional)
        if (data.bankName !== undefined) {
            if (!data.bankName.trim()) {
                errors.bankName = ["Bank name cannot be empty."];
            } else if (data.bankName.length < 3) {
                errors.bankName = ["Bank name must be at least 3 characters."];
            }
        }

        // IFSC Code (optional)
        if (data.IFSC_code !== undefined) {
            if (
                !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
                    data.IFSC_code.trim().toUpperCase()
                )
            ) {
                errors.IFSC_code = ["Invalid IFSC code format."];
            }
        }

        // AD Code (optional)
        if (data.AD_code !== undefined) {
            if (!/^[A-Z0-9]{3,15}$/.test(data.AD_code.trim().toUpperCase())) {
                errors.AD_code = ["Invalid AD code format."];
            }
        }

        // Account Number (optional)
        if (data.Account_Number !== undefined) {
            if (!/^\d{9,18}$/.test(String(data.Account_Number))) {
                errors.Account_Number = ["Account number must be between 9 to 18 digits."];
            }
        }

        // Address (optional)
        if (data.Address !== undefined && !data.Address.trim()) {
            errors.Address = ["Address cannot be empty."];
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

    static validateCreatePI(data) {
    const errors = {};

    // ------------------
    // PI LEVEL VALIDATION
    // ------------------

    if (!data.company_id) {
        errors.company_id = ["Company is required."];
    }

    if (!data.voucher_no || !data.voucher_no.trim()) {
        errors.voucher_no = ["Voucher number is required."];
    }

    if (!data.date) {
        errors.date = ["Date is required."];
    }

    if (!data.consignee || !data.consignee.trim()) {
        errors.consignee = ["Consignee is required."];
    }

    if (!data.buyer || !data.buyer.trim()) {
        errors.buyer = ["Buyer is required."];
    }

    // ------------------
    // ITEMS VALIDATION
    // ------------------

    if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.items = ["At least one item is required."];
    } else {
        const itemErrors = [];

        data.items.forEach((item, index) => {
            const err = {};

            if (!item.product_name || !item.product_name.trim()) {
                err.product_name = ["Product name is required."];
            }

            if (!item.sku || !item.sku.trim()) {
                err.sku = ["SKU is required."];
            }

            if (!item.hsn_sac || !item.hsn_sac.trim()) {
                err.hsn_sac = ["HSN/SAC is required."];
            }

            if (!item.quantity || item.quantity <= 0) {
                err.quantity = ["Quantity must be greater than 0."];
            }

            if (item.rate === undefined || item.rate < 0) {
                err.rate = ["Rate must be 0 or greater."];
            }

            if (Object.keys(err).length > 0) {
                itemErrors[index] = err;
            }
        });

        if (itemErrors.length > 0) {
            errors.items = itemErrors;
        }
    }

    // ------------------
    // FINAL RESPONSE
    // ------------------

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