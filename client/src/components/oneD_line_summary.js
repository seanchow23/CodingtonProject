import React from 'react';
import Plot from 'react-plotly.js';

export default function OneDLineSummaryChart({ paramValues, yValues, label, yAxisTitle, paramLabel = 'Parameter' }) {
  return (
    <div style={{ marginTop: '40px' }}>
      <h4>{label} vs {paramLabel}</h4>
      <Plot
        data={[
          {
            x: paramValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: label,
          },
        ]}
        layout={{
          title: `${label} vs ${paramLabel}`,
          xaxis: { title: paramLabel },
          yaxis: { title: yAxisTitle },
          margin: { t: 40, l: 50, r: 30, b: 50 },
        }}
        style={{ width: '100%', height: '400px' }}
        config={{ responsive: true }}
      />
    </div>
  );
}
