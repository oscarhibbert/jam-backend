const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDB, disconnectDB } = require('./loaders/dbLoader');

let mongoServer;

// Start MongoDB Memory Server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();

  // Explicitly call connectDB to establish the database connection
  await connectDB();
});

// Stop MongoDB Memory Server
afterAll(async () => {
  if (mongoServer) {
    // Clear all data on the server
    

    // Stop the server
    await mongoServer.stop();

    // Explicitly call connectDB to establish the database connection
    await disconnectDB();
  }
});
