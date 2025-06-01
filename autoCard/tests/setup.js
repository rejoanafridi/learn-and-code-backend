const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  // Mongoose's connect options to avoid deprecation warnings
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true, // Not needed in Mongoose 6+
    // useFindAndModify: false, // Not needed in Mongoose 6+
  };
  await mongoose.connect(uri, mongooseOpts);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// Optional: Clear all data before each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
