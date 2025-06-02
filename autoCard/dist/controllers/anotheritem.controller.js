"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnotheritem = exports.updateAnotheritem = exports.getAnotheritemById = exports.getAllAnotheritems = exports.createAnotheritem = void 0;
const anotheritem_model_1 = __importDefault(require("../models/anotheritem.model")); // Adjust path as needed
// import { AppError } from '../utils/AppError'; // Example for error handling
// @desc    Create a new anotheritem
// @route   POST /api/v1/anotheritems
// @access  Private (example)
const createAnotheritem = async (req, res, next) => {
    try {
        const newAnotheritem = await anotheritem_model_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: newAnotheritem,
        });
    }
    catch (error) {
        // next(new AppError(`Error creating anotheritem: ${(error as Error).message}`, 400));
        next(error); // Basic error forwarding
    }
};
exports.createAnotheritem = createAnotheritem;
// @desc    Get all anotheritems
// @route   GET /api/v1/anotheritems
// @access  Public
const getAllAnotheritems = async (req, res, next) => {
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
        const anotheritems = await anotheritem_model_1.default.find(queryFilters)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Example sort
        const totalDocuments = await anotheritem_model_1.default.countDocuments(queryFilters);
        res.status(200).json({
            success: true,
            count: anotheritems.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalDocuments / limit),
                totalDocuments,
            },
            data: anotheritems,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllAnotheritems = getAllAnotheritems;
// @desc    Get a single anotheritem by ID
// @route   GET /api/v1/anotheritems/:id
// @access  Public
const getAnotheritemById = async (req, res, next) => {
    try {
        const anotheritem = await anotheritem_model_1.default.findById(req.params.id);
        if (!anotheritem) {
            // return next(new AppError('Anotheritem not found', 404));
            return res.status(404).json({ success: false, error: 'Anotheritem not found with id ' + req.params.id });
        }
        res.status(200).json({
            success: true,
            data: anotheritem,
        });
    }
    catch (error) {
        // Catching potential CastError if the ID format is invalid
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Anotheritem ID format: ' + req.params.id });
        }
        next(error);
    }
};
exports.getAnotheritemById = getAnotheritemById;
// @desc    Update a anotheritem
// @route   PUT /api/v1/anotheritems/:id
// @access  Private
const updateAnotheritem = async (req, res, next) => {
    try {
        const anotheritem = await anotheritem_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!anotheritem) {
            // return next(new AppError('Anotheritem not found', 404));
            return res.status(404).json({ success: false, error: 'Anotheritem not found with id ' + req.params.id });
        }
        res.status(200).json({
            success: true,
            data: anotheritem,
        });
    }
    catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Anotheritem ID format: ' + req.params.id });
        }
        // Add more specific error handling for validation or duplicate keys if needed
        next(error);
    }
};
exports.updateAnotheritem = updateAnotheritem;
// @desc    Delete a anotheritem
// @route   DELETE /api/v1/anotheritems/:id
// @access  Private
const deleteAnotheritem = async (req, res, next) => {
    try {
        const anotheritem = await anotheritem_model_1.default.findByIdAndDelete(req.params.id);
        if (!anotheritem) {
            // return next(new AppError('Anotheritem not found', 404));
            return res.status(404).json({ success: false, error: 'Anotheritem not found with id ' + req.params.id });
        }
        res.status(200).json({
            success: true,
            message: 'Anotheritem deleted successfully',
            data: {} // Or send back the deleted item: data: anotheritem
        });
    }
    catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Anotheritem ID format: ' + req.params.id });
        }
        next(error);
    }
};
exports.deleteAnotheritem = deleteAnotheritem;
//# sourceMappingURL=anotheritem.controller.js.map