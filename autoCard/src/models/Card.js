const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Added trim for better data hygiene
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['todo', 'inprogress', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  // createdAt and updatedAt will be handled by timestamps option
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt fields
});

// Adding an index for fields that might be frequently queried together, if necessary.
// For now, title is unique, which already creates an index.
// cardSchema.index({ status: 1, priority: 1 }); // Example if we need compound index

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
