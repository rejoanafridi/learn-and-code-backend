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
const mongoose_1 = __importStar(require("mongoose")); // Added Types for Schema.Types
const testitemSchemaDefinition = {};
// If no fields are added, Mongoose will create a schema with only _id.
// Consider adding a default field if fields array is empty, or let Mongoose handle it.
// if (Object.keys(testitemSchemaDefinition).length === 0) {
//   console.warn("Schema for Testitem is empty. Consider adding fields or a default field.");
//   // Optionally add a default field:
//   // testitemSchemaDefinition.name = { type: String, required: true, default: 'Default Name' };
// }
const testitemSchema = new mongoose_1.Schema(testitemSchemaDefinition, {
    timestamps: true, // Automatically add createdAt and updatedAt
});
// Example of an index (can be made dynamic based on user input later)
// testitemSchema.index({ name: 'text' }); 
exports.default = mongoose_1.default.model('Testitem', testitemSchema);
//# sourceMappingURL=testitem.model.js.map