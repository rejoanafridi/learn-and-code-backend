"use strict";
const express = require('express');
const router = express.Router();
const { createHabit, getAllHabits, getHabitById, updateHabit, deleteHabit,
// markHabitComplete, // If implemented as a separate controller action
 } = require('../controllers/habitController');
// Later, protect these routes with authentication middleware if users are associated
// const { protect } = require('../middleware/authMiddleware'); // Example
// Routes for /api/v1/habits
router.route('/')
    .post(createHabit) // protect, createHabit
    .get(getAllHabits); // protect, getAllHabits
// Routes for /api/v1/habits/:habitId
router.route('/:habitId')
    .get(getHabitById) // protect, getHabitById
    .put(updateHabit) // protect, updateHabit
    .delete(deleteHabit); // protect, deleteHabit
// Optional: Route for marking a habit as complete
// router.route('/:habitId/complete')
//   .post(markHabitComplete); // protect, markHabitComplete
module.exports = router;
//# sourceMappingURL=habitRoutes.js.map