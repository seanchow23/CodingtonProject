// import React from 'react';
// import Plot from 'react-plotly.js';

/*function generateSimulations({ numSimulations = 30, numYears = 10 }) {
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
  console.log(simulations)
  return { simulations };
}*/

import React from 'react';
import Plot from 'react-plotly.js';

export default function UnifiedStackedFinanceChart({ data }) {
  const startYear = 2025;
  const numYears = 10;
  const years = Array.from({ length: numYears }, (_, i) => startYear + i);

  // Helper to compute averages per year per event name
  function averageByEventName(simulations, categoryIndex, valueExtractor) {
    const results = {};
    const counts = {};

    for (const simulation of simulations) {
      const categoryData = simulation[categoryIndex];
      if (!categoryData) continue;

      for (let yearIndex = 0; yearIndex < numYears; yearIndex++) {
        const events = categoryData[yearIndex] || [];

        for (const event of events) {
          if (typeof event.duration === 'number' && event.duration === 0) continue;

          const name = valueExtractor.name(event);
          const value = valueExtractor.value(event);

          if (!results[name]) {
            results[name] = Array(numYears).fill(0);
            counts[name] = Array(numYears).fill(0);
          }

          results[name][yearIndex] += value;
          counts[name][yearIndex] += 1;
        }
      }
    }

    // Final averaging step
    for (const name in results) {
      for (let i = 0; i < numYears; i++) {
        results[name][i] = counts[name][i] > 0 ? results[name][i] / counts[name][i] : 0;
      }
    }

    return results;
  }

  // Compute each category
  const incomeData = averageByEventName(data, 0, {
    name: (e) => e.name,
    value: (e) => e.amount || 0,
  });

  const expenseData = averageByEventName(data, 1, {
    name: (e) => e.name,
    value: (e) => e.amount || 0,
  });

  const investmentData = averageByEventName(data, 2, {
    name: (e) => e.investmentType?.name || 'Unknown Investment',
    value: (e) => e.value || 0,
  });

  // Build all chart traces
  const traces = [
    ...Object.entries(incomeData),
    ...Object.entries(expenseData),
    ...Object.entries(investmentData),
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
