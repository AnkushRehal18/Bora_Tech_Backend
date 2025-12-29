const fs = require("fs");
const csv = require("csv-parser");
const Company = require('../model/companies');
const PI = require('../model/PI');

exports.parseAndSavePIFromCSV = async (filePath) => {
    const piMap = {};
    const invalidVouchers = new Set(); // 🚨 Track vouchers with invalid company
    const companyCache = {};
    const rows = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                rows.push(row);
            })
            .on("end", async () => {
                try {
                    if (rows.length === 0) return resolve(0);

                    for (const row of rows) {
                        const voucher = row.voucher_no;
                        if (!voucher) continue;

                        // 🚨 If already marked invalid, skip completely
                        if (invalidVouchers.has(voucher)) continue;

                        // 🔎 Resolve company
                        if (!companyCache[row.company_code]) {
                            let company = await Company.findOne({
                                name: row.company_name   // ✅ COMPANY NAME FROM CSV
                            });

                            if (!company) {
                                console.warn(
                                    `Skipping voucher ${voucher}: company not found -> ${row.company_name}`
                                );

                                invalidVouchers.add(voucher); // ❌ mark voucher invalid
                                delete piMap[voucher];        // ❌ remove partial data
                                continue;
                            }

                            companyCache[row.company_code] = company._id;
                        }

                        if (!piMap[voucher]) {
                            piMap[voucher] = {
                                company_id: companyCache[row.company_code],
                                voucher_no: voucher,
                                date: new Date(row.date),
                                consignee: row.consignee,
                                buyer: row.buyer,
                                status: row.status || "Draft",
                                items: [],
                                total_quantity: 0,
                                total_amount: 0
                            };
                        }

                        const qty = Number(row.quantity) || 0;
                        const rate = Number(row.rate) || 0;

                        piMap[voucher].items.push({
                            product_id: row.product_id,
                            product_name: row.product_name,
                            sku: row.sku,
                            category: row.category,
                            brand: row.brand,
                            hsn_sac: row.hsn_sac,
                            made_in: row.made_in,
                            quantity: qty,
                            rate: rate
                        });

                        piMap[voucher].total_quantity += qty;
                        piMap[voucher].total_amount += qty * rate;
                    }

                    const piArray = Object.values(piMap);

                    if (piArray.length > 0) {
                        await PI.insertMany(piArray, { ordered: false });
                    }

                    resolve(piArray.length);
                } catch (err) {
                    if (err.code === 11000) {
                        resolve(Object.keys(piMap).length);
                    } else {
                        reject(err);
                    }
                }
            })
            .on("error", reject);
    });
};

