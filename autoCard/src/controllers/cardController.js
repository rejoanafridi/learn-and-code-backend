const Card = require('../models/Card');

// @desc    Create a new card
// @route   POST /api/v1/cards
// @access  Public (for now, will add auth later)
exports.createCard = async (req, res) => {
  try {
    const newCard = await Card.create(req.body);
    res.status(201).json({
      success: true,
      data: newCard,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all cards
// @route   GET /api/v1/cards
// @access  Public
exports.getAllCards = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
    const skip = (page - 1) * limit;

    // Build filter options
    const filterOptions = {};
    if (req.query.status) {
      // Basic validation for status if needed, though schema handles strict enum.
      // const allowedStatuses = ['todo', 'inprogress', 'done'];
      // if (allowedStatuses.includes(req.query.status)) {
      filterOptions.status = req.query.status;
      // }
    }
    if (req.query.priority) {
      // Basic validation for priority if needed.
      // const allowedPriorities = ['low', 'medium', 'high'];
      // if (allowedPriorities.includes(req.query.priority)) {
      filterOptions.priority = req.query.priority;
      // }
    }
    if (req.query.title) {
      filterOptions.title = { $regex: req.query.title, $options: 'i' }; // Case-insensitive regex
    }

    const cards = await Card.find(filterOptions)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    const totalCards = await Card.countDocuments(filterOptions); // Get total count for pagination info based on filters

    res.status(200).json({
      success: true,
      count: cards.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCards / limit),
        totalCards: totalCards,
      },
      data: cards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Get a single card by ID
// @route   GET /api/v1/cards/:cardId
// @access  Public
exports.getCardById = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found with id: ' + req.params.cardId,
      });
    }
    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    // Catching potential CastError if the ID format is invalid
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, error: 'Invalid Card ID format' });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message,
    });
  }
};

// @desc    Update a card
// @route   PUT /api/v1/cards/:cardId
// @access  Public
exports.updateCard = async (req, res) => {
  try {
    // { new: true } returns the modified document rather than the original.
    // { runValidators: true } ensures that updates adhere to the schema's validation rules.
    const card = await Card.findByIdAndUpdate(req.params.cardId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found with id: ' + req.params.cardId,
      });
    }
    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, error: 'Invalid Card ID format' });
    }
    res.status(400).json({ // Can also be 500 depending on the error
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete a card
// @route   DELETE /api/v1/cards/:cardId
// @access  Public
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found with id: ' + req.params.cardId,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Card deleted successfully', // Or send back data: card if preferred
    });
  } catch (error) {
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, error: 'Invalid Card ID format' });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message,
    });
  }
};
