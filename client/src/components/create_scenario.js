import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "./input_field";
import { createScenario, getScenario } from "../api/scenarioApi";
import { getCurrentUser } from "../api/userApi";
import { createInvestmentType } from "../api/investmentTypeApi";
import * as investmentApi from "../api/investmentApi";
import * as eventsApi from "../api/eventsApi";

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
    random: [0, 77, 15, 0, 2.5, 1.9],
  });

  const [error, setError] = useState("");
  const [user, setUser] = useState(null); // State to hold the current user

  // Fetch the current user from the backend
  useEffect(() => {
    getCurrentUser()
      .then((response) => {
        setUser(response.data); // Store the current user data
      })
      .catch((error) => {
        console.log("Error fetching current user:", error);
        setUser(null); // If the user is not logged in, set it to null
      });
  }, []);

  // Load temporary scenario from sessionStorage (if it exists)
  useEffect(() => {
    const savedScenario = sessionStorage.getItem('temporaryScenario');
    if (savedScenario) {
      setFormData(JSON.parse(savedScenario)); // Load it into the form if it exists
    }
  }, []);

  // Save scenario data to sessionStorage whenever formData changes
  useEffect(() => {
    if (formData.name) {
      sessionStorage.setItem('temporaryScenario', JSON.stringify(formData));
    }
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleRadioChange = (e) => {
    setFormData({ ...formData, married: e.target.value });
  };

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

  const addScenario = (newScenario) => {
    scenarios.push(newScenario);
    navigate('/');
  };

  const submit = async (e) => {
    e.preventDefault();
    const check = Object.keys(formData).find((key) => formData[key] < 0);
    if (check) {
      setError(`The ${check} field cannot have a negative value.`);
      return;
    }
    
    const newInvestmentType = {
      name: "Cash",
      description: "",
      expectedAnnualReturn: 0,
      expenseRatio: 0,
      expectedAnnualIncome: 0,
      taxability: false,
      random: [0, 0, 0, 0, 0, 0]
    };
    const investmentTypeResponse = await createInvestmentType(newInvestmentType);
    const createdInvestmentType = investmentTypeResponse.data; // <-- now you have _id

    const newInvestment = {
      investmentType: createdInvestmentType._id,
      value: 0,
      baseValue: 0,
      taxStatus: "non-retirement",
    };
    const investmentResponse = await investmentApi.createInvestment(newInvestment);
    const createdInvestment = investmentResponse.data;
  
    const newAllocation = {
      investment: createdInvestment._id,
      percentage: 0,
      finalPercentage: 0,
      glide: 0
    };

    const allocationResponse = await allocationApi.createAllocation(newAllocation);
    const createdAllocation = allocationResponse.data;
  
    const newInvestEvent = {
      type: "invest",
      name: "Default Invest Event",
      description: "",
      startYear: new Date().getFullYear(),
      duration: 1,
      random: [0, 0, 0, 0, 0, 0],
      allocations: [createdAllocation._id],
      max: 0,
      glide: false
    };
    const eventResponse = await eventsApi.createEvent(newInvestEvent);
    const createdEvent = eventResponse.data;

    const newScenario = {
      user: user ? user._id : null,
      name: formData.name,
      married: formData.married === true || formData.married === "true",
      birthYearUser: formData.birthYearUser,
      birthYearSpouse: formData.birthYearSpouse,
      lifeExpectancyUser: Number(formData.lifeExpectancyUser),
      lifeExpectancySpouse: Number(formData.lifeExpectancySpouse),
      investments: [createdInvestment._id],
      investmentTypes: [createdInvestmentType._id],
      events: [createdEvent._id],
      inflation: Number(formData.inflation),
      annualLimit: Number(formData.annualLimit),
      spendingStrategy: [],
      withdrawalStrategy: [createdInvestment._id],
      rmd: [],
      rothStrategy: [],
      rothYears: [
        new Date().getFullYear(),
        new Date().getFullYear() + Number(formData.lifeExpectancyUser),
      ],
      rothOptimizer: formData.rothOptimizer,
      sharing: formData.sharing,
      financialGoal: Number(formData.financialGoal),
      state: formData.state,
      random: formData.random,
    };

    const createdScenario = await createScenario(newScenario);
    const populatedScenario = await getScenario(createdScenario._id); // fetch with populated data
    sessionStorage.removeItem('temporaryScenario');
    console.log(populatedScenario)
    addScenario(populatedScenario);
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
                {formData.married === "true" && formData.random[0] === 0 && <InputField id="lifeExpectancySpouse" type="number" value={formData.lifeExpectancySpouse} onChange={handleInputChange}>Spouse Life Expectancy (Years)</InputField>}

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
