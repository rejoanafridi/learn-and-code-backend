require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Import middleware
const apiRateLimiter = require('./src/middleware/rateLimiter');

// Import routes
const cardRoutes = require('./src/routes/cardRoutes');

const app = express();
const PORT = process.env.PORT || 3001; // Default to 3001 if PORT not in .env

// Middleware
app.use(express.json()); // Parser for JSON request bodies

// Apply Rate Limiter to API routes
// This will apply the limiter to all routes starting with /api
app.use('/api', apiRateLimiter);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in .env file.");
  process.exit(1); // Exit if DB URI is not set
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Mount routers
app.use('/api/v1/cards', cardRoutes);

// Basic Route - can be kept for a simple health check
app.get('/', (req, res) => {
  res.send('autoCard API is running!');
});

// Generic Error Handling Middleware
// This should be defined after all other app.use() and routes calls
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Start the server only after successful DB connection
// And if not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose.connection.once('open', () => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });

  // Handle initial connection errors explicitly (already done but good to keep in mind)
  // This listener should also ideally be conditional or handled differently for tests,
  // as process.exit(1) can abruptly stop the test runner.
  // For now, keeping it but tests will use an in-memory server.
  mongoose.connection.on('error', err => {
      console.error('MongoDB initial connection error:', err);
      if (process.env.NODE_ENV !== 'test') { // Avoid exiting during tests
        process.exit(1);
      }
  });
}

module.exports = app; // Export the Express app for testing
