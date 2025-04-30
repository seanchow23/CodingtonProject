const express = require('express');
const router = express.Router();
const Invest = require('../models/invest');

// CREATE Invest Event
router.post('/', async (req, res) => {
  try {
    const newInvest = new Invest(req.body);
    const saved = await newInvest.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET ALL Invest Events
router.get('/', async (req, res) => {
  try {
    const invests = await Invest.find().populate('allocations');
    res.json(invests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ONE Invest Event by ID
router.get('/:id', async (req, res) => {
  try {
    const invest = await Invest.findById(req.params.id).populate('allocations');
    if (!invest) return res.status(404).json({ error: 'Invest event not found' });
    res.json(invest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Invest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Invest event not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Invest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Invest event not found' });
    res.json({ message: 'Invest event deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
