import request from 'supertest';
import app from '../src/server'; // Path to your Express app (server.ts)
import Card, { ICard, CardStatus, CardPriority } from '../src/models/card.model'; // Path to your Card model
import mongoose from 'mongoose';

describe('Card API', () => {
  // Type for API responses
  interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string | string[];
    count?: number;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalCards: number;
    };
    message?: string;
  }

  const validCardData: Partial<ICard> = { // Use Partial<ICard> for send data
    title: 'Test Card 1',
    description: 'This is a test card description.',
    status: CardStatus.Todo,
    priority: CardPriority.Medium,
  };

  // Test for POST /api/v1/cards - Create Card
  describe('POST /api/v1/cards', () => {
    it('should create a new card with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/cards')
        .send(validCardData);
      
      const body: ApiResponse<ICard> = res.body;
      expect(res.statusCode).toEqual(201);
      expect(body.success).toBe(true);
      expect(body.data?.title).toBe(validCardData.title);
      expect(body.data).toHaveProperty('_id');

      if (body.data?._id) {
        const cardInDb = await Card.findById(body.data._id);
        expect(cardInDb).not.toBeNull();
        expect(cardInDb?.title).toBe(validCardData.title);
      } else {
        throw new Error('Card ID not found in response');
      }
    });

    it('should not create a card with invalid data (missing title)', async () => {
      const { title, ...invalidData } = validCardData; // Remove title
      const res = await request(app)
        .post('/api/v1/cards')
        .send(invalidData);
      
      const body: ApiResponse = res.body;
      expect(res.statusCode).toEqual(400);
      expect(body.success).toBe(false);
      // The error message from controller is now a single string: "Path `title` is required."
      expect(body.error).toContain('title: Path `title` is required'); 
    });

    it('should not create a card with duplicate title', async () => {
      await Card.create({ title: 'Unique Title', description: 'First card', status: CardStatus.Todo, priority: CardPriority.Low });
      const res = await request(app)
        .post('/api/v1/cards')
        .send({ ...validCardData, title: 'Unique Title' });
      
      const body: ApiResponse = res.body;
      expect(res.statusCode).toEqual(400);
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/Duplicate title/); // Controller specific message
    });
  });

  // Test for GET /api/v1/cards - Get All Cards
  describe('GET /api/v1/cards', () => {
    beforeEach(async () => {
      await Card.insertMany([
        { title: 'Card A', description: 'Description A', status: CardStatus.Todo, priority: CardPriority.Low },
        { title: 'Card B', description: 'Description B', status: CardStatus.InProgress, priority: CardPriority.Medium },
        { title: 'Card C', description: 'Description C', status: CardStatus.Done, priority: CardPriority.High },
      ]);
    });

    it('should retrieve all cards', async () => {
      const res = await request(app).get('/api/v1/cards');
      const body: ApiResponse<ICard[]> = res.body;
      expect(res.statusCode).toEqual(200);
      expect(body.success).toBe(true);
      expect(body.count).toBe(3);
      expect(body.data?.length).toBe(3);
      if (body.data) { // Type guard
         expect(body.data[0].title).toBe('Card C'); 
      }
    });

    it('should retrieve cards with pagination (page 1, limit 2)', async () => {
      const res = await request(app).get('/api/v1/cards?page=1&limit=2');
      const body: ApiResponse<ICard[]> = res.body;
      expect(res.statusCode).toEqual(200);
      expect(body.data?.length).toBe(2);
      expect(body.pagination?.currentPage).toBe(1);
      expect(body.pagination?.totalPages).toBe(2);
      if (body.data) {
        expect(body.data[0].title).toBe('Card C');
      }
    });

    it('should retrieve cards with pagination (page 2, limit 2)', async () => {
      const res = await request(app).get('/api/v1/cards?page=2&limit=2');
      const body: ApiResponse<ICard[]> = res.body;
      expect(res.statusCode).toEqual(200);
      expect(body.data?.length).toBe(1);
      expect(body.pagination?.currentPage).toBe(2);
      if (body.data) {
        expect(body.data[0].title).toBe('Card A');
      }
    });

    it('should filter cards by status (status=todo)', async () => {
      const res = await request(app).get('/api/v1/cards?status=todo');
      const body: ApiResponse<ICard[]> = res.body;
      expect(res.statusCode).toEqual(200);
      expect(body.data?.length).toBe(1);
      if (body.data) {
        expect(body.data[0].status).toBe(CardStatus.Todo);
        expect(body.data[0].title).toBe('Card A');
      }
    });
    
    // ... (other filter tests can be similarly typed)
    it('should filter cards by priority (priority=high)', async () => {
        const res = await request(app).get('/api/v1/cards?priority=high');
        const body: ApiResponse<ICard[]> = res.body;
        expect(res.statusCode).toEqual(200);
        expect(body.data?.[0]?.priority).toBe(CardPriority.High);
    });

    it('should filter cards by title (case-insensitive partial match)', async () => {
        const res = await request(app).get('/api/v1/cards?title=card%20b');
        const body: ApiResponse<ICard[]> = res.body;
        expect(body.data?.[0]?.title).toBe('Card B');
    });

    it('should filter cards by multiple criteria (status=inprogress&priority=medium)', async () => {
        const res = await request(app).get('/api/v1/cards?status=inprogress&priority=medium');
        const body: ApiResponse<ICard[]> = res.body;
        expect(body.data?.[0]?.title).toBe('Card B');
    });
  });

  // GET /api/v1/cards/:cardId
  describe('GET /api/v1/cards/:cardId', () => {
    let testCard: ICard;
    beforeEach(async () => {
      testCard = await Card.create({ title: 'Specific Card', description: 'Details', status: CardStatus.Todo, priority: CardPriority.Low });
    });

    it('should retrieve a specific card by ID', async () => {
      const res = await request(app).get(`/api/v1/cards/${testCard._id}`);
      const body: ApiResponse<ICard> = res.body;
      expect(res.statusCode).toEqual(200);
      expect(body.data?.title).toBe('Specific Card');
      expect(body.data?._id.toString()).toBe(testCard._id.toString());
    });

    it('should return 404 for a non-existent card ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/v1/cards/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toContain('Card not found');
    });

    it('should return 400 for an invalid card ID format', async () => {
      const res = await request(app).get('/api/v1/cards/invalidID123');
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('Invalid Card ID format');
    });
  });

  // PUT /api/v1/cards/:cardId
  describe('PUT /api/v1/cards/:cardId', () => {
    let testCard: ICard;
    beforeEach(async () => {
      testCard = await Card.create({ title: 'Update Me', status: CardStatus.Todo, priority: CardPriority.Low });
    });

    it('should update an existing card with valid data', async () => {
      const updates = { title: 'Updated Title', status: CardStatus.Done, priority: CardPriority.High };
      const res = await request(app)
        .put(`/api/v1/cards/${testCard._id}`)
        .send(updates);
      const body: ApiResponse<ICard> = res.body;
      expect(res.statusCode).toEqual(200);
      expect(body.data?.title).toBe(updates.title);
      expect(body.data?.status).toBe(updates.status);
      
      const updatedCardInDb = await Card.findById(testCard._id);
      expect(updatedCardInDb?.title).toBe(updates.title);
    });

    it('should not update a card with invalid data (e.g., empty title)', async () => {
      const updates = { title: '' };
      const res = await request(app)
        .put(`/api/v1/cards/${testCard._id}`)
        .send(updates);
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('title: Path `title` is required');
    });
    
    it('should return 404 when trying to update a non-existent card', async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .put(`/api/v1/cards/${nonExistentId}`)
            .send({ title: 'Ghost Update' });
        expect(res.statusCode).toEqual(404);
    });
  });

  // DELETE /api/v1/cards/:cardId
  describe('DELETE /api/v1/cards/:cardId', () => {
    let testCard: ICard;
    beforeEach(async () => {
      testCard = await Card.create({ title: 'Delete Me', status: CardStatus.Todo, priority: CardPriority.Low });
    });

    it('should delete an existing card', async () => {
      const res = await request(app).delete(`/api/v1/cards/${testCard._id}`);
      const body: ApiResponse = res.body;
      expect(res.statusCode).toEqual(200);
      expect(body.message).toBe('Card deleted successfully');

      const deletedCardInDb = await Card.findById(testCard._id);
      expect(deletedCardInDb).toBeNull();
    });
    
    it('should return 404 when trying to delete a non-existent card', async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).delete(`/api/v1/cards/${nonExistentId}`);
        expect(res.statusCode).toEqual(404);
    });
  });
  
  describe('Rate Limiting Headers', () => {
    it('should include rate limit headers in the response', async () => {
      const res = await request(app).get('/api/v1/cards');
      expect(res.headers).toHaveProperty('ratelimit-limit');
      expect(res.headers).toHaveProperty('ratelimit-remaining');
      expect(res.headers).toHaveProperty('ratelimit-reset');
    });
  });
});
