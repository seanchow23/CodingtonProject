import React from "react"
import { useNavigate } from 'react-router-dom';

const ScenarioList = ({ scenarios }) => {
    const navigate = useNavigate();
    const handleScenarioClick = (scenario) => {navigate(`/scenario/${scenario._id}`, { state: { scenario } });};

    return (<div className="scenario-list">
        <div className="home-header">
            <h1 className="home-title">Scenarios</h1>
            <button className="create-button">+ Create Scenario</button>
        </div>
        {scenarios.map(scenario => (
            <div key={scenario._id} className="scenario-card" onClick={() => handleScenarioClick(scenario)}>
                <h2 className="scenario-name"  to="/scenario">{scenario.name}</h2>
            </div>))
        }
    </div>);
}

export default ScenarioList