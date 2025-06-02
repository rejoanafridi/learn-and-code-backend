import { Request, Response, NextFunction } from 'express';
import Card, { ICard, CardStatus, CardPriority } from '../models/card.model'; 

interface ICardFilters {
  status?: CardStatus;
  priority?: CardPriority;
  title?: { $regex: string; $options: string };
}

export const createCard = async (req: Request<{}, {}, ICard>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newCard = await Card.create(req.body);
    res.status(201).json({
      success: true,
      data: newCard,
    });
  } catch (error: any) { 
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((val: any) => val.message);
        res.status(400).json({ success: false, error: messages.join(', ') });
        return; 
    }
    if (error.code === 11000) { 
        res.status(400).json({ success: false, error: 'Duplicate title: A card with this title already exists.' });
        return;
    }
    // Instead of res.status(500), pass to error handling middleware
    next(error); 
  }
};

export const getAllCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const filterOptions: ICardFilters = {};
    if (req.query.status && Object.values(CardStatus).includes(req.query.status as CardStatus)) {
      filterOptions.status = req.query.status as CardStatus;
    }
    if (req.query.priority && Object.values(CardPriority).includes(req.query.priority as CardPriority)) {
      filterOptions.priority = req.query.priority as CardPriority;
    }
    if (req.query.title) {
      filterOptions.title = { $regex: req.query.title as string, $options: 'i' };
    }

    const cards = await Card.find(filterOptions)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCards = await Card.countDocuments(filterOptions);

    res.status(200).json({
      success: true,
      count: cards.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCards / limit),
        totalCards: totalCards,
      },
      data: cards,
    });
  } catch (error: any) {
    next(error); 
  }
};

export const getCardById = async (req: Request<{ cardId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) {
      res.status(404).json({ // Send response and end execution
        success: false,
        error: 'Card not found with id: ' + req.params.cardId,
      });
      return; 
    }
    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
        res.status(400).json({ success: false, error: 'Invalid Card ID format: ' + req.params.cardId });
        return;
    }
    next(error); 
  }
};

export const updateCard = async (req: Request<{ cardId: string }, {}, Partial<ICard>>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const card = await Card.findByIdAndUpdate(req.params.cardId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!card) {
      res.status(404).json({
        success: false,
        error: 'Card not found with id: ' + req.params.cardId,
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
        res.status(400).json({ success: false, error: 'Invalid Card ID format: ' + req.params.cardId });
        return;
    }
     if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((val: any) => val.message);
        res.status(400).json({ success: false, error: messages.join(', ') });
        return;
    }
    if (error.code === 11000) { 
        res.status(400).json({ success: false, error: 'Update failed: A card with this title already exists.' });
        return;
    }
    next(error);
  }
};

export const deleteCard = async (req: Request<{ cardId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);

    if (!card) {
      res.status(404).json({
        success: false,
        error: 'Card not found with id: ' + req.params.cardId,
      });
      return;
    }
    res.status(200).json({ // Send response and end execution
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
        res.status(400).json({ success: false, error: 'Invalid Card ID format: ' + req.params.cardId });
        return;
    }
    next(error);
  }
};
