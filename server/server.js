const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const mongoose = require('mongoose');
const app = require('./app');  // This imports app with all routes

// Scrapers
require('./scrapers/taxscraper');
require('./scrapers/standardDeductions');
require('./scrapers/capital_gains');
require('./scrapers/rmdscraper');

// Routes
const userRoutes = require('./routes/user');
const scenarioRoutes = require('./routes/scenario');
const simulationRoutes = require('./routes/simulationRoutes');
const investmentTypeRoutes = require('./routes/investmentType');
const investmentRoutes = require('./routes/investment');
const eventsRoutes = require('./routes/events');
const allocationRoutes = require('./routes/allocation');
const expenseRoutes = require('./routes/expense');
const incomeRoutes = require('./routes/income');
const investRoutes = require('./routes/invest');
const rebalanceRoutes = require('./routes/rebalance');
const distributionRoutes = require('./routes/distribution');
const scenarioExportRoutes = require('./routes/exportScenario');
const scenarioImportRoutes = require('./routes/scenarioImport');

// Add routes
app.use('/api/scenarios/export', scenarioExportRoutes);
app.use('/api/scenarios/import', scenarioImportRoutes);

// Auth and Models
require('dotenv').config();
require('./auth');
require('./models/user');
require('./models/scenario');
require('./models/investment');
require('./models/investmentType');
require('./models/event');
require('./models/expense');

// Server Port
const PORT = 5000;  // Use 5000 for targeting Google OAuth callback
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());

// Enable CORS to allow client (frontend) to talk to server
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL  // Vercel frontend URL for production
    : 'http://localhost:3000',  // Localhost for development
  credentials: true
}));

// Handle preflight requests (CORS)
app.options('*', cors());

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/investment-types', investmentTypeRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/invest', investRoutes);
app.use('/api/rebalance', rebalanceRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/scenarios/import', scenarioImportRoutes);
app.use('/api/scenarios/export', scenarioExportRoutes);

// Google Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000');
  });

// User Auth Routes
app.get('/auth/user', (req, res) => {
  res.send(req.user || null);
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000');
  });
});

// Scraping
const scrapeCapitalGains = require('./scrapers/capital_gains');
const scrapeStandardDeductions = require('./scrapers/standardDeductions');
const scrapeRMDUniformTable = require('./scrapers/rmdscraper');

scrapeCapitalGains();
scrapeStandardDeductions();
scrapeRMDUniformTable();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Log environment details
console.log(process.env.NODE_ENV === 'production');
console.log(process.env.NODE_ENV);
console.log(process.env.CLIENT_URL);