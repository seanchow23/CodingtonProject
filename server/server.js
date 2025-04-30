const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const app = require('./app');  // This imports app with all routes

require('./scrapers/taxscraper'); // assuming taxscraper exports a function too
require('./scrapers/standardDeductions'); // assuming taxscraper exports a function too
require('./scrapers/capital_gains'); // assuming taxscraper exports a function too
require('./scrapers/rmdscraper'); // assuming taxscraper exports a function too



const userRoutes = require('./routes/user'); 
const scenarioRoutes = require('./routes/scenario');
const investmentTypeRoutes = require('./routes/investmentType');
const investmentRoutes = require('./routes/investment');
const eventsRoutes = require('./routes/events');

require('dotenv').config();
require('./auth'); // auth config file

require('./models/user');
require('./models/scenario');
require('./models/investment');
require('./models/investmentType');
require('./models/event');
require('./models/expense'); 

const PORT = 5001; // use 5000 for targeting Google OAuth callback


// set up connection to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));


app.use(express.json());


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

// use user routes
app.use('/api/users', userRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/investment-types', investmentTypeRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/events', eventsRoutes);

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

 const scrapeCapitalGains = require('./scrapers/capital_gains');
 const scrapeStandardDeductions = require('./scrapers/standardDeductions');
 const scrapeRMDUniformTable = require('./scrapers/rmdscraper'); // ✅ RMD scraper
 
 scrapeCapitalGains();       // <-- call it
 scrapeStandardDeductions(); // <-- call it
 scrapeRMDUniformTable();
 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});