const express = require('express');
const router = express.Router();
const Rebalance = require('../models/rebalance');

// CREATE
router.post('/', async (req, res) => {
  try {
    const newRebalance = new Rebalance(req.body);
    const saved = await newRebalance.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET ALL
router.get('/', async (req, res) => {
  try {
    const rebalances = await Rebalance.find().populate('allocations');
    res.json(rebalances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ONE
router.get('/:id', async (req, res) => {
  try {
    const rebalance = await Rebalance.findById(req.params.id).populate('allocations');
    if (!rebalance) return res.status(404).json({ error: 'Rebalance not found' });
    res.json(rebalance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Rebalance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Rebalance not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Rebalance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Rebalance not found' });
    res.json({ message: 'Rebalance deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
