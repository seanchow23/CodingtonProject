const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const mongoose = require('mongoose');
const app = require('./app');

require('dotenv').config();
require('./auth');

// Models
require('./models/user');
require('./models/scenario');
require('./models/investment');
require('./models/investmentType');
require('./models/event');
require('./models/expense');

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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());

// CORS config for both local and Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app'
  ],
  credentials: true
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
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

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:3000'); // replace with your frontend in production
  }
);

app.get('/auth/user', (req, res) => {
  res.send(req.user || null);
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000'); // replace with your frontend in production
  });
});

// Scrape data on server start
const scrapeCapitalGains = require('./scrapers/capital_gains');
const scrapeStandardDeductions = require('./scrapers/standardDeductions');
const scrapeRMDUniformTable = require('./scrapers/rmdscraper');

scrapeCapitalGains();
scrapeStandardDeductions();
scrapeRMDUniformTable();

// Dynamic PORT for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
