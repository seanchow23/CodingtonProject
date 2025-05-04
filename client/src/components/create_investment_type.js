import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";
import { createInvestmentType } from "../api/investmentTypeApi";
import * as scenarioApi from "../api/scenarioApi"
import { createDistribution } from "../api/distributionApi";

export default function CreateInvestmentTypes({ scenarios }) {
    const location = useLocation();
    const navigate = useNavigate();

    const {scenario} = location.state

    const return_distribution = {
        type: "fixed",
        value1: 0,
        value2: 0,
    }

    const income_distribution = {
        type: "fixed",
        value1: 0,
        value2: 0,
    }

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        expectedAnnualReturn: return_distribution,
        expenseRatio: "",
        expectedAnnualIncome: income_distribution,
        taxability: false,
    });
    
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const handleRandom = (e) => {
        const { name, value, checked } = e.target;
        if (name === "random_return") {
            setFormData({ ...formData, expectedAnnualReturn: { ...formData.expectedAnnualReturn, type: checked ? "normal" : "fixed" } });
        } else if (name === "mean_return") {
            setFormData({ ...formData, expectedAnnualReturn: { ...formData.expectedAnnualReturn, value1: Number(value) } });
        } else if (name === "sd_return") {
            setFormData({ ...formData, expectedAnnualReturn: { ...formData.expectedAnnualReturn, value2: Number(value) } });
        } else if (name === "random_income") {
            setFormData({ ...formData, expectedAnnualIncome: { ...formData.expectedAnnualIncome, type: checked ? "normal" : "fixed" } });
        } else if (name === "mean_income") {
            setFormData({ ...formData, expectedAnnualIncome: { ...formData.expectedAnnualIncome, value1: Number(value) } });
        } else if (name === "sd_income") {
            setFormData({ ...formData, expectedAnnualIncome: { ...formData.expectedAnnualIncome, value2: Number(value) } });
        } else if (name === "expectedAnnualReturn") {
            setFormData({ ...formData, expectedAnnualReturn: { ...formData.expectedAnnualReturn, value1: Number(value) } });
        } else if (name === "expectedAnnualIncome") {
            setFormData({ ...formData, expectedAnnualIncome: { ...formData.expectedAnnualIncome, value1: Number(value) } });
        }
    }

    const addInvestmentType = async (newInvestmentType) => {
        try {
            const currentScenario = await scenarioApi.getScenarioUnpop(scenarios.find(s => s._id === scenario._id)._id);
            currentScenario.investmentTypes.push(newInvestmentType._id);
            await scenarioApi.updateScenario(currentScenario._id, currentScenario);
            const updatedScenario = await scenarioApi.getScenario(currentScenario._id);
            navigate(`/scenario/${updatedScenario._id}`, { state: { scenario: updatedScenario } });
        } catch (err) {
            console.error("Failed to add investment type:", err);
            setError("An error occurred while adding the investment type.");
        }
    }

    const submit = async (e) => {
        e.preventDefault();
        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        };

        const returnDistributionResponse = await createDistribution(formData.expectedAnnualReturn);
        const returnDistribution = returnDistributionResponse.data;
        const incomeDistributionResponse = await createDistribution(formData.expectedAnnualIncome);
        const incomeDistribution = incomeDistributionResponse.data;

        const newInvestmentType = {
            name: formData.name,
            description: formData.description,
            expectedAnnualReturn: returnDistribution._id,
            expenseRatio: Number(formData.expenseRatio),
            expectedAnnualIncome: incomeDistribution._id,
            taxability: formData.taxability,
            random: formData.random,
        };

        try {
            const response = await createInvestmentType(newInvestmentType);
            const savedType = response.data;
            await addInvestmentType(savedType);
        } catch (err) {
            console.error("Failed to create investment type:", err);
            setError("An error occurred while saving the investment type.");
        }
    };

    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <InputField id="name" type="text" value={formData.name} onChange={handleInputChange}>Investment Name</InputField>

                <label htmlFor="description">Description</label>
                <textarea type="text" id="description" name="description" value={formData.description} onChange={handleInputChange}></textarea>

                {formData.expectedAnnualReturn.type === "fixed" && <InputField id="expectedAnnualReturn" type="number" value={formData.expectedAnnualReturn.value1} onChange={handleRandom}>Expected Annual Return (%)</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_return">Annual Return Sampling</label>
                    <input type="checkbox" id="random_return" name="random_return" value={formData.expectedAnnualReturn.type === "normal"} onChange={handleRandom} style={{ marginBottom: '15px' }}/>
                </div>
                {formData.expectedAnnualReturn.type === "normal" && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="mean_return" style={{ marginBottom: '20px' }}>Mean</label>
                    <input type="number" name="mean_return" value={formData.expectedAnnualReturn.value1} onChange={handleRandom} required />
                    <label htmlFor="sd_return" style={{ marginBottom: '20px' }}>Standard Deviation</label>
                    <input type="number" name="sd_return" value={formData.expectedAnnualReturn.value2} onChange={handleRandom} required />
                </div>}

                {formData.expectedAnnualIncome.type === "fixed" && <InputField id="expectedAnnualIncome" type="number" value={formData.expectedAnnualIncome.value1} onChange={handleRandom}>Expected Annual Income ($)</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_income">Annual Income Sampling</label>
                    <input type="checkbox" id="random_income" name="random_income" value={formData.expectedAnnualIncome.type === "normal"} onChange={handleRandom} style={{ marginBottom: '15px' }}/>
                </div>
                {formData.expectedAnnualIncome.type === "normal" && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="mean_income" style={{ marginBottom: '20px' }}>Mean</label>
                    <input type="number" name="mean_income" value={formData.expectedAnnualIncome.value1} onChange={handleRandom} required />
                    <label htmlFor="sd_income" style={{ marginBottom: '20px' }}>Standard Deviation</label>
                    <input type="number" name="sd_income" value={formData.expectedAnnualIncome.value2} onChange={handleRandom} required />
                </div>}

                <InputField id="expenseRatio" type="number" value={formData.expenseRatio} onChange={handleInputChange}>Expense Ratio (%)</InputField>
                <InputField id="taxability" type="checkbox" checked={formData.taxability} onChange={handleInputChange}>Taxable</InputField>

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}