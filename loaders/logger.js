// Import Winston
const winston = require('winston');
const config = require('config');
const Sentry = require('winston-transport-sentry-node').default;
const { LoggingWinston } = require('@google-cloud/logging-winston');

// Create empty logger object
let logger;

// Format all Winston transports
let formatAllLevels = winston.format.combine(
    winston.format.colorize({
        all:true
    }),
    winston.format.label({
        label:'[LOGGER]'
    }),
    winston.format.timestamp({
        format:"DD-MM-YY HH:mm:ss"
    }),
    winston.format.printf(info => {
    let { timestamp, level, code, stack, message } = info;

    // print out http error code w/ a space if we have one
    code = code ? ` ${code}` : '';
    // print the stack if we have it, message otherwise.
    // message = stack || message;
        
    // If stack is undefined set it to a blank string
    if (!stack) stack = '';

    return `${info.label} ${timestamp} ${level}: ${message} ${stack}`;
    })
);

// Set console transport
const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        formatAllLevels
    ),
});

// Set logger options
let loggerOptions = {
    // Set maximum level to log
    level: 'debug',
    // put the errors formatter in the parent, only works if included here
    format: winston.format.errors({ stack: true }),
    // Transport array with consoleTransport included. Others to be added to below on logic
    transports: [
        consoleTransport
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
        new (winston.transports.Console)({
        })
    ],
    // Handle uncaught promise rejections
    rejectionHandlers: [
        new (winston.transports.Console)({
        })
    ]
};

// Create empty transport objects
let sentryTransport;
let gcpTransport;

// Fetch remote logging status from ENV
const remoteLoggingStatus = () => {
    const remoteLoggingBoolean = config.get('remoteLogging');
    if (remoteLoggingBoolean === true) return true;
    else return false;
};

// If the remote logging status is true
if (remoteLoggingStatus()) {    
    // Set Sentry Transport
    sentryTransport = new Sentry({
        sentry: {
            dsn: config.get('sentryDSN'),
        },
        level: 'error',
    });

    // Set GCP Log Name
    let gcpWinstonLogName;

    if (process.env.NODE_ENV === 'development') gcpWinstonLogName = config.get('gcpDevLogName');
    else if (process.env.NODE_ENV === 'production') gcpWinstonLogName = config.get('gcpProdLogName');
    else gcpWinstonLogName = 'aura-backend-dev';
    
    // Set GCP Transport
    gcpTransport = new LoggingWinston({
        projectId: config.get('gcpProjectId'),
        keyFilename: config.get('gcpKeyFilepath'),
        logName: gcpWinstonLogName,
    });

    // Add Transports to transport array
    loggerOptions.transports.push(sentryTransport, gcpTransport);

    // Build logger
    logger = winston.createLogger(
        loggerOptions
    );

    // Log info
    logger.info(`Winston: Console Logging Enabled ✅`);
    logger.info(`Winston: Sentry Logging Enabled ✅`);
    logger.info(`Winston: GCP Logging Enabled ✅`);
}

// Else
else {
    // Using base loggerOptions
    // Build logger
    logger = winston.createLogger(
        loggerOptions
    );

    // Log info
    logger.info(`Winston: Console Logging Enabled ✅`);
};

// Export logger
module.exports = logger;