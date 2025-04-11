import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";

export default function EditInvestmentTypes({ scenarios }) {
    const location = useLocation();
    const navigate = useNavigate();

    const {investmentType} = location.state

    const [formData, setFormData] = useState({
        name: investmentType.name,
        description: investmentType.description,
        expectedAnnualReturn: investmentType.expectedAnnualReturn,
        expenseRatio: investmentType.expenseRatio,
        expectedAnnualIncome: investmentType.expectedAnnualIncome,
        taxability: investmentType.taxability,
    });
    
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const submit = (e) => {
        e.preventDefault();
        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        }
        const target = scenarios.find(s => s.investmentTypes.find(i => i._id === investmentType._id));
        const target_investmentType = target.investmentTypes.find(i => i._id === investmentType._id);
        target_investmentType.name = formData.name;
        target_investmentType.description = formData.description;
        target_investmentType.expectedAnnualReturn = formData.expectedAnnualReturn;
        target_investmentType.expenseRatio = formData.expenseRatio;
        target_investmentType.expectedAnnualIncome = formData.expectedAnnualIncome;
        target_investmentType.taxability = formData.taxability;
        navigate(`/scenario/${target._id}`, { state: { scenario: target }});
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
                <InputField id="taxability" type="checkbox" checked={formData.taxability} onChange={handleInputChange}>Taxability</InputField>

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}