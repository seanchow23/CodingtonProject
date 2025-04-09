import React, { useState } from "react";
import ScenarioList from "./scenario_list";
import { useLocation } from "react-router-dom";
import _ from "lodash";

export default function Simulation() {
    const location = useLocation();
    const {scenario} = location.state;

    const simulated_scenarios = [scenario];
    var prev_scenario = scenario;
    var next_scenario = null;
    var year = 2025;
    var tax = 0;

    do {
        next_scenario = _.cloneDeep(prev_scenario);
        simulated_scenarios.push(next_scenario);

        next_scenario.lifeExpectancyUser--;
        if (next_scenario.lifeExpectancySpouse) {next_scenario.lifeExpectancySpouse--;}

        // Run Income Events
        // Perform RMD for previous year
        // Update Investment
        // Run Optimizer if enabled
        // Pay expense, withdrwals
        // Invest Excess cash
        // Run rebalance

        prev_scenario = next_scenario;

    } while (next_scenario.lifeExpectancyUser > 1);

    return (
        <ScenarioList scenarios={simulated_scenarios} simulate={true} />
    );
}

function runIncomeEvent(scenario, year) {
    // Find cash investment or make one
    // Calculate income and add to cash
    // Decrement duration
    // Remove ended income events 
    // Update extisting income events
    // Start income events based on year
}

function RMD(scenario) {}

function updateInvestments(scenario) {}

function rothOptimizer(scenario) {}

function payExpenses(scenario, year) {}