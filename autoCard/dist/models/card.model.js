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
exports.CardPriority = exports.CardStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define an enum for status for better type safety
var CardStatus;
(function (CardStatus) {
    CardStatus["Todo"] = "todo";
    CardStatus["InProgress"] = "inprogress";
    CardStatus["Done"] = "done";
})(CardStatus || (exports.CardStatus = CardStatus = {}));
// Define an enum for priority
var CardPriority;
(function (CardPriority) {
    CardPriority["Low"] = "low";
    CardPriority["Medium"] = "medium";
    CardPriority["High"] = "high";
})(CardPriority || (exports.CardPriority = CardPriority = {}));
const cardSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(CardStatus), // Use enum values
        default: CardStatus.Todo,
    },
    priority: {
        type: String,
        enum: Object.values(CardPriority), // Use enum values
        default: CardPriority.Medium,
    },
    dueDate: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Example index (if needed)
// cardSchema.index({ status: 1, priority: 1 });
const Card = mongoose_1.default.model('Card', cardSchema);
exports.default = Card;
//# sourceMappingURL=card.model.js.map