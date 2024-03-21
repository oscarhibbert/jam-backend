// Logger module
const logger = require('./logger');

// Mongoose deps
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

// This function checks if we're running in a test environment and returns the appropriate MongoDB URI
function getDatabaseUri() {
  // Check if the MONGODB_URI environment variable is set, which indicates testing environment
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI; // Use the in-memory server URI for tests
  } else {
    return config.get('mongoURI'); // Use the default MongoDB Atlas URI from config for other environments
  }
}

exports.connectDB = async () => {
  const dbUri = getDatabaseUri(); // Get the appropriate URI

  try {
    logger.info('MongoDB: Establishing connection....')
    // Establish connection to MongoDB Atlas
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info('MongoDB: Connection Established ✅');

  } catch (err) {
    logger.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

exports.disconnectDB = async () => {
  try {
      logger.info('MongoDB: Closing Connection....');
      await mongoose.disconnect();
      logger.info('MongoDB: Connection Closed ✅');
  } catch (err) {
    throw err;
  };
};