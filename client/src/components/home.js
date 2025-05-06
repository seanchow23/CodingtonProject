import React, { useEffect, useState } from "react";
import Navbar from "./navBar";
import ScenarioList from "./scenario_list.js";
import Scenario from "./scenario.js";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Login from "./login.js";
import UserProfile from "./user_profile.js";
import ImportScenario from './ImportScenario.js';


import CreateScenario from "./create_scenario";
import CreateInvestmentTypes from "./create_investment_type.js";
import CreateInvestments from "./create_investments.js";
import CreateEvent from "./event_series/create_event.js";
import EditScenario from "./edit_scenario";
import EditInvestmentTypes from "./edit_investment_types.js";
import EditInvestments from "./edit_investments.js";
import EditEvent from "./event_series/edit_event.js";
import SimulationPage from "./simulation_page.js";
import OneDExplorePage from './oneDExplorePage.js';
import * as userApi from "../api/userApi";
import * as scenarioApi from "../api/scenarioApi";

function Home() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);

      try {
        const { data: user } = await userApi.getCurrentUser();

        if (user && user._id) {
          const allScenarioIds = [...user.scenarios, ...user.sharedScenarios];
          const scenarioFetches = allScenarioIds.map(id => scenarioApi.getScenario(id));
          const scenarioResponses = await Promise.all(scenarioFetches);
          const scenarioList = scenarioResponses.map(res => res);
          setScenarios(scenarioList);
        } else {
          throw new Error("No user");
        }

      } catch (err) {
        // Not logged in — fallback to localStorage
        const local = localStorage.getItem("localScenarios");
        const parsed = local ? JSON.parse(local) : [];
        setScenarios(parsed);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, [location.pathname]);

  if (loading) return <p>Loading...</p>;

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
            <Route path="/explore/:id" element={<OneDExplorePage />} />
            <Route path="/import-scenario" element={<ImportScenario setScenarios={setScenarios} />} />

        </Routes>
        </main>

    </div>
  );
}

export default Home;
