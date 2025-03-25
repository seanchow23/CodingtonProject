const request = require('supertest');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Setup Express app for testing
const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: false }));

// Mock passport to bypass actual Google login
const passport = require('passport');
jest.mock('passport');
passport.initialize = () => (req, res, next) => next();
passport.session = () => (req, res, next) => next();
passport.authenticate = () => (req, res, next) => {
  req.user = { displayName: 'Test User' };
  next();
};

app.use(passport.initialize());
app.use(passport.session());

// Mocked /auth/user route simulating logged-in user
app.get('/auth/user', (req, res) => {
  res.send({ displayName: 'Test User' });
});

// Mocked /auth/logout route
app.get('/auth/logout', (req, res) => {
  req.logout = (cb) => cb(); // mock logout
  req.logout(() => {
    res.redirect('http://localhost:3000');
  });
});

// Route to return federal tax bracket data from JSON
app.get('/api/tax/federal', (req, res) => {
  const file = path.join(__dirname, '../data/federal_tax_brackets.json');
  if (!fs.existsSync(file)) return res.status(404).send('Missing test data file');
  const data = fs.readFileSync(file, 'utf8');
  res.json(JSON.parse(data));
});

// Route to return standard deductions data from JSON
app.get('/api/tax/deductions', (req, res) => {
  const file = path.join(__dirname, '../data/standard_deductions.json');
  if (!fs.existsSync(file)) return res.status(404).send('Missing test data file');
  const data = fs.readFileSync(file, 'utf8');
  res.json(JSON.parse(data));
});

// Route to return capital gains tax data from JSON
app.get('/api/tax/capital-gains', (req, res) => {
  const file = path.join(__dirname, '../data/capital_gains.json');
  if (!fs.existsSync(file)) return res.status(404).send('Missing test data file');
  const data = fs.readFileSync(file, 'utf8');
  res.json(JSON.parse(data));
});

// ==============================
// Backend Route Test Suite
// ==============================
describe('Backend Route Tests', () => {
  // Test user login simulation via /auth/user
  test('should return a mock user from /auth/user', async () => {
    const res = await request(app).get('/auth/user');
    expect(res.statusCode).toBe(200);
    expect(res.body.displayName).toBe('Test User');
  });

  // Test logout route redirects correctly
  test('should redirect to homepage on /auth/logout', async () => {
    const res = await request(app).get('/auth/logout');
    expect(res.statusCode).toBe(302); // redirect
    expect(res.headers.location).toBe('http://localhost:3000');
  });

  // Test if federal tax brackets are returned correctly
  test('should return JSON array from /api/tax/federal', async () => {
    const res = await request(app).get('/api/tax/federal');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test if standard deductions are returned correctly
  test('should return JSON object from /api/tax/deductions', async () => {
    const res = await request(app).get('/api/tax/deductions');
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  // Test if capital gains data is returned correctly
  test('should return JSON array from /api/tax/capital-gains', async () => {
    const res = await request(app).get('/api/tax/capital-gains');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
