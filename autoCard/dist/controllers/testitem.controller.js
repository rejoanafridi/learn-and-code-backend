"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTestitem = exports.updateTestitem = exports.getTestitemById = exports.getAllTestitems = exports.createTestitem = void 0;
const testitem_model_1 = __importDefault(require("../models/testitem.model")); // Adjust path as needed
// import { AppError } from '../utils/AppError'; // Example for error handling
// @desc    Create a new testitem
// @route   POST /api/v1/testitems
// @access  Private (example)
const createTestitem = async (req, res, next) => {
    try {
        const newTestitem = await testitem_model_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: newTestitem,
        });
    }
    catch (error) {
        // next(new AppError(`Error creating testitem: ${(error as Error).message}`, 400));
        next(error); // Basic error forwarding
    }
};
exports.createTestitem = createTestitem;
// @desc    Get all testitems
// @route   GET /api/v1/testitems
// @access  Public
const getAllTestitems = async (req, res, next) => {
    try {
        // Basic Pagination (example, can be enhanced)
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        // Construct filter object from query parameters, excluding pagination params
        const queryFilters = { ...req.query };
        delete queryFilters.page;
        delete queryFilters.limit;
        // Add more sophisticated filtering logic here (e.g., regex for strings, ranges for numbers/dates)
        const testitems = await testitem_model_1.default.find(queryFilters)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Example sort
        const totalDocuments = await testitem_model_1.default.countDocuments(queryFilters);
        res.status(200).json({
            success: true,
            count: testitems.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalDocuments / limit),
                totalDocuments,
            },
            data: testitems,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllTestitems = getAllTestitems;
// @desc    Get a single testitem by ID
// @route   GET /api/v1/testitems/:id
// @access  Public
const getTestitemById = async (req, res, next) => {
    try {
        const testitem = await testitem_model_1.default.findById(req.params.id);
        if (!testitem) {
            // return next(new AppError('Testitem not found', 404));
            return res.status(404).json({ success: false, error: 'Testitem not found with id ' + req.params.id });
        }
        res.status(200).json({
            success: true,
            data: testitem,
        });
    }
    catch (error) {
        // Catching potential CastError if the ID format is invalid
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Testitem ID format: ' + req.params.id });
        }
        next(error);
    }
};
exports.getTestitemById = getTestitemById;
// @desc    Update a testitem
// @route   PUT /api/v1/testitems/:id
// @access  Private
const updateTestitem = async (req, res, next) => {
    try {
        const testitem = await testitem_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!testitem) {
            // return next(new AppError('Testitem not found', 404));
            return res.status(404).json({ success: false, error: 'Testitem not found with id ' + req.params.id });
        }
        res.status(200).json({
            success: true,
            data: testitem,
        });
    }
    catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Testitem ID format: ' + req.params.id });
        }
        // Add more specific error handling for validation or duplicate keys if needed
        next(error);
    }
};
exports.updateTestitem = updateTestitem;
// @desc    Delete a testitem
// @route   DELETE /api/v1/testitems/:id
// @access  Private
const deleteTestitem = async (req, res, next) => {
    try {
        const testitem = await testitem_model_1.default.findByIdAndDelete(req.params.id);
        if (!testitem) {
            // return next(new AppError('Testitem not found', 404));
            return res.status(404).json({ success: false, error: 'Testitem not found with id ' + req.params.id });
        }
        res.status(200).json({
            success: true,
            message: 'Testitem deleted successfully',
            data: {} // Or send back the deleted item: data: testitem
        });
    }
    catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Testitem ID format: ' + req.params.id });
        }
        next(error);
    }
};
exports.deleteTestitem = deleteTestitem;
//# sourceMappingURL=testitem.controller.js.map