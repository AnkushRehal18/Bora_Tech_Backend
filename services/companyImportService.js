const fs = require("fs");
const csv = require("csv-parser");
const Companies = require("../model/companies");

exports.importCompaniesFromCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const companies = [];

        // AUTO-DETECT CSV SEPARATOR (comma or tab)
        const firstLine = fs.readFileSync(filePath, "utf8").split("\n")[0];
        const separator = firstLine.includes("\t") ? "\t" : ",";

        fs.createReadStream(filePath)
            .pipe(csv({
                separator,
                mapHeaders: ({ header }) => header.trim(),
                mapValues: ({ value }) => value ? value.trim() : value
            }))
            .on("data", (row) => {
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
                        const insertedCount = error.insertedDocs
                            ? error.insertedDocs.length
                            : 0;

                        const writeErrors = error.writeErrors || [];
                        const errorCount = writeErrors.length;

                        const errors = writeErrors.map(e => ({
                            index: e.index,
                            message: e.errmsg,
                            identifier: e.op ? e.op.GSTNumber : 'Unknown'
                        }));

                        resolve({
                            status: true,
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
    const digits = contact.toString().replace(/\D/g, '');
    if (digits.length === 10) return digits;
    if (digits.length > 10 && digits.startsWith('91')) {
        return digits.slice(-10);
    }
    return digits;
};
