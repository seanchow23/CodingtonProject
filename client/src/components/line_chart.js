import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';

export default function Line_Chart({ data }) {
  const startYear = 2025;
  const simulations = data;

  const maxYears = Math.max(...simulations.map(sim => sim.length));
  const years = Array.from({ length: maxYears }, (_, i) => startYear + i);

  // Calculate probability of success per year
  const probabilities = years.map((_, i) => {
    const alive = simulations.filter(sim => sim.length > i);
    const successes = alive.filter(sim => sim[i] === true).length;
    return alive.length > 0 ? (successes / alive.length) * 100 : null;
  });

  return (
    <Plot
      data={[
        {
          x: years,
          y: probabilities,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Probability of Success',
          line: { color: '#8884d8', width: 3 },
          marker: { size: 6 },
          hovertemplate: '%{x}: %{y:.1f}%',
        },
      ]}
      layout={{
        title: 'Probability of Success Over Time',
        xaxis: { title: 'Year' },
        yaxis: {
          title: 'Probability of Success (%)',
          range: [0, 100],
        },
        margin: { t: 40, l: 50, r: 30, b: 50 },
        autosize: true,
      }}
      useResizeHandler
      data-testid="plotly-chart"  //  Add this line
      style={{ width: '100%', height: '400px' }}
      config={{ responsive: true }}
    />
  );
}
