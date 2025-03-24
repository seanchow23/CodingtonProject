import React, { useState } from "react";
import Navbar from "./navBar";

const CreateScenario = () => {
  const [formData, setFormData] = useState({
    name: "",
    married: false,
    dob: "",
    spouse_dob: "",
    life_expectancy: "",
    spouse_expectancy: "",
    goal: "",
    inflation: "",
    optimizer: false,
    initial_limit: "",
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Scenario created:", formData);
    alert("Scenario created!");
    // You can redirect or save data here
  };

  return (
    <div className="home-container">
      <main className="home-main">
        <h1 className="home-title">Create New Scenario</h1>
        <form className="scenario-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Name:
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-label">
            Married:
            <input
              type="checkbox"
              name="married"
              checked={formData.married}
              onChange={handleChange}
            />
          </label>

          <label className="form-label">
            Date of Birth:
            <input
              className="form-input"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-label">
            Life Expectancy:
            <input
              className="form-input"
              type="number"
              name="life_expectancy"
              value={formData.life_expectancy}
              onChange={handleChange}
              required
            />
          </label>

          {formData.married && (
            <label className="form-label">
              Spouse Date of Birth:
              <input
                className="form-input"
                type="date"
                name="spouse_dob"
                value={formData.spouse_dob}
                onChange={handleChange}
              />
            </label>
          )}

          {formData.married && (
            <label className="form-label">
              Spouse Life Expectancy:
              <input
                className="form-input"
                type="number"
                name="spouse_expectancy"
                value={formData.spouse_expectancy}
                onChange={handleChange}
              />
            </label>
          )}

          <label className="form-label">
            Goal:
            <input
              className="form-input"
              type="number"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-label">
            Inflation Rate (%):
            <input
              className="form-input"
              type="number"
              step="0.01"
              name="inflation"
              value={formData.inflation}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-label">
            Use Optimizer:
            <input
              type="checkbox"
              name="optimizer"
              checked={formData.optimizer}
              onChange={handleChange}
            />
          </label>

          <label className="form-label">
            Initial Spending Limit:
            <input
              className="form-input"
              type="number"
              name="initial_limit"
              value={formData.initial_limit}
              onChange={handleChange}
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
