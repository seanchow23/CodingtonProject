const express = require('express');
const router = express.Router();
const Scenario = require('../models/scenario');
const User = require('../models/user');
require('../models/investment');
require('../models/investmentType');
require('../models/event');
require('../models/expense');

// Add this to your server/routes/scenario.js file

const yaml = require('js-yaml');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');





// Setup multer for temporary file storage
const upload = multer({ dest: 'uploads/' });


// Route for importing a YAML scenario
router.post('/import', upload.single('yamlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Read and parse the YAML file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const scenarioData = yaml.load(fileContent);
    
    // Process the YAML data to convert it to our database schema format
    const processedScenario = await processYamlScenario(scenarioData, req.user);
    
    // Return the fully populated scenario
    const populatedScenario = await Scenario.findById(processedScenario._id)
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
          }
        ]
      })
      .populate({
        path: 'spendingStrategy',
        model: 'expense'
      })
      .populate({
        path: 'withdrawalStrategy',
        populate: { path: 'investmentType' }
      })
      .populate({
        path: 'rmd',
        populate: { path: 'investmentType' }
      })
      .populate({
        path: 'rothStrategy',
        populate: { path: 'investmentType' }
      })
      .populate('lifeExpectancyUser')
      .populate('lifeExpectancySpouse')
      .populate('inflation')
      .populate('user');

    // Load additional nested data
    await Promise.all(
      populatedScenario.events
        .filter(event => event.type === 'invest' || event.type === 'rebalance')
        .map(event =>
          event.populate({
            path: 'allocations',
            populate: {
              path: 'investment',
              populate: {
                path: 'investmentType'
              }
            }
          })
        )
    );

    // Clean up the temp file
    fs.unlinkSync(filePath);
    
    res.status(201).json(populatedScenario);
    
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import scenario: ' + error.message });
  }
});


// Export route for downloading a scenario as YAML
router.get('/export/:id', async (req, res) => {
  try {
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
          { path: 'startYear' },
          { path: 'duration' },
          { path: 'allocations' }
        ]
      })
      .populate('lifeExpectancyUser')
      .populate('lifeExpectancySpouse')
      .populate('inflation');
    
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    // Convert to YAML format
    const yamlData = convertToYamlFormat(scenario);
    const yamlString = yaml.dump(yamlData);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/x-yaml');
    res.setHeader('Content-Disposition', `attachment; filename="${scenario.name}.yaml"`);
    
    res.send(yamlString);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export scenario' });
  }
});

