import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "./input_field";
import { createScenario, getScenario } from "../api/scenarioApi";
import { getCurrentUser } from "../api/userApi";
import { createInvestmentType } from "../api/investmentTypeApi";
import * as allocationApi from "../api/allocationApi";
import * as investmentApi from "../api/investmentApi";
import * as eventsApi from "../api/eventsApi";
import * as distributionApi from "../api/distributionApi";

export default function CreateScenario({ scenarios }) {
  const navigate = useNavigate();

  const lifeDistribution = {
    type: "fixed",
    value1: 0,
    value2: 0,
  }
  const spouseDistribution = {
    type: "fixed",
    value1: 0,
    value2: 0,
  }
  const inflationDistribution = {
    type: "fixed",
    value1: 0,
    value2: 0,
  }

  const [formData, setFormData] = useState({
    name: "",
    married: false,
    birthYearUser: 2000,
    birthYearSpouse: 2000,
    lifeExpectancyUser: lifeDistribution,
    lifeExpectancySpouse: spouseDistribution,
    inflation: inflationDistribution,
    annualLimit: "",
    rothOptimizer: false,
    sharing: "",
    financialGoal: "",
    state: "",
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

    const lifeDistributionResponse = await distributionApi.createDistribution(formData.lifeExpectancyUser);
    const createdLifeDistribution = lifeDistributionResponse.data;
    const spouseDistributionResponse = await distributionApi.createDistribution(formData.lifeExpectancySpouse);
    const createdSpouseDistribution = spouseDistributionResponse.data;
    const inflationDistributionResponse = await distributionApi.createDistribution(formData.inflation);
    const createdInflationDistribution = inflationDistributionResponse.data;

    const newScenario = {
      user: user ? user._id : null,
      name: formData.name,
      married: formData.married === true || formData.married === "true",
      birthYearUser: formData.birthYearUser,
      birthYearSpouse: formData.birthYearSpouse,
      lifeExpectancyUser: createdLifeDistribution,
      lifeExpectancySpouse: createdSpouseDistribution,
      investments: [createdInvestment._id],
      investmentTypes: [createdInvestmentType._id],
      events: [createdEvent._id],
      inflation: createdInflationDistribution,
      annualLimit: Number(formData.annualLimit),
      spendingStrategy: [],
      withdrawalStrategy: [createdInvestment._id],
      rmd: [],
      rothStrategy: [],
      rothYears: [
        new Date().getFullYear(),
        new Date().getFullYear() + (formData.lifeExpectancyUser.value1), // 1000 is a placeholder for the end year. need to account for randomness
      ],
      rothOptimizer: formData.rothOptimizer,
      sharing: formData.sharing,
      financialGoal: Number(formData.financialGoal),
      state: formData.state,
    };

    const createdScenario = await createScenario(newScenario);
    const populatedScenario = await getScenario(createdScenario._id); // fetch with populated data
    sessionStorage.removeItem('temporaryScenario');
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
