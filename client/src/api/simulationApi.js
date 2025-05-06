// client/src/api/simulationApi.js - FIXED VERSION

import axios from 'axios';

// Create an axios instance with proper configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout for simulations
});

/**
 * Ensure a scenario has proper structure before running simulation
 * This fixes common issues that cause simulation failures
 */
function preprocessScenario(scenario) {
  // Create a deep copy to avoid modifying the original
  const processedScenario = JSON.parse(JSON.stringify(scenario));
  
  // Ensure Cash investment exists
  const hasCash = processedScenario.investments.some(
    inv => inv.investmentType?.name === "Cash"
  );
  
  if (!hasCash) {
    console.warn("No Cash investment found in scenario - adding one");
    
    // Find a default investment type or create one
    let cashType = processedScenario.investmentTypes.find(t => t.name === "Cash");
    
    if (!cashType) {
      // Create a new Cash investment type with minimal properties
      cashType = {
        _id: `cash_${Date.now()}`,
        name: "Cash",
        expectedAnnualReturn: {
          type: "fixed",
          value1: 0,
          value2: 0
        },
        expectedAnnualIncome: {
          type: "fixed",
          value1: 0,
          value2: 0
        },
        expenseRatio: 0,
        taxability: false
      };
      
      processedScenario.investmentTypes.push(cashType);
    }
    
    // Add a Cash investment
    processedScenario.investments.push({
      _id: `cash_inv_${Date.now()}`,
      investmentType: cashType,
      value: 0,
      baseValue: 0,
      taxStatus: "non-retirement"
    });
  }
  
  // Ensure all events have proper structure
  if (processedScenario.events) {
    processedScenario.events.forEach(event => {
      // Fix missing properties based on event type
      if (event.type === 'income' || event.type === 'expense') {
        if (event.amount === undefined) {
          console.warn(`Adding missing amount to ${event.type} event "${event.name}"`);
          event.amount = 0;
        }
        
        if (event.change === undefined) {
          console.warn(`Adding missing change to ${event.type} event "${event.name}"`);
          event.change = 0;
        }
        
        if (event.type === 'income' && event.ss === undefined) {
          event.ss = false;
        }
        
        if (event.type === 'expense' && event.discretionary === undefined) {
          event.discretionary = false;
        }
        
        if (event.inflation === undefined) {
          event.inflation = false;
        }
      }
      
      if (event.type === 'invest' && event.max === undefined) {
        console.warn(`Adding missing max value to invest event "${event.name}"`);
        event.max = 1000;
      }
      
      // Ensure all events have a startYear and duration distribution
      if (!event.startYear || !event.startYear.type) {
        console.warn(`Fixing missing startYear in event "${event.name}"`);
        event.startYear = {
          type: "fixed",
          value1: 2025,
          value2: 0
        };
      }
      
      if (!event.duration || !event.duration.type) {
        console.warn(`Fixing missing duration in event "${event.name}"`);
        event.duration = {
          type: "fixed",
          value1: 1,
          value2: 0
        };
      }
    });
  }
  
  // Ensure withdrawal strategy exists
  if (!processedScenario.withdrawalStrategy || processedScenario.withdrawalStrategy.length === 0) {
    console.warn("Withdrawal strategy is empty - using all investments");
    processedScenario.withdrawalStrategy = processedScenario.investments.map(inv => inv._id);
  }
  
  // Initialize missing arrays
  if (!processedScenario.spendingStrategy) processedScenario.spendingStrategy = [];
  if (!processedScenario.rmd) processedScenario.rmd = [];
  if (!processedScenario.rothStrategy) processedScenario.rothStrategy = [];
  if (!processedScenario.rothYears) processedScenario.rothYears = [2030, 2050];
  
  // Ensure all distributions have proper structure
  ensureDistribution(processedScenario, 'lifeExpectancyUser');
  ensureDistribution(processedScenario, 'lifeExpectancySpouse');
  ensureDistribution(processedScenario, 'inflation');
  
  return processedScenario;
}

/**
 * Ensure a distribution property exists and has valid structure
 */
function ensureDistribution(scenario, propName) {
  if (!scenario[propName]) {
    console.warn(`Creating missing ${propName} distribution`);
    scenario[propName] = { 
      type: "fixed",
      value1: propName.includes('life') ? 80 : 2.5,
      value2: 0
    };
  } else if (!scenario[propName].type) {
    console.warn(`Fixing malformed ${propName} distribution`);
    const value = typeof scenario[propName] === 'number' ? 
      scenario[propName] : 
      (propName.includes('life') ? 80 : 2.5);
      
    scenario[propName] = {
      type: "fixed",
      value1: value,
      value2: 0
    };
  }
}

/**
 * Run a simulation with a given scenario and seed
 * Preprocesses the scenario to prevent common simulation failures
 */
export async function runSimulation(scenario, seed = null) {
  try {
    // Process the scenario to ensure it's valid for simulation
    const processedScenario = preprocessScenario(scenario);
    
    console.log("Running simulation with processed scenario:", processedScenario.name);
    
    const response = await API.post('/api/simulation', {
      scenario: processedScenario,
      seed
    });

    const data = response.data;

    if (!data.success) {
      console.error("Simulation failed:", data.error);
      throw new Error(data.error || 'Simulation failed');
    }

    return data.result;
  } catch (error) {
    console.error('Simulation error:', error.message);
    
    // Provide more detailed error info to help debugging
    if (error.response) {
      // The server responded with an error status
      console.error('Server response:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Check server connectivity.');
    }
    
    throw error;
  }
}