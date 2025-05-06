import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Line_Chart from './line_chart';
import Shaded_Chart from './shaded_chart';
import UnifiedStackedFinanceChart from './stacked_chart'; 
import ScenarioList from './scenario_list';
import InputField from "./input_field";
import MultiLineProbabilityChart from './multi_line_probability';
import MultiLineMedianInvestmentChart from './multi_line_median';
import { runSimulation } from '../api/simulationApi';

export default function SimulationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    scenario: originalScenario,
    oneDResults,
    oneDParam
  } = location.state || {};

  const [formData, setFormData] = useState({
    num: 10,
    totalInvestment: false,
    totalIncome: false,
    totalExpenseTax: false,
    earlyWithdrawlTax: false,
    discretionaryExpenses: false,
    median: false
  });
  
  const [message, setMessage] = useState("");
  
  function simulateProbabilityEdited(scenarios) {
    return scenarios.map((scenario) => {
      const runs = [];
      for (let i = 0; i < formData.num; i++) {
        runs.push(simulation({ scenario: structuredClone(scenario) })[0]); // probability array
      }
      return runs;
    });
  }

  function simulateInvestmentSeries(scenarios) {
    return scenarios.map((scenario) => {
      const series = [];
      for (let i = 0; i < formData.num; i++) {
        const sim = simulation({ scenario: structuredClone(scenario) });
        series.push(sim[1][0]);  // assuming [1][0] = total investments per year
      }
      return series;
    });
  }

  const [hasRun, setHasRun] = useState(false); // ✅ moved up here
  const [baseScenario] = useState(() => structuredClone(originalScenario)); // locked base
  const [editedScenarios, setEditedScenarios] = useState([]);
  const [multiLineProbData, setMultiLineProbData] = useState([]);
  const [multiLineInvestData, setMultiLineInvestData] = useState([]);

  const [line, setLine] = useState([]);
  const [shade1, setShade1] = useState([]);
  const [shade2, setShade2] = useState([]);
  const [shade3, setShade3] = useState([]);
  const [shade4, setShade4] = useState([]);
  const [shade5, setShade5] = useState([]);
  const [bar, setBar] = useState([]);

  useEffect(() => {
    if (oneDResults) {
      setEditedScenarios(oneDResults.map(s => structuredClone(s)));
    }
  }, [oneDResults]);

  useEffect(() => {
    if (hasRun && oneDResults && oneDParam) {
      simulateProbabilityEdited(oneDResults).then(setMultiLineProbData);
      simulateInvestmentSeries(oneDResults).then(setMultiLineInvestData);
    }
  }, [hasRun, oneDResults, oneDParam, formData.num]);

  async function simulateProbabilityEdited(scenarios) {
    const allResults = await Promise.all(
      scenarios.map(async (scenario) => {
        const runs = [];
        for (let i = 0; i < formData.num; i++) {
          runs.push(runSimulation(structuredClone(scenario)));
        }
        const results = await Promise.all(runs);
        return results.map((r) => r[0]); // true/false arrays
      })
    );
    return allResults;
  }

  async function simulateInvestmentSeries(scenarios) {
    const allResults = await Promise.all(
      scenarios.map(async (scenario) => {
        const runs = [];
        for (let i = 0; i < formData.num; i++) {
          runs.push(runSimulation(structuredClone(scenario)));
        }
        const results = await Promise.all(runs);
        return results.map((r) => r[1][0]); // total investments per year
      })
    );
    return allResults;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleRunSimulations = async (scenario, handle) => {
    try {
      const res = await fetch('http://localhost:5000/api/tax/state');
      const data = await res.json();
      const stateKey = scenario.state.toLowerCase().replace(/\s/g, '_');
      if (!data[stateKey]) {
        handle(`Warning: No tax data found for ${scenario.state}, simulation will ignore state tax!`)
      }
    } catch (err) {
      console.error('Error fetching state tax data:', err);
    }
    const newLine = [];
    const newShade1 = [];
    const newShade2 = [];
    const newShade3 = [];
    const newShade4 = [];
    const newShade5 = [];
    const newBar = [];

    try {
      const tasks = [];
      for (let i = 0; i < formData.num; i++) {
        tasks.push(runSimulation(structuredClone(originalScenario)));
      }

      const results = await Promise.all(tasks);

      results.forEach((simResult) => {
        newLine.push(simResult[0]);
        newShade1.push(simResult[1][0]);
        newShade2.push(simResult[1][1]);
        newShade3.push(simResult[1][2]);
        newShade4.push(simResult[1][3]);
        newShade5.push(simResult[1][4]);
        newBar.push(simResult[2]);
      });

      setLine(newLine);
      setShade1(newShade1);
      setShade2(newShade2);
      setShade3(newShade3);
      setShade4(newShade4);
      setShade5(newShade5);
      setBar(newBar);
      setHasRun(true);
    } catch (error) {
      console.error('Error running simulations in parallel:', error);
    }
  };

  return (
    <div>
      {message && <p style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '10px 15px', 
          border: '1px solid #ffeeba', 
          borderRadius: '4px',
          fontWeight: 'bold',
          marginTop: '10px'
      }}>
          {message}
      </p>}
      {!hasRun ? (
        <div>
          <h2>Enter number of simulations</h2>
          <input
            type="number"
            name="num"
            min={1}
            value={formData.num}
            onChange={handleInputChange}
            style={{ width: '100px', marginRight: '10px' }}
          />
          <button onClick={() => handleRunSimulations(originalScenario, setMessage)}>Run Simulations</button>
        </div>
      ) : (
        <div>
          <h3>Ran {formData.num} simulations</h3>
          <h4>Probability of Success</h4>
          <Line_Chart data={line} />
          <h4>Total Assets</h4>
          <InputField id="totalInvestment" type="checkbox" checked={formData.totalInvestment} onChange={handleInputChange}>Total Investment</InputField>
          {formData.totalInvestment && <Shaded_Chart data={shade1} />}
          <InputField id="totalIncome" type="checkbox" checked={formData.totalIncome} onChange={handleInputChange}>Total Income</InputField>
          {formData.totalIncome && <Shaded_Chart data={shade2} />}
          <InputField id="totalExpenseTax" type="checkbox" checked={formData.totalExpenseTax} onChange={handleInputChange}>Total Expenses with Tax</InputField>
          {formData.totalExpenseTax && <Shaded_Chart data={shade3} />}
          <InputField id="earlyWithdrawlTax" type="checkbox" checked={formData.earlyWithdrawlTax} onChange={handleInputChange}>Early Withdrawl Tax</InputField>
          {formData.earlyWithdrawlTax && <Shaded_Chart data={shade4} />}
          <InputField id="discretionaryExpenses" type="checkbox" checked={formData.discretionaryExpenses} onChange={handleInputChange}>Discretionary Expenses</InputField>
          {formData.discretionaryExpenses && <Shaded_Chart data={shade5} />}
          <h4>Value of Events/Investments</h4>
          <InputField id="median" type="checkbox" checked={formData.median} onChange={handleInputChange}>Use Median</InputField>
          <UnifiedStackedFinanceChart data={bar} median={formData.median} />

          <button
            onClick={() =>
              navigate(`/explore/${baseScenario._id}`, {
                state: { scenario: structuredClone(baseScenario) }
              })
            }
            style={{ marginTop: '30px', padding: '10px 20px', fontSize: '16px' }}
          >
            One-Dimensional Parameter Exploration
          </button>

          {oneDResults && oneDParam && (
            <>
              {multiLineProbData.length > 0 && (
                <MultiLineProbabilityChart
                  simulationsList={multiLineProbData}
                  parameterValues={oneDParam.values}
                />
              )}
              {multiLineInvestData.length > 0 && (
                <MultiLineMedianInvestmentChart
                  investmentRuns={multiLineInvestData}
                  paramValues={oneDParam.values}
                />
              )}
            </>
          )}
        </div>
      )}
      <div style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '10px 15px', 
          border: '1px solid #ffeeba', 
          borderRadius: '4px',
          fontWeight: 'bold',
          marginTop: '10px'
      }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>ASSUMPTIONS, LIMITATIONS, SIMPLIFICATIONS</div>
          <ul style={{ fontWeight: 'normal', margin: 0, paddingLeft: '20px' }}>
              <li>Start Year is 2025</li>
              <li>Increase in investment value is shown the next year</li>
              <li>Events that start after another event begin the year after that event ends</li>
              <li>The same state tax bracket is used for both income and capital gains calculation</li>
              <li>Only 85% of social security income is counted as taxable</li>
              <li>Simulation only considers single or married taxes</li>
              <li>Early withdrawal tax is 10%; all withdrawals before age 59 are considered early</li>
              <li>Gliding for events is done linearly</li>
              <li>Simulation automatically normalizes all percentages to 100%</li>
              <li>RMD starts at age 74; any age above 120 uses the RMD for age 120</li>
              <li>The graph shows investments by type, condensed by similar types</li>
              <li>Simulations that terminate early are excluded from future success probability</li>
          </ul>
      </div>
    </div>
  );
}
