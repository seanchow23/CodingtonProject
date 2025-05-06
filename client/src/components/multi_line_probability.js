import React from 'react';
import Plot from 'react-plotly.js';

export default function MultiLineProbabilityChart({ simulationsList = [], parameterValues = [], paramLabel }) {
  const startYear = 2025;

  if (!Array.isArray(simulationsList) || simulationsList.length === 0) {
    return <div>No simulation results available for multi-line chart.</div>;
  }

  const numYears = Math.max(
    ...simulationsList.map(simulations =>
      simulations[0] ? simulations[0].length : 0
    )
  );
  const years = Array.from({ length: numYears }, (_, i) => startYear + i);

  const traces = simulationsList.map((simulations, i) => {
    const probabilitiesPerYear = years.map((_, yearIndex) => {
      const activeSimulations = simulations.filter(sim => sim.length > yearIndex);
      const successCount = activeSimulations.filter(sim => sim[yearIndex]).length;
      return activeSimulations.length > 0
        ? (successCount / activeSimulations.length) * 100
        : null;
    });

    return {
      x: years,
      y: probabilitiesPerYear,
      type: 'scatter',
      mode: 'lines+markers',
      name: `${paramLabel} = ${parameterValues[i]}`,
    };
  });

  return (
    <div style={{ marginTop: '40px' }}>
      <h4>Probability of Success Over Time (1D Exploration)</h4>
      <Plot
        data={traces}
        layout={{
          xaxis: { title: 'Year' },
          yaxis: { title: 'Probability of Success (%)', range: [0, 100] },
          margin: { t: 40, l: 50, r: 30, b: 50 },
        }}
        style={{ width: '100%', height: '450px' }}
        config={{ responsive: true }}
      />
    </div>
  );
}
