
// import React from 'react';
// import Plot from 'react-plotly.js';

// function generateSimulations({ numSimulations = 30, numYears = 10 }) {
//   const investmentTypes = ['401(k)', 'Roth IRA', 'Brokerage'];
//   const incomeTypes = ['Salary', 'Freelance', 'Rental'];
//   const expenseTypes = ['Housing', 'Food', 'Entertainment', 'Transport', 'Tax'];

//   const simulations = [];

//   for (let s = 0; s < numSimulations; s++) {
//     const sim = [];

//     for (let y = 0; y < numYears; y++) {
//       const investments = investmentTypes.map(name => ({
//         name,
//         value: Math.round(5000 + Math.random() * 20000),
//       }));

//       const income = incomeTypes.map(name => ({
//         name,
//         amount: Math.round(10000 + Math.random() * 20000),
//       }));

//       const expenses = expenseTypes.map(name => ({
//         name,
//         amount: Math.round(
//           name === 'Tax' ? 3000 + Math.random() * 2000 : 2000 + Math.random() * 8000
//         ),
//       }));

//       sim.push({ investments, income, expenses });
//     }

//     simulations.push(sim);
//   }

//   return { simulations, investmentTypes, incomeTypes, expenseTypes };
// }

// function buildAveragedSeries(simulations, categoryKey, valueKey, labelKey, years) {
//   const totalsByType = {};

//   simulations.forEach(sim => {
//     sim.forEach((yearData, yearIndex) => {
//       yearData[categoryKey].forEach(item => {
//         const name = item[labelKey];
//         if (!totalsByType[name]) {
//           totalsByType[name] = Array(years.length).fill(0);
//         }
//         totalsByType[name][yearIndex] += item[valueKey];
//       });
//     });
//   });

//   const averagesByType = {};
//   for (const [name, totals] of Object.entries(totalsByType)) {
//     averagesByType[name] = totals.map(total => total / simulations.length);
//   }

//   return averagesByType;
// }

// export default function FullStackedFinanceChart() {
//   const startYear = 2025;
//   const numYears = 10;
//   const years = Array.from({ length: numYears }, (_, i) => startYear + i);

//   const { simulations } = generateSimulations({ numSimulations: 50, numYears });

//   // Collect all categories
//   const investments = buildAveragedSeries(simulations, 'investments', 'value', 'name', years);
//   const income = buildAveragedSeries(simulations, 'income', 'amount', 'name', years);
//   const expenses = buildAveragedSeries(simulations, 'expenses', 'amount', 'name', years);

//   // Merge into a single array of traces
//   const traces = [
//     ...Object.entries(investments).map(([name, y]) => ({
//       x: years,
//       y,
//       name: `Investment: ${name}`,
//       type: 'bar',
//       marker: { color: '#8884d8' },
//     })),
//     ...Object.entries(income).map(([name, y]) => ({
//       x: years,
//       y,
//       name: `Income: ${name}`,
//       type: 'bar',
//       marker: { color: '#82ca9d' },
//     })),
//     ...Object.entries(expenses).map(([name, y]) => ({
//       x: years,
//       y,
//       name: name === 'Tax' ? 'Tax' : `Expense: ${name}`,
//       type: 'bar',
//       marker: { color: name === 'Tax' ? '#c0392b' : '#ff7f50' },
//     })),
//   ];

//   return (
//     <Plot
//       data={traces}
//       layout={{
//         barmode: 'stack',
//         title: 'Total Financial Breakdown by Year (Investments, Income, Expenses)',
//         xaxis: { title: 'Year' },
//         yaxis: { title: 'Amount ($)' },
//         legend: { orientation: 'v' },
//         margin: { t: 40, b: 50, l: 60, r: 30 },
//       }}
//       useResizeHandler
//       style={{ width: '100%', height: '600px' }}
//       config={{ responsive: true }}
//     />
//   );
// }

import React from 'react';
import Plot from 'react-plotly.js';

function generateSimulations({ numSimulations = 30, numYears = 10 }) {
  const investmentTypes = ['401(k)', 'Roth IRA', 'Brokerage'];
  const incomeTypes = ['Salary', 'Freelance', 'Rental'];
  const expenseTypes = ['Housing', 'Food', 'Entertainment', 'Transport', 'Tax'];

  const simulations = [];

  for (let s = 0; s < numSimulations; s++) {
    const sim = [];

    for (let y = 0; y < numYears; y++) {
      const investments = investmentTypes.map(name => ({
        name,
        value: Math.round(5000 + Math.random() * 20000),
      }));

      const income = incomeTypes.map(name => ({
        name,
        amount: Math.round(10000 + Math.random() * 20000),
      }));

      const expenses = expenseTypes.map(name => ({
        name,
        amount: Math.round(
          name === 'Tax' ? 3000 + Math.random() * 2000 : 2000 + Math.random() * 8000
        ),
      }));

      sim.push({ investments, income, expenses });
    }

    simulations.push(sim);
  }

  return { simulations };
}

function buildAveragedSeries(simulations, categoryKey, valueKey, labelKey, years) {
  const totalsByType = {};

  simulations.forEach(sim => {
    sim.forEach((yearData, yearIndex) => {
      yearData[categoryKey].forEach(item => {
        const name = item[labelKey];
        if (!totalsByType[name]) {
          totalsByType[name] = Array(years.length).fill(0);
        }
        totalsByType[name][yearIndex] += item[valueKey];
      });
    });
  });

  const averagesByType = {};
  for (const [name, totals] of Object.entries(totalsByType)) {
    averagesByType[name] = totals.map(total => total / simulations.length);
  }

  return averagesByType;
}

export default function UnifiedStackedFinanceChart() {
  const startYear = 2025;
  const numYears = 10;
  const years = Array.from({ length: numYears }, (_, i) => startYear + i);

  const { simulations } = generateSimulations({ numSimulations: 50, numYears });

  // Get all individual named components, averaged
  const investments = buildAveragedSeries(simulations, 'investments', 'value', 'name', years);
  const income = buildAveragedSeries(simulations, 'income', 'amount', 'name', years);
  const expenses = buildAveragedSeries(simulations, 'expenses', 'amount', 'name', years);

  // Merge everything into one flat list of traces
  const traces = [
    ...Object.entries(investments),
    ...Object.entries(income),
    ...Object.entries(expenses),
  ].map(([name, values]) => ({
    x: years,
    y: values,
    name,
    type: 'bar',
  }));

  return (
    <Plot
      data={traces}
      layout={{
        barmode: 'stack',
        title: 'Total Financial Category Breakdown by Year',
        xaxis: { title: 'Year' },
        yaxis: { title: 'Amount ($)' },
        legend: { orientation: 'v' },
        margin: { t: 40, b: 50, l: 60, r: 30 },
      }}
      useResizeHandler
      style={{ width: '100%', height: '600px' }}
      config={{ responsive: true }}
    />
  );
}

