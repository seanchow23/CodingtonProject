const { parentPort } = require('worker_threads');
const simulation = require('./simulation');

parentPort.on('message', async ({ scenario, seed }) => {
  try {
    const result = await simulation({ scenario, seed });
    parentPort.postMessage({ success: true, result });
  } catch (err) {
    parentPort.postMessage({ success: false, error: err.message });
  }
});