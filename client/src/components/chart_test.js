import React from "react"
import Line_Chart from "./line_chart";
import Shaded_Chart from "./shaded_chart";
import Stacked_Chart from "./stacked_chart";
import { useNavigate } from 'react-router-dom';

export default function ChartTest() {
  const line_data = [
    [true, true, false, true, true],
    [true, false, false, true, false],
    [true, true, true, true, true],
    [false, true, true, false, true],
    [true, true, false, false, true],
  ];

  const shade_data = generateSimulations({});

  const stacked_data = generateSimulations2({ numSimulations: 50, numYears: 10 });


  return(
    <div>
  <Line_Chart data={line_data}/>
  <Shaded_Chart data={shade_data}/>

  </div>
  );
}

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
  }

  function generateSimulations2({ numSimulations = 30, numYears = 10 }) {
    const investmentTypes = ['401(k)', 'Roth IRA', 'Brokerage'];
    const incomeTypes = ['Salary', 'Freelance', 'Rental'];
    const expenseTypes = ['Housing', 'Food', 'Entertainment', 'Transport', 'Tax'];
  
    const simulations = [];
  
    for (let s = 0; s < numSimulations; s++) {
      const sim = [];
  
      for (let y = 0; y < numYears; y++) {
        const investments = investmentTypes.map(name => ({
          name,
          value: Math.round(5000 + Math.random() * 20000),
        }));
  
        const income = incomeTypes.map(name => ({
          name,
          amount: Math.round(10000 + Math.random() * 20000),
        }));
  
        const expenses = expenseTypes.map(name => ({
          name,
          amount: Math.round(
            name === 'Tax' ? 3000 + Math.random() * 2000 : 2000 + Math.random() * 8000
          ),
        }));
  
        sim.push({ investments, income, expenses });
      }
  
      simulations.push(sim);
    }
    return { simulations };
  }