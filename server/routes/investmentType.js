const express = require('express');
const router = express.Router();
const InvestmentType = require('../models/investmentType');

// GET /api/investment-types/:id
// Get a specific investment type by ID
router.get('/:id', async (req, res) => {
  try {
    const type = await InvestmentType.findById(req.params.id);
    if (!type) return res.status(404).json({ error: 'Investment type not found' });
    res.json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/investment-types/:id
// Update an investment type
router.put('/:id', async (req, res) => {
  try {
    const updated = await InvestmentType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Investment type not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/investment-types/:id
// Delete an investment type
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await InvestmentType.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Investment type not found' });
    res.json({ message: 'Investment type deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// POST /api/investment-types
// Create a new investment type
router.post('/', async (req, res) => {
  try {
    const newType = new InvestmentType(req.body);
    const saved = await newType.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// GET /api/investment-types
// Get all investment types
router.get('/', async (req, res) => {
  try {
    const types = await InvestmentType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
