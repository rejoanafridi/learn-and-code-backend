const request = require('supertest');
const app = require('../server');
const Habit = require('../src/models/Habit');
const mongoose = require('mongoose');

describe('Habit API', () => {
  const validHabitData = {
    name: 'Drink Water Daily',
    description: 'Drink 8 glasses of water every day.',
    frequency: 'daily',
    goal: '8 glasses',
  };

  const anotherHabitData = {
    name: 'Exercise Weekly',
    description: 'Go to the gym 3 times a week.',
    frequency: 'weekly',
    goal: '3 times a week',
    daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
  };

  const yetAnotherHabitData = { // For filtering by name
    name: 'Read Daily',
    description: 'Read for 30 minutes.',
    frequency: 'daily',
    goal: '30 minutes'
  };

  // POST /api/v1/habits - Create Habit
  describe('POST /api/v1/habits', () => {
    it('should create a new habit with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/habits')
        .send(validHabitData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validHabitData.name);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.currentStreak).toBe(0);
      expect(res.body.data.longestStreak).toBe(0);

      const habitInDb = await Habit.findById(res.body.data._id);
      expect(habitInDb).not.toBeNull();
      expect(habitInDb.name).toBe(validHabitData.name);
    });

    it('should not create a habit with missing required fields (e.g., name)', async () => {
      const { name, ...invalidData } = validHabitData;
      const res = await request(app)
        .post('/api/v1/habits')
        .send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toEqual(expect.arrayContaining([expect.stringContaining('Habit name is required')]));
    });

    it('should not create a habit with a duplicate name', async () => {
      await Habit.create(validHabitData);
      const res = await request(app)
        .post('/api/v1/habits')
        .send({ ...anotherHabitData, name: validHabitData.name });
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Duplicate value for name/);
    });
  });

  // GET /api/v1/habits - Get All Habits
  describe('GET /api/v1/habits', () => {
    beforeEach(async () => {
      await Habit.insertMany([validHabitData, anotherHabitData, yetAnotherHabitData]);
    });

    it('should retrieve all habits', async () => {
      const res = await request(app).get('/api/v1/habits');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0].name).toBe(yetAnotherHabitData.name); // Default sort createdAt: -1
    });

    it('should retrieve habits with pagination (page 1, limit 2)', async () => {
      const res = await request(app).get('/api/v1/habits?page=1&limit=2');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should filter habits by frequency', async () => {
      const res = await request(app).get('/api/v1/habits?frequency=weekly');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe(anotherHabitData.name);
    });

    it('should filter habits by name (case-insensitive, partial match)', async () => {
      const res = await request(app).get('/api/v1/habits?name=water');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe(validHabitData.name);
    });
  });

  // GET /api/v1/habits/:habitId - Get Habit by ID
  describe('GET /api/v1/habits/:habitId', () => {
    let testHabit;
    beforeEach(async () => {
      testHabit = await Habit.create(validHabitData);
    });

    it('should retrieve a specific habit by ID', async () => {
      const res = await request(app).get(`/api/v1/habits/${testHabit._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.name).toBe(validHabitData.name);
    });

    it('should return 404 for a non-existent habit ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/habits/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for an invalid ID format', async () => {
        const res = await request(app).get('/api/v1/habits/invalidID');
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('Invalid Habit ID format');
    });
  });

  // PUT /api/v1/habits/:habitId - Update Habit (including marking complete)
  describe('PUT /api/v1/habits/:habitId', () => {
    let testHabit;
    beforeEach(async () => {
      testHabit = await Habit.create({
        name: 'Test Streak Habit',
        frequency: 'daily',
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null
      });
    });

    it('should update basic habit details', async () => {
      const updates = { description: 'Updated description', goal: 'New Goal' };
      const res = await request(app)
        .put(`/api/v1/habits/${testHabit._id}`)
        .send(updates);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.description).toBe(updates.description);
      expect(res.body.data.goal).toBe(updates.goal);
    });

    it('should mark a habit as complete for the first time', async () => {
      const res = await request(app)
        .put(`/api/v1/habits/${testHabit._id}`)
        .send({ markComplete: true });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.currentStreak).toBe(1);
      expect(res.body.data.longestStreak).toBe(1);
      expect(res.body.data.lastCompletedDate).not.toBeNull();
      // Check if lastCompletedDate is today (ignoring time part for robust test)
      const today = new Date().toISOString().split('T')[0];
      expect(res.body.data.lastCompletedDate.startsWith(today)).toBe(true);
    });

    it('should increment streak if marked complete on consecutive days', async () => {
      // Simulate completion yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await Habit.findByIdAndUpdate(testHabit._id, {
        lastCompletedDate: yesterday,
        currentStreak: 1,
        longestStreak: 1
      });

      const res = await request(app)
        .put(`/api/v1/habits/${testHabit._id}`)
        .send({ markComplete: true });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.currentStreak).toBe(2);
      expect(res.body.data.longestStreak).toBe(2);
    });

    it('should reset streak if marked complete after a gap', async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      await Habit.findByIdAndUpdate(testHabit._id, {
        lastCompletedDate: twoDaysAgo,
        currentStreak: 5, // Some previous streak
        longestStreak: 5
      });

      const res = await request(app)
        .put(`/api/v1/habits/${testHabit._id}`)
        .send({ markComplete: true });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.currentStreak).toBe(1); // Resets to 1
      expect(res.body.data.longestStreak).toBe(5); // Longest streak remains
    });

    it('should update longestStreak if currentStreak surpasses it', async () => {
      await Habit.findByIdAndUpdate(testHabit._id, {
        currentStreak: 3,
        longestStreak: 3
      });
      // Simulate a completion that would make currentStreak 4
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await Habit.findByIdAndUpdate(testHabit._id, { lastCompletedDate: yesterday });


      const res = await request(app)
        .put(`/api/v1/habits/${testHabit._id}`)
        .send({ markComplete: true });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.currentStreak).toBe(4);
      expect(res.body.data.longestStreak).toBe(4);
    });

     it('should allow manually setting currentStreak and update longestStreak accordingly', async () => {
      const res = await request(app)
        .put(`/api/v1/habits/${testHabit._id}`)
        .send({ currentStreak: 10 }); // Manually setting streak
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.currentStreak).toBe(10);
      expect(res.body.data.longestStreak).toBe(10); // Should also update longestStreak

      const res2 = await request(app)
        .put(`/api/v1/habits/${testHabit._id}`)
        .send({ currentStreak: 5 }); // Set to a lower streak
      expect(res2.statusCode).toEqual(200);
      expect(res2.body.data.currentStreak).toBe(5);
      expect(res2.body.data.longestStreak).toBe(10); // Longest should remain
    });
  });

  // DELETE /api/v1/habits/:habitId - Delete Habit
  describe('DELETE /api/v1/habits/:habitId', () => {
    let testHabit;
    beforeEach(async () => {
      testHabit = await Habit.create(validHabitData);
    });

    it('should delete an existing habit', async () => {
      const res = await request(app).delete(`/api/v1/habits/${testHabit._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Habit deleted successfully');

      const deletedHabitInDb = await Habit.findById(testHabit._id);
      expect(deletedHabitInDb).toBeNull();
    });

    it('should return 404 for deleting a non-existent habit', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app).delete(`/api/v1/habits/${nonExistentId}`);
        expect(res.statusCode).toEqual(404);
    });
  });
});
