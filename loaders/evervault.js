// Imports
const Evervault = require('@evervault/sdk');
const config = require('config');

const evervault = new Evervault(config.get('evervault.appId'), config.get('evervault.apiKey'));

// Export evervault
module.exports = evervault;