import React from "react"
import { useNavigate } from 'react-router-dom';

  
const ScenarioList = ({ scenarios, simulate }) => {
    const navigate = useNavigate();
    const handleScenarioClick = (scenario) => {navigate(`/scenario/${scenario._id}`, { state: { scenario } });};
    const handleCreateScenarioClick = () => {navigate(`/scenario/create`);};
    const handleImportClick = () => {navigate('/import-scenario');};
    return (<div className="scenario-list">
        <div className="home-header">
            <h1 className="home-title">Scenarios</h1>
            {!simulate && <button className="create-button"  onClick={handleCreateScenarioClick}>+ Create Scenario</button>}
        </div>
        {scenarios.map((scenario, index) => (
            <div key={scenario._id} className="scenario-card" onClick={() => handleScenarioClick(scenario)}>
                <h2 className="scenario-name"  to="/scenario">
                    {simulate ? `${scenario.name} - Year ${index + 1}` : scenario.name}
                </h2>
            </div>))
        }
        <button className="import-button" onClick={handleImportClick}>Import Scenario</button>

    </div>);
}

export default ScenarioList