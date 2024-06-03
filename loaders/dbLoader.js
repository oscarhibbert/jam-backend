// Logger module
const logger = require('./logger');

// Mongoose deps
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

let connectionMessage;

// This function checks if we're running in a test environment and returns the appropriate MongoDB URI
function getDatabaseUri() {
  // Check if the MONGODB_URI environment variable is set, which indicates testing environment
  if (process.env.MONGODB_URI) {
    connectionMessage = "MongoDB Memory Server:";

    return process.env.MONGODB_URI; // Use the in-memory server URI for tests
  } else {
    connectionMessage = "MongoDB Atlas:"
    return db; // Use the default MongoDB Atlas URI from config for other environments
  }
}

exports.connectDB = async () => {
  const dbUri = getDatabaseUri(); // Get the appropriate URI

  try {
    logger.info(`${connectionMessage} Establishing connection....`)
    // Establish connection to MongoDB Atlas
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info(`${connectionMessage} Connection Established ✅`);

  } catch (err) {
    logger.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

exports.disconnectDB = async () => {
  try {
      logger.info(`${connectionMessage} Closing Connection....`);
      await mongoose.disconnect();
      logger.info(`${connectionMessage} Connection Closed ✅`);
  } catch (err) {
    throw err;
  };
};