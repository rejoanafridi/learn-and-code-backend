const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Habit name is required.'],
    unique: true, // Assuming habit names are unique per user if user model is added
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  frequency: {
    type: String,
    enum: {
      values: ['daily', 'weekly', 'monthly', 'specific_days'],
      message: '{VALUE} is not a supported frequency. Must be daily, weekly, monthly, or specific_days.',
    },
    default: 'daily',
  },
  // Example: if frequency is 'specific_days', this array could store ['Monday', 'Wednesday', 'Friday']
  // For simplicity, this field can exist for all, but only be contextually relevant for 'specific_days'.
  // Alternatively, make it conditional or handle in application logic.
  daysOfWeek: { // Relevant if frequency is 'specific_days'
    type: [String], // Array of strings like 'Monday', 'Tuesday', etc.
    default: [],
    // Could add a validator to ensure days are valid if 'specific_days' is chosen
    // validate: {
    //   validator: function(v) {
    //     if (this.frequency === 'specific_days') {
    //       return Array.isArray(v) && v.length > 0 && v.every(day => 
    //         ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day)
    //       );
    //     }
    //     return true; // Not relevant for other frequencies
    //   },
    //   message: 'Please provide valid days of the week if frequency is "specific_days".'
    // }
  },
  goal: { // e.g., "Drink 8 glasses of water", "Exercise for 30 minutes"
    type: String,
    trim: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: [0, 'Current streak cannot be negative.'],
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: [0, 'Longest streak cannot be negative.'],
  },
  lastCompletedDate: {
    type: Date,
  },
  // Optional: User association
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // Assuming a User model
  //   // required: true, // If a habit must belong to a user
  // },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Ensure currentStreak is not greater than longestStreak (application-level or complex validator)
habitSchema.pre('save', function(next) {
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  next();
});

habitSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    // If currentStreak is being set/incremented and is greater than longestStreak
    if (update.$set && update.$set.currentStreak !== undefined) {
        // Need to fetch the document to compare currentStreak with longestStreak
        // This is a bit more complex with findOneAndUpdate, may need to handle in controller logic
        // or use a document middleware after fetching the doc.
        // For now, this pre-hook for findOneAndUpdate might not perfectly handle all cases
        // for longestStreak updates without fetching the doc first.
    } else if (update.currentStreak !== undefined) { // handles direct set
         // Similar complexity as above
    }
    // A simpler approach for longestStreak is often handled in the application logic (controller)
    // when currentStreak is updated.
    next();
});


// Indexing for frequently queried fields
habitSchema.index({ name: 1 }); // If user-specific, compound with user: habitSchema.index({ user: 1, name: 1 });
habitSchema.index({ frequency: 1 });

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
