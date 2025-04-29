import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";

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
        const { name, value, checked } = e.target;
        if (name === "random_life") {
            setFormData({ ...formData, random: [checked ? 1 : 0, formData.random[1], formData.random[2], formData.random[3], formData.random[4], formData.random[5]] });
        } else if (name === "mean") {
            setFormData({ ...formData, random: [formData.random[0], Number(value), formData.random[2], formData.random[3], formData.random[4], formData.random[5]] });
        } else if (name === "sd") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], Number(value), formData.random[3], formData.random[4], formData.random[5]] });
        } else if (name === "random_inflation") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], formData.random[2], checked ? 1 : 0, formData.random[4], formData.random[5]] });
        } else if (name === "mean_inflation") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], formData.random[2], formData.random[3], Number(value), formData.random[5]] });
        } else if (name === "sd_inflation") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], formData.random[2], formData.random[3], formData.random[4], Number(value)] });
        }
    }

    const submit = (e) => {
        e.preventDefault();
        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        }
        const target = scenarios.find(s => s._id === scenario._id)
        target.name = formData.name;
        target.married = formData.married;
        target.birthYearUser = formData.birthYearUser;
        target.birthYearSpouse = formData.birthYearSpouse;
        target.lifeExpectancyUser = Number(formData.lifeExpectancyUser);
        target.lifeExpectancySpouse = Number(formData.lifeExpectancySpouse);
        target.inflation = Number(formData.inflation);
        target.annualLimit = Number(formData.annualLimit);
        target.rothOptimizer = formData.rothOptimizer,
        target.financialGoal = Number(formData.financialGoal);
        target.state = formData.state;
        target.random = formData.random;
        navigate(`/scenario/${target._id}`, { state: { scenario: target }});
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
                {formData.random[0] === 0 && <InputField id="lifeExpectancyUser" type="number" value={formData.lifeExpectancyUser} onChange={handleInputChange}>Life Expectancy (Years)</InputField>}
                    <div style={{ display: 'flex', gap: '10px'}}>
                        <label htmlFor="random_life">Life Expectancy Sampling</label>
                        <input type="checkbox" id="random_life" name="random_life" value={formData.random[0] === 0} onChange={handleRandom} style={{ marginBottom: '15px' }}/>
                    </div>
                    {formData.random[0] !== 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <label htmlFor="mean" style={{ marginBottom: '20px' }}>Mean</label>
                        <input type="number" name="mean" value={formData.random[1]} onChange={handleRandom} required />
                        <label htmlFor="sd" style={{ marginBottom: '20px' }}>Standard Deviation</label>
                        <input type="number" name="sd" value={formData.random[2]} onChange={handleRandom} required />
                    </div>}

                {formData.married === "true" && <InputField id="birthYearSpouse" type="number" value={formData.birthYearSpouse} onChange={handleInputChange}>Spouse Birth Year</InputField>}
                {formData.married === "true" && <InputField id="lifeExpectancySpouse" type="number" value={formData.lifeExpectancySpouse} onChange={handleInputChange}>Spouse Life Expectancy (Years)</InputField>}

                {formData.random[3] === 0 && <InputField id="inflation" type="number" value={formData.inflation} onChange={handleInputChange}>Inflation (%)</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_inflation">Inflation Sampling</label>
                    <input type="checkbox" id="random_inflation" name="random_inflation" value={formData.random[3] === 0} onChange={handleRandom} style={{ marginBottom: '15px' }}/>
                </div>
                {formData.random[3] !== 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="mean_inflation" style={{ marginBottom: '20px' }}>Mean</label>
                    <input type="number" name="mean_inflation" value={formData.random[4]} onChange={handleRandom} required />
                    <label htmlFor="sd_inflation" style={{ marginBottom: '20px' }}>Standard Deviation</label>
                    <input type="number" name="sd_inflation" value={formData.random[5]} onChange={handleRandom} required />
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
