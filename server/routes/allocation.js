const express = require('express');
const router = express.Router();
const Allocation = require('../models/allocation');

// CREATE
router.post('/', async (req, res) => {
  try {
    const newAllocation = new Allocation(req.body);
    const saved = await newAllocation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate({
        path: 'investment',
        populate: {
          path: 'investmentType'
        }
      });

    res.json(allocations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate({
        path: 'investment',
        populate: {
          path: 'investmentType'
        }
      });

    if (!allocation) return res.status(404).json({ error: 'Allocation not found' });
    res.json(allocation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Allocation.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate({
        path: 'investment',
        populate: {
          path: 'investmentType'
        }
      });

    if (!updated) return res.status(404).json({ error: 'Allocation not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Allocation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Allocation not found' });
    res.json({ message: 'Allocation deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
