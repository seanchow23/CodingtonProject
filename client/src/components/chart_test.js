import React from "react"
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, Label,AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
  } from 'recharts';
  
  const data = [
    { name: 'Jan', uv: 400, pv: 240, amt: 240 },
    { name: 'Feb', uv: 300, pv: 139, amt: 221 },
    { name: 'Mar', uv: 200, pv: 980, amt: 229 },
  ];

  const simulations = [
    [true, true, false, true, true],   // simulation 1
    [true, false, false, true, false], // simulation 2
    [true, true, true, true, true],    // simulation 3
    [false, true, true, false, true],  // simulation 4
    [true, true, false, false, true],  // simulation 5
  ];

export default function ChartTest() {
  // Line Chart

const startYear = 2025;
const numYears = simulations[0].length;
const probabilityData = Array.from({ length: numYears }, (_, i) => {
  const successCount = simulations.filter(sim => sim[i]).length;
  return {
    year: startYear + i,
    probability: successCount / simulations.length
  };
});

  return(
    <div>
  {/* <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <CartesianGrid stroke="#eee" />
      <Line type="monotone" dataKey="uv" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
   */}
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={probabilityData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="year">
        <Label value="Year" offset={-5} position="insideBottom" />
    </XAxis>
    <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} >
        <Label value="Probability of Success" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
    </YAxis>
    <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
    <Line type="monotone" dataKey="probability" stroke="#8884d8" strokeWidth={2} dot />
  </LineChart>
</ResponsiveContainer>

  Area Chart (Shaded Line)
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
    </AreaChart>
  </ResponsiveContainer>
  
  Stacked Bar Chart
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="pv" stackId="a" fill="#8884d8" />
      <Bar dataKey="uv" stackId="a" fill="#82ca9d" />
    </BarChart>
  </ResponsiveContainer>
  </div>
  );
}