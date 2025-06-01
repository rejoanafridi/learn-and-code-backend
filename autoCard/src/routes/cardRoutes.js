const express = require('express');
const router = express.Router();

const {
  createCard,
  getAllCards,
  getCardById,
  updateCard,
  deleteCard,
} = require('../controllers/cardController');

// Route for creating a new card and getting all cards
router.route('/')
  .post(createCard)
  .get(getAllCards);

// Route for getting, updating, and deleting a specific card by its ID
router.route('/:cardId')
  .get(getCardById)
  .put(updateCard)
  .delete(deleteCard);

module.exports = router;
