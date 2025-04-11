import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "./input_field";

export default function CreateScenario({ scenarios }) {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        married: false,
        birthYearUser: 2000,
        birthYearSpouse: 2000,
        lifeExpectancyUser: "",
        lifeExpectancySpouse: "",
        inflation: "",
        annualLimit: "",
        rothOptimizer: false,
        sharing: "",
        financialGoal: "",
        state: "",
    });
    
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const handleRadioChange = (e) => {setFormData({ ...formData, married: e.target.value });};

    const addScenario = (newScenario) => {
        scenarios.push(newScenario);
        navigate('/');
    };

    const submit = (e) => {
        e.preventDefault();
        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        };
        const newInvestmentType = {
            _id: Math.floor(Math.random() * 1000) + 1000,
            name: "Cash",
            description: "",
            expectedAnnualReturn: 0,
            expenseRatio: 0,
            expectedAnnualIncome: 0,
            taxability: false,
        };
        const newInvestment = {
            _id: Math.floor(Math.random() * 1000) + 1000,
            investmentType: newInvestmentType,
            value: 0,
            taxStatus: "non-retirement"
        };
        const newScenario = {
            _id: Math.floor(Math.random() * 1000) + 1000,
            name: formData.name,
            married: formData.married,
            birthYearUser: formData.birthYearUser,
            birthYearSpouse: formData.birthYearSpouse,
            lifeExpectancyUser: formData.lifeExpectancyUser,
            lifeExpectancySpouse: formData.lifeExpectancySpouse,
            investments: [newInvestment],
            investmentTypes: [newInvestmentType],
            events: [],
            inflation: formData.inflation,
            annualLimit: formData.annualLimit,
            spendingStrategy: [],
            withdrawalStrategy: [newInvestment],
            rmd: [],
            rothStrategy: [],
            rothOptimizer: formData.rothOptimizer,
            sharing: formData.sharing,
            financialGoal: formData.financialGoal,
            state: formData.state,
        };
        addScenario(newScenario)
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
                <InputField id="lifeExpectancyUser" type="number" value={formData.lifeExpectancyUser} onChange={handleInputChange}>Life Expectancy (Years)</InputField>

                {formData.married === "true" && <InputField id="birthYearSpouse" type="number" value={formData.birthYearSpouse} onChange={handleInputChange}>Spouse Birth Year</InputField>}
                {formData.married === "true" && <InputField id="lifeExpectancySpouse" type="number" value={formData.lifeExpectancySpouse} onChange={handleInputChange}>Spouse Life Expectancy (Years)</InputField>}

                <InputField id="inflation" type="number" value={formData.inflation} onChange={handleInputChange}>Inflation (%)</InputField>
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