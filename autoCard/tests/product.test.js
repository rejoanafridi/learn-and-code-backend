const request = require('supertest');
const app = require('../server'); // Path to your Express app
const Product = require('../src/models/Product'); // Path to your Product model
const mongoose = require('mongoose'); // For generating valid ObjectIds in tests

describe('Product API', () => {
  // Test data - can be defined here or within specific describe blocks
  const validProductData = {
    name: 'Test Product 1',
    description: 'A great product for testing.',
    price: 19.99,
    category: 'Testing',
    stock: 100,
    sku: 'TESTPROD001',
  };

  const anotherProductData = {
    name: 'Test Product 2',
    description: 'Another product.',
    price: 29.99,
    category: 'Testing',
    stock: 50,
    sku: 'TESTPROD002',
  };

  const yetAnotherProductData = {
    name: 'Advanced Gizmo',
    description: 'A more advanced product.',
    price: 99.50,
    category: 'Gadgets',
    stock: 20,
    sku: 'ADVGIZ001',
  };


  // POST /api/v1/products - Create Product
  describe('POST /api/v1/products', () => {
    it('should create a new product with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send(validProductData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validProductData.name);
      expect(res.body.data.sku).toBe(validProductData.sku);
      expect(res.body.data).toHaveProperty('_id');

      const productInDb = await Product.findById(res.body.data._id);
      expect(productInDb).not.toBeNull();
      expect(productInDb.name).toBe(validProductData.name);
    });

    it('should not create a product with missing required fields (e.g., name)', async () => {
      const { name, ...invalidData } = validProductData; // Remove name
      const res = await request(app)
        .post('/api/v1/products')
        .send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toEqual(expect.arrayContaining([expect.stringContaining('Product name is required')]));
    });

    it('should not create a product with invalid price (e.g., negative)', async () => {
      const invalidData = { ...validProductData, price: -10 };
      const res = await request(app)
        .post('/api/v1/products')
        .send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toEqual(expect.arrayContaining([expect.stringContaining('Price cannot be negative')]));
    });

    it('should not create a product with a duplicate name', async () => {
      await Product.create(validProductData); // Create first product
      const res = await request(app) // Attempt to create with same name
        .post('/api/v1/products')
        .send({ ...anotherProductData, name: validProductData.name });
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Duplicate field value entered for name/);
    });

    it('should not create a product with a duplicate SKU', async () => {
      await Product.create(validProductData); // Create first product
      const res = await request(app) // Attempt to create with same SKU
        .post('/api/v1/products')
        .send({ ...anotherProductData, sku: validProductData.sku });
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Duplicate field value entered for sku/);
    });
  });

  // GET /api/v1/products - Get All Products
  describe('GET /api/v1/products', () => {
    beforeEach(async () => {
      // Seed data for GET tests
      await Product.insertMany([validProductData, anotherProductData, yetAnotherProductData]);
    });

    it('should retrieve all products', async () => {
      const res = await request(app).get('/api/v1/products');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.data.length).toBe(3);
       // Default sort is createdAt: -1, so 'Advanced Gizmo' (last inserted) should be first
      expect(res.body.data[0].name).toBe(yetAnotherProductData.name);
    });

    it('should retrieve products with pagination (page 1, limit 2)', async () => {
      const res = await request(app).get('/api/v1/products?page=1&limit=2');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.data[0].name).toBe(yetAnotherProductData.name);
    });

    it('should retrieve products with pagination (page 2, limit 2)', async () => {
      const res = await request(app).get('/api/v1/products?page=2&limit=2');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.currentPage).toBe(2);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.data[0].name).toBe(validProductData.name); // The first one inserted
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/v1/products?category=Gadgets');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe(yetAnotherProductData.name);
    });

    it('should filter products by name (case-insensitive, partial match)', async () => {
      const res = await request(app).get('/api/v1/products?name=product%202'); // "product 2"
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe(anotherProductData.name);
    });
  });

  // GET /api/v1/products/:productId - Get Product by ID
  describe('GET /api/v1/products/:productId', () => {
    let testProduct;
    beforeEach(async () => {
      testProduct = await Product.create(validProductData);
    });

    it('should retrieve a specific product by ID', async () => {
      const res = await request(app).get(`/api/v1/products/${testProduct._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validProductData.name);
    });

    it('should return 404 for a non-existent product ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/products/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for an invalid product ID format', async () => {
      const res = await request(app).get('/api/v1/products/invalidID123');
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Invalid Product ID format');
    });
  });

  // PUT /api/v1/products/:productId - Update Product
  describe('PUT /api/v1/products/:productId', () => {
    let testProduct;
    beforeEach(async () => {
      testProduct = await Product.create(validProductData);
    });

    it('should update an existing product with valid data', async () => {
      const updates = { name: 'Updated Product Name', price: 25.99 };
      const res = await request(app)
        .put(`/api/v1/products/${testProduct._id}`)
        .send(updates);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.name).toBe(updates.name);
      expect(res.body.data.price).toBe(updates.price);

      const updatedProductInDb = await Product.findById(testProduct._id);
      expect(updatedProductInDb.name).toBe(updates.name);
    });

    it('should not update a product with invalid data (e.g., negative stock)', async () => {
      const updates = { stock: -5 };
      const res = await request(app)
        .put(`/api/v1/products/${testProduct._id}`)
        .send(updates);
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual(expect.arrayContaining([expect.stringContaining('Stock cannot be negative')]));
    });

    it('should return 404 when trying to update a non-existent product', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/api/v1/products/${nonExistentId}`)
            .send({ name: 'Ghost Update' });
        expect(res.statusCode).toEqual(404);
    });
  });

  // DELETE /api/v1/products/:productId - Delete Product
  describe('DELETE /api/v1/products/:productId', () => {
    let testProduct;
    beforeEach(async () => {
      testProduct = await Product.create(validProductData);
    });

    it('should delete an existing product', async () => {
      const res = await request(app).delete(`/api/v1/products/${testProduct._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Product deleted successfully');

      const deletedProductInDb = await Product.findById(testProduct._id);
      expect(deletedProductInDb).toBeNull();
    });

    it('should return 404 when trying to delete a non-existent product', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app).delete(`/api/v1/products/${nonExistentId}`);
        expect(res.statusCode).toEqual(404);
    });
  });
});