// Helper function to process YAML scenario data
async function processYamlScenario(yamlData, user) {
  const Distribution = mongoose.model('Distribution');
  const InvestmentType = mongoose.model('InvestmentType');
  const Investment = mongoose.model('Investment');
  const Event = mongoose.model('Event');
  const Income = mongoose.model('income');
  const Expense = mongoose.model('expense');
  const Invest = mongoose.model('invest');
  const Rebalance = mongoose.model('rebalance');
  const Allocation = mongoose.model('Allocation');
  
  // Create base scenario structure
  const newScenario = new Scenario({
    name: yamlData.name || 'Imported Scenario',
    married: yamlData.maritalStatus === 'couple',
    user: user ? user._id : null,
    // Other base fields...
  });
  
  // Process birth years
  if (yamlData.birthYears && yamlData.birthYears.length > 0) {
    newScenario.birthYearUser = yamlData.birthYears[0];
    if (yamlData.birthYears.length > 1) {
      newScenario.birthYearSpouse = yamlData.birthYears[1];
    }
  }
  
  // Process life expectancy distributions
  if (yamlData.lifeExpectancy && yamlData.lifeExpectancy.length > 0) {
    const userExpectancy = yamlData.lifeExpectancy[0];
    const userDistribution = new Distribution({
      type: userExpectancy.type,
      value1: userExpectancy.value || userExpectancy.mean || userExpectancy.lower,
      value2: userExpectancy.stdev || userExpectancy.upper
    });
    await userDistribution.save();
    newScenario.lifeExpectancyUser = userDistribution._id;
    
    if (yamlData.lifeExpectancy.length > 1) {
      const spouseExpectancy = yamlData.lifeExpectancy[1];
      const spouseDistribution = new Distribution({
        type: spouseExpectancy.type,
        value1: spouseExpectancy.value || spouseExpectancy.mean || spouseExpectancy.lower,
        value2: spouseExpectancy.stdev || spouseExpectancy.upper
      });
      await spouseDistribution.save();
      newScenario.lifeExpectancySpouse = spouseDistribution._id;
    }
  }
  
  // Process inflation
  const inflationDist = new Distribution({
    type: 'fixed',
    value1: yamlData.inflationAssumption?.value || 0.03,
    value2: 0
  });
  await inflationDist.save();
  newScenario.inflation = inflationDist._id;
  
  // Process investment types
  const investmentTypeMap = {};
  if (yamlData.investmentTypes && yamlData.investmentTypes.length > 0) {
    newScenario.investmentTypes = [];
    
    for (const typeData of yamlData.investmentTypes) {
      // Create return distribution
      const returnDist = new Distribution({
        type: typeData.returnDistribution.type,
        value1: typeData.returnDistribution.value || typeData.returnDistribution.mean || typeData.returnDistribution.lower,
        value2: typeData.returnDistribution.stdev || typeData.returnDistribution.upper
      });
      await returnDist.save();
      
      // Create income distribution
      const incomeDist = new Distribution({
        type: typeData.incomeDistribution.type,
        value1: typeData.incomeDistribution.value || typeData.incomeDistribution.mean || typeData.incomeDistribution.lower,
        value2: typeData.incomeDistribution.stdev || typeData.incomeDistribution.upper
      });
      await incomeDist.save();
      
      // Create investment type
      const newType = new InvestmentType({
        name: typeData.name,
        description: typeData.description,
        expectedAnnualReturn: returnDist._id,
        expenseRatio: typeData.expenseRatio,
        expectedAnnualIncome: incomeDist._id,
        taxability: typeData.taxability
      });
      await newType.save();
      
      newScenario.investmentTypes.push(newType._id);
      investmentTypeMap[typeData.name] = newType;
    }
  }
  
  // Process investments
  const investmentMap = {};
  if (yamlData.investments && yamlData.investments.length > 0) {
    newScenario.investments = [];
    
    for (const invData of yamlData.investments) {
      const investmentType = investmentTypeMap[invData.investmentType];
      if (!investmentType) {
        console.warn(`Investment type ${invData.investmentType} not found`);
        continue;
      }
      
      const newInvestment = new Investment({
        investmentType: investmentType._id,
        value: invData.value,
        baseValue: invData.value,
        taxStatus: invData.taxStatus
      });
      await newInvestment.save();
      
      newScenario.investments.push(newInvestment._id);
      investmentMap[invData.id] = newInvestment;
    }
  }
  
  // Process event series
  if (yamlData.eventSeries && yamlData.eventSeries.length > 0) {
    newScenario.events = [];
    const eventMap = {};
    
    // First pass - create base events
    for (const eventData of yamlData.eventSeries) {
      let startYearDist, durationDist;
      
      // Create start year distribution
      if (eventData.start.type === 'startWith' || eventData.start.type === 'startAfter') {
        // Will need a second pass to link these up
        startYearDist = new Distribution({
          type: eventData.start.type === 'startWith' ? 'starts-with' : 'starts-after',
          value1: 0,
          value2: 0
        });
      } else {
        startYearDist = new Distribution({
          type: eventData.start.type,
          value1: eventData.start.value || eventData.start.mean || eventData.start.lower,
          value2: eventData.start.stdev || eventData.start.upper
        });
      }
      await startYearDist.save();
      
      // Create duration distribution
      durationDist = new Distribution({
        type: eventData.duration.type,
        value1: eventData.duration.value || eventData.duration.mean || eventData.duration.lower,
        value2: eventData.duration.stdev || eventData.duration.upper
      });
      await durationDist.save();
      
      let newEvent;
      
      // Create different event types
      switch (eventData.type) {
        case 'income':
          newEvent = new Income({
            name: eventData.name,
            description: '',
            startYear: startYearDist._id,
            duration: durationDist._id,
            amount: eventData.initialAmount,
            change: eventData.changeDistribution.value || eventData.changeDistribution.mean || 0,
            inflation: eventData.inflationAdjusted,
            ss: eventData.socialSecurity
          });
          break;
          
        case 'expense':
          newEvent = new Expense({
            name: eventData.name,
            description: '',
            startYear: startYearDist._id,
            duration: durationDist._id,
            amount: eventData.initialAmount,
            change: eventData.changeDistribution.value || eventData.changeDistribution.mean || 0,
            inflation: eventData.inflationAdjusted,
            discretionary: eventData.discretionary
          });
          break;
          
        case 'invest':
          newEvent = new Invest({
            name: eventData.name,
            description: '',
            startYear: startYearDist._id,
            duration: durationDist._id,
            max: eventData.maxCash || 1000,
            glide: eventData.glidePath || false,
            allocations: [] // Will be populated in second pass
          });
          break;
          
        case 'rebalance':
          newEvent = new Rebalance({
            name: eventData.name,
            description: '',
            startYear: startYearDist._id,
            duration: durationDist._id,
            glide: false,
            allocations: [] // Will be populated in second pass
          });
          break;
      }
      
      if (newEvent) {
        await newEvent.save();
        newScenario.events.push(newEvent._id);
        eventMap[eventData.name] = newEvent;
        
        // Add to appropriate strategies
        if (eventData.type === 'expense' && eventData.discretionary) {
          if (!newScenario.spendingStrategy) newScenario.spendingStrategy = [];
          newScenario.spendingStrategy.push(newEvent._id);
        }
      }
    }
    
    // Second pass - handle linked events and allocations
    for (const eventData of yamlData.eventSeries) {
      const currentEvent = eventMap[eventData.name];
      
      // Link dependent events
      if (eventData.start.type === 'startWith' || eventData.start.type === 'startAfter') {
        const dependentEventName = eventData.start.eventSeries;
        const dependentEvent = eventMap[dependentEventName];
        
        if (dependentEvent) {
          const startYearDist = await Distribution.findById(currentEvent.startYear);
          startYearDist.event = dependentEvent._id;
          await startYearDist.save();
        }
      }
      
      // Handle allocations for invest/rebalance events
      if ((eventData.type === 'invest' || eventData.type === 'rebalance') && 
          (eventData.assetAllocation || eventData.assetAllocation2)) {
        
        // Create allocations
        for (const [investId, percentage] of Object.entries(eventData.assetAllocation)) {
          const investment = investmentMap[investId];
          if (!investment) continue;
          
          let finalPercentage = percentage;
          if (eventData.glidePath && eventData.assetAllocation2) {
            finalPercentage = eventData.assetAllocation2[investId] || percentage;
          }
          
          const newAllocation = new Allocation({
            investment: investment._id,
            percentage: percentage * 100, // Convert from decimal to percentage
            finalPercentage: finalPercentage * 100,
            glide: 0 // Calculated during simulation
          });
          
          await newAllocation.save();
          
          // Add to event
          await mongoose.model(eventData.type).findByIdAndUpdate(
            currentEvent._id,
            { $push: { allocations: newAllocation._id } }
          );
        }
      }
    }
  }
  
  // Process strategies
  if (yamlData.expenseWithdrawalStrategy) {
    newScenario.withdrawalStrategy = yamlData.expenseWithdrawalStrategy.map(id => 
      investmentMap[id] ? investmentMap[id]._id : null
    ).filter(id => id !== null);
  }
  
  if (yamlData.RMDStrategy) {
    newScenario.rmd = yamlData.RMDStrategy.map(id => 
      investmentMap[id] ? investmentMap[id]._id : null
    ).filter(id => id !== null);
  }
  
  if (yamlData.RothConversionStrategy) {
    newScenario.rothStrategy = yamlData.RothConversionStrategy.map(id => 
      investmentMap[id] ? investmentMap[id]._id : null
    ).filter(id => id !== null);
  }
  
  // Set other fields
  newScenario.annualLimit = yamlData.afterTaxContributionLimit || 0;
  newScenario.rothOptimizer = yamlData.RothConversionOpt || false;
  newScenario.rothYears = [yamlData.RothConversionStart || 2050, yamlData.RothConversionEnd || 2060];
  newScenario.financialGoal = yamlData.financialGoal || 0;
  newScenario.state = yamlData.residenceState || '';
  
  // Save the scenario
  await newScenario.save();
  
  // If the user is logged in, add scenario to user's list
  if (user) {
    await mongoose.model('User').findByIdAndUpdate(
      user._id,
      { $push: { scenarios: newScenario._id } }
    );
  }
  
  return newScenario;
}

