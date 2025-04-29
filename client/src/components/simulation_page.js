import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import simulation from './simulation'; // renamed to avoid conflict
import Line_Chart from './line_chart';
import Shaded_Chart from './shaded_chart';
import UnifiedStackedFinanceChart from './stacked_chart'; 
import ScenarioList from './scenario_list';

export default function SimulationPage() { 
    const location = useLocation();
    const { scenario } = location.state;
    const num = 10;
    var simResult = null;

    const line = [];
    const shade = [];
    const bar = [];
    for (let i = 0; i < num; i++) {
        simResult = simulation({ scenario: structuredClone(scenario) });
        line.push(simResult[0]);
        shade.push(simResult[1]);
        bar.push(simResult[2]);
    }

    return (
        <div>
            <h3>Ran {num} simulations</h3>
            <h4>Proability of Success</h4>
            <Line_Chart data={line} />
            <h4>Total Assets</h4>
            <Shaded_Chart data={shade} />
            <h4>Value of Events/Investments</h4>
            <UnifiedStackedFinanceChart data={bar}/>
        </div>
    );
}