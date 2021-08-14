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
const connectDB = require('./loaders/dbLoader');

// Call database loader
connectDB();

// Init express json middleware
app.use(express.json({ extended: false }));

// Import route files
// const auth = require('./routes/auth');
// const users = require('./routes/users');
const journalEntries = require('./routes/journalEntries');
const settings = require('./routes/settings');

// Mount routers
// app.use('/api/v1/auth', auth);
// app.use('/api/v1/users', users);
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

// // API running message
// app.get('/', (req, res) => res.send('Acorn API running'));

// Port config
const PORT = process.env.PORT || 5000;

// Listen config
app.listen(PORT, () => logger.info(`Acorn backend server started on port ${PORT}...`));
