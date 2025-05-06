import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function TwoDExplorePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const originalScenario = location.state?.scenario
    ? structuredClone(location.state.scenario)
    : null;

  if (!originalScenario) {
    return <div style={{ padding: '20px' }}>Error: No scenario data received.</div>;
  }

  const parameterOptions = [];
  originalScenario.events.forEach((event, index) => {
    if (event.startYear !== undefined) {
      parameterOptions.push({ label: `${event.name} (Start Year)`, value: `event-${index}-startYear` });
    }
    if (event.duration !== undefined) {
      parameterOptions.push({ label: `${event.name} (Duration)`, value: `event-${index}-duration` });
    }
    if ((event.type === 'income' || event.type === 'expense') && typeof event.amount === 'number') {
      parameterOptions.push({ label: `${event.name} (Amount)`, value: `event-${index}-amount` });
    }
    if (event.type === 'invest' && event.assetAllocation?.length === 2) {
      parameterOptions.push({ label: `${event.name} (Investment 1 % of 2)`, value: `event-${index}-allocation` });
    }
  });

  const [paramX, setParamX] = useState(parameterOptions[0].value);
  const [paramY, setParamY] = useState(parameterOptions[1]?.value || parameterOptions[0].value);

  const [xRange, setXRange] = useState({ min: 0, max: 0, step: 1 });
  const [yRange, setYRange] = useState({ min: 0, max: 0, step: 1 });

  const applyChange = (scenario, key, val) => {
    const [_, indexStr, field] = key.split('-');
    const index = parseInt(indexStr);
    const event = scenario.events[index];
    if (!event) return;

    if (field === 'startYear') event.startYear = { type: 'fixed', value1: val };
    else if (field === 'duration') event.duration = { type: 'fixed', value1: val };
    else if (field === 'amount') event.amount = val;
    else if (field === 'allocation' && event.assetAllocation?.length === 2) {
      event.assetAllocation[0].percentage = val;
      event.assetAllocation[1].percentage = 100 - val;
    }
  };

  const handleRun = () => {
    const xVals = [];
    for (let x = xRange.min; x <= xRange.max; x += xRange.step) xVals.push(x);
    const yVals = [];
    for (let y = yRange.min; y <= yRange.max; y += yRange.step) yVals.push(y);

    const scenarios2D = xVals.map(xv =>
      yVals.map(yv => {
        const scenarioCopy = structuredClone(originalScenario);
        applyChange(scenarioCopy, paramX, xv);
        applyChange(scenarioCopy, paramY, yv);
        return scenarioCopy;
      })
    );

    navigate(`/simulation/${originalScenario._id}`, {
      state: {
        scenario: originalScenario,
        twoDResults: scenarios2D,
        twoDParams: {
          param1: {
            key: paramX,
            values: xVals,
            keyLabel: parameterOptions.find(opt => opt.value === paramX)?.label || paramX
          },
          param2: {
            key: paramY,
            values: yVals,
            keyLabel: parameterOptions.find(opt => opt.value === paramY)?.label || paramY
          }
        }
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Two-Dimensional Parameter Exploration</h2>

      <div style={{ marginBottom: '15px' }}>
        <label><strong>X-Axis Parameter:</strong></label>
        <select value={paramX} onChange={e => setParamX(e.target.value)}>
          {parameterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label><strong>X Range:</strong></label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label>Lower Bound</label><br />
            <input type="number" value={xRange.min} onChange={e => setXRange({ ...xRange, min: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label>Upper Bound</label><br />
            <input type="number" value={xRange.max} onChange={e => setXRange({ ...xRange, max: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label>Step Size</label><br />
            <input type="number" value={xRange.step} onChange={e => setXRange({ ...xRange, step: parseFloat(e.target.value) })} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label><strong>Y-Axis Parameter:</strong></label>
        <select value={paramY} onChange={e => setParamY(e.target.value)}>
          {parameterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label><strong>Y Range:</strong></label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label>Lower Bound</label><br />
            <input type="number" value={yRange.min} onChange={e => setYRange({ ...yRange, min: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label>Upper Bound</label><br />
            <input type="number" value={yRange.max} onChange={e => setYRange({ ...yRange, max: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label>Step Size</label><br />
            <input type="number" value={yRange.step} onChange={e => setYRange({ ...yRange, step: parseFloat(e.target.value) })} />
          </div>
        </div>
      </div>

      <button onClick={handleRun} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Run Two-Dimensional Exploration
      </button>
    </div>
  );
}
