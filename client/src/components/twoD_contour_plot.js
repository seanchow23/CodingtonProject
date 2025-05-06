import React from 'react';
import Plot from 'react-plotly.js';

export default function TwoDContourPlot({ xLabels, yLabels, zData, title, zLabel, xLabel = 'Parameter 1', yLabel = 'Parameter 2' }) {
  const fullTitle = `${zLabel} vs ${xLabel} and ${yLabel}`;

  return (
    <div>
    <Plot
      data={[
        {
          type: 'contour',
          x: xLabels,
          y: yLabels,
          z: zData,
          colorscale: 'Viridis',
          contours: { coloring: 'heatmap' },
          colorbar: { title: zLabel },
        },
      ]}
      layout={{
        title: fullTitle,
        xaxis: { title: xLabel },
        yaxis: { title: yLabel },
        margin: { t: 50, l: 50, r: 50, b: 50 },
      }}
      style={{ width: '100%', height: '500px' }}
      config={{ responsive: true }}
    />
    </div>
  );
}
