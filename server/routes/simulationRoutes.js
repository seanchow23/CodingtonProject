const express = require('express');
const simulation = require('../simulation');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { scenario, seed } = req.body;
    const result = await simulation({ scenario, seed });
    res.json({ success: true, result });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;