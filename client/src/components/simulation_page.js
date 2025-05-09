import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Line_Chart from './line_chart';
import Shaded_Chart from './shaded_chart';
import UnifiedStackedFinanceChart from './stacked_chart';
import InputField from './input_field';
import MultiLineProbabilityChart from './multi_line_probability';
import MultiLineMedianInvestmentChart from './multi_line_median';
import OneDLineSummaryChart from './oneD_line_summary';
import { runSimulation } from '../api/simulationApi';
import TwoDSurfacePlot from './twoD_surface_plot';
import TwoDContourPlot from './twoD_contour_plot';

export default function SimulationPage({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    scenario: originalScenario,
    oneDResults,
    oneDParam,
    twoDResults,
    twoDParams
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
  const [seed, setSeed] = useState(null);

  const [hasRun, setHasRun] = useState(false);
  const [multiLineProbData, setMultiLineProbData] = useState([]);
  const [multiLineInvestData, setMultiLineInvestData] = useState([]);
  const [finalProbabilities, setFinalProbabilities] = useState([]);
  const [finalInvestments, setFinalInvestments] = useState([]);
  const [final2DProbabilities, setFinal2DProbabilities] = useState([]);
  const [final2DInvestments, setFinal2DInvestments] = useState([]);

  const [baseScenario] = useState(() => structuredClone(originalScenario));
  const [line, setLine] = useState([]);
  const [shade1, setShade1] = useState([]);
  const [shade2, setShade2] = useState([]);
  const [shade3, setShade3] = useState([]);
  const [shade4, setShade4] = useState([]);
  const [shade5, setShade5] = useState([]);
  const [bar, setBar] = useState([]);

  useEffect(() => {
    if (hasRun && oneDResults && oneDParam) {
      simulateEditedScenarios(oneDResults).then(data => {
        setMultiLineProbData(data.map(d => d.probRuns));
        setMultiLineInvestData(data.map(d => d.investRuns));
        setFinalProbabilities(data.map(d => d.finalProb));
        setFinalInvestments(data.map(d => d.finalMedianInvest));
      });
    }
  }, [hasRun, oneDResults, oneDParam, formData.num]);

  useEffect(() => {
    if (hasRun && twoDResults && twoDParams) {
      Promise.all(
        twoDResults.map(async (row) =>
          Promise.all(row.map(async (scenario) => {
            const results = await Promise.all(
              Array.from({ length: formData.num }, () => runSimulation(structuredClone(scenario), seed, user))
            );
            const finalProbs = results.map(r => r[0].at(-1)).filter(Boolean);
            const finalInvests = results.map(r => r[1][0].at(-1)).filter(Boolean);
            return {
              prob: average(finalProbs),
              invest: median(finalInvests)
            };
          }))
        )
      ).then(rows => {
        setFinal2DProbabilities(rows.map(row => row.map(cell => cell.prob)));
        setFinal2DInvestments(rows.map(row => row.map(cell => cell.invest)));
      });
    }
  }, [hasRun, twoDResults, twoDParams, formData.num]);

  async function simulateEditedScenarios(scenarios) {
    return await Promise.all(
      scenarios.map(async scenario => {
        const probRuns = [];
        const investRuns = [];

        for (let i = 0; i < formData.num; i++) {
          const result = await runSimulation(structuredClone(scenario));
          probRuns.push(result[0]);
          investRuns.push(result[1][0]);
        }

        const finalProb = probRuns.map(run => run.at(-1)).filter(Boolean);
        const finalMedianInvest = investRuns.map(years => years.at(-1)).filter(Boolean);

        return {
          probRuns,
          investRuns,
          finalProb: average(finalProb),
          finalMedianInvest: median(finalMedianInvest)
        };
      })
    );
  }

  function average(arr) {
    if (!arr.length) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  function median(arr) {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'seed') {
      setSeed(value);
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const stateAbbrevToKey = {
    AL: "alabama", AK: "alaska", AZ: "arizona", AR: "arkansas", CA: "california",
    CO: "colorado", CT: "connecticut", DE: "delaware", FL: "florida", GA: "georgia",
    HI: "hawaii", ID: "idaho", IL: "illinois", IN: "indiana", IA: "iowa",
    KS: "kansas", KY: "kentucky", LA: "louisiana", ME: "maine", MD: "maryland",
    MA: "massachusetts", MI: "michigan", MN: "minnesota", MS: "mississippi", MO: "missouri",
    MT: "montana", NE: "nebraska", NV: "nevada", NH: "new_hampshire", NJ: "new_jersey",
    NM: "new_mexico", NY: "new_york", NC: "north_carolina", ND: "north_dakota", OH: "ohio",
    OK: "oklahoma", OR: "oregon", PA: "pennsylvania", RI: "rhode_island", SC: "south_carolina",
    SD: "south_dakota", TN: "tennessee", TX: "texas", UT: "utah", VT: "vermont",
    VA: "virginia", WA: "washington", WV: "west_virginia", WI: "wisconsin", WY: "wyoming"
  };
  
  const getStateKeyFromAbbreviation = (abbrev) => {
    return stateAbbrevToKey[abbrev?.toUpperCase()] || null;
  };

const handleRunSimulations = async (scenario = originalScenario, handleMessage = setMessage) => {
  try {
    // Fetch state tax data
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/tax/state`);
    const data = await res.json();
    const stateKey = getStateKeyFromAbbreviation(scenario.state);
    if (!data[stateKey]) {
      handleMessage(`Warning: No tax data found for ${scenario.state}, simulation will ignore state tax!`);
    }
  } catch (err) {
    console.error('Error fetching state tax data:', err);
  }

  try {
    console.log("Starting simulation with scenario:", originalScenario);

    // Clone scenario
    const scenarioToUse = structuredClone(originalScenario);

    // Ensure a Cash investment exists
    const hasCash = scenarioToUse.investments.some(
      inv => inv.investmentType?.name === "Cash"
    );

    if (!hasCash) {
      let cashType = scenarioToUse.investmentTypes.find(type => type.name === "Cash");

      if (!cashType) {
        cashType = {
          _id: "temp_cash_type_id",
          name: "Cash",
          description: "Auto-created Cash account",
          expectedAnnualReturn: { type: "fixed", value1: 0, value2: 0 },
          expenseRatio: 0,
          expectedAnnualIncome: { type: "fixed", value1: 0, value2: 0 },
          taxability: false
        };
        scenarioToUse.investmentTypes.push(cashType);
      }

      const cashInvestment = {
        _id: "temp_cash_investment_id",
        investmentType: cashType,
        value: 0,
        baseValue: 0,
        taxStatus: "non-retirement"
      };

      scenarioToUse.investments.push(cashInvestment);
      console.log("Added Cash investment to scenario:", cashInvestment);
    }

    // Run the simulations
    const tasks = [];
    for (let i = 0; i < formData.num; i++) {
      tasks.push(runSimulation(structuredClone(scenarioToUse), seed, user));
    }

    const results = await Promise.all(tasks);
    setLine(results.map(r => r[0]));
    setShade1(results.map(r => r[1][0]));
    setShade2(results.map(r => r[1][1]));
    setShade3(results.map(r => r[1][2]));
    setShade4(results.map(r => r[1][3]));
    setShade5(results.map(r => r[1][4]));
    setBar(results.map(r => r[2]));
    setHasRun(true);
  } catch (error) {
    console.error('Error running simulations:', error);
  }
};

  const param1Label = twoDParams?.param1?.label || 'Parameter 1';
  const param2Label = twoDParams?.param2?.label || 'Parameter 2';

  const probTitle2D = `Final Probability of Success (${param1Label} vs ${param2Label})`;
  const investTitle2D = `Final Median Investments (${param1Label} vs ${param2Label})`;

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
          <button className="edit-button" onClick={() => handleRunSimulations(originalScenario, setMessage)}>Run Simulations</button>
          <h4>Set Simulation Seed</h4>
          <input
            type="number"
            name="seed"
            value={seed || ''}
            onChange={handleInputChange}
            style={{ width: '100px', marginRight: '10px' }}
          />
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

          <button className="edit-button" onClick={() => navigate(`/explore/${baseScenario._id}`, { state: { scenario: structuredClone(baseScenario) } })}>
            One-Dimensional Parameter Exploration
          </button>

          {oneDResults && oneDParam && (
            <>
              <MultiLineProbabilityChart
                simulationsList={multiLineProbData}
                parameterValues={oneDParam.values}
                paramLabel={oneDParam.keyLabel}
              />
              <MultiLineMedianInvestmentChart
                investmentRuns={multiLineInvestData}
                paramValues={oneDParam.values}
                paramLabel={oneDParam.keyLabel}
              />
              <OneDLineSummaryChart
                paramValues={oneDParam.values}
                yValues={finalProbabilities}
                label="Final Probability of Success"
                yAxisTitle="% Success"
                paramLabel={oneDParam.keyLabel}
              />
              <OneDLineSummaryChart
                paramValues={oneDParam.values}
                yValues={finalInvestments}
                label="Final Median Total Investments"
                yAxisTitle="Dollars"
                paramLabel={oneDParam.keyLabel}
              />
            </>
          )}

          <button className="edit-button" onClick={() => navigate(`/explore2/${baseScenario._id}`, { state: { scenario: structuredClone(baseScenario) } })}>
            Two-Dimensional Parameter Exploration
          </button>

          {twoDResults && twoDParams && final2DProbabilities.length > 0 && (
            <>
              <div><h4>Final Probability of Success Surface plot (2D Exploration)</h4></div>
              <TwoDSurfacePlot
                zData={final2DProbabilities}
                xLabels={twoDParams.param2.values}
                yLabels={twoDParams.param1.values}
                title={probTitle2D}
                zLabel="% Success"
                xLabel={param1Label}
                yLabel={param2Label}
              />
              <div><h4>Final Probability of Success Contour plot (2D Exploration)</h4></div>
              <TwoDContourPlot
                zData={final2DProbabilities}
                xLabels={twoDParams.param2.values}
                yLabels={twoDParams.param1.values}
                title={`Contour: ${probTitle2D}`}
                zLabel="% Success"
                xLabel={param1Label}
                yLabel={param2Label}
              />
            </>
          )}

          {twoDResults && twoDParams && final2DInvestments.length > 0 && (
            <>

              <div><h4>Total Investment Surface plot (2D Exploration)</h4></div>
              <TwoDSurfacePlot
                zData={final2DInvestments}
                xLabels={twoDParams.param2.values}
                yLabels={twoDParams.param1.values}
                title={investTitle2D}
                zLabel="Dollars"
                xLabel={param1Label}
                yLabel={param2Label}
              />
              <div><h4>Total Investment Contour plot (2D Exploration)</h4></div>
              <TwoDContourPlot
                zData={final2DInvestments}
                xLabels={twoDParams.param2.values}
                yLabels={twoDParams.param1.values}
                title={`Contour: ${investTitle2D}`}
                zLabel="Dollars"
                xLabel={param1Label}
                yLabel={param2Label}
              />
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