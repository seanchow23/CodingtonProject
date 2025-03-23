
import React from "react";
import Navbar from "./navBar";
import ScenarioList from "./scenario_list.js"
import Scenario from "./scenario.js";
import { Route, Routes } from "react-router-dom"
import Login from "./login.js"
import UserProfile from "./user_profile.js"

const e1 = {
    _id: 1001,
    name: 'Annual Budget Review',
    description: 'A review of the yearly expenses and adjustments.',
    start_year: 2025,
    duration: 2,  // Duration in hours
    amount: 5000,  // Amount for the expense
    change: 100,  // Change in the expense from previous year
    inflation: true,  // Whether inflation is a factor
    discretionary: false,  // Whether it's discretionary or non-discretionary
    type: "expense"
  };

  const e2 = {
    _id: 1002,
    name: 'Gambling',
    description: '',
    start_year: 2025,
    duration: 20,  // Duration in hours
    amount: 1000,  // Amount for the expense
    change: 0,  // Change in the expense from previous year
    inflation: false,  // Whether inflation is a factor
    discretionary: true,  // Whether it's discretionary or non-discretionary
    type: "expense"
  };

  const e3 = {
    _id: 1003,
    name: 'Food',
    description: 'I need to eat',
    start_year: 2025,
    duration: 70,  // Duration in hours
    amount: 20000,  // Amount for the expense
    change: 200,  // Change in the expense from previous year
    inflation: true,  // Whether inflation is a factor
    discretionary: true,  // Whether it's discretionary or non-discretionary
    type: "expense"
  };

  const i1 = {
    _id: 2001,
    name: 'Income',
    description: '',
    start_year: 2025,
    duration: 20,  // Duration in hours
    amount: 50000,  // Amount for the expense
    change: 1000,  // Change in the expense from previous year
    inflation: true,  // Whether inflation is a factor
    ss: false,  // Whether it's discretionary or non-discretionary
    type: "income"
  };

  const i2 = {
    _id: 2002,
    name: 'Lottery Ticket',
    description: '',
    start_year: 2025,
    duration: 1,  // Duration in hours
    amount: 1000,  // Amount for the expense
    change: 0,  // Change in the expense from previous year
    inflation: false,  // Whether inflation is a factor
    ss: false,  // Whether it's discretionary or non-discretionary
    type: "income"
  };

  const i3 = {
    _id: 2003,
    name: 'SNAP',
    description: 'government money',
    start_year: 2025,
    duration: 5,  // Duration in hours
    amount: 1000,  // Amount for the expense
    change: 50,  // Change in the expense from previous year
    inflation: true,  // Whether inflation is a factor
    ss: true,  // Whether it's discretionary or non-discretionary
    type: "income"
  };

  

const dummyScenarios = [
    { _id: 1, name: "Scenario Alpha", events: [e1, e2, e3, i1, i2, i3] },
    { _id: 2, name: "Scenario Beta", events: [e1] },
    { _id: 3, name: "Scenario Gamma", events: [e1] },
];

function Home() {
    return (
        <div className="home-container">
            <Navbar />
            <main className="home-main">
                <Routes>
                    <Route path="/" element={<ScenarioList scenarios={dummyScenarios} />} />
                    <Route path="/scenario/:id" element={<Scenario />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/user_profile" element={<UserProfile />} />
                </Routes>
            </main>
        </div>
    );
};

export default Home

