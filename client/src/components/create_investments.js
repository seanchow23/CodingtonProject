import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";
import * as investmentApi from "../api/investmentApi";
import * as scenarioApi from "../api/scenarioApi";
import * as allocationApi from "../api/allocationApi";

export default function CreateInvestments({ scenarios }) {
    const location = useLocation();
    const navigate = useNavigate();

    const {scenario} = location.state
    const investmentTypes = scenario.investmentTypes

    const [formData, setFormData] = useState({
        investmentType: "",
        value: "",
        taxStatus: ""
    });
    
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const addInvestment = async (newInvestment) => {
        const currentScenario = scenarios.find(s => s._id === scenario._id);
        currentScenario.investments.push(newInvestment);
        currentScenario.withdrawalStrategy.push(newInvestment);
      
        if (newInvestment.taxStatus === 'pre-tax retirement') {
          currentScenario.rmd.push(newInvestment);
          currentScenario.rothStrategy.push(newInvestment);
        } else {
          const newAllocationData = {
            investment: newInvestment._id,
            percentage: 0,
            finalPercentage: 0,
            glide: 0,
          };
      
          try {
            const allocationResponse = await allocationApi.createAllocation(newAllocationData);
            const savedAllocation = allocationResponse.data;
      
            // Push saved allocation into each 'invest' event
            currentScenario.events
              .filter(event => event.type === 'invest')
              .forEach(event => event.allocations.push(savedAllocation._id)); // use _id, not full object
      
          } catch (err) {
            console.error("Failed to create allocation:", err);
            setError("Failed to create allocation for the investment.");
            return;
          }
        }
      
        try {
          await scenarioApi.updateScenario(currentScenario._id, currentScenario);
          navigate(`/scenario/${currentScenario._id}`, { state: { scenario: currentScenario }});
        } catch (err) {
          console.error("Failed to update scenario:", err);
          setError("Failed to update scenario with new investment.");
        }
      };
      
    

    const submit = async (e) => {
        e.preventDefault();
        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        };
        try {
            // Build the investment object to send to API
            const investmentToCreate = {
                investmentType: investmentTypes[formData.investmentType]._id, // send ID
                value: Number(formData.value),
                baseValue: Number(formData.value),
                taxStatus: formData.taxStatus
            };
    
            const response = await investmentApi.createInvestment(investmentToCreate);
            const newInvestment = response.data; // full saved investment w/ _id
    
            await addInvestment(newInvestment); // use real data from backend
        } catch (err) {
            console.error("Failed to create investment:", err);
            setError("Failed to create investment.");
        }
    };

    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <label htmlFor="investmentType">Select Investment Type*</label>
                <select id="investmentType" name="investmentType" value={formData.investmentType} onChange={handleInputChange} required>
                    <option value="">--Select Investment Type--</option>
                    {investmentTypes.map((investmentType, index) => (<option key={index} value={index}>{investmentType.name}</option>))}
                </select>

                <InputField id="value" type="number" value={formData.value} onChange={handleInputChange}>Value ($)</InputField>

                <label htmlFor="taxStatus">Account Type</label>
                <select id="taxStatus" name="taxStatus" value={formData.taxStatus} onChange={handleInputChange} required>
                    <option value="">--Select Account Type--</option>
                    <option value="non-retirement">non-retirement</option>
                    <option value="pre-tax retirement">pre-tax retirement</option>
                    <option value="after-tax retirement">after-tax retirement</option>
                </select>

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}