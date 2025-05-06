import React from 'react';
import Plot from 'react-plotly.js';

export default function TwoDSurfacePlot({ xLabels, yLabels, zData, title, zLabel, xLabel = 'Parameter 1', yLabel = 'Parameter 2' }) {
  const fullTitle = `${zLabel} vs ${xLabel} and ${yLabel}`;

  return (
    <div>
    <Plot
      data={[
        {
          type: 'surface',
          x: xLabels,
          y: yLabels,
          z: zData,
          colorscale: 'Viridis',
        },
      ]}
      layout={{
        title: fullTitle,
        scene: {
          xaxis: { title: xLabel },
          yaxis: { title: yLabel },
          zaxis: { title: zLabel },
        },
        margin: { t: 50, l: 0, r: 0, b: 0 },
      }}
      style={{ width: '100%', height: '500px' }}
      config={{ responsive: true }}
    />
    </div>
  );
}

