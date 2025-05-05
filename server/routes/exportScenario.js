// server/routes/scenarioExport.js
const express = require('express');
const router = express.Router();
const yaml = require('js-yaml');
const Scenario = require('../models/scenario');
const Distribution = require('../models/distribution');
const InvestmentType = require('../models/investmentType');
const Event = require('../models/event');
const Investment = require('../models/investment');
const Allocation = require('../models/allocation');

// Export scenario as YAML
router.get('/:id', async (req, res) => {
  try {
    // Fetch the scenario with all necessary populated fields
    const scenario = await Scenario.findById(req.params.id)
      .populate({
        path: 'investmentTypes',
        populate: [
          { path: 'expectedAnnualReturn' },
          { path: 'expectedAnnualIncome' }
        ]
      })
      .populate({
        path: 'investments',
        populate: { path: 'investmentType' }
      })
      .populate({
        path: 'events',
        populate: [
          {
            path: 'startYear',
            populate: { path: 'event' }
          },
          {
            path: 'duration',
            populate: { path: 'event' }
          },
          {
            path: 'allocations',
            populate: {
              path: 'investment',
              populate: {
                path: 'investmentType'
              }
            }
          }
        ]
      })
      .populate('lifeExpectancyUser')
      .populate('lifeExpectancySpouse')
      .populate('inflation');

    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    // Convert MongoDB document to YAML format
    const yamlData = convertToYaml(scenario);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/yaml');
    res.setHeader('Content-Disposition', `attachment; filename="${scenario.name.replace(/\s+/g, '_')}.yaml"`);
    
    // Send the YAML file
    res.send(yamlData);
  } catch (err) {
    console.error('Error exporting scenario:', err);
    res.status(500).json({ error: 'Failed to export scenario' });
  }
});

// Function to convert scenario to YAML format
function convertToYaml(scenario) {
  // Create a structure that matches the expected YAML format
  const yamlObj = {
    name: scenario.name,
    maritalStatus: scenario.married ? 'couple' : 'individual',
    birthYears: [scenario.birthYearUser],
    lifeExpectancy: [convertDistributionToYaml(scenario.lifeExpectancyUser)],
    
    investmentTypes: scenario.investmentTypes.map(invType => ({
      name: invType.name,
      description: invType.description || invType.name,
      returnAmtOrPct: "percent",
      returnDistribution: convertDistributionToYaml(invType.expectedAnnualReturn),
      expenseRatio: invType.expenseRatio,
      incomeAmtOrPct: "percent",
      incomeDistribution: convertDistributionToYaml(invType.expectedAnnualIncome),
      taxability: invType.taxability
    })),
    
    iinvestments: scenario.investments.map(inv => ({
      investmentType: inv.investmentType.name,
      value: inv.value,
      taxStatus: inv.taxStatus, // Keep the full enum value
      id: inv.investmentType.name + " " + inv.taxStatus
    })),
    
    eventSeries: scenario.events.map(event => {
      // Base event properties
      const baseEvent = {
        name: event.name,
        start: convertDistributionToYaml(event.startYear),
        duration: convertDistributionToYaml(event.duration),
        type: event.type
      };
      
      // Add type-specific properties
      if (event.type === 'income') {
        return {
          ...baseEvent,
          initialAmount: event.amount,
          changeAmtOrPct: "amount",
          changeDistribution: { type: "fixed", value: event.change },
          inflationAdjusted: event.inflation,
          userFraction: 1.0,
          socialSecurity: event.ss
        };
      } else if (event.type === 'expense') {
        return {
          ...baseEvent,
          initialAmount: event.amount,
          changeAmtOrPct: "amount",
          changeDistribution: { type: "fixed", value: event.change },
          inflationAdjusted: event.inflation,
          userFraction: 1.0,
          discretionary: event.discretionary
        };
      } else if (event.type === 'invest') {
        // Convert allocations to expected format
        const assetAllocation = {};
        event.allocations.forEach(alloc => {
          if (alloc.investment?.investmentType?.name) {
            assetAllocation[alloc.investment.investmentType.name + " " + alloc.investment.taxStatus] = alloc.percentage / 100;
          }
        });
        
        // For glide path, create second allocation if needed
        const assetAllocation2 = event.glide ? 
          event.allocations.reduce((acc, alloc) => {
            if (alloc.investment?.investmentType?.name) {
              acc[alloc.investment.investmentType.name + " " + alloc.investment.taxStatus] = alloc.finalPercentage / 100;
            }
            return acc;
          }, {}) : undefined;
        
        return {
          ...baseEvent,
          assetAllocation,
          glidePath: event.glide,
          assetAllocation2,
          maxCash: event.max
        };
      } else if (event.type === 'rebalance') {
        // Similar to invest event but with different structure
        const assetAllocation = {};
        event.allocations.forEach(alloc => {
          if (alloc.investment?.investmentType?.name) {
            assetAllocation[alloc.investment.investmentType.name + " " + alloc.investment.taxStatus] = alloc.percentage / 100;
          }
        });
        
        return {
          ...baseEvent,
          assetAllocation,
          glidePath: event.glide
        };
      }
      
      return baseEvent;
    }),
    
    inflationAssumption: convertDistributionToYaml(scenario.inflation),
    afterTaxContributionLimit: scenario.annualLimit,
    spendingStrategy: scenario.spendingStrategy.map(event => event.name),
    expenseWithdrawalStrategy: scenario.withdrawalStrategy.map(inv => 
      inv.investmentType.name + " " + inv.taxStatus
    ),
    RMDStrategy: scenario.rmd.map(inv => 
      inv.investmentType.name + " " + inv.taxStatus
    ),
    RothConversionOpt: scenario.rothOptimizer,
    RothConversionStart: scenario.rothYears[0],
    RothConversionEnd: scenario.rothYears[1],
    RothConversionStrategy: scenario.rothStrategy.map(inv => 
      inv.investmentType.name + " " + inv.taxStatus
    ),
    financialGoal: scenario.financialGoal,
    residenceState: scenario.state
  };
  
  // Add spouse data if married
  if (scenario.married) {
    yamlObj.birthYears.push(scenario.birthYearSpouse);
    yamlObj.lifeExpectancy.push(convertDistributionToYaml(scenario.lifeExpectancySpouse));
  }
  
  // Convert to YAML string
  return "# file format for scenario import/export.  version: 2025-04-16\n" +
         "# CSE416, Software Engineering, Scott D. Stoller.\n\n" +
         "# a distribution is represented as a map with one of the following forms:\n" +
         "# {type: fixed, value: <number>}\n" +
         "# {type: normal, mean: <number>, stdev: <number>}\n" +
         "# {type: uniform, lower: <number>, upper: <number>}\n" +
         "# percentages are represented by their decimal value, e.g., 4% is represented as 0.04.\n\n" +
         yaml.dump(yamlObj);
}

// Helper function to convert distribution to YAML format
function convertDistributionToYaml(distribution) {
  if (!distribution) {
    return { type: "fixed", value: 0 };
  }
  
  switch (distribution.type) {
    case 'fixed':
      return { type: "fixed", value: distribution.value1 };
    case 'normal':
      return { type: "normal", mean: distribution.value1, stdev: distribution.value2 };
    case 'uniform':
      return { type: "uniform", lower: distribution.value1, upper: distribution.value2 };
    case 'starts-with':
    case 'starts-after':
      if (distribution.event) {
        return { type: distribution.type, eventSeries: distribution.event.name };
      }
      return { type: "fixed", value: distribution.value1 };
    default:
      return { type: "fixed", value: distribution.value1 };
  }
}

module.exports = router;