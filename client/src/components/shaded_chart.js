import React from 'react';
import Plot from 'react-plotly.js';
/*
//simulate financial data
function generateSimulations({ numSimulations = 50, numYears = 20, startValue = 200000 }) {
    const simulations = [];

    for (let i = 0; i < numSimulations; i++) {
        let value = startValue;
        const sim = [];
        for (let j = 0; j < numYears; j++) {
            const change = 1 + (Math.random() - 0.5) * 0.2; // ±10%
            value *= change;
            sim.push(+value.toFixed(2));
        }
        simulations.push(sim);
        }
        return simulations;
    }*/

function getPercentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export default function Shaded_Chart({ data }) {
  const startYear = 2025;
  const numYears = 20;
  const labels = Array.from({ length: numYears }, (_, i) => startYear + i);
  const simulations = data;

  // Get percentile bands
  const getBand = (p) => labels.map((_, i) =>
    getPercentile(simulations.map(s => s[i]), p)
  );

  const p10 = getBand(10);
  const p20 = getBand(20);
  const p30 = getBand(30);
  const p40 = getBand(40);
  const p50 = getBand(50); // median
  const p60 = getBand(60);
  const p70 = getBand(70);
  const p80 = getBand(80);
  const p90 = getBand(90);

  return (
    <Plot
      data={[
        // P10 base
        {
          x: labels,
          y: p10,
          mode: 'lines',
          line: { color: 'rgba(0,0,0,0)' }, // transparent line
          showlegend: false,
          hoverinfo: 'skip',
        },
        // P10–P90
        {
          x: labels,
          y: p90,
          fill: 'tonexty',
          mode: 'lines',
          line: { color: 'rgba(136, 132, 216, 0.1)' },
          name: '10–90%',
        },

        // P20 base
        {
          x: labels,
          y: p20,
          mode: 'lines',
          line: { color: 'rgba(0,0,0,0)' },
          showlegend: false,
          hoverinfo: 'skip',
        },
        // P20–P80
        {
          x: labels,
          y: p80,
          fill: 'tonexty',
          mode: 'lines',
          line: { color: 'rgba(136, 132, 216, 0.2)' },
          name: '20–80%',
        },

        // P30 base
        {
          x: labels,
          y: p30,
          mode: 'lines',
          line: { color: 'rgba(0,0,0,0)' },
          showlegend: false,
          hoverinfo: 'skip',
        },
        // P30–P70
        {
          x: labels,
          y: p70,
          fill: 'tonexty',
          mode: 'lines',
          line: { color: 'rgba(136, 132, 216, 0.3)' },
          name: '30–70%',
        },

        // P40 base
        {
          x: labels,
          y: p40,
          mode: 'lines',
          line: { color: 'rgba(0,0,0,0)' },
          showlegend: false,
          hoverinfo: 'skip',
        },
        // P40–P60
        {
          x: labels,
          y: p60,
          fill: 'tonexty',
          mode: 'lines',
          line: { color: 'rgba(136, 132, 216, 0.4)' },
          name: '40–60%',
        },

        // Median
        {
          x: labels,
          y: p50,
          mode: 'lines',
          line: { color: 'red', width: 3 },
          name: 'Median',
        },
      ]}
      layout={{
        title: 'Shaded Percentile Bands',
        xaxis: { title: 'Year' },
        yaxis: { title: 'Total Investments' },
        showlegend: true,
        legend: { orientation: 'h' },
        margin: { t: 40, l: 50, r: 30, b: 50 },
        autosize: true,
      }}
      useResizeHandler
      style={{ width: '100%', height: '500px' }}
      config={{ responsive: true }}
    />
  );
}
