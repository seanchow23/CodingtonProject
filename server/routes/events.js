const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Event = require('../models/event');
const Income = require('../models/income');
const Expense = require('../models/expense');
const Invest = require('../models/invest');
const Rebalance = require('../models/rebalance');

// ----------------------------------------------------
// GET /api/events/:id
// Get a specific event by ID
// ----------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/unpopulated/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// PUT /api/events/:id
// Update an event
// ----------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Event not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/allocations', async (req, res) => {
  try {
    const { allocationId, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(allocationId)) {
      return res.status(400).json({ error: 'Invalid allocation ID' });
    }

    if (type === 'invest') {
      const updated = await Invest.findByIdAndUpdate(
        req.params.id,
        { $push: { allocations: allocationId } },
        { new: true }
      );

      if (!updated) return res.status(404).json({ error: 'Invest Event not found' });

      res.json(updated);
    
  } else {
    const updated = await Rebalance.findByIdAndUpdate(
      req.params.id,
      { $push: { allocations: allocationId } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Rebalance Event not found' });

    res.json(updated);
  }

  } catch (err) {
    console.error('Error updating allocations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----------------------------------------------------
// DELETE /api/events/:id
// Delete an event
// ----------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// POST /api/events
// Create a new event (base event only)
// ----------------------------------------------------
router.post('/', async (req, res) => {
  try {
    let event;
    switch (req.body.type) {
      case 'income':
        event = new Income(req.body);
        break;
      case 'expense':
        event = new Expense(req.body);
        break;
      case 'invest':
        event = new Invest(req.body);
        break;
      case 'rebalance':
        event = new Rebalance(req.body);
        break;
      default:
        event = new Event(req.body); // fallback to base Event
    }

    const saved = await event.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Save error:", err);
    res.status(400).json({ error: err.message, details: err.errors });
  }
});

// ----------------------------------------------------
// GET /api/events
// Get all events
// ----------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
