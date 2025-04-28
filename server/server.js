const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');

const userRoutes = require('./routes/user'); 
const app = require('./app');  // This imports app with all routes



require('dotenv').config();
require('./auth'); // auth config file


const PORT = 5000; // use 5000 for targeting Google OAuth callback


// set up connection to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));


const scrapeCapitalGains = require('./scrapers/capital_gains');
const scrapeStandardDeductions = require('./scrapers/standardDeductions');
const scrapeRMDUniformTable = require('./scrapers/rmdscraper'); // ✅ RMD scraper

require('./scrapers/taxscraper'); // assuming taxscraper exports a function too

scrapeCapitalGains();       // <-- call it
scrapeStandardDeductions(); // <-- call it
scrapeRMDUniformTable();




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