// Helper function to convert scenario to YAML format
function convertToYamlFormat(scenario) {
  // Implementation goes here based on YAML format spec
  // This would be the reverse of processYamlScenario
  
  // Return YAML compatible object
  return {
    name: scenario.name,
    maritalStatus: scenario.married ? 'couple' : 'individual',
    // ... other fields formatted according to YAML spec
  };
}

// ----------------------------------------------------
// GET /api/scenarios/user/:userId
// Get all scenarios created by a specific user (alternative approach)
// (Only needed if filtering by creator, not scenario access list)
// ----------------------------------------------------
// router.get('/user/:userId', async (req, res) => {
//   try {
//     const scenarios = await Scenario.find({ user: req.params.userId });
//     res.json(scenarios);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });




function hasAccess(userId, scenario) {
  if (!userId || !scenario) return { owner: false, canRead: false, canWrite: false };


  const isOwner = scenario.user?.equals(userId);
  const canRead = scenario.sharedRead?.some(u => u.equals(userId));
  const canWrite = scenario.sharedWrite?.some(u => u.equals(userId));


  return { owner: isOwner, canRead, canWrite };
}


// POST /api/scenarios/:id/share
router.post('/:id/share', async (req, res) => {
  try {
    const { email, access } = req.body;
    console.log("From share route:", email, "and", access);
    const scenarioId = req.params.id;


    if (!['read', 'write'].includes(access)) {
      return res.status(400).json({ error: 'Invalid access type. Use "read" or "write".' });
    }


    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found with provided email.' });
    }


    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found.' });
    }


    // Add to sharedScenarios if not already present
    if (!targetUser.sharedScenarios.includes(scenario._id)) {
      targetUser.sharedScenarios.push(scenario._id);
      await targetUser.save();
    }


    const userIdStr = targetUser._id.toString();
    //const inRead = scenario.sharedRead.map(id => id.toString()).includes(userIdStr);
    //const inWrite = scenario.sharedWrite.map(id => id.toString()).includes(userIdStr);


    // Remove from both if present
    scenario.sharedRead = scenario.sharedRead.filter(id => id.toString() !== userIdStr);
    scenario.sharedWrite = scenario.sharedWrite.filter(id => id.toString() !== userIdStr);


    // Add to the correct array
    if (access === 'read') {
      scenario.sharedRead.push(targetUser._id);
    } else {
      scenario.sharedWrite.push(targetUser._id);
    }


    await scenario.save();


    res.status(200).json({ message: `Scenario shared with ${targetUser.email} as ${access} access.` });


  } catch (err) {
    console.error("Error sharing scenario:", err);
    res.status(500).json({ error: 'Failed to share scenario.' });
  }
});




