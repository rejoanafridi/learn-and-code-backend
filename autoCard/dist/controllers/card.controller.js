"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCard = exports.updateCard = exports.getCardById = exports.getAllCards = exports.createCard = void 0;
const card_model_1 = __importStar(require("../models/card.model"));
const createCard = async (req, res, next) => {
    try {
        const newCard = await card_model_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: newCard,
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            res.status(400).json({ success: false, error: messages.join(', ') });
            return;
        }
        if (error.code === 11000) {
            res.status(400).json({ success: false, error: 'Duplicate title: A card with this title already exists.' });
            return;
        }
        // Instead of res.status(500), pass to error handling middleware
        next(error);
    }
};
exports.createCard = createCard;
const getAllCards = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const filterOptions = {};
        if (req.query.status && Object.values(card_model_1.CardStatus).includes(req.query.status)) {
            filterOptions.status = req.query.status;
        }
        if (req.query.priority && Object.values(card_model_1.CardPriority).includes(req.query.priority)) {
            filterOptions.priority = req.query.priority;
        }
        if (req.query.title) {
            filterOptions.title = { $regex: req.query.title, $options: 'i' };
        }
        const cards = await card_model_1.default.find(filterOptions)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const totalCards = await card_model_1.default.countDocuments(filterOptions);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCards = getAllCards;
const getCardById = async (req, res, next) => {
    try {
        const card = await card_model_1.default.findById(req.params.cardId);
        if (!card) {
            res.status(404).json({
                success: false,
                error: 'Card not found with id: ' + req.params.cardId,
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: card,
        });
    }
    catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({ success: false, error: 'Invalid Card ID format: ' + req.params.cardId });
            return;
        }
        next(error);
    }
};
exports.getCardById = getCardById;
const updateCard = async (req, res, next) => {
    try {
        const card = await card_model_1.default.findByIdAndUpdate(req.params.cardId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!card) {
            res.status(404).json({
                success: false,
                error: 'Card not found with id: ' + req.params.cardId,
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: card,
        });
    }
    catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({ success: false, error: 'Invalid Card ID format: ' + req.params.cardId });
            return;
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            res.status(400).json({ success: false, error: messages.join(', ') });
            return;
        }
        if (error.code === 11000) {
            res.status(400).json({ success: false, error: 'Update failed: A card with this title already exists.' });
            return;
        }
        next(error);
    }
};
exports.updateCard = updateCard;
const deleteCard = async (req, res, next) => {
    try {
        const card = await card_model_1.default.findByIdAndDelete(req.params.cardId);
        if (!card) {
            res.status(404).json({
                success: false,
                error: 'Card not found with id: ' + req.params.cardId,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Card deleted successfully',
        });
    }
    catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({ success: false, error: 'Invalid Card ID format: ' + req.params.cardId });
            return;
        }
        next(error);
    }
};
exports.deleteCard = deleteCard;
//# sourceMappingURL=card.controller.js.map