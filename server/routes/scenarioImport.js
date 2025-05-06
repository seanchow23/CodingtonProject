// server/routes/scenarioImport.js
const express = require('express');
const router = express.Router();
const yaml = require('js-yaml');
const multer = require('multer');
const Scenario = require('../models/scenario');
const Distribution = require('../models/distribution');
const InvestmentType = require('../models/investmentType');
const Investment = require('../models/investment');
const Allocation = require('../models/allocation');
const Event = require('../models/event');
const Income = require('../models/income');
const Expense = require('../models/expense');
const Invest = require('../models/invest');
const Rebalance = require('../models/rebalance');

// Helper function to map tax status values
function mapTaxStatus(status) {
  // Map different possible values to the correct enum values
  const taxStatusMap = {
    'pre-tax': 'pre-tax retirement',
    'after-tax': 'after-tax retirement',
    'non-retirement': 'non-retirement',
    'pre-tax retirement': 'pre-tax retirement',
    'after-tax retirement': 'after-tax retirement'
  };
  
  return taxStatusMap[status] || 'non-retirement'; // Default to non-retirement if mapping not found
}

// Helper function to find investment type by name (case-insensitive)
function findInvestmentType(map, name) {
  // Check exact match first
  if (map[name]) return map[name];
  
  // Check case-insensitive match
  const lcName = name.toLowerCase();
  for (const [key, value] of Object.entries(map)) {
    if (key.toLowerCase() === lcName) {
      return value;
    }
  }
  
  // No match found
  return null;
}

// Configure multer for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Import scenario from YAML
router.post('/', upload.single('yamlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const yamlContent = req.file.buffer.toString('utf8');
    const yamlData = yaml.load(yamlContent);
    
    // Create a new scenario from the YAML data
    const scenarioData = await convertFromYaml(yamlData, req.user?._id);
    
    // Save the scenario
    const scenario = new Scenario(scenarioData);
    const savedScenario = await scenario.save();
    
    // If the user is logged in, associate the scenario with the user
    if (req.user) {
      req.user.scenarios.push(savedScenario._id);
      await req.user.save();
    }
    
    // Return the created scenario
    res.status(201).json(savedScenario);
  } catch (err) {
    console.error('Error importing scenario:', err);
    res.status(400).json({ error: 'Failed to import scenario: ' + err.message });
  }
});

// Function to convert YAML to scenario data
async function convertFromYaml(yamlData, userId) {
  // Create distributions for scenario
  const lifeExpectancyUser = await createDistribution(yamlData.lifeExpectancy[0]);
  const lifeExpectancySpouse = yamlData.lifeExpectancy.length > 1 
    ? await createDistribution(yamlData.lifeExpectancy[1])
    : await createDistribution({ type: "fixed", value: 0 });
  const inflation = await createDistribution(yamlData.inflationAssumption);
  
  // Create investment types
  const investmentTypeMap = {};
  const investmentTypeIds = [];
  
  for (const invType of yamlData.investmentTypes) {
    const expectedAnnualReturn = await createDistribution(invType.returnDistribution);
    const expectedAnnualIncome = await createDistribution(invType.incomeDistribution);
    
    const investmentType = new InvestmentType({
      name: invType.name,
      description: invType.description,
      expectedAnnualReturn: expectedAnnualReturn._id,
      expenseRatio: invType.expenseRatio,
      expectedAnnualIncome: expectedAnnualIncome._id,
      taxability: invType.taxability
    });
    
    const savedInvestmentType = await investmentType.save();
    investmentTypeMap[invType.name] = savedInvestmentType;
    investmentTypeIds.push(savedInvestmentType._id);
  }
  
  // Create investments
  const investmentMap = {};
  const investmentIds = [];
  
  for (const inv of yamlData.investments) {
    let investmentType = findInvestmentType(investmentTypeMap, inv.investmentType);
    
    // If investment type not found, create it automatically
    if (!investmentType) {
      console.log(`Creating missing investment type: ${inv.investmentType}`);
      
      // Create default distributions
      const returnDist = await createDistribution({ type: "fixed", value: 0 });
      const incomeDist = await createDistribution({ type: "fixed", value: 0 });
      
      // Create the missing investment type
      const newInvestmentType = new InvestmentType({
        name: inv.investmentType,
        description: `Auto-created during import: ${inv.investmentType}`,
        expectedAnnualReturn: returnDist._id,
        expenseRatio: 0,
        expectedAnnualIncome: incomeDist._id,
        taxability: false
      });
      
      const savedType = await newInvestmentType.save();
      investmentTypeMap[inv.investmentType] = savedType;
      investmentTypeIds.push(savedType._id);
      investmentType = savedType;
    }
    
    const investment = new Investment({
      investmentType: investmentType._id,
      value: inv.value,
      baseValue: inv.value,
      taxStatus: mapTaxStatus(inv.taxStatus)
    });
    
    const savedInvestment = await investment.save();
    investmentMap[inv.id] = savedInvestment;
    investmentIds.push(savedInvestment._id);
  }
  
  // Create events
  const eventMap = {};
  const eventIds = [];
  const spendingStrategyIds = [];
  
  for (const eventData of yamlData.eventSeries) {
    // Create distributions for start and duration
    const startYearDist = await createDistribution(eventData.start);
    const durationDist = await createDistribution(eventData.duration);
    
    let event;
    
    switch (eventData.type) {
      // Update the income case in your switch statement
      case 'income': {
        // Extract the change value based on the distribution type
        let changeValue = 0; // Default value
        
        if (eventData.changeDistribution) {
          if (eventData.changeDistribution.type === 'fixed') {
            changeValue = eventData.changeDistribution.value || 0;
          } else if (eventData.changeDistribution.type === 'uniform') {
            // For uniform, use average of lower and upper as a simple approach
            changeValue = ((eventData.changeDistribution.lower || 0) + 
                          (eventData.changeDistribution.upper || 0)) / 2;
          } else if (eventData.changeDistribution.type === 'normal') {
            // For normal, use the mean
            changeValue = eventData.changeDistribution.mean || 0;
          }
        }

        event = new Income({
          name: eventData.name,
          description: eventData.description || '',
          startYear: startYearDist._id,
          duration: durationDist._id,
          amount: eventData.initialAmount,
          change: changeValue, // Use the extracted change value
          inflation: eventData.inflationAdjusted,
          ss: eventData.socialSecurity || false
        });
        break;
      }
      case 'expense': {
        // Extract the change value based on the distribution type
        let changeValue = 0; // Default value
        
        if (eventData.changeDistribution) {
          if (eventData.changeDistribution.type === 'fixed') {
            changeValue = eventData.changeDistribution.value || 0;
          } else if (eventData.changeDistribution.type === 'uniform') {
            changeValue = ((eventData.changeDistribution.lower || 0) + 
                          (eventData.changeDistribution.upper || 0)) / 2;
          } else if (eventData.changeDistribution.type === 'normal') {
            changeValue = eventData.changeDistribution.mean || 0;
          }
        }
      
        event = new Expense({
          name: eventData.name,
          description: eventData.description || '',
          startYear: startYearDist._id,
          duration: durationDist._id,
          amount: eventData.initialAmount,
          change: changeValue, // Use the extracted change value
          inflation: eventData.inflationAdjusted,
          discretionary: eventData.discretionary || false
        });
        
        // Add to spending strategy if discretionary
        if (eventData.discretionary) {
          spendingStrategyIds.push(event._id);
        }
        break;
      }
      case 'invest': {
        // Create allocations
        const allocations = [];
        
        for (const [investmentId, percentage] of Object.entries(eventData.assetAllocation)) {
          const investment = investmentMap[investmentId];
          if (!investment) {
            console.warn(`Investment not found: ${investmentId}, skipping allocation`);
            continue;
          }
          
          // Get final percentage for glide path
          let finalPercentage = percentage * 100;
          if (eventData.glidePath && eventData.assetAllocation2) {
            finalPercentage = (eventData.assetAllocation2[investmentId] || 0) * 100;
          }
          
          const allocation = new Allocation({
            investment: investment._id,
            percentage: percentage * 100,
            finalPercentage: finalPercentage,
            glide: 0 // This will be calculated later
          });
          
          const savedAllocation = await allocation.save();
          allocations.push(savedAllocation._id);
        }
        
        event = new Invest({
          name: eventData.name,
          description: eventData.description || '',
          startYear: startYearDist._id,
          duration: durationDist._id,
          allocations: allocations,
          max: eventData.maxCash,
          glide: eventData.glidePath || false
        });
        break;
      }
      case 'rebalance': {
        // Create allocations
        const allocations = [];
        
        for (const [investmentId, percentage] of Object.entries(eventData.assetAllocation)) {
          const investment = investmentMap[investmentId];
          if (!investment) {
            console.warn(`Investment not found: ${investmentId}, skipping allocation`);
            continue;
          }
          
          const allocation = new Allocation({
            investment: investment._id,
            percentage: percentage * 100,
            finalPercentage: percentage * 100,
            glide: 0
          });
          
          const savedAllocation = await allocation.save();
          allocations.push(savedAllocation._id);
        }
        
        event = new Rebalance({
          name: eventData.name,
          description: eventData.description || '',
          startYear: startYearDist._id,
          duration: durationDist._id,
          allocations: allocations,
          glide: false
        });
        break;
      }
      default:
        throw new Error(`Unknown event type: ${eventData.type}`);
    }
    
    const savedEvent = await event.save();
    eventMap[eventData.name] = savedEvent;
    eventIds.push(savedEvent._id);
  }
  
  // Resolve event references for startYear/endYear distributions
  for (const [name, event] of Object.entries(eventMap)) {
    const eventData = yamlData.eventSeries.find(e => e.name === name);
    if (eventData.start.eventSeries) {
      const referencedEvent = eventMap[eventData.start.eventSeries];
      if (referencedEvent) {
        const startYear = await Distribution.findById(event.startYear);
        startYear.event = referencedEvent._id;
        await startYear.save();
      }
    }
  }
  
  // Map withdrawal strategy and RMD strategy
  let withdrawalStrategyIds = [];
  let rmdIds = [];
  let rothStrategyIds = [];
  
  // Handle missing or empty arrays
  if (yamlData.expenseWithdrawalStrategy && yamlData.expenseWithdrawalStrategy.length > 0) {
    withdrawalStrategyIds = yamlData.expenseWithdrawalStrategy
      .map(id => {
        const investment = investmentMap[id];
        return investment ? investment._id : null;
      })
      .filter(id => id !== null);
  }
  
  if (yamlData.RMDStrategy && yamlData.RMDStrategy.length > 0) {
    rmdIds = yamlData.RMDStrategy
      .map(id => {
        const investment = investmentMap[id];
        return investment ? investment._id : null;
      })
      .filter(id => id !== null);
  }
  
  if (yamlData.RothConversionStrategy && yamlData.RothConversionStrategy.length > 0) {
    rothStrategyIds = yamlData.RothConversionStrategy
      .map(id => {
        const investment = investmentMap[id];
        return investment ? investment._id : null;
      })
      .filter(id => id !== null);
  }
  
  // Create the scenario object
  return {
    user: userId,
    name: yamlData.name,
    married: yamlData.maritalStatus === 'couple',
    birthYearUser: yamlData.birthYears[0],
    birthYearSpouse: yamlData.birthYears.length > 1 ? yamlData.birthYears[1] : 0,
    lifeExpectancyUser: lifeExpectancyUser._id,
    lifeExpectancySpouse: lifeExpectancySpouse._id,
    investments: investmentIds,
    investmentTypes: investmentTypeIds,
    events: eventIds,
    inflation: inflation._id,
    annualLimit: yamlData.afterTaxContributionLimit,
    spendingStrategy: spendingStrategyIds,
    withdrawalStrategy: withdrawalStrategyIds.length > 0 ? withdrawalStrategyIds : investmentIds,
    rmd: rmdIds,
    rothStrategy: rothStrategyIds,
    rothYears: [yamlData.RothConversionStart || 2050, yamlData.RothConversionEnd || 2060],
    rothOptimizer: yamlData.RothConversionOpt || false,
    sharing: '',
    financialGoal: yamlData.financialGoal || 0,
    state: yamlData.residenceState || 'NY'
  };
}

// Helper function to create a distribution from YAML format
async function createDistribution(distributionData) {
  let distribution;
  
  if (!distributionData) {
    distribution = new Distribution({
      type: 'fixed',
      value1: 0,
      value2: 0
    });
  } else if (distributionData.type === 'fixed') {
    distribution = new Distribution({
      type: 'fixed',
      value1: distributionData.value,
      value2: 0
    });
  } else if (distributionData.type === 'normal') {
    distribution = new Distribution({
      type: 'normal',
      value1: distributionData.mean,
      value2: distributionData.stdev
    });
  } else if (distributionData.type === 'uniform') {
    distribution = new Distribution({
      type: 'uniform',
      value1: distributionData.lower,
      value2: distributionData.upper
    });
  } else if (distributionData.type === 'startWith' || distributionData.type === 'startAfter') {
    distribution = new Distribution({
      type: distributionData.type === 'startWith' ? 'starts-with' : 'starts-after',
      value1: 0,
      value2: 0,
      event: null // Will be filled in later when events are created
    });
  } else {
    distribution = new Distribution({
      type: 'fixed',
      value1: distributionData.value || 0,
      value2: 0
    });
  }
  
  return await distribution.save();
}

module.exports = router;