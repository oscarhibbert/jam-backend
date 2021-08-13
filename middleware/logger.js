const winston = require('../loaders/logger');

exports.logger = (req, res, next) => {
  try {
    // Winston Request Logging
    winston.info(`HTTP REQUEST - ${req.method} - ${req.originalUrl} - ${req.user.sub}`);

    // Winston Response Logging
    res.on('finish', () => {
      winston.info(`HTTP RESPONSE - ${res.statusCode} - ${req.user.sub}`);
    });  

    next();
  } catch (err) {
    winston.error(err.message);
    throw err;
  };
};