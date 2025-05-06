// import React, { useState } from 'react';

// const DebugConsole = ({ scenario }) => {
//   const [debugOutput, setDebugOutput] = useState('');
  
//   const analyzeScenario = () => {
//     try {
//       const output = [];
      
//       // Basic structure check
//       output.push(`Scenario Name: ${scenario.name || 'Unnamed'}`);
//       output.push(`ID: ${scenario._id || 'No ID'}`);
//       output.push(`Investments: ${scenario.investments?.length || 0}`);
//       output.push(`Investment Types: ${scenario.investmentTypes?.length || 0}`);
//       output.push(`Events: ${scenario.events?.length || 0}`);
      
//       // Check for Cash investment
//       const cashInvestment = scenario.investments?.find(
//         inv => inv.investmentType?.name === 'Cash'
//       );
//       output.push(`Cash Investment: ${cashInvestment ? 'Found' : 'MISSING'}`);
      
//       // Check distributions
//       output.push(`\nLife Expectancy: ${JSON.stringify(scenario.lifeExpectancyUser)}`);
//       output.push(`Inflation: ${JSON.stringify(scenario.inflation)}`);
      
//       // Check events
//       if (scenario.events && scenario.events.length > 0) {
//         output.push('\nEvents:');
//         scenario.events.forEach((event, i) => {
//           output.push(`  ${i+1}. ${event.name || 'Unnamed'} (${event.type})`);
//           output.push(`     Start Year: ${JSON.stringify(event.startYear)}`);
//           output.push(`     Duration: ${JSON.stringify(event.duration)}`);
          
//           if (event.type === 'income' || event.type === 'expense') {
//             output.push(`     Amount: ${event.amount}`);
//           }
          
//           if (event.type === 'invest' || event.type === 'rebalance') {
//             output.push(`     Allocations: ${event.allocations?.length || 0}`);
//           }
//         });
//       }
      
//       setDebugOutput(output.join('\n'));
//     } catch (error) {
//       setDebugOutput(`Error analyzing scenario: ${error.message}`);
//     }
//   };

//   const testSimulation = async () => {
//     try {
//       setDebugOutput('Testing connection to simulation endpoint...');
      
//       // Simple fetch without the full scenario to test API connectivity
//       const response = await fetch('http://localhost:5000/api/simulation/test', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ test: true }),
//       });
      
//       const data = await response.json();
//       setDebugOutput(`Test response: ${JSON.stringify(data, null, 2)}`);
//     } catch (error) {
//       setDebugOutput(`Test error: ${error.message}`);
//     }
//   };
//   return (
    
//         <div style={{ border: '1px solid #ccc', padding: '15px', margin: '15px 0', backgroundColor: '#f8f8f8' }}>
//           <h3>Debug Console</h3>
//           <div>
//             <button 
//               onClick={analyzeScenario} 
//               style={{ 
//                 marginRight: '10px',
//                 padding: '8px 15px',
//                 backgroundColor: '#007bff',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               Analyze Scenario
//             </button>
//             <button 
//               onClick={testSimulation}
//               style={{
//                 padding: '8px 15px',
//                 backgroundColor: '#28a745',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               Test Simulation API
//             </button>
//           </div>
//           <pre style={{ 
//             marginTop: '15px', 
//             padding: '10px', 
//             border: '1px solid #ddd', 
//             backgroundColor: '#fff',
//             maxHeight: '400px',
//             overflow: 'auto',
//             whiteSpace: 'pre-wrap',
//             fontSize: '14px',
//             fontFamily: 'monospace'
//           }}>
//             {debugOutput || 'Click a button above to see debug information'}
//           </pre>
//         </div>
//       );
//     };
    
//     export default DebugConsole;
  















