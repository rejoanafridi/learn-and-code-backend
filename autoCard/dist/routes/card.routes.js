"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const card_controller_1 = require("../controllers/card.controller"); // Updated import path
const router = express_1.default.Router();
// Route for creating a new card and getting all cards
router.route('/')
    .post(card_controller_1.createCard)
    .get(card_controller_1.getAllCards);
// Route for getting, updating, and deleting a specific card by its ID
router.route('/:cardId') // Reverted to :cardId to match controller
    .get(card_controller_1.getCardById)
    .put(card_controller_1.updateCard)
    .delete(card_controller_1.deleteCard);
exports.default = router;
//# sourceMappingURL=card.routes.js.map