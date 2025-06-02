"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const testitem_controller_1 = require("../controllers/testitem.controller"); // Adjust path as needed
// import { protect, authorize } from '../middleware/auth'; // Example for auth middleware
const router = express_1.default.Router();
router
    .route('/')
    // .post(protect, authorize('admin'), createTestitem) // Example with auth
    .post(testitem_controller_1.createTestitem)
    .get(testitem_controller_1.getAllTestitems);
router
    .route('/:id') // Using generic ':id' as is common practice
    .get(testitem_controller_1.getTestitemById)
    // .put(protect, authorize('admin'), updateTestitem) // Example with auth
    .put(testitem_controller_1.updateTestitem)
    // .delete(protect, authorize('admin'), deleteTestitem); // Example with auth
    .delete(testitem_controller_1.deleteTestitem);
exports.default = router;
//# sourceMappingURL=testitem.routes.js.map