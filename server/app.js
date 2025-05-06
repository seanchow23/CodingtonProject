const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

require('dotenv').config();
require('./auth');

// Register all models globally so Mongoose knows them at startup
require('./models/user');
require('./models/scenario');
require('./models/investment');
require('./models/investmentType');
require('./models/event');
require('./models/expense'); 

const app = express();

// Dynamic CORS configuration based on environment
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL  // Vercel/Render URL in production
    : 'http://localhost:3000',  // Localhost for development
  credentials: true
}));

app.use(session({ secret: process.env.SESSION_SECRET || 'test-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('http://localhost:3000');
});
app.get('/auth/user', (req, res) => {
  res.send(req.user || null);
});
app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('http://localhost:3000'));
});

// Setup multer for file upload
const upload = multer({ dest: 'uploads/' }); // temp location

// Tax upload route with async file handling
app.post('/api/tax/upload-state-yaml', upload.single('yamlFile'), async (req, res) => {
  const filePath = req.file.path;

  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const yamlData = yaml.load(fileContent);

    // Save the parsed data to a JSON file or your DB
    const outputPath = path.join(__dirname, 'data/state_tax_data.json');
    await fs.promises.writeFile(outputPath, JSON.stringify(yamlData, null, 2));

    res.json({ message: 'YAML file uploaded and parsed successfully' });
  } catch (err) {
    console.error("YAML parse error:", err);
    res.status(500).json({ message: 'Failed to parse YAML file' });
  } finally {
    try {
      await fs.promises.unlink(filePath);  // Clean up temp file
    } catch (cleanupErr) {
      console.error("Failed to clean up temp file:", cleanupErr);
    }
  }
});

// Async file reading for tax data routes
const getTaxData = async (filePath, res) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.status(500).send("Internal Server Error");
  }
};

app.get('/api/tax/federal', (req, res) => getTaxData(path.join(__dirname, 'data/federal_tax_brackets.json'), res));
app.get('/api/tax/deductions', (req, res) => getTaxData(path.join(__dirname, 'data/standard_deductions.json'), res));
app.get('/api/tax/capital-gains', (req, res) => getTaxData(path.join(__dirname, 'data/capital_gains.json'), res));
app.get('/api/tax/rmd-table', (req, res) => getTaxData(path.join(__dirname, 'data/rmd_uniform_table.json'), res));
app.get('/api/tax/state', (req, res) => getTaxData(path.join(__dirname, 'data/state_tax_data.json'), res));

module.exports = app;