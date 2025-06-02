"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Ensure environment variables are loaded at the very top
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
// Import middleware
// Assuming rateLimiter.js will be converted or correctly resolved by TS/Node
const rateLimiter_1 = __importDefault(require("./middleware/rateLimiter"));
// Import routes
const card_routes_1 = __importDefault(require("./routes/card.routes")); // Updated for TS file
const productRoutes_js_1 = __importDefault(require("./routes/productRoutes.js")); // Keep .js for now
const addressRoutes_js_1 = __importDefault(require("./routes/addressRoutes.js")); // Keep .js for now
const habitRoutes_js_1 = __importDefault(require("./routes/habitRoutes.js")); // Keep .js for now
// AUTOCRUD_PLACEHOLDER_IMPORTS
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(express_1.default.json());
// Apply Rate Limiter to API routes
app.use('/api', rateLimiter_1.default);
// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file.");
    process.exit(1);
}
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Successfully connected to MongoDB.');
})
    .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
// Mount routers
app.use('/api/v1/cards', card_routes_1.default);
app.use('/api/v1/products', productRoutes_js_1.default);
app.use('/api/v1/addresses', addressRoutes_js_1.default);
app.use('/api/v1/habits', habitRoutes_js_1.default);
// AUTOCRUD_PLACEHOLDER_ROUTES
// Basic Route
app.get('/', (req, res) => {
    res.send('autoCard API is running!');
});
// Generic Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Server Error',
    });
});
// Start the server 
if (process.env.NODE_ENV !== 'test') {
    mongoose_1.default.connection.once('open', () => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
    mongoose_1.default.connection.on('error', err => {
        console.error('MongoDB initial connection error during startup:', err);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map