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
app.listen(PORT, () => console.log(`Acorn backend server started on port ${PORT}...`));
