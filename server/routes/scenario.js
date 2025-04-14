const express = require('express');
const router = express.Router();
const Scenario = require('../models/scenario');
const User = require('../models/user');

// ----------------------------------------------------
// GET /api/scenarios/user/:userId
// Get all scenarios created by a specific user (alternative approach)
// (Only needed if filtering by creator, not scenario access list)
// ----------------------------------------------------
// router.get('/user/:userId', async (req, res) => {
//   try {
//     const scenarios = await Scenario.find({ user: req.params.userId });
//     res.json(scenarios);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// ----------------------------------------------------
// POST /api/scenarios
// Create a new scenario (does NOT assign to a user)
// Requires: { name, married, birthYearUser, etc. }
// ----------------------------------------------------
router.post('/', async (req, res) => {
    try {
      const newScenario = new Scenario(req.body);
      const savedScenario = await newScenario.save();
      res.status(201).json(savedScenario);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

// ----------------------------------------------------
// GET /api/scenarios/:id
// Get a specific scenario by ID (with populated references)
// ----------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id)
      .populate('investments')
      .populate('investmentTypes')
      .populate('events')
      .populate('spendingStrategy')
      .populate('withdrawalStrategy')
      .populate('rmd')
      .populate('rothStrategy');

    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json(scenario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// PUT /api/scenarios/:id
// Update an existing scenario by ID
// ----------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const updatedScenario = await Scenario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedScenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json(updatedScenario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// DELETE /api/scenarios/:id
// Delete a scenario by ID
// ----------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const deletedScenario = await Scenario.findByIdAndDelete(req.params.id);
    if (!deletedScenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json({ message: 'Scenario deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// GET /api/scenarios
// Get all scenarios (admin/debugging only; use /users/:id/scenarios in real use)
// ----------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const scenarios = await Scenario.find();
    res.json(scenarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
