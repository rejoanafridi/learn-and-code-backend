import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Mongoose 6+ does not require useNewUrlParser, useUnifiedTopology, etc.
  // If using Mongoose 5 or older, you might need:
  // const mongooseOpts = {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // };
  // await mongoose.connect(uri, mongooseOpts);
  
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
