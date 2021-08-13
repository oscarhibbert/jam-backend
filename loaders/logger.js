// Import Winston
const winston = require('winston');
const { transports, format } = winston;
const { combine, json, timestamp, prettyPrint, colorize } = format;

let alignColorsAndTime = winston.format.combine(
    winston.format.colorize({
        all:true
    }),
    winston.format.errors({ stack: true }),
    winston.format.label({
        label:'[LOGGER]'
    }),
    winston.format.timestamp({
        format:"DD-MM-YY HH:mm:ss"
    }),
    winston.format.printf(
        info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    )
);

const logger = winston.createLogger({
    level: "debug",
    handleExceptions: true,
    transports: [
        new (winston.transports.Console)({
            format: winston.format.combine(winston.format.colorize(), alignColorsAndTime)
        })
    ]
});


// Build production logger
// const prodLogger;

// // Set empty logger object
// let logger = null;

// // Set logger to export depending on NODE_ENV
// if (process.env.NODE_ENV === 'development') {
//     logger = devLogger;
// } else {
//     return;
// };

// Export logger
module.exports = logger;