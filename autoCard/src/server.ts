import dotenv from 'dotenv';
dotenv.config(); // Ensure environment variables are loaded at the very top

import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Import middleware
// Assuming rateLimiter.js will be converted or correctly resolved by TS/Node
import apiRateLimiter from './middleware/rateLimiter'; 

// Import routes
import cardRoutes from './routes/card.routes'; // Updated for TS file
import productRoutes from './routes/productRoutes.js'; // Keep .js for now
import addressRoutes from './routes/addressRoutes.js'; // Keep .js for now
import habitRoutes from './routes/habitRoutes.js';   // Keep .js for now
// AUTOCRUD_PLACEHOLDER_IMPORTS

const app: Express = express();
const PORT: string | number = process.env.PORT || 3001;

// Middleware
app.use(express.json()); 

// Apply Rate Limiter to API routes
app.use('/api', apiRateLimiter);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in .env file.");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('Successfully connected to MongoDB.');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Mount routers
app.use('/api/v1/cards', cardRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/habits', habitRoutes);
// AUTOCRUD_PLACEHOLDER_ROUTES

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('autoCard API is running!');
});

// Generic Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Start the server 
if (process.env.NODE_ENV !== 'test') {
  mongoose.connection.once('open', () => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });

  mongoose.connection.on('error', err => {
      console.error('MongoDB initial connection error during startup:', err);
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
  });
}

export default app;
