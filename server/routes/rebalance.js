const express = require('express');
const router = express.Router();
const Rebalance = require('../models/rebalance');

// ----------------------------------------------------
// POST /api/rebalance
// Create a new rebalance event
// ----------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const newRebalance = new Rebalance(req.body);
    const saved = await newRebalance.save();
    const populated = await saved.populate({
      path: 'allocations',
      populate: {
        path: 'investment',
        populate: {
          path: 'investmentType'
        }
      }
    });
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// GET /api/rebalance
// Get all rebalance events
// ----------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const rebalances = await Rebalance.find().populate({
      path: 'allocations',
      populate: {
        path: 'investment',
        populate: {
          path: 'investmentType'
        }
      }
    });
    res.json(rebalances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// GET /api/rebalance/:id
// Get a specific rebalance event by ID
// ----------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const rebalance = await Rebalance.findById(req.params.id).populate({
      path: 'allocations',
      populate: {
        path: 'investment',
        populate: {
          path: 'investmentType'
        }
      }
    });
    if (!rebalance) return res.status(404).json({ error: 'Rebalance not found' });
    res.json(rebalance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// PUT /api/rebalance/:id
// Update a rebalance event
// ----------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const updated = await Rebalance.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate({
      path: 'allocations',
      populate: {
        path: 'investment',
        populate: {
          path: 'investmentType'
        }
      }
    });
    if (!updated) return res.status(404).json({ error: 'Rebalance not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// DELETE /api/rebalance/:id
// Delete a rebalance event
// ----------------------------------------------------
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
