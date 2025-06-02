import express, { Router } from 'express';
import {
  createCard,
  getAllCards,
  getCardById,
  updateCard,
  deleteCard,
} from '../controllers/card.controller'; // Updated import path

const router: Router = express.Router();

// Route for creating a new card and getting all cards
router.route('/')
  .post(createCard)
  .get(getAllCards);

// Route for getting, updating, and deleting a specific card by its ID
router.route('/:cardId') // Reverted to :cardId to match controller
  .get(getCardById)
  .put(updateCard)
  .delete(deleteCard);

export default router;
