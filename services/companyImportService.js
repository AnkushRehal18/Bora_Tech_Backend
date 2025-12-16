const fs = require("fs");
const csv = require("csv-parser");
const Companies = require("../model/companies");

exports.importCompaniesFromCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const companies = [];

        fs.createReadStream(filePath)
            .pipe(csv({
                separator: ',',
                mapHeaders: ({ header }) => header.trim(),
                mapValues: ({ value }) => value ? value.trim() : value
            }))
            .on("data", (row) => {
                // Normalize keys to lowercase for case-insensitive matching if needed, 
                // but here we stick to the provided variations for now.
                // We can handle empty rows by checking if required fields exist.
                const name = row.name || row.Name;
                const gst = row.GSTNumber || row.GST;
                
                if (name && gst) {
                    companies.push({
                        name: name,
                        GSTNumber: gst.toUpperCase(),
                        apob: row.apob || row.APOB,
                        city: row.city || row.City,
                        country: row.country || 'India',
                        contact: cleanContact(row.contact || row.Contact),
                        address: row.address || row.Address
                    });
                }
            })
            .on("end", async () => {
                try {
                    if (companies.length === 0) {
                        deleteFile(filePath);
                        return resolve({ 
                            status: true,
                            message: "No valid companies found in CSV.",
                            insertedCount: 0, 
                            errorCount: 0, 
                            errors: [] 
                        });
                    }

                    const inserted = await Companies.insertMany(companies, {
                        ordered: false
                    });

                    deleteFile(filePath);
                    resolve({ 
                        status: true,
                        message: "All companies imported successfully.",
                        insertedCount: inserted.length, 
                        errorCount: 0, 
                        errors: [] 
                    });
                } catch (error) {
                    deleteFile(filePath);
                    
                    if (error.code === 11000 || error.writeErrors) {
                        // Partial success or duplicate key errors
                        const insertedCount = error.insertedDocs ? error.insertedDocs.length : 0;
                        const writeErrors = error.writeErrors || [];
                        const errorCount = writeErrors.length;
                        
                        // Map errors to a more readable format
                        const errors = writeErrors.map(e => ({
                            index: e.index,
                            message: e.errmsg,
                            // Extract GSTNumber if possible from the error message or operation
                            identifier: e.op ? e.op.GSTNumber : 'Unknown'
                        }));

                        resolve({ 
                            status: true, // We resolve as success because some might have been inserted
                            message: `Imported ${insertedCount} companies. ${errorCount} failed.`,
                            insertedCount, 
                            errorCount, 
                            errors 
                        });
                    } else {
                        console.error("Import Error:", error);
                        reject(error);
                    }
                }
            })
            .on("error", (error) => {
                deleteFile(filePath);
                reject(error);
            });
    });
};

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to delete file ${filePath}:`, err);
    });
};

const cleanContact = (contact) => {
    if (!contact) return contact;
    // Remove non-digits
    const digits = contact.toString().replace(/\D/g, '');
    // If 10 digits, return.
    if (digits.length === 10) return digits;
    // If > 10 digits and starts with 91, remove 91 (for India)
    if (digits.length > 10 && digits.startsWith('91')) {
        return digits.slice(-10);
    }
    return digits;
};
