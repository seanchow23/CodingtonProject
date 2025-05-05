import React, { useState, useEffect } from 'react';
import simulation from './simulation';

/**
 * TestSimulation component
 * Fetches tax data, runs the simulation, and displays the output
 * 
 * Props:
 *   - scenario: your scenario object (must match the shape expected by simulation)
 */
export default function test({ scenario }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function runSim() {
      try {
        const output = await simulation({ scenario });
        if (!cancelled) {
          setResult(output);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      }
    }

    runSim();
    return () => {
      cancelled = true;
    };
  }, [scenario]);

  if (error) {
    return <div>Error running simulation: {error.message}</div>;
  }
  if (!result) {
    return <div>Running simulation...</div>;
  }

  return (
    <div>
      <h2>Simulation Output</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
