// In server/simulationWorker.js
const { parentPort } = require('worker_threads');
const simulation = require('./simulation');
const { CsvLogger, EventLogger, getLogFilenames } = require('./log_utils');

parentPort.on('message', async ({ scenario, seed, user }) => {
  try {
    console.log("Worker received scenario:", scenario.name);
    console.log("Checking for Cash investment:", 
      scenario.investments.some(inv => inv.investmentType && inv.investmentType.name === "Cash"));
    
    // Add more detailed debugging before running the simulation
    console.log("Scenario structure check:");
    console.log("- Events count:", scenario.events?.length || 0);
    console.log("- Investment types count:", scenario.investmentTypes?.length || 0);
    console.log("- Investments count:", scenario.investments?.length || 0);
    
    // Check specific structures needed by simulation
    try {
      const lifeExpObj = scenario.lifeExpectancyUser;
      console.log("- Life expectancy:", lifeExpObj?.type, lifeExpObj?.value1);
      
      const inflationObj = scenario.inflation;
      console.log("- Inflation:", inflationObj?.type, inflationObj?.value1);
      
      // Check for Cash investment specifically
      const cashInvestment = scenario.investments.find(inv => 
        inv.investmentType && inv.investmentType.name === "Cash");
      
      if (!cashInvestment) {
        console.error("ERROR: No Cash investment found!");
      } else {
        console.log("- Cash investment found:", cashInvestment.value, cashInvestment.taxStatus);
      }
      
    } catch (checkErr) {
      console.error("Structure check error:", checkErr);
    }
    
    let csvLogger = null;
    let eventLogger = null;

    const { csv, log } = getLogFilenames(user || 'anonymous');
    csvLogger = new CsvLogger(csv);
    eventLogger = new EventLogger(log);

    const result = await simulation({ scenario, seed, csvLogger, eventLogger });
    parentPort.postMessage({ success: true, result });

  } catch (err) {
    console.error('Simulation worker error:', err);
    console.error('Error stack:', err.stack);
    parentPort.postMessage({ success: false, error: err.message });
  }
});