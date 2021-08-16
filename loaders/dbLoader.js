// Logger module
const logger = require('./logger');

// Mongoose deps
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

// Retrieve master key configs
const gcpKeyConfig = config.get('gcpKeyConfig');

// Specify KMS provider settings
const kmsProviders = {
   gcp: {
    email: gcpKeyConfig.email,
    privateKey: gcpKeyConfig.privateKey
  }
};
 
// Set keyVault Namespace
const keyVaultNamespace = 'aura-backend.encryption';

// Fetch schemaMap
// const getSchemaMap = require('../csfleSchema');
// const schemaMap = getSchemaMap();

const connectDB = async () => {
  try {
    logger.info('Establishing connection to MongoDB....')
    // Establish connection to MongoDB Atlas
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      // Configure CSFLE auto encryption
      autoEncryption: {
        keyVaultNamespace, 
        kmsProviders
      }
    });

    logger.info('MongoDB connected successfully!')

  } catch (err) {
    logger.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;