import React from "react";
import Navbar from "./navBar";

const dummyScenarios = [
    { id: 1, name: "Scenario Alpha" },
    { id: 2, name: "Scenario Beta" },
    { id: 3, name: "Scenario Gamma" },
  ];

const Home = () => {

    const handleScenarioClick = (id) => {
        //to be implemented
    };

    const handleCreateScenario = () => {
        alert("Create Scenario button clicked");
        // You can navigate to a create page or open a modal
    };

    return (
        <div className="home-container">
        <Navbar />

        <main className="home-main">
            <div className="home-header">
            <h1 className="home-title">Scenarios</h1>
            <button className="create-button" onClick={handleCreateScenario}>
                + Create Scenario
            </button>
            </div>

            <div className="scenario-list">
            {dummyScenarios.map((scenario) => (
                <div
                key={scenario.id}
                className="scenario-card"
                onClick={() => handleScenarioClick(scenario.id)}
                >
                <h2 className="scenario-name">{scenario.name}</h2>
                </div>
            ))}
            </div>
        </main>
        </div>
    );
};
export default Home;