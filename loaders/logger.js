// Import Winston
const winston = require('winston');

// let formatAllLevels = winston.format.combine(
//     winston.format.colorize({
//         all:true
//     }),
//     winston.format.label({
//         label:'[LOGGER]'
//     }),
//     winston.format.timestamp({
//         format:"DD-MM-YY HH:mm:ss"
//     }),
//     winston.format.printf(
//         info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
//     )
// );

// const enumerateErrorFormat = winston.format(info => {
//   if (info.message instanceof Error) {
//     info.message = Object.assign({
//       message: info.message.message,
//       stack: info.message.stack
//     }, info.message);
//   }

//   if (info instanceof Error) {
//     return Object.assign({
//       message: info.message,
//       stack: info.stack
//     }, info);
//   }

//   return info;
// });

// const logger = winston.createLogger({
//     format: winston.format.combine(
//     enumerateErrorFormat(),
//     winston.format.json()
//     ),
//     transports: [
//         new (winston.transports.Console)({
//             level: 'debug',
//             format: winston.format.combine(winston.format.colorize(), formatAllLevels)
//         }),
//         new (winston.transports.Console)({
//             level: 'error'
//         }),
//     ],
//     // Handle uncaught exceptions
//     exceptionHandlers: [
//         new (winston.transports.Console)({
//         })
//     ],
//     // Handle uncaught promise rejections
//     rejectionHandlers: [
//         new (winston.transports.Console)({
//         })
//     ]
// });

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
  
const logger = winston.createLogger({
        level: 'debug',
        // put the errors formatter in the parent for some reason, only needed there:
        format: winston.format.errors({ stack: true }),
        transports: new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                formatAllLevels
            ),
        }),
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
    });

// Export logger
module.exports = logger;