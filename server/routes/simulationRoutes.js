const express = require('express');
const { Worker } = require('worker_threads');
const path = require('path');
const router = express.Router();

function runSimulationInWorker(scenario, seed, user = null) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, '../simulationWorker.js'));

    worker.postMessage({ scenario, seed, user });

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
    const { scenario, seed, user } = req.body;
    const result = await runSimulationInWorker(scenario, seed, user);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add these functions at the bottom of your simulationRoutes.js file

// Function to validate scenario structure
function validateScenario(scenario) {
  // Check cash investment exists
  const hasCash = scenario.investments.some(inv => 
    inv.investmentType && inv.investmentType.name === "Cash"
  );
  
  if (!hasCash) {
    return 'Scenario must have a Cash investment type';
  }
  
  // Validate and ensure distributions have correct structure
  try {
    // Check if lifeExpectancyUser is a Distribution object
    if (!scenario.lifeExpectancyUser || typeof scenario.lifeExpectancyUser !== 'object') {
      return 'Life expectancy is missing or invalid';
    }
    
    // Ensure it has the correct properties
    if (!scenario.lifeExpectancyUser.type || !('value1' in scenario.lifeExpectancyUser)) {
      return 'Life expectancy distribution missing required fields';
    }
    
    // Similarly for inflation
    if (!scenario.inflation || typeof scenario.inflation !== 'object') {
      return 'Inflation is missing or invalid';
    }
    
    if (!scenario.inflation.type || !('value1' in scenario.inflation)) {
      return 'Inflation distribution missing required fields';
    }
    
    // Check event distributions
    for (const event of scenario.events || []) {
      if (!event.startYear || !event.startYear.type || !('value1' in event.startYear)) {
        return `Event ${event.name || 'unknown'} has invalid startYear distribution`;
      }
      
      if (!event.duration || !event.duration.type || !('value1' in event.duration)) {
        return `Event ${event.name || 'unknown'} has invalid duration distribution`;
      }
    }
    
    // Check investment type distributions
    for (const type of scenario.investmentTypes || []) {
      if (!type.expectedAnnualReturn || !type.expectedAnnualReturn.type || 
          !('value1' in type.expectedAnnualReturn)) {
        return `Investment type ${type.name || 'unknown'} has invalid return distribution`;
      }
      
      if (!type.expectedAnnualIncome || !type.expectedAnnualIncome.type || 
          !('value1' in type.expectedAnnualIncome)) {
        return `Investment type ${type.name || 'unknown'} has invalid income distribution`;
      }
    }
  } catch (err) {
    return `Distribution validation error: ${err.message}`;
  }
  
  return true;
}

// Function to repair scenario distributions if needed
function repairScenarioDistributions(scenario) {
  // Convert numeric life expectancy to distribution object
  if (typeof scenario.lifeExpectancyUser === 'number') {
    scenario.lifeExpectancyUser = {
      type: "fixed",
      value1: scenario.lifeExpectancyUser,
      value2: 0
    };
  }
  
  // Convert numeric inflation to distribution object
  if (typeof scenario.inflation === 'number') {
    scenario.inflation = {
      type: "fixed",
      value1: scenario.inflation,
      value2: 0
    };
  }
  
  // Fix event distributions
  for (const event of scenario.events || []) {
    if (typeof event.startYear === 'number') {
      event.startYear = {
        type: "fixed",
        value1: event.startYear,
        value2: 0
      };
    }
    
    if (typeof event.duration === 'number') {
      event.duration = {
        type: "fixed",
        value1: event.duration,
        value2: 0
      };
    }
  }
  
  // Fix investment type distributions
  for (const type of scenario.investmentTypes || []) {
    if (typeof type.expectedAnnualReturn === 'number') {
      type.expectedAnnualReturn = {
        type: "fixed",
        value1: type.expectedAnnualReturn,
        value2: 0
      };
    }
    
    if (typeof type.expectedAnnualIncome === 'number') {
      type.expectedAnnualIncome = {
        type: "fixed",
        value1: type.expectedAnnualIncome,
        value2: 0
      };
    }
  }
  
  return scenario;
}
// Add these functions at the bottom of your simulationRoutes.js file

