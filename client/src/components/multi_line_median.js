import React from 'react';
import Plot from 'react-plotly.js';

export default function MultiLineMedianInvestmentChart({ investmentRuns, paramValues }) {
  const startYear = 2025;
  console.log(investmentRuns);
  const numYears = Math.max(...investmentRuns.map(run =>
    Math.max(...run.map(sim => sim.length))
  ));
  const years = Array.from({ length: numYears }, (_, i) => startYear + i);

  const traces = investmentRuns.map((simulations, i) => {
    const medians = years.map((_, yearIndex) => {
      const valuesAtYear = simulations
        .map(sim => sim[yearIndex])
        .filter(v => v !== undefined);
      if (valuesAtYear.length === 0) return null;
      const sorted = [...valuesAtYear].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    });

    return {
      x: years,
      y: medians,
      type: 'scatter',
      mode: 'lines+markers',
      name: `Param = ${paramValues[i]}`
    };
  });

  return (
    <Plot
      data={traces}
      layout={{
        title: 'Median Total Investment vs. Time',
        xaxis: { title: 'Year' },
        yaxis: { title: 'Median Investment ($)' },
        margin: { t: 40, l: 60, r: 30, b: 50 },
      }}
      style={{ width: '100%', height: '400px' }}
      config={{ responsive: true }}
    />
  );
}
