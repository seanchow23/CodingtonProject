import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';

export default function Line_Chart({ data }) {
  const startYear = 2025;
  const simulations = data;

  const numYears = simulations[0].length;
  const years = Array.from({ length: numYears }, (_, i) => startYear + i);

  // Calculate probability of success per year
  const probabilities = years.map((_, i) => {
    const successes = simulations.filter(sim => sim[i]).length;
    return (successes / simulations.length) * 100; // % value
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
      style={{ width: '100%', height: '400px' }}
      config={{ responsive: true }}
    />
  );
}
