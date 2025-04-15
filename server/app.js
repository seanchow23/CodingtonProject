const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

require('dotenv').config();
require('./auth');

// Register all models globally so Mongoose knows them at startup
require('./models/user');
require('./models/scenario');
require('./models/investment');
require('./models/investmentType');
require('./models/event');
require('./models/expense'); // 👈 This one is key for your failing test


const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
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

// Tax routes
const fs = require('fs');
const path = require('path');

const multer = require('multer');
const yaml = require('js-yaml');

// Setup multer for file upload
const upload = multer({ dest: 'uploads/' }); // temp location

app.post('/api/tax/upload-state-yaml', upload.single('yamlFile'), (req, res) => {
  const fs = require('fs');
  const filePath = req.file.path;

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const yamlData = yaml.load(fileContent);

    // Save the parsed data to a JSON file or your DB
    const outputPath = path.join(__dirname, 'data/state_tax_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(yamlData, null, 2));

    res.json({ message: '✅ YAML file uploaded and parsed successfully' });
  } catch (err) {
    console.error("YAML parse error:", err);
    res.status(500).json({ message: '❌ Failed to parse YAML file' });
  } finally {
    fs.unlinkSync(filePath); // Clean up temp file
  }
});


app.get('/api/tax/federal', (req, res) => {
  const file = path.join(__dirname, 'data/federal_tax_brackets.json');
  try {
    const data = fs.readFileSync(file, 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

app.get('/api/tax/deductions', (req, res) => {
  const file = path.join(__dirname, 'data/standard_deductions.json');
  try {
    const data = fs.readFileSync(file, 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

app.get('/api/tax/capital-gains', (req, res) => {
  const file = path.join(__dirname, 'data/capital_gains.json');
  try {
    const data = fs.readFileSync(file, 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.status(500).send("Internal Server Error");
  }
});


const scenarioRoutes = require('./routes/scenario');
const userRoutes = require('./routes/user');

app.use('/api/scenarios', scenarioRoutes);
app.use('/api/users', userRoutes);


module.exports = app;

