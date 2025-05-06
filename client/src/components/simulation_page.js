import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import simulation from './simulation';
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

export default function SimulationPage() {
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
              Array.from({ length: formData.num }, () => runSimulation(structuredClone(scenario)))
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
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleRunSimulations = async () => {
    const tasks = [];
    for (let i = 0; i < formData.num; i++) {
      tasks.push(runSimulation(structuredClone(originalScenario)));
    }

    try {
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
          <button onClick={handleRunSimulations}>Run Simulations</button>
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

          <button onClick={() => navigate(`/explore/${baseScenario._id}`, { state: { scenario: structuredClone(baseScenario) } })}>
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

          <button onClick={() => navigate(`/explore2/${baseScenario._id}`, { state: { scenario: structuredClone(baseScenario) } })}>
            Two-Dimensional Parameter Exploration
          </button>

          {twoDResults && twoDParams && final2DProbabilities.length > 0 && (
            <>
              <div><h4>Final Probability of Success Surface plot (2D Exploration)</h4></div>
              <TwoDSurfacePlot
                zData={final2DProbabilities}
                xLabels={twoDParams.param1.values}
                yLabels={twoDParams.param2.values}
                title={probTitle2D}
                zLabel="% Success"
                xLabel={param1Label}
                yLabel={param2Label}
              />
              <div><h4>Final Probability of Success Contour plot (2D Exploration)</h4></div>
              <TwoDContourPlot
                zData={final2DProbabilities}
                xLabels={twoDParams.param1.values}
                yLabels={twoDParams.param2.values}
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
                xLabels={twoDParams.param1.values}
                yLabels={twoDParams.param2.values}
                title={investTitle2D}
                zLabel="Dollars"
                xLabel={param1Label}
                yLabel={param2Label}
              />
              <div><h4>Total Investment Contour plot (2D Exploration)</h4></div>
              <TwoDContourPlot
                zData={final2DInvestments}
                xLabels={twoDParams.param1.values}
                yLabels={twoDParams.param2.values}
                title={`Contour: ${investTitle2D}`}
                zLabel="Dollars"
                xLabel={param1Label}
                yLabel={param2Label}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
