
import React from "react";
import Navbar from "./navBar";
import ScenarioList from "./scenario_list.js"
import Scenario from "./scenario.js";
import { Route, Routes } from "react-router-dom"
import Login from "./login.js"
import UserProfile from "./user_profile.js"

import CreateScenario from "./create_scenario";
import CreateInvestmentTypes from "./create_investment_type.js";
import CreateInvestments from "./create_investments.js";
import CreateEvent from "./event_series/create_event.js";
import EditScenario from "./edit_scenario";
import EditInvestmentTypes from "./edit_investment_types.js";
import EditInvestments from "./edit_investments.js";
import EditEvent from "./event_series/edit_event.js";
import SimulationPage from "./simulation_page.js";
import ChartTest from "./chart_test.js"
function Home() {
  const scenarios = []; // here if the user is logged in check if the user has any scenarios already created,
  //if they do show that otherwise show empty list

  return (
    <div className="home-container">
      <Navbar />
        <main className="home-main">
          <Routes>
            <Route path="/" element={<ScenarioList scenarios={scenarios} simulate={false}/>} />
            <Route path="/scenario/:id" element={<Scenario/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/user_profile" element={<UserProfile />} />
            <Route path="/scenario/create" element={<CreateScenario scenarios={scenarios}/>} />
            <Route path="/scenario/create_investment_type/:id" element={<CreateInvestmentTypes scenarios={scenarios}/>} />
            <Route path="/scenario/create_investment/:id" element={<CreateInvestments scenarios={scenarios}/>} />
            <Route path="/scenario/create_event/:id" element={<CreateEvent scenarios={scenarios}/>} />
            <Route path="/scenario/edit/:id" element={<EditScenario scenarios={scenarios}/>} />
            <Route path="/scenario/edit_investment_type/:id" element={<EditInvestmentTypes scenarios={scenarios}/>} />
            <Route path="/scenario/edit_investment/:id" element={<EditInvestments scenarios={scenarios}/>} />
            <Route path="/scenario/edit_event/:id" element={<EditEvent scenarios={scenarios}/>} />
            <Route path="/simulation/:id" element={<SimulationPage/>} />
            <Route path="/chart-test" element={<ChartTest />} />
          </Routes>
        </main>
    </div>
  );
};

export default Home

