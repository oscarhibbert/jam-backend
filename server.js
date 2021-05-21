// Imports
const express = require('express');

// Init express
const app = express();

// Call DB loader 
const connectDB = require('./loaders/dbLoader');

// Auth0 config
const { auth } = require('express-openid-connect');
const config = require('./config/auth.json');
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
console.log('Auth0 Connected...');

// Call database loader
connectDB();

// Init express json middleware
app.use(express.json({ extended: false }));


// Import route files
// const auth = require('./routes/auth');
const journalEntries = require('./routes/journalEntries');
const users = require('./routes/users');

// Mount routers
// app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/entries', journalEntries);

// // API running message
// app.get('/', (req, res) => res.send('Acorn API running'));

// Port config
const PORT = process.env.PORT || 5000;

// Listen config
app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
