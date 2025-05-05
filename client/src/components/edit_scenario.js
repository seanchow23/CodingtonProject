import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";
import * as scenarioApi from "../api/scenarioApi";
import * as userApi from "../api/userApi";

export default function EditScenario({ scenarios }) {
    const location = useLocation()
    const navigate = useNavigate();
    
    const {scenario} = location.state

    const [formData, setFormData] = useState({
        name: scenario.name,
        married: scenario.married,
        birthYearUser: scenario.birthYearUser,
        birthYearSpouse: scenario.birthYearSpouse,
        lifeExpectancyUser: scenario.lifeExpectancyUser,
        lifeExpectancySpouse: scenario.lifeExpectancySpouse,
        inflation: scenario.inflation,
        annualLimit: scenario.annualLimit,
        rothOptimizer: scenario.rothOptimizer,
        financialGoal: scenario.financialGoal,
        state: scenario.state,
        random: scenario.random,
    });
    
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const handleRadioChange = (e) => {setFormData({ ...formData, married: e.target.value });};

    const handleRandom = (e) => {
        const { name, value } = e.target;
        let distribution;
        if (name === "random_life") {
          distribution = { ...formData.lifeExpectancyUser, type: value };
          setFormData({ ...formData, lifeExpectancyUser: distribution });
        } else if (name === "random_spouse") {
          distribution = { ...formData.lifeExpectancySpouse, type: value };
          setFormData({ ...formData, lifeExpectancySpouse: distribution });
        } else if (name === "random_inflation") {
          distribution = { ...formData.inflation, type: value };
          setFormData({ ...formData, inflation: distribution });
        } else if (name === "uv1") {
          distribution = { ...formData.lifeExpectancyUser, value1: Number(value) };
          setFormData({ ...formData, lifeExpectancyUser: distribution });
        } else if (name === "uv2") {
          distribution = { ...formData.lifeExpectancyUser, value2: Number(value) };
          setFormData({ ...formData, lifeExpectancyUser: distribution });
        } else if (name === "sv1") {
          distribution = { ...formData.lifeExpectancySpouse, value1: Number(value) };
          setFormData({ ...formData, lifeExpectancySpouse: distribution });
        } else if (name === "sv2") {
          distribution = { ...formData.lifeExpectancySpouse, value2: Number(value) };
          setFormData({ ...formData, lifeExpectancySpouse: distribution });
        } else if (name === "iv1") {
          distribution = { ...formData.inflation, value1: Number(value) };
          setFormData({ ...formData, inflation: distribution });
        } else if (name === "iv2") {
          distribution = { ...formData.inflation, value2: Number(value) };
          setFormData({ ...formData, inflation: distribution });
        } else if (name === "lifeExpectancyUser") {
          distribution = { ...formData.lifeExpectancyUser, value1: Number(value) };
          setFormData({ ...formData, lifeExpectancyUser: distribution });
        } else if (name === "lifeExpectancySpouse") {
          distribution = { ...formData.lifeExpectancySpouse, value1: Number(value) };
          setFormData({ ...formData, lifeExpectancySpouse: distribution });
        } else if (name === "inflation") {
          distribution = { ...formData.inflation, value1: Number(value) };
          setFormData({ ...formData, inflation: distribution });
        }
    }

    const submit = async (e) => {
      e.preventDefault();
    
      const check = Object.keys(formData).find((key) => formData[key] < 0);
      if (check) {
        setError(`The ${check} field cannot have a negative value.`);
        return;
      }
    
      const updatedScenario = {
        name: formData.name,
        married: formData.married,
        birthYearUser: formData.birthYearUser,
        birthYearSpouse: formData.birthYearSpouse,
        lifeExpectancyUser: formData.lifeExpectancyUser,
        lifeExpectancySpouse: formData.lifeExpectancySpouse,
        inflation: formData.inflation,
        annualLimit: Number(formData.annualLimit),
        rothOptimizer: formData.rothOptimizer,
        financialGoal: Number(formData.financialGoal),
        state: formData.state,
        random: formData.random
      };
    
      try {
        await scenarioApi.updateScenario(scenario._id, updatedScenario);
      
        // Fetch full updated scenario (populated)
        const updatedFullScenario = await scenarioApi.getScenario(scenario._id);

        // If user is not logged in, update it in localStorage
        const user = await userApi.getCurrentUser().catch(() => null);
        if (!user) {
          const localScenarios = JSON.parse(localStorage.getItem("localScenarios")) || [];
          const updatedList = localScenarios.map(s =>
            s._id === updatedFullScenario._id ? updatedFullScenario : s
          );
          localStorage.setItem("localScenarios", JSON.stringify(updatedList));
        }
      
        // Navigate with updated data
        navigate(`/scenario/${scenario._id}`, {
          state: { scenario: updatedFullScenario }
        });
      } catch (err) {
        console.error("Failed to update scenario:", err);
        setError("Scenario update failed.");
      }
      
    };
    

    const states = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
        "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
        "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
        "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
        "Wisconsin", "Wyoming",
    ];

    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <InputField id="name" type="text" value={formData.name} onChange={handleInputChange}>Scenario Name</InputField>
                
                <label htmlFor="married">Marital Status*</label>
                <input type="radio" name="married" value={false} onChange={handleRadioChange} required/> Single
                <input type="radio" name="married" value={true} onChange={handleRadioChange} /> Married

                <InputField id="birthYearUser" type="number" value={formData.birthYearUser} onChange={handleInputChange}>Birth Year</InputField>
                {formData.lifeExpectancyUser.type === "fixed" && <InputField id="lifeExpectancyUser" type="number" value={formData.lifeExpectancyUser.value1} onChange={handleRandom}>Life Expectancy (Years)</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_life">Life Expectancy Sampling</label>
                    <select name="random_life" value={formData.lifeExpectancyUser.type} onChange={handleRandom}>
                        <option value={"fixed"}>Fixed</option>
                        <option value={"normal"}>Normal Distribution</option>
                        <option value={"uniform"}>Uniform Distribution</option>
                    </select>
                </div>
                {formData.lifeExpectancyUser.type !== "fixed" && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="uv1" style={{ marginBottom: '20px' }}>{formData.lifeExpectancyUser.type === "normal" ? "Mean" : "Min"}</label>
                    <input type="number" name="uv1" value={formData.lifeExpectancyUser.value1} onChange={handleRandom} required />
                    <label htmlFor="uv2" style={{ marginBottom: '20px' }}>{formData.lifeExpectancyUser.type === "normal" ? "Standard Deviation" : "Max"}</label>
                    <input type="number" name="uv2" value={formData.lifeExpectancyUser.value2} onChange={handleRandom} required />
                </div>}

                {formData.married === "true" && <InputField id="birthYearSpouse" type="number" value={formData.birthYearSpouse} onChange={handleInputChange}>Spouse Birth Year</InputField>}
                {formData.married === "true" && formData.lifeExpectancySpouse.type === "fixed" && <InputField id="lifeExpectancySpouse" type="number" value={formData.lifeExpectancySpouse.value1} onChange={handleRandom}>Spouse Life Expectancy (Years)</InputField>}
                {formData.married === "true" && <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_spouse">Life Expectancy Sampling</label>
                    <select name="random_spouse" value={formData.lifeExpectancySpouse.type} onChange={handleRandom}>
                        <option value={"fixed"}>Fixed</option>
                        <option value={"normal"}>Normal Distribution</option>
                        <option value={"uniform"}>Uniform Distribution</option>
                    </select>
                </div>}
                {formData.married === "true" && formData.lifeExpectancySpouse.type !== "fixed" && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="sv1" style={{ marginBottom: '20px' }}>{formData.lifeExpectancySpouse.type === "normal" ? "Mean" : "Min"}</label>
                    <input type="number" name="sv1" value={formData.lifeExpectancySpouse.value1} onChange={handleRandom} required />
                    <label htmlFor="sv2" style={{ marginBottom: '20px' }}>{formData.lifeExpectancySpouse.type === "normal" ? "Standard Deviation" : "Max"}</label>
                    <input type="number" name="sv2" value={formData.lifeExpectancySpouse.value2} onChange={handleRandom} required />
                </div>}

                {formData.inflation.type === "fixed" && <InputField id="inflation" type="number" value={formData.inflation.value1} onChange={handleRandom}>Inflation (%)</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_inflation">Inflation Sampling</label>
                    <select name="random_inflation" value={formData.inflation.type} onChange={handleRandom}>
                        <option value={"fixed"}>Fixed</option>
                        <option value={"normal"}>Normal Distribution</option>
                        <option value={"uniform"}>Uniform Distribution</option>
                    </select>
                </div>
                {formData.inflation.type !== "fixed" && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="iv1" style={{ marginBottom: '20px' }}>{formData.inflation.type === "normal" ? "Mean" : "Min"}</label>
                    <input type="number" name="iv1" value={formData.inflation.value1} onChange={handleRandom} required />
                    <label htmlFor="iv2" style={{ marginBottom: '20px' }}>{formData.inflation.type === "normal" ? "Standard Deviation" : "Max"}</label>
                    <input type="number" name="iv2" value={formData.inflation.value2} onChange={handleRandom} required />
                </div>}

                <InputField id="annualLimit" type="number" value={formData.annualLimit} onChange={handleInputChange}>Annual Contribution Limit ($)</InputField>

                <InputField id="rothOptimizer" type="checkbox" checked={formData.rothOptimizer} onChange={handleInputChange}>Roth Optimizer</InputField>
                <InputField id="financialGoal" type="number" value={formData.financialGoal} onChange={handleInputChange}>Financial Goal ($)</InputField>

                <label htmlFor="state">State of Residence</label>
                <select id="state" name="state" value={formData.state} onChange={handleInputChange} required>
                    <option value="">--Select a State--</option>
                    {states.map((state, index) => (<option key={index} value={state}>{state}</option>))}
                </select>

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>      
    )
}
