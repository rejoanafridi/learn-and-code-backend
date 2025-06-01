const request = require('supertest');
const app = require('../server');
const Address = require('../src/models/Address');
const mongoose = require('mongoose');

describe('Address API', () => {
  const validAddressData = {
    street: '123 Main St',
    apartmentOrSuite: 'Apt 4B',
    city: 'Anytown',
    stateOrProvince: 'CA',
    country: 'USA',
    postalCode: '90210',
    addressType: 'home',
    isDefault: true,
  };

  const anotherAddressData = {
    street: '456 Oak Ln',
    city: 'Otherville',
    stateOrProvince: 'NY',
    country: 'USA',
    postalCode: '10001',
    addressType: 'work',
  };

  const yetAnotherAddressData = {
    street: '789 Pine Rd',
    city: 'Anytown', // Same city for filtering test
    stateOrProvince: 'CA',
    country: 'USA',
    postalCode: '90211', // Different postal code
    addressType: 'other',
  };

  // POST /api/v1/addresses - Create Address
  describe('POST /api/v1/addresses', () => {
    it('should create a new address with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/addresses')
        .send(validAddressData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.street).toBe(validAddressData.street);
      expect(res.body.data).toHaveProperty('_id');

      const addressInDb = await Address.findById(res.body.data._id);
      expect(addressInDb).not.toBeNull();
      expect(addressInDb.city).toBe(validAddressData.city);
    });

    it('should not create an address with missing required fields (e.g., street)', async () => {
      const { street, ...invalidData } = validAddressData;
      const res = await request(app)
        .post('/api/v1/addresses')
        .send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toEqual(expect.arrayContaining([expect.stringContaining('Street is required')]));
    });

    it('should not create an address with invalid addressType', async () => {
      const invalidData = { ...validAddressData, addressType: 'invalidtype' };
      const res = await request(app)
        .post('/api/v1/addresses')
        .send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toEqual(expect.arrayContaining([expect.stringContaining('is not a supported address type')]));
    });
  });

  // GET /api/v1/addresses - Get All Addresses
  describe('GET /api/v1/addresses', () => {
    beforeEach(async () => {
      await Address.insertMany([validAddressData, anotherAddressData, yetAnotherAddressData]);
    });

    it('should retrieve all addresses', async () => {
      const res = await request(app).get('/api/v1/addresses');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.data.length).toBe(3);
      // Default sort is createdAt desc, so last inserted is first
      expect(res.body.data[0].street).toBe(yetAnotherAddressData.street);
    });

    it('should retrieve addresses with pagination (page 1, limit 2)', async () => {
      const res = await request(app).get('/api/v1/addresses?page=1&limit=2');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.data[0].street).toBe(yetAnotherAddressData.street);
    });

    it('should filter addresses by city (case-insensitive)', async () => {
      const res = await request(app).get('/api/v1/addresses?city=anytown');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2); // validAddressData and yetAnotherAddressData
      expect(res.body.data.every(addr => addr.city === 'Anytown')).toBe(true);
    });

    it('should filter addresses by postalCode', async () => {
      const res = await request(app).get('/api/v1/addresses?postalCode=10001');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].postalCode).toBe(anotherAddressData.postalCode);
    });
  });

  // GET /api/v1/addresses/:addressId - Get Address by ID
  describe('GET /api/v1/addresses/:addressId', () => {
    let testAddress;
    beforeEach(async () => {
      testAddress = await Address.create(validAddressData);
    });

    it('should retrieve a specific address by ID', async () => {
      const res = await request(app).get(`/api/v1/addresses/${testAddress._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.street).toBe(validAddressData.street);
    });

    it('should return 404 for a non-existent address ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/addresses/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for an invalid ID format', async () => {
        const res = await request(app).get('/api/v1/addresses/invalidID');
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('Invalid Address ID format');
    });
  });

  // PUT /api/v1/addresses/:addressId - Update Address
  describe('PUT /api/v1/addresses/:addressId', () => {
    let testAddress;
    beforeEach(async () => {
      testAddress = await Address.create(validAddressData);
    });

    it('should update an existing address with valid data', async () => {
      const updates = { city: 'Newcityville', isDefault: false };
      const res = await request(app)
        .put(`/api/v1/addresses/${testAddress._id}`)
        .send(updates);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.city).toBe(updates.city);
      expect(res.body.data.isDefault).toBe(false);

      const updatedAddressInDb = await Address.findById(testAddress._id);
      expect(updatedAddressInDb.city).toBe(updates.city);
    });

    it('should not update an address with invalid data (e.g. missing required field)', async () => {
      const updates = { city: "" }; // city is required
      const res = await request(app)
        .put(`/api/v1/addresses/${testAddress._id}`)
        .send(updates);
      expect(res.statusCode).toEqual(400);
       expect(res.body.error).toEqual(expect.arrayContaining([expect.stringContaining('City is required')]));
    });

    it('should return 404 for updating a non-existent address', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/addresses/${nonExistentId}`)
        .send({ city: 'Ghost City' });
      expect(res.statusCode).toEqual(404);
    });
  });

  // DELETE /api/v1/addresses/:addressId - Delete Address
  describe('DELETE /api/v1/addresses/:addressId', () => {
    let testAddress;
    beforeEach(async () => {
      testAddress = await Address.create(validAddressData);
    });

    it('should delete an existing address', async () => {
      const res = await request(app).delete(`/api/v1/addresses/${testAddress._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Address deleted successfully');

      const deletedAddressInDb = await Address.findById(testAddress._id);
      expect(deletedAddressInDb).toBeNull();
    });

    it('should return 404 for deleting a non-existent address', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/v1/addresses/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});