// ----------------------------------------------------
// POST /api/scenarios
// Create a new scenario (user is optional; if logged in, associate it with the user)
router.post('/', async (req, res) => {
  //console.log('Received new scenario data:', req.body); // Log received data
  try {
    const user = req.user; // This will be set by your auth middleware (Passport, JWT, etc.)


    // Create a new scenario
    const newScenario = new Scenario(req.body);


    // If the user is logged in, associate the scenario with the user
    if (user) {
      newScenario.user = user._id; // Link scenario to logged-in user
      user.scenarios.push(newScenario._id); // Add to the user's scenarios list
      await user.save();
    }


    // Save the scenario to the database
    const savedScenario = await newScenario.save();


    res.status(201).json(savedScenario); // Return the saved scenario
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error creating scenario' });
  }
});


// ----------------------------------------------------
// GET /api/scenarios/:id
// Get a specific scenario by ID (with populated references)
// ----------------------------------------------------
router.get('/unpopulated/:id', async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id)
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json(scenario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
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
        }
      ]
    })
    .populate({
      path: 'spendingStrategy',
      model: 'expense'
    })
    .populate({
      path: 'withdrawalStrategy',
      populate: { path: 'investmentType' }
    })
    .populate({
      path: 'rmd',
      populate: { path: 'investmentType' }
    })
    .populate({
      path: 'rothStrategy',
      populate: { path: 'investmentType' }
    })
    .populate('lifeExpectancyUser')
    .populate('lifeExpectancySpouse')
    .populate('inflation')
    .populate('user') 
    .populate('sharedRead', '_id email username')
    .populate('sharedWrite', '_id email username');


    await Promise.all(
      scenario.events
        .filter(event => event.type === 'invest' || event.type === 'rebalance')
        .map(event =>
          event.populate({
            path: 'allocations',
            populate: {
              path: 'investment',
              populate: {
                path: 'investmentType'
              }
            }
          })
        )
    );


    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json(scenario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ----------------------------------------------------
// PUT /api/scenarios/:id
// Update an existing scenario by ID
// ----------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const updatedScenario = await Scenario.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // This returns the updated document
    );


    if (!updatedScenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }


    res.json({ success: true, updatedScenario });


  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ----------------------------------------------------
// DELETE /api/scenarios/:id
// Delete a scenario by ID
// ----------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const deletedScenario = await Scenario.findByIdAndDelete(req.params.id);
    if (!deletedScenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json({ message: 'Scenario deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/cleanup/anonymous', async (req, res) => {
  try {
    const result = await Scenario.deleteMany({ user: null });
    res.json({ message: `Deleted ${result.deletedCount} anonymous scenario(s).` });
  } catch (err) {
    console.error("Error deleting anonymous scenarios:", err);
    res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// GET /api/scenarios
// Get all scenarios (admin/debugging only; use /users/:id/scenarios in real use)
// ----------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const scenarios = await Scenario.find();
    res.json(scenarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;



