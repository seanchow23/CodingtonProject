import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import simulation from './simulation'; // renamed to avoid conflict
import Line_Chart from './line_chart';
import Shaded_Chart from './shaded_chart';
import UnifiedStackedFinanceChart from './stacked_chart'; 
import ScenarioList from './scenario_list';
import InputField from "./input_field";
export default function SimulationPage() { 

    const [formData, setFormData] = useState({
         num: 10,
         totalInvestment: false,
         totalIncome: false,
         totalExpenseTax: false,
         earlyWithdrawlTax: false,
         discretionaryExpenses:false,
         median: false
        });
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };
    const location = useLocation();
    const { scenario } = location.state;
    var simResult = null;
    const [hasRun, setHasRun] = useState(false);

    const [line, setLine] = useState([]);
    const [shade1, setShade1] = useState([]);
    const [shade2, setShade2] = useState([]);
    const [shade3, setShade3] = useState([]);
    const [shade4, setShade4] = useState([]);
    const [shade5, setShade5] = useState([]);
    const [bar, setBar] = useState([]);


    const handleRunSimulations = async () => {
      const newLine    = [];
      const newShade1  = [];
      const newShade2  = [];
      const newShade3  = [];
      const newShade4  = [];
      const newShade5  = [];
      const newBar     = [];
  
      for (let i = 0; i < formData.num; i++) {
        // await here so simResult is the actual array
        const simResult = await simulation({
          scenario: structuredClone(scenario)
        });
  
        newLine   .push(simResult[0]);
        newShade1 .push(simResult[1][0]);
        newShade2 .push(simResult[1][1]);
        newShade3 .push(simResult[1][2]);
        newShade4 .push(simResult[1][3]);
        newShade5 .push(simResult[1][4]);
        newBar    .push(simResult[2]);
      }
  
      setLine  (newLine);
      setShade1(newShade1);
      setShade2(newShade2);
      setShade3(newShade3);
      setShade4(newShade4);
      setShade5(newShade5);
      setBar   (newBar);
      setHasRun(true);
    
      };
    
return (
    <div>
    {!hasRun && (
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
    )}
        {hasRun && (
        <div>
            <h3>Ran {formData.num} simulations</h3>
            <h4>Probability of Success</h4>
            <Line_Chart data={line} />
            <h4>Total Assets</h4>
            <InputField id="totalInvestment" type="checkbox" checked={formData.totalInvestment} onChange={handleInputChange}>Total Investment</InputField>
            {formData.totalInvestment &&<Shaded_Chart data={shade1} />}
            <InputField id="totalIncome" type="checkbox" checked={formData.totalIncome} onChange={handleInputChange}>Total Income</InputField>
            {formData.totalIncome &&<Shaded_Chart data={shade2} />}
            <InputField id="totalExpenseTax" type="checkbox" checked={formData.totalExpenseTax} onChange={handleInputChange}>Total Expenses with Tax</InputField>
            {formData.totalExpenseTax &&<Shaded_Chart data={shade3} />}
            <InputField id="earlyWithdrawlTax" type="checkbox" checked={formData.earlyWithdrawlTax} onChange={handleInputChange}>Early Withdrawl Tax</InputField>
            {formData.earlyWithdrawlTax &&<Shaded_Chart data={shade4} />}
            <InputField id="discretionaryExpenses" type="checkbox" checked={formData.discretionaryExpenses} onChange={handleInputChange}>Discretionary Expenses</InputField>
            {formData.discretionaryExpenses &&<Shaded_Chart data={shade5} />}
            <h4>Value of Events/Investments</h4>
            <InputField id="median" type="checkbox" checked={formData.median} onChange={handleInputChange}>Use Median</InputField>
            <UnifiedStackedFinanceChart data={bar}  median={formData.median}/>
        </div>
        )}
    </div>
    );
}
