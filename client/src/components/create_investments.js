import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";

export default function CreateInvestments({ scenarios }) {
    const location = useLocation();
    const navigate = useNavigate();

    const {scenario} = location.state

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        expectedAnnualReturn: "",
        expenseRatio: "",
        expectedAnnualIncome: "",
        taxability: "",
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
        }
        navigate(`/scenario/${scenario._id}`, { state: { scenario: currentScenario}});
    }

    const submit = (e) => {
        e.preventDefault();
        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        }
        const newInvestmentType = {
            _id: Math.floor(Math.random() * 1000) + 1000,
            name: formData.name,
            description: formData.description,
            expectedAnnualReturn: formData.expectedAnnualReturn,
            expenseRatio: formData.expenseRatio,
            expectedAnnualIncome: formData.expectedAnnualIncome,
            taxability: formData.taxability,
        }
        const newInvestment = {
            _id: Math.floor(Math.random() * 1000) + 1000,
            investmentType: newInvestmentType,
            value: formData.value,
            taxStatus: formData.taxStatus
        };
        addInvestment(newInvestment);
    };

    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <InputField id="name" type="text" value={formData.name} onChange={handleInputChange}>Investment Name</InputField>

                <label htmlFor="description">Description</label>
                <textarea type="text" id="description" name="description" value={formData.description} onChange={handleInputChange}></textarea>

                <InputField id="expectedAnnualReturn" type="number" value={formData.expectedAnnualReturn} onChange={handleInputChange}>Expected Annual Return (%)</InputField>
                <InputField id="expectedAnnualIncome" type="number" value={formData.expectedAnnualIncome} onChange={handleInputChange}>Expected Annual Income ($)</InputField>
                <InputField id="expenseRatio" type="number" value={formData.expenseRatio} onChange={handleInputChange}>Expense Ratio (%)</InputField>
                <InputField id="value" type="number" value={formData.value} onChange={handleInputChange}>Value ($)</InputField>
                <InputField id="taxability" type="checkbox" checked={formData.taxability} onChange={handleInputChange}>Taxability</InputField>

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