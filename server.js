// Import Config
const config = require('config');

// Import Sentry
const Sentry = require("@sentry/node");
// or use es6 import statements
// import * as Sentry from '@sentry/node';

// Init Sentry
Sentry.init({
  dsn: config.get('sentryDSN'),

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// Import logger
const logger = require('./loaders/logger');

// Imports
const express = require('express');

// Init express
const app = express();

// Call DB loader 
const { connectDB, disconnectDB } = require('./loaders/dbLoader');

// Init express json middleware
app.use(express.json({ extended: false }));

// Import route files
const user = require('./routes/user');
const journalEntries = require('./routes/journalEntries');
const settings = require('./routes/settings');

// Mount routers
app.use('/api/v1/user', user);
app.use('/api/v1/entries', journalEntries);
app.use('/api/v1/settings', settings);

// FINAL MIDDLEWARE - JWT authorization error handling
app.use((err, req, res, next) => {
  try {
    // Winston Request Logging
    logger.info(`HTTP REQUEST - ${req.method} - ${req.originalUrl} - user unknown`);

    // Winston Response Logging
    res.on('finish', () => {
      logger.info(`HTTP RESPONSE - ${res.statusCode} - user unknown`);
    });  

    if (err.name === 'UnauthorizedError') {
        logger.error(`User unauthorized - token expired`);
      res.status(401).json({ errors: err.name + ': ' + err.message });
    };
  } catch (err) {
    logger.error(err.message);
    throw err;
  };
});

// Port config
const PORT = process.env.PORT || 8000;

// Set Server Var
let server;

// Build startServer function
const startServer = async () => {
  try {
    // Call database loader
    await connectDB();

    // Start Express Server
    server = app.listen(PORT, () => logger.info(`Server: Started On Port ${PORT} ✅`));
    
  } catch (err) {
    console.error(err);
    throw err;
  };
};

// Start Server
startServer();

// Graceful Shutdown for Express
// Set graceful shutdown options
process.on('SIGINT', async () => {
  // Disconnect MongoDB
  await disconnectDB();

  // Shut Down Server
  logger.info(`Server: Shutting Down Server....`)
  await server.close();
  logger.info(`Server: Server Shutdown Complete ✅`);
  // Avoid plugging up ports - ensures all processes are stopped
  process.exit(0);
});

process.on('SIGTERM', async () => {
  // Disconnect MongoDB
  await disconnectDB();
  
  // Shut Down Server
  logger.info(`Server: Shutting Down Server....`)
  await server.close();
  logger.info(`Server: Server Shutdown Complete ✅`);
  // Avoid plugging up ports - ensures all processes are stopped
  process.exit(0);
});
  