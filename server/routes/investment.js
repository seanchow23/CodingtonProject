const express = require('express');
const router = express.Router();
const Investment = require('../models/investment');

// ----------------------------------------------------
// GET /api/investments/:id
// Get a specific investment by ID
// ----------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id).populate('investmentType');
    if (!investment) return res.status(404).json({ error: 'Investment not found' });
    res.json(investment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// PUT /api/investments/:id
// Update an existing investment
// ----------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const updated = await Investment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('investmentType'); //  populate added here
    if (!updated) return res.status(404).json({ error: 'Investment not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// DELETE /api/investments/:id
// Delete an investment
// ----------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Investment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Investment not found' });
    res.json({ message: 'Investment deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// POST /api/investments
// Create a new investment
// ----------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const newInvestment = new Investment(req.body);
    const saved = await newInvestment.save();
    const populated = await saved.populate('investmentType'); // populate after save
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// GET /api/investments
// Get all investments (for admin/debugging only)
// ----------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const all = await Investment.find().populate('investmentType');
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
