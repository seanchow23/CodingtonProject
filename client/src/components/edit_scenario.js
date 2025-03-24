import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "./navBar";

const EditScenario = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    married: false,
    dob: "",
    spouse_dob: "",
    life_expectancy: "",
    spouse_expectancy: 0,
    goal: "",
    inflation: "",
    optimizer: false,
    initial_limit: ""
  });

  useEffect(() => {
    if (state?.scenario) {
      setFormData(state.scenario);
    } else {
      // Fetch logic can go here if needed
      console.warn("No scenario data provided.");
    }
  }, [state]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated scenario:", formData);
    alert("Scenario updated!");
    // Optional: Redirect or save to backend
  };

  return (
    <div className="home-container">
      <main className="home-main">
        <h1 className="home-title">Edit Scenario</h1>
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
              type="date"
              className="form-input"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </label>

          {formData.married && (
            <label className="form-label">
              Spouse Date of Birth:
              <input
                type="date"
                className="form-input"
                name="spouse_dob"
                value={formData.spouse_dob}
                onChange={handleChange}
              />
            </label>
          )}

          <label className="form-label">
            Life Expectancy:
            <input
              type="number"
              className="form-input"
              name="life_expectancy"
              value={formData.life_expectancy}
              onChange={handleChange}
            />
          </label>

          {formData.married && (
            <label className="form-label">
              Spouse Life Expectancy:
              <input
                type="number"
                className="form-input"
                name="spouse_expectancy"
                value={formData.spouse_expectancy}
                onChange={handleChange}
              />
            </label>
          )}

          <label className="form-label">
            Goal:
            <input
              type="number"
              className="form-input"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
            />
          </label>

          <label className="form-label">
            Inflation Rate (%):
            <input
              type="number"
              step="0.01"
              className="form-input"
              name="inflation"
              value={formData.inflation}
              onChange={handleChange}
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
              type="number"
              className="form-input"
              name="initial_limit"
              value={formData.initial_limit}
              onChange={handleChange}
            />
          </label>

          <button type="submit" className="create-button">Save Changes</button>
        </form>
      </main>
    </div>
  );
};

export default EditScenario;
