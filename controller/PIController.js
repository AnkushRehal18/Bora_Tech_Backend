const logger = require('../utils/logger');
const PI = require('../model/PI');
const ValidationService = require('../utils/validation');

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

    const total = await PI.countDocuments();

    const pis = await PI.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('voucher_no buyer consignee status total_quantity total_amount items')


    const result = pis.map(pi => ({
      _id: pi._id,
      voucher_no: pi.voucher_no,
      buyer: pi.buyer,
      consignee: pi.consignee,
      status: pi.status,
      total_quantity: pi.total_quantity,
      total_amount: pi.total_amount,
      items: pi.items.map((item)=> item.product_name),
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

    logger.error("Error", err)
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