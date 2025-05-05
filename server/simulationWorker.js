const { parentPort } = require('worker_threads');
const simulation = require('./simulation');
const { CsvLogger, EventLogger, getLogFilenames } = require('./log_utils');

parentPort.on('message', async ({ scenario, seed, user, isFirstSimulation }) => {
  try {
    let csvLogger = null;
    let eventLogger = null;

    if (isFirstSimulation) {
      const { csv, log } = getLogFilenames(user || 'anonymous');
      csvLogger = new CsvLogger(csv);
      eventLogger = new EventLogger(log);
    }

    const result = await simulation({ scenario, seed, csvLogger, eventLogger });
    parentPort.postMessage({ success: true, result });

  } catch (err) {
    parentPort.postMessage({ success: false, error: err.message });
  }
});