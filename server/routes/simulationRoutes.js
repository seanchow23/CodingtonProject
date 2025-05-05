const express = require('express');
const { Worker } = require('worker_threads');
const path = require('path');
const router = express.Router();

function runSimulationInWorker(scenario, seed) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, '../simulationWorker.js'));

    worker.postMessage({ scenario, seed });

    worker.on('message', (msg) => {
      if (msg.success) resolve(msg.result);
      else reject(new Error(msg.error));
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

router.post('/', async (req, res) => {
  try {
    const { scenario, seed } = req.body;
    const result = await runSimulationInWorker(scenario, seed);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;