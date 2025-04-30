const express = require('express');
const router = express.Router();
const Scenario = require('../models/scenario');
const User = require('../models/user');
require('../models/investment');
require('../models/investmentType');
require('../models/event');
require('../models/expense');



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
// Create a new scenario (user is optional; if logged in, associate it with the user)
router.post('/', async (req, res) => {
  //console.log('Received new scenario data:', req.body); // Log received data
  try {
    const user = req.user; // This will be set by your auth middleware (Passport, JWT, etc.)

    // Create a new scenario
    const newScenario = new Scenario(req.body);

    // If the user is logged in, associate the scenario with the user
    if (user) {
      newScenario.user = user._id; // Link scenario to logged-in user
      user.scenarios.push(newScenario._id); // Add to the user's scenarios list
      await user.save();
    }

    // Save the scenario to the database
    const savedScenario = await newScenario.save();

    res.status(201).json(savedScenario); // Return the saved scenario
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error creating scenario' });
  }
});

// ----------------------------------------------------
// GET /api/scenarios/:id
// Get a specific scenario by ID (with populated references)
// ----------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id)
    .populate('investmentTypes')
    .populate({
      path: 'investments',
      populate: { path: 'investmentType' }
    })
    .populate('events')
    .populate({
      path: 'spendingStrategy',
      model: 'Expense'
    })
    .populate({
      path: 'withdrawalStrategy',
      populate: { path: 'investmentType' }
    })
    .populate({
      path: 'rmd',
      populate: { path: 'investmentType' }
    })
    .populate({
      path: 'rothStrategy',
      populate: { path: 'investmentType' }
    });

    await Promise.all(
      scenario.events
        .filter(event => event.type === 'invest')
        .map(event =>
          event.populate({
            path: 'allocations',
            populate: {
              path: 'investment',
              populate: {
                path: 'investmentType'
              }
            }
          })
        )
    );

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
