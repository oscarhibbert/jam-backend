// Logger module
const logger = require('./logger');

// Mongoose deps
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

exports.connectDB = async () => {
  try {
    logger.info('MongoDB: Establishing connection....')
    // Establish connection to MongoDB Atlas
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
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