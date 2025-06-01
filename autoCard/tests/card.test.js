const request = require('supertest');
const app = require('../server'); // Adjust path as necessary if server.js is elsewhere
const Card = require('../src/models/Card'); // Adjust path to your Card model

describe('Card API', () => {
  // Test for POST /api/v1/cards - Create Card
  describe('POST /api/v1/cards', () => {
    it('should create a new card with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/cards')
        .send({
          title: 'Test Card 1',
          description: 'This is a test card description.',
          status: 'todo',
          priority: 'medium',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Card 1');
      expect(res.body.data).toHaveProperty('_id');

      // Verify the card was saved to the database
      const cardInDb = await Card.findById(res.body.data._id);
      expect(cardInDb).not.toBeNull();
      expect(cardInDb.title).toBe('Test Card 1');
    });

    it('should not create a card with invalid data (missing title)', async () => {
      const res = await request(app)
        .post('/api/v1/cards')
        .send({
          description: 'Missing title.',
          status: 'todo',
          priority: 'low',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Card validation failed: title: Path `title` is required.');
    });

    it('should not create a card with duplicate title', async () => {
      // First, create a card
      await Card.create({ title: 'Unique Title', description: 'First card' });

      // Attempt to create another card with the same title
      const res = await request(app)
        .post('/api/v1/cards')
        .send({ title: 'Unique Title', description: 'Second card with same title' });

      expect(res.statusCode).toEqual(400); // Mongoose duplicate key error
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/E11000 duplicate key error collection/);
    });
  });

  // Test for GET /api/v1/cards - Get All Cards
  describe('GET /api/v1/cards', () => {
    beforeEach(async () => {
      // Seed some data for GET tests
      await Card.insertMany([
        { title: 'Card A', description: 'Description A', status: 'todo', priority: 'low' },
        { title: 'Card B', description: 'Description B', status: 'inprogress', priority: 'medium' },
        { title: 'Card C', description: 'Description C', status: 'done', priority: 'high' },
      ]);
    });

    it('should retrieve all cards', async () => {
      const res = await request(app).get('/api/v1/cards');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0].title).toBe('Card C'); // Default sort is by createdAt: -1
    });

    // Pagination Tests
    it('should retrieve cards with pagination (page 1, limit 2)', async () => {
      const res = await request(app).get('/api/v1/cards?page=1&limit=2');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.totalPages).toBe(2); // 3 total cards, limit 2 -> 2 pages
      expect(res.body.data[0].title).toBe('Card C');
    });

    it('should retrieve cards with pagination (page 2, limit 2)', async () => {
      const res = await request(app).get('/api/v1/cards?page=2&limit=2');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1); // Second page has 1 card
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.currentPage).toBe(2);
      expect(res.body.data[0].title).toBe('Card A');
    });

    // Filtering Tests
    it('should filter cards by status (status=todo)', async () => {
      const res = await request(app).get('/api/v1/cards?status=todo');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('todo');
      expect(res.body.data[0].title).toBe('Card A');
    });

    it('should filter cards by priority (priority=high)', async () => {
      const res = await request(app).get('/api/v1/cards?priority=high');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].priority).toBe('high');
      expect(res.body.data[0].title).toBe('Card C');
    });

    it('should filter cards by title (case-insensitive partial match)', async () => {
      const res = await request(app).get('/api/v1/cards?title=card%20b'); // "card b"
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Card B');
    });

     it('should filter cards by multiple criteria (status=inprogress&priority=medium)', async () => {
      const res = await request(app).get('/api/v1/cards?status=inprogress&priority=medium');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toBe('Card B');
    });
  });

  // Placeholder for GET /api/v1/cards/:cardId
  describe('GET /api/v1/cards/:cardId', () => {
    let testCard;
    beforeEach(async () => {
        testCard = await Card.create({ title: 'Specific Card', description: 'Details' });
    });

    it('should retrieve a specific card by ID', async () => {
        const res = await request(app).get(`/api/v1/cards/${testCard._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('Specific Card');
        expect(res.body.data._id).toBe(testCard._id.toString());
    });

    it('should return 404 for a non-existent card ID', async () => {
        const nonExistentId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId
        const res = await request(app).get(`/api/v1/cards/${nonExistentId}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('Card not found');
    });

    it('should return 400 for an invalid card ID format', async () => {
        const invalidId = '123';
        const res = await request(app).get(`/api/v1/cards/${invalidId}`);
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('Invalid Card ID format');
    });
  });

  // Placeholder for PUT /api/v1/cards/:cardId
  describe('PUT /api/v1/cards/:cardId', () => {
    let testCard;
    beforeEach(async () => {
        testCard = await Card.create({ title: 'Update Me', status: 'todo', priority: 'low' });
    });

    it('should update an existing card with valid data', async () => {
        const updates = { title: 'Updated Title', status: 'done', priority: 'high' };
        const res = await request(app)
            .put(`/api/v1/cards/${testCard._id}`)
            .send(updates);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('Updated Title');
        expect(res.body.data.status).toBe('done');
        expect(res.body.data.priority).toBe('high');

        const updatedCardInDb = await Card.findById(testCard._id);
        expect(updatedCardInDb.title).toBe('Updated Title');
    });

    it('should not update a card with invalid data (e.g., empty title)', async () => {
        const updates = { title: '' }; // Invalid: title is required
        const res = await request(app)
            .put(`/api/v1/cards/${testCard._id}`)
            .send(updates);
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('Validation error'); // Or specific Mongoose error
    });

    it('should return 404 when trying to update a non-existent card', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/api/v1/cards/${nonExistentId}`)
            .send({ title: 'Ghost Update' });
        expect(res.statusCode).toEqual(404);
    });
  });

  // Placeholder for DELETE /api/v1/cards/:cardId
  describe('DELETE /api/v1/cards/:cardId', () => {
    let testCard;
    beforeEach(async () => {
        testCard = await Card.create({ title: 'Delete Me' });
    });

    it('should delete an existing card', async () => {
        const res = await request(app).delete(`/api/v1/cards/${testCard._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Card deleted successfully');

        const deletedCardInDb = await Card.findById(testCard._id);
        expect(deletedCardInDb).toBeNull();
    });

    it('should return 404 when trying to delete a non-existent card', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app).delete(`/api/v1/cards/${nonExistentId}`);
        expect(res.statusCode).toEqual(404);
    });
  });

  // Basic Rate Limiting Header Test
  // This is a very basic check. True rate limit testing is more complex.
  describe('Rate Limiting Headers', () => {
    it('should include rate limit headers in the response', async () => {
      const res = await request(app).get('/api/v1/cards');
      expect(res.headers).toHaveProperty('ratelimit-limit');
      expect(res.headers).toHaveProperty('ratelimit-remaining');
      expect(res.headers).toHaveProperty('ratelimit-reset');
    });
  });
});

// Mongoose is needed for ObjectId creation in tests for non-existent IDs
const mongoose = require('mongoose');
