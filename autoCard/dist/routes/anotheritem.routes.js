"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const anotheritem_controller_1 = require("../controllers/anotheritem.controller"); // Adjust path as needed
// import { protect, authorize } from '../middleware/auth'; // Example for auth middleware
const router = express_1.default.Router();
router
    .route('/')
    // .post(protect, authorize('admin'), createAnotheritem) // Example with auth
    .post(anotheritem_controller_1.createAnotheritem)
    .get(anotheritem_controller_1.getAllAnotheritems);
router
    .route('/:id') // Using generic ':id' as is common practice
    .get(anotheritem_controller_1.getAnotheritemById)
    // .put(protect, authorize('admin'), updateAnotheritem) // Example with auth
    .put(anotheritem_controller_1.updateAnotheritem)
    // .delete(protect, authorize('admin'), deleteAnotheritem); // Example with auth
    .delete(anotheritem_controller_1.deleteAnotheritem);
exports.default = router;
//# sourceMappingURL=anotheritem.routes.js.map