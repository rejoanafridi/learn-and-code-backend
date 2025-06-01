const Address = require('../models/Address');

// @desc    Create a new address
// @route   POST /api/v1/addresses
// @access  Public (adjust as needed, e.g., private to a user)
exports.createAddress = async (req, res) => {
  try {
    // Add logic here if addresses are tied to users, e.g., req.body.user = req.user.id;
    const newAddress = await Address.create(req.body);
    res.status(201).json({
      success: true,
      data: newAddress,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error creating address.',
    });
  }
};

// @desc    Get all addresses
// @route   GET /api/v1/addresses
// @access  Public (adjust as needed)
exports.getAllAddresses = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filterOptions = {};
    // Add user filter if addresses are user-specific:
    // if (req.user) { filterOptions.user = req.user.id; }

    if (req.query.city) {
      filterOptions.city = { $regex: req.query.city, $options: 'i' };
    }
    if (req.query.postalCode) {
      filterOptions.postalCode = req.query.postalCode;
    }
    // Add more filters like country, stateOrProvince if needed

    const addresses = await Address.find(filterOptions)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Or sort by other criteria

    const totalAddresses = await Address.countDocuments(filterOptions);

    res.status(200).json({
      success: true,
      count: addresses.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalAddresses / limit),
        totalAddresses: totalAddresses,
      },
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error retrieving addresses: ' + error.message,
    });
  }
};

// @desc    Get a single address by ID
// @route   GET /api/v1/addresses/:addressId
// @access  Public (adjust as needed)
exports.getAddressById = async (req, res) => {
  try {
    // Add user check if necessary: findOne({ _id: req.params.addressId, user: req.user.id })
    const address = await Address.findById(req.params.addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found with id: ' + req.params.addressId,
      });
    }
    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid Address ID format' });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error retrieving address: ' + error.message,
    });
  }
};

// @desc    Update an address
// @route   PUT /api/v1/addresses/:addressId
// @access  Public (adjust as needed)
exports.updateAddress = async (req, res) => {
  try {
    // Ensure user cannot update 'user' field if present, or check ownership
    // const query = { _id: req.params.addressId };
    // if (req.user) { query.user = req.user.id; }
    // const address = await Address.findOneAndUpdate(query, req.body, { new: true, runValidators: true });

    const address = await Address.findByIdAndUpdate(req.params.addressId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found or user not authorized to update: ' + req.params.addressId,
      });
    }
    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid Address ID format' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error updating address: ' + error.message,
    });
  }
};

// @desc    Delete an address
// @route   DELETE /api/v1/addresses/:addressId
// @access  Public (adjust as needed)
exports.deleteAddress = async (req, res) => {
  try {
    // const query = { _id: req.params.addressId };
    // if (req.user) { query.user = req.user.id; }
    // const address = await Address.findOneAndDelete(query);

    const address = await Address.findByIdAndDelete(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found or user not authorized to delete: ' + req.params.addressId,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid Address ID format' });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error deleting address: ' + error.message,
    });
  }
};
