import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";

export default function CreateInvestmentTypes({ scenarios }) {
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
    });
    
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const addInvestmentType = (newInvestmentType) => {
        const currentScenario = scenarios.find(s => s._id === scenario._id);
        currentScenario.investmentTypes.push(newInvestmentType);
        navigate(`/scenario/${scenario._id}`, { state: { scenario: currentScenario}});
    }

    const submit = (e) => {
        e.preventDefault();
        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        };
        const newInvestmentType = {
            _id: Math.floor(Math.random() * 1000) + 1000,
            name: formData.name,
            description: formData.description,
            expectedAnnualReturn: formData.expectedAnnualReturn,
            expenseRatio: formData.expenseRatio,
            expectedAnnualIncome: formData.expectedAnnualIncome,
            taxability: formData.taxability,
        };
        addInvestmentType(newInvestmentType);
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
                <InputField id="taxability" type="checkbox" checked={formData.taxability} onChange={handleInputChange}>Taxable</InputField>

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}