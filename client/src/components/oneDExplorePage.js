import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OneDExplorePage() {
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
      parameterOptions.push({
        label: `${event.name} (Start Year)`,
        value: `event-${index}-startYear`,
      });
    }
    if (event.duration !== undefined) {
      parameterOptions.push({
        label: `${event.name} (Duration)`,
        value: `event-${index}-duration`,
      });
    }
    if (
      (event.type === 'income' || event.type === 'expense') &&
      typeof event.amount === 'number'
    ) {
      parameterOptions.push({
        label: `${event.name} (Amount)`,
        value: `event-${index}-amount`,
      });
    }
    if (event.type === 'invest' && event.assetAllocation?.length === 2) {
      parameterOptions.push({
        label: `${event.name} (Investment 1 % of 2)`,
        value: `event-${index}-allocation`,
      });
    }
  });
  parameterOptions.push({
    label: `Enable Roth Optimizer`,
    value: `rothOptimizer`,
  });

  if (parameterOptions.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>No editable parameters found in this scenario.</h2>
      </div>
    );
  }

  const [paramType, setParamType] = useState(parameterOptions[0].value);
  const [lower, setLower] = useState(0);
  const [upper, setUpper] = useState(0);
  const [step, setStep] = useState(1);

  const applyParameterChange = (scenario, key, val) => {
    const [_, indexStr, field] = key.split('-');
    const index = parseInt(indexStr);
    const event = scenario.events[index];
    if (!event && key !== 'rothOptimizer') return;

    if (key === 'rothOptimizer') {
      scenario.rothOptimizer = val === 1 || val === true;
    } else if (field === 'startYear') {
      event.startYear = { type: 'fixed', value1: val };
    } else if (field === 'duration') {
      event.duration = { type: 'fixed', value1: val };
    } else if (field === 'amount') {
      event.amount = val;
    } else if (field === 'allocation') {
      if (event.assetAllocation?.length === 2) {
        event.assetAllocation[0].percentage = val;
        event.assetAllocation[1].percentage = 100 - val;
      }
    }
  };

  const handleApply = () => {
    const scenarios = [];
    const values = [];

    if (paramType === 'rothOptimizer') {
      const updated = structuredClone(originalScenario);
      applyParameterChange(updated, paramType, lower);  // lower is 0 or 1
      scenarios.push(updated);
      values.push(lower);
    } else {
      for (let val = lower; val <= upper; val += step) {
        const updated = structuredClone(originalScenario);
        applyParameterChange(updated, paramType, val);
        scenarios.push(updated);
        values.push(val);
      }
    }
    const selectedLabel = parameterOptions.find(opt => opt.value === paramType)?.label || paramType;

    navigate(`/simulation/${originalScenario._id}`, {
      state: {
        scenario: originalScenario,
        oneDResults: scenarios,
        oneDParam: {
          key: paramType,
          keyLabel: selectedLabel,
          values
        }
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Explore a Scenario Parameter (1D)</h2>

      <label>Parameter to change:</label>
      <select
        value={paramType}
        onChange={(e) => setParamType(e.target.value)}
        style={{ display: 'block', margin: '10px 0' }}
      >
        {parameterOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {paramType === 'rothOptimizer' ? (
        <>
          <label>Choose Value:</label>
          <select
            value={lower}
            onChange={(e) => setLower(parseInt(e.target.value))}
            style={{ display: 'block', margin: '10px 0' }}
          >
            <option value={1}>Enabled</option>
            <option value={0}>Disabled</option>
          </select>
        </>
      ) : (
        <>
          <label>Lower Bound:</label>
          <input
            type="number"
            value={lower}
            onChange={(e) => setLower(parseFloat(e.target.value))}
            style={{ width: '100px', marginBottom: '10px' }}
          />
          <label>Upper Bound:</label>
          <input
            type="number"
            value={upper}
            onChange={(e) => setUpper(parseFloat(e.target.value))}
            style={{ width: '100px', marginBottom: '10px' }}
          />
          <label>Step Size:</label>
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(parseFloat(e.target.value))}
            style={{ width: '100px', marginBottom: '10px' }}
          />
        </>
      )}

      <button onClick={handleApply} style={{ marginTop: '20px' }}>
        Run One-Dimensional Exploration
      </button>
    </div>
  );
}
