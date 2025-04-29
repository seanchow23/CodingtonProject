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
        taxability: false,
        random: [0, 0, 0, 0, 0, 0],
    });
    
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const handleRandom = (e) => {
        const { name, value, checked } = e.target;
        if (name === "random_return") {
            setFormData({ ...formData, random: [checked ? 1 : 0, formData.random[1], formData.random[2], formData.random[3], formData.random[4], formData.random[5]] });
        } else if (name === "mean_return") {
            setFormData({ ...formData, random: [formData.random[0], Number(value), formData.random[2], formData.random[3], formData.random[4], formData.random[5]] });
        } else if (name === "sd_return") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], Number(value), formData.random[3], formData.random[4], formData.random[5]] });
        } else if (name === "random_income") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], formData.random[2], checked ? 1 : 0, formData.random[4], formData.random[5]] });
        } else if (name === "mean_income") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], formData.random[2], formData.random[3], Number(value), formData.random[5]] });
        } else if (name === "sd_income") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], formData.random[2], formData.random[3], formData.random[4], Number(value)] });
        }
    }

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
            expectedAnnualReturn: Number(formData.expectedAnnualReturn),
            expenseRatio: Number(formData.expenseRatio),
            expectedAnnualIncome: Number(formData.expectedAnnualIncome),
            taxability: formData.taxability,
            random: formData.random,
        };
        addInvestmentType(newInvestmentType);
    };

    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <InputField id="name" type="text" value={formData.name} onChange={handleInputChange}>Investment Name</InputField>

                <label htmlFor="description">Description</label>
                <textarea type="text" id="description" name="description" value={formData.description} onChange={handleInputChange}></textarea>

                {formData.random[0] === 0 && <InputField id="expectedAnnualReturn" type="number" value={formData.expectedAnnualReturn} onChange={handleInputChange}>Expected Annual Return (%)</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_return">Annual Return Sampling</label>
                    <input type="checkbox" id="random_return" name="random_return" value={formData.random[0] === 0} onChange={handleRandom} style={{ marginBottom: '15px' }}/>
                </div>
                {formData.random[0] !== 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="mean_return" style={{ marginBottom: '20px' }}>Mean</label>
                    <input type="number" name="mean_return" value={formData.random[1]} onChange={handleRandom} required />
                    <label htmlFor="sd_return" style={{ marginBottom: '20px' }}>Standard Deviation</label>
                    <input type="number" name="sd_return" value={formData.random[2]} onChange={handleRandom} required />
                </div>}

                {formData.random[3] === 0 && <InputField id="expectedAnnualIncome" type="number" value={formData.expectedAnnualIncome} onChange={handleInputChange}>Expected Annual Income ($)</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_income">Annual Return Sampling</label>
                    <input type="checkbox" id="random_income" name="random_income" value={formData.random[0] === 0} onChange={handleRandom} style={{ marginBottom: '15px' }}/>
                </div>
                {formData.random[3] !== 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="mean_income" style={{ marginBottom: '20px' }}>Mean</label>
                    <input type="number" name="mean_income" value={formData.random[4]} onChange={handleRandom} required />
                    <label htmlFor="sd_income" style={{ marginBottom: '20px' }}>Standard Deviation</label>
                    <input type="number" name="sd_income" value={formData.random[5]} onChange={handleRandom} required />
                </div>}

                <InputField id="expenseRatio" type="number" value={formData.expenseRatio} onChange={handleInputChange}>Expense Ratio (%)</InputField>
                <InputField id="taxability" type="checkbox" checked={formData.taxability} onChange={handleInputChange}>Taxable</InputField>

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}