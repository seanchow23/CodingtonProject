const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();
require('./auth'); // auth config file

const app = express();

// Enable CORS to allow client (frontend) to talk to server
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:3000'); // Go back to the client
  });

app.get('/auth/user', (req, res) => {
  res.send(req.user || null);
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000');
  });
});

// Start server
app.listen(5000, () => {
  console.log('Server listening on http://localhost:5000');
});
