const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Start MongoDB Memory Server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
});

// Stop MongoDB Memory Server
afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
});
