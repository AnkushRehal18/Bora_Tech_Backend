const logger = require('../utils/logger');
const PI = require('../model/PI');
const ValidationService = require('../utils/validation');
const { parseAndPreparePIData, parseAndSavePIFromCSV } = require('../services/PiImportService');
const fs = require('fs');

exports.createPI = async (req, res) => {
  try {
    // 1️⃣ Validate request body
    const validationError = ValidationService.validateCreatePI(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const {
      company_id,   //company id from the companies model
      voucher_no,
      date,
      consignee,
      buyer,
      items,
      status,
    } = req.body;

    // 2️⃣ Check if voucher already exists
    const existingPI = await PI.findOne({ voucher_no });
    if (existingPI) {
      return res.status(409).json({
        status: false,
        message: 'Voucher number already exists',
      });
    }

    // 3️⃣ Calculate totals
    let total_quantity = 0;
    let total_amount = 0;

    items.forEach(item => {
      total_quantity += Number(item.quantity);
      total_amount += Number(item.quantity) * Number(item.rate);
    });

    // 4️⃣ Create PI
    const pi = await PI.create({
      company_id,
      voucher_no,
      date,
      consignee,
      buyer,
      status,
      items,
      total_quantity,
      total_amount,
    });

    // 5️⃣ Success response
    return res.status(201).json({
      status: true,
      message: 'PI created successfully',
      data: pi,
    });

  } catch (err) {
    logger.error('Create PI Error:', err);

    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

exports.getPIList = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      from_date,
      to_date,
      company_id
    } = req.query;

    // 🔹 Build filter query dynamically
    const filter = {};

    // Company filter
    if (company_id) {
      filter.company_id = company_id;
    }

    // Date filter
    if (from_date || to_date) {
      filter.createdAt = {};

      if (from_date) {
        const startDate = new Date(from_date);
        startDate.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = startDate;
      }

      if (to_date) {
        const endDate = new Date(to_date);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Total count (with filters)
    const total = await PI.countDocuments(filter);

    // Fetch filtered data
    const pis = await PI.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('voucher_no buyer consignee status total_quantity total_amount items');

    const result = pis.map(pi => ({
      _id: pi._id,
      voucher_no: pi.voucher_no,
      buyer: pi.buyer,
      consignee: pi.consignee,
      status: pi.status,
      total_quantity: pi.total_quantity,
      total_amount: pi.total_amount,
      items: pi.items.map(item => item.product_name),
      item_count: pi.items.length
    }));

    return res.status(200).json({
      status: true,
      message: 'PI list fetched successfully',
      data: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    logger.error("Error", err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

exports.getSinglePiDetail = async (req, res) => {
  try {
    const piId = req.params.id;

    //  Validate PI id
    if (!piId) {
      logger.info('PI id not provided');

      return res.status(400).json({
        status: false,
        message: 'PI id is required'
      });
    }

    // Fetch PI
    const piDetail = await PI.findById(piId);

    if (!piDetail) {
      return res.status(404).json({
        status: false,
        message: 'PI not found'
      });
    }

    //  Success
    return res.status(200).json({
      status: true,
      message: 'PI details fetched successfully',
      data: piDetail
    });

  } catch (err) {
    logger.error('Get Single PI Error:', err);

    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

exports.deleteSinglePI = async (req, res) => {
  try {
    const piId = req.params.id;

    //  Validate ID
    if (!piId) {
      return res.status(400).json({
        status: false,
        message: 'PI id is required'
      });
    }

    //  Check if PI exists
    const pi = await PI.findById(piId);
    if (!pi) {
      return res.status(404).json({
        status: false,
        message: 'PI not found'
      });
    }

    // 3️⃣ Delete PI
    await PI.findByIdAndDelete(piId);

    return res.status(200).json({
      status: true,
      message: 'PI deleted successfully'
    });

  } catch (err) {
    logger.error('Delete PI Error:', err);

    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

exports.bulkDeletePI = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'PI ids array is required'
      });
    }

    // Validate ObjectIds
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No valid PI ids provided'
      });
    }

    //  Delete records
    const result = await PI.deleteMany({
      _id: { $in: validIds }
    });

    return res.status(200).json({
      status: true,
      message: 'PI records deleted successfully',
      deletedCount: result.deletedCount
    });

  } catch (err) {
    logger.error('Bulk Delete PI Error:', err);

    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

exports.uploadPICSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "CSV file is required"
      });
    }

    try {
      const totalPI = await parseAndSavePIFromCSV(req.file.path);

      // Success
      return res.status(201).json({
        status: true,
        message: "PI uploaded successfully",
        total_pi_created: totalPI
      });
    } finally {
      // Always clean up the file
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          logger.error("Failed to delete temp file", e);
        }
      }
    }

  } catch (err) {
    logger.error("CSV Upload Error:", err);
    return res.status(500).json({
      status: false,
      message: "CSV processing failed"
    });
  }
};

exports.updatePI = async (req, res) => {
  try {
    const piId = req.params.id;

    //  Validate request body (reuse same validation)
    const validationError = ValidationService.validateCreatePI(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const {
      company_id,
      voucher_no,
      date,
      consignee,
      buyer,
      items,
      status,
    } = req.body;

    //  Check if PI exists
    const existingPI = await PI.findById(piId);
    if (!existingPI) {
      return res.status(404).json({
        status: false,
        message: 'PI not found',
      });
    }

    //  Check voucher number uniqueness (exclude current PI)
    if (voucher_no) {
      const duplicateVoucher = await PI.findOne({
        voucher_no,
        _id: { $ne: piId },
      });

      if (duplicateVoucher) {
        return res.status(409).json({
          status: false,
          message: 'Voucher number already exists',
        });
      }
    }

    //  Recalculate totals
    let total_quantity = 0;
    let total_amount = 0;

    items.forEach(item => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;

      total_quantity += qty;
      total_amount += qty * rate;
    });

    //  Update PI
    const updatedPI = await PI.findByIdAndUpdate(
      piId,
      {
        company_id,
        voucher_no,
        date,
        consignee,
        buyer,
        status,
        items,
        total_quantity,
        total_amount,
      },
      { new: true }
    );

    //  Success response
    return res.status(200).json({
      status: true,
      message: 'PI updated successfully',
      data: updatedPI,
    });

  } catch (err) {
    logger.error('Update PI Error:', err);

    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};
