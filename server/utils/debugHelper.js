// server/utils/debugHelper.js

const fs = require('fs');
const path = require('path');

/**
 * Logs a scenario object to a JSON file for debugging purposes
 * @param {Object} scenario - The scenario object to log
 * @param {string} label - A label to use in the filename (default: 'scenario')
 * @returns {boolean} - True if logging was successful, false otherwise
 */
function logScenario(scenario, label = 'scenario') {
  try {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Create a log file with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logFile = path.join(logsDir, `${label}_${timestamp}.json`);
    
    // Write the scenario to a log file with pretty formatting
    fs.writeFileSync(
      logFile, 
      JSON.stringify(scenario, null, 2)
    );
    
    console.log(`Scenario logged to ${logFile}`);
    return true;
  } catch (error) {
    console.error('Error logging scenario:', error);
    return false;
  }
}

/**
 * Logs error details for debugging purposes
 * @param {Error} error - The error object to log
 * @param {string} context - Additional context information
 * @returns {boolean} - True if logging was successful, false otherwise
 */
function logError(error, context = '') {
  try {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Create a log file with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logFile = path.join(logsDir, `error_${timestamp}.json`);
    
    // Extract important details from the error
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
      // Add any other useful properties
      ...(error.response ? { response: error.response.data } : {}),
      ...(error.request ? { request: 'Request made but no response received' } : {}),
      ...(error.config ? { config: error.config } : {})
    };
    
    // Write the error details to a log file
    fs.writeFileSync(
      logFile, 
      JSON.stringify(errorDetails, null, 2)
    );
    
    console.log(`Error logged to ${logFile}`);
    return true;
  } catch (err) {
    console.error('Error logging error details:', err);
    return false;
  }
}

/**
 * Compare two scenario objects and log the differences
 * @param {Object} scenario1 - First scenario to compare
 * @param {Object} scenario2 - Second scenario to compare
 * @param {string} label - A label for the comparison (default: 'comparison')
 * @returns {boolean} - True if comparison was successful, false otherwise
 */
function compareScenarios(scenario1, scenario2, label = 'comparison') {
  try {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Create a log file with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logFile = path.join(logsDir, `${label}_${timestamp}.json`);
    
    // Find differences between scenarios
    const differences = findDifferences(scenario1, scenario2);
    
    // Write the differences to a log file
    fs.writeFileSync(
      logFile, 
      JSON.stringify({
        scenario1_id: scenario1._id,
        scenario2_id: scenario2._id,
        differences
      }, null, 2)
    );
    
    console.log(`Scenario comparison logged to ${logFile}`);
    return true;
  } catch (error) {
    console.error('Error comparing scenarios:', error);
    return false;
  }
}

/**
 * Helper function to find differences between two objects
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {Object} - Object containing differences
 */
function findDifferences(obj1, obj2, path = '') {
  const differences = {};
  
  // Check properties in obj1
  for (const key in obj1) {
    const currentPath = path ? `${path}.${key}` : key;
    
    // Skip functions and internal MongoDB properties
    if (typeof obj1[key] === 'function' || key.startsWith('$') || key === '__v') {
      continue;
    }
    
    if (!(key in obj2)) {
      differences[currentPath] = {
        type: 'missing_in_obj2',
        value1: obj1[key]
      };
      continue;
    }
    
    // Compare values
    if (typeof obj1[key] === 'object' && obj1[key] !== null && 
        typeof obj2[key] === 'object' && obj2[key] !== null) {
      // Handle arrays
      if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        if (obj1[key].length !== obj2[key].length) {
          differences[currentPath] = {
            type: 'array_length_mismatch',
            length1: obj1[key].length,
            length2: obj2[key].length
          };
        }
        
        // For small arrays, check each item
        if (obj1[key].length <= 10 && obj2[key].length <= 10) {
          for (let i = 0; i < Math.max(obj1[key].length, obj2[key].length); i++) {
            if (i >= obj1[key].length || i >= obj2[key].length) continue;
            
            const nestedDiffs = findDifferences(obj1[key][i], obj2[key][i], `${currentPath}[${i}]`);
            Object.assign(differences, nestedDiffs);
          }
        }
      } else {
        // Recursively compare nested objects
        const nestedDiffs = findDifferences(obj1[key], obj2[key], currentPath);
        Object.assign(differences, nestedDiffs);
      }
    } else if (obj1[key] !== obj2[key]) {
      differences[currentPath] = {
        type: 'value_mismatch',
        value1: obj1[key],
        value2: obj2[key]
      };
    }
  }
  
  // Check for properties in obj2 that aren't in obj1
  for (const key in obj2) {
    const currentPath = path ? `${path}.${key}` : key;
    
    // Skip functions and internal MongoDB properties
    if (typeof obj2[key] === 'function' || key.startsWith('$') || key === '__v') {
      continue;
    }
    
    if (!(key in obj1)) {
      differences[currentPath] = {
        type: 'missing_in_obj1',
        value2: obj2[key]
      };
    }
  }
  
  return differences;
}

module.exports = {
  logScenario,
  logError,
  compareScenarios
};