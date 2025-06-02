"use strict";
const Product = require('../models/Product');
// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Public (for now)
exports.createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json({
            success: true,
            data: newProduct,
        });
    }
    catch (error) {
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages,
            });
        }
        // Handle duplicate key errors (e.g., for name or SKU)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                error: `Duplicate field value entered for ${field}. Please use another value.`,
            });
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error',
        });
    }
};
// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const filterOptions = {};
        if (req.query.category) {
            filterOptions.category = req.query.category;
        }
        if (req.query.name) {
            filterOptions.name = { $regex: req.query.name, $options: 'i' }; // Case-insensitive partial match
        }
        // Add more filters as needed, e.g., price range
        const products = await Product.find(filterOptions)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Default sort, can be made configurable
        const totalProducts = await Product.countDocuments(filterOptions);
        res.status(200).json({
            success: true,
            count: products.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts: totalProducts,
            },
            data: products,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + error.message,
        });
    }
};
// @desc    Get a single product by ID
// @route   GET /api/v1/products/:productId
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found with id: ' + req.params.productId,
            });
        }
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Product ID format' });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + error.message,
        });
    }
};
// @desc    Update a product
// @route   PUT /api/v1/products/:productId
// @access  Public
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.productId, req.body, {
            new: true, // Return the modified document
            runValidators: true, // Run schema validators on update
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found with id: ' + req.params.productId,
            });
        }
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Product ID format' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages,
            });
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                error: `Duplicate field value entered for ${field} during update. Please use another value.`,
            });
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error',
        });
    }
};
// @desc    Delete a product
// @route   DELETE /api/v1/products/:productId
// @access  Public
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found with id: ' + req.params.productId,
            });
        }
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            // data: product // Optionally send back the deleted item
        });
    }
    catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Product ID format' });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + error.message,
        });
    }
};
//# sourceMappingURL=productController.js.map