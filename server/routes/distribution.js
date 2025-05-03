const express = require('express');
const router = express.Router();
const Distribution = require('../models/distribution');

// CREATE
router.post('/', async (req, res) => {
  try {
    const newDistribution = new Distribution(req.body);
    const saved = await newDistribution.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const distributions = await Distribution.find().populate('event');
    res.json(distributions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const distribution = await Distribution.findById(req.params.id).populate('event');
    if (!distribution) return res.status(404).json({ error: 'Distribution not found' });
    res.json(distribution);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Distribution.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('event');

    if (!updated) return res.status(404).json({ error: 'Distribution not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Distribution.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Distribution not found' });
    res.json({ message: 'Distribution deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;