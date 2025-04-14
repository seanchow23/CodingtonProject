import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";

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

    const addInvestment = (newInvestment) => {
        const currentScenario = scenarios.find(s => s._id === scenario._id);
        currentScenario.investments.push(newInvestment);
        currentScenario.withdrawalStrategy.push(newInvestment);
        if (newInvestment.taxStatus === 'pre-tax retirement') {
            currentScenario.rmd.push(newInvestment);
            currentScenario.rothStrategy.push(newInvestment);
        } else {
            const newAllocation = {
                _id: Math.floor(Math.random() * 1000) + 1000,
                investment: newInvestment,
                percentage: 0
            }
            currentScenario.events.filter(event => event.type === 'invest').map(event => event.allocations.push(newAllocation))
        }
        navigate(`/scenario/${scenario._id}`, { state: { scenario: currentScenario}});
    }

    const submit = (e) => {
        e.preventDefault();
        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        };
        const newInvestment = {
            _id: Math.floor(Math.random() * 1000) + 1000,
            investmentType: investmentTypes[formData.investmentType],
            value: Number(formData.value),
            baseValue: Number(formData.value),
            taxStatus: formData.taxStatus
        };
        addInvestment(newInvestment);
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