// Imports
const express = require('express');
const connectDB = require('./config/db');

// Init express
const app = express();

// Connect Database
connectDB();

// Init express json middleware
app.use(express.json({ extended: false }));

// Import route files
const auth = require('./routes/auth');
const journalEntries = require('./routes/journalEntries');
const users = require('./routes/users');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/entries', journalEntries);

// // API running message
// app.get('/', (req, res) => res.send('Acorn API running'));

// Port config
const PORT = process.env.PORT || 5000;

// Listen config
app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));




/* CODE TO TEST */
console.log('Running test code....................')
const UserService = require('./services/UserService');

const userService = new UserService();

userService.CheckUser({ email: 'oscarhibbert1@gmail.com' });