// Function to validate scenario structure
function validateScenario(scenario) {
  // Check cash investment exists
  const hasCash = scenario.investments.some(inv => 
    inv.investmentType && inv.investmentType.name === "Cash"
  );
  
  if (!hasCash) {
    return 'Scenario must have a Cash investment type';
  }
  
  // Validate and ensure distributions have correct structure
  try {
    // Check if lifeExpectancyUser is a Distribution object
    if (!scenario.lifeExpectancyUser || typeof scenario.lifeExpectancyUser !== 'object') {
      return 'Life expectancy is missing or invalid';
    }
    
    // Ensure it has the correct properties
    if (!scenario.lifeExpectancyUser.type || !('value1' in scenario.lifeExpectancyUser)) {
      return 'Life expectancy distribution missing required fields';
    }
    
    // Similarly for inflation
    if (!scenario.inflation || typeof scenario.inflation !== 'object') {
      return 'Inflation is missing or invalid';
    }
    
    if (!scenario.inflation.type || !('value1' in scenario.inflation)) {
      return 'Inflation distribution missing required fields';
    }
    
    // Check event distributions
    for (const event of scenario.events || []) {
      if (!event.startYear || !event.startYear.type || !('value1' in event.startYear)) {
        return `Event ${event.name || 'unknown'} has invalid startYear distribution`;
      }
      
      if (!event.duration || !event.duration.type || !('value1' in event.duration)) {
        return `Event ${event.name || 'unknown'} has invalid duration distribution`;
      }
    }
    
    // Check investment type distributions
    for (const type of scenario.investmentTypes || []) {
      if (!type.expectedAnnualReturn || !type.expectedAnnualReturn.type || 
          !('value1' in type.expectedAnnualReturn)) {
        return `Investment type ${type.name || 'unknown'} has invalid return distribution`;
      }
      
      if (!type.expectedAnnualIncome || !type.expectedAnnualIncome.type || 
          !('value1' in type.expectedAnnualIncome)) {
        return `Investment type ${type.name || 'unknown'} has invalid income distribution`;
      }
    }
  } catch (err) {
    return `Distribution validation error: ${err.message}`;
  }
  
  return true;
}

// Function to repair scenario distributions if needed
function repairScenarioDistributions(scenario) {
  // Convert numeric life expectancy to distribution object
  if (typeof scenario.lifeExpectancyUser === 'number') {
    scenario.lifeExpectancyUser = {
      type: "fixed",
      value1: scenario.lifeExpectancyUser,
      value2: 0
    };
  }
  
  // Convert numeric inflation to distribution object
  if (typeof scenario.inflation === 'number') {
    scenario.inflation = {
      type: "fixed",
      value1: scenario.inflation,
      value2: 0
    };
  }
  
  // Fix event distributions
  for (const event of scenario.events || []) {
    if (typeof event.startYear === 'number') {
      event.startYear = {
        type: "fixed",
        value1: event.startYear,
        value2: 0
      };
    }
    
    if (typeof event.duration === 'number') {
      event.duration = {
        type: "fixed",
        value1: event.duration,
        value2: 0
      };
    }
  }
  
  // Fix investment type distributions
  for (const type of scenario.investmentTypes || []) {
    if (typeof type.expectedAnnualReturn === 'number') {
      type.expectedAnnualReturn = {
        type: "fixed",
        value1: type.expectedAnnualReturn,
        value2: 0
      };
    }
    
    if (typeof type.expectedAnnualIncome === 'number') {
      type.expectedAnnualIncome = {
        type: "fixed",
        value1: type.expectedAnnualIncome,
        value2: 0
      };
    }
  }
  
  return scenario;
}
module.exports = router;