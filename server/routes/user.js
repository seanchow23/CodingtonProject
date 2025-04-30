const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Scenario = require('../models/scenario'); // Needed for .populate() to work properly

// ----------------------------------------------------
// GET /api/users/:id/scenarios
// Get all scenarios for a specific user (by user ID)
// ----------------------------------------------------
router.get('/:id/scenarios', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'scenarios',
        populate: [
          { path: 'investmentTypes' },
          {
            path: 'investments',
            populate: { path: 'investmentType' }
          },
          {
            path: 'events',
            populate: {
              path: 'allocations',
              populate: {
                path: 'investment',
                populate: {
                  path: 'investmentType'
                }
              }
            }
          },
          {
            path: 'spendingStrategy',
            model: 'Expense'
          },
          {
            path: 'withdrawalStrategy',
            populate: { path: 'investmentType' }
          },
          {
            path: 'rmd',
            populate: { path: 'investmentType' }
          },
          {
            path: 'rothStrategy',
            populate: { path: 'investmentType' }
          }
        ]
      });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user.scenarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// POST /api/users/:id/scenarios/:scenarioId
// Add an existing scenario to a user's list (sharing)
// ----------------------------------------------------
router.post('/:id/scenarios/:scenarioId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const scenarioId = req.params.scenarioId;

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Avoid duplicates
    if (!user.scenarios.includes(scenarioId)) {
      user.scenarios.push(scenarioId);
      await user.save();
    }

    res.json({ message: 'Scenario shared with user', scenarios: user.scenarios });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// GET /api/users/me
// Get the currently authenticated user
// ----------------------------------------------------
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json(req.user);
  }
  res.status(401).json({ error: 'Not authenticated' });
});

// ----------------------------------------------------
// GET /api/users
// Get all users
// ----------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// GET /api/users/:id
// Get a specific user by ID
// ----------------------------------------------------
// ----------------------------------------------------
// GET /api/users/:id
// Get a specific user by ID with full scenarios
// ----------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'scenarios',
        populate: [
          { path: 'investmentTypes' },
          {
            path: 'investments',
            populate: { path: 'investmentType' }
          },
          {
            path: 'events',
            populate: {
              path: 'allocations',
              populate: {
                path: 'investment',
                populate: {
                  path: 'investmentType'
                }
              }
            }
          },
          {
            path: 'spendingStrategy',
            model: 'Expense'
          },
          {
            path: 'withdrawalStrategy',
            populate: { path: 'investmentType' }
          },
          {
            path: 'rmd',
            populate: { path: 'investmentType' }
          },
          {
            path: 'rothStrategy',
            populate: { path: 'investmentType' }
          }
        ]
      })
      .populate({
        path: 'sharedScenarios',
        populate: [
          { path: 'investmentTypes' },
          {
            path: 'investments',
            populate: { path: 'investmentType' }
          },
          {
            path: 'events',
            populate: {
              path: 'allocations',
              populate: {
                path: 'investment',
                populate: {
                  path: 'investmentType'
                }
              }
            }
          },
          {
            path: 'spendingStrategy',
            model: 'Expense'
          },
          {
            path: 'withdrawalStrategy',
            populate: { path: 'investmentType' }
          },
          {
            path: 'rmd',
            populate: { path: 'investmentType' }
          },
          {
            path: 'rothStrategy',
            populate: { path: 'investmentType' }
          }
        ]
      });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ----------------------------------------------------
// PUT /api/users/:id
// Update a specific user by ID
// ----------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// DELETE /api/users/:id
// Delete a specific user by ID
// ----------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
