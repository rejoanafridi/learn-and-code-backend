const Habit = require('../models/Habit');

// @desc    Create a new habit
// @route   POST /api/v1/habits
// @access  Public (adjust for user association later)
exports.createHabit = async (req, res) => {
  try {
    // If user-specific: req.body.user = req.user.id;
    const newHabit = await Habit.create(req.body);
    res.status(201).json({
      success: true,
      data: newHabit,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    if (error.code === 11000) { // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
          success: false,
          error: `Duplicate value for ${field}: ${error.keyValue[field]}. Please use another value.`,
      });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Get all habits
// @route   GET /api/v1/habits
// @access  Public
exports.getAllHabits = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filterOptions = {};
    // If user-specific: filterOptions.user = req.user.id;
    if (req.query.frequency) {
      filterOptions.frequency = req.query.frequency;
    }
    if (req.query.name) {
      filterOptions.name = { $regex: req.query.name, $options: 'i' };
    }

    const habits = await Habit.find(filterOptions)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalHabits = await Habit.countDocuments(filterOptions);

    res.status(200).json({
      success: true,
      count: habits.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalHabits / limit),
        totalHabits: totalHabits,
      },
      data: habits,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
  }
};

// @desc    Get a single habit by ID
// @route   GET /api/v1/habits/:habitId
// @access  Public
exports.getHabitById = async (req, res) => {
  try {
    // If user-specific, add user check: const habit = await Habit.findOne({ _id: req.params.habitId, user: req.user.id });
    const habit = await Habit.findById(req.params.habitId);
    if (!habit) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found with id: ' + req.params.habitId,
      });
    }
    res.status(200).json({ success: true, data: habit });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid Habit ID format' });
    }
    res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
  }
};

// @desc    Update a habit (can include logic for marking complete)
// @route   PUT /api/v1/habits/:habitId
// @access  Public
exports.updateHabit = async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const updates = req.body;

    // If user-specific:
    // const habit = await Habit.findOne({ _id: habitId, user: req.user.id });
    // if (!habit) {
    //   return res.status(404).json({ success: false, error: 'Habit not found or not authorized' });
    // }
    
    // Logic for marking habit complete & updating streaks
    if (updates.markComplete) { // Expecting a field like { "markComplete": true }
      const habit = await Habit.findById(habitId); // Fetch current habit
      if (!habit) {
          return res.status(404).json({ success: false, error: 'Habit not found' });
      }
      
      // Simple streak logic:
      // More sophisticated logic would check if lastCompletedDate was yesterday/last week etc.
      const today = new Date();
      today.setHours(0,0,0,0); // Normalize today's date
      
      let newStreak = habit.currentStreak;
      if (habit.lastCompletedDate) {
        const lastCompleted = new Date(habit.lastCompletedDate);
        lastCompleted.setHours(0,0,0,0); // Normalize last completed date

        const diffTime = Math.abs(today - lastCompleted);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) { // Completed consecutively
          newStreak += 1;
        } else if (diffDays > 1) { // Broke the streak
          newStreak = 1; // Reset to 1 for today's completion
        } else { // Completed again on the same day, streak doesn't change
          // Or, if you don't want to allow multiple completions per day to affect streak:
          // return res.status(400).json({ success: false, error: "Habit already marked complete today."});
        }
      } else { // First time completing
        newStreak = 1;
      }
      
      updates.lastCompletedDate = new Date();
      updates.currentStreak = newStreak;
      if (newStreak > habit.longestStreak) {
        updates.longestStreak = newStreak;
      }
      delete updates.markComplete; // Remove the trigger field
    } else if (updates.currentStreak !== undefined && updates.longestStreak === undefined) {
      // If currentStreak is manually set, ensure longestStreak is also updated if necessary
      const habit = await Habit.findById(habitId);
       if (habit && updates.currentStreak > habit.longestStreak) {
           updates.longestStreak = updates.currentStreak;
       } else if (habit) {
           updates.longestStreak = habit.longestStreak; // keep existing if not greater
       }
    }


    const updatedHabit = await Habit.findByIdAndUpdate(habitId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedHabit) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found with id: ' + habitId,
      });
    }
    res.status(200).json({ success: true, data: updatedHabit });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid Habit ID format' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
     if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
          success: false,
          error: `Duplicate value for ${field}: ${error.keyValue[field]}. Please use another value.`,
      });
    }
    res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
  }
};

// @desc    Delete a habit
// @route   DELETE /api/v1/habits/:habitId
// @access  Public
exports.deleteHabit = async (req, res) => {
  try {
    // If user-specific:
    // const habit = await Habit.findOneAndDelete({ _id: req.params.habitId, user: req.user.id });
    const habit = await Habit.findByIdAndDelete(req.params.habitId);

    if (!habit) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found or not authorized to delete: ' + req.params.habitId,
      });
    }
    res.status(200).json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid Habit ID format' });
    }
    res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
  }
};
