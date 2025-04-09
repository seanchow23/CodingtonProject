
import React from "react";
import Navbar from "./navBar";
import ScenarioList from "./scenario_list.js"
import Scenario from "./scenario.js";
import { Route, Routes } from "react-router-dom"
import Login from "./login.js"
import UserProfile from "./user_profile.js"
import TaxInfo from "./taxinfo.js";

import CreateEvent from "./event_series/create_event.js";
import CreateScenario from "./create_scenario";
import CreateInvestments from "./create_investments.js";
import EditScenario from "./edit_scenario";
import EditInvestments from "./edit_investments.js";
import EditEvent from "./edit_event.js";

function Home() {
  const scenarios = [];

  return (
    <div className="home-container">
      <Navbar />
        <main className="home-main">
          <Routes>
            <Route path="/" element={<ScenarioList scenarios={scenarios}/>} />
            <Route path="/scenario/:id" element={<Scenario scenarios={scenarios}/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/user_profile" element={<UserProfile />} />
            <Route path="/scenario/create" element={<CreateScenario scenarios={scenarios}/>} />
            <Route path="/scenario/create_investment/:id" element={<CreateInvestments scenarios={scenarios}/>} />
            <Route path="/scenario/create_event/:id" element={<CreateEvent scenarios={scenarios}/>} />
            <Route path="/scenario/edit/:id" element={<EditScenario scenarios={scenarios}/>} />
            <Route path="/scenario/edit_investment/:id" element={<EditInvestments scenarios={scenarios}/>} />
            <Route path="/scenario/edit_event/:id" element={<EditEvent scenarios={scenarios}/>} />
            <Route path="/tax-info" element={<TaxInfo />} />
          </Routes>
        </main>
    </div>
  );
};

export default Home

