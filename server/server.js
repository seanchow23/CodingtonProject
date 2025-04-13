const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
require('./auth'); // auth config file

const app = express();
const PORT = 5000; // use 5000 for targeting Google OAuth callback

// enable CORS to allow client (frontend) to talk to server
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:3000');
  });

app.get('/auth/user', (req, res) => {
  res.send(req.user || null);
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000');
  });
});

// tax API Route 
app.get('/api/tax/federal', (req, res) => {
  const fs = require('fs');
  const path = require('path');

  const filePath = path.join(__dirname, 'data/federal_tax_brackets.json');
  console.log("Trying to read file from:", filePath);

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Failed to read or parse JSON:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// deductions API route
app.get('/api/tax/deductions', (req, res) => {
  const file = path.join(__dirname, 'data/standard_deductions.json');
  try {
    const data = fs.readFileSync(file, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading standard deductions:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
