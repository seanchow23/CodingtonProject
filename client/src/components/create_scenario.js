import React, { useState } from "react";
import Navbar from "./navBar";

const CreateScenario = () => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Scenario "${name}" created!`);
    // You can add saving logic here or redirect after submit
  };

  return (
    <div className="home-container">
      <main className="home-main">
        <h1 className="home-title">Create New Scenario</h1>
        <form className="scenario-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Scenario Name:
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="create-button">
            Create Scenario
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateScenario;
