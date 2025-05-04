import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";
import { updateInvestmentType } from "../api/investmentTypeApi";
import { getScenario } from "../api/scenarioApi";
import { updateDistribution } from "../api/distributionApi";

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

    const submit = async (e) => {
        e.preventDefault();
    
        const check = Object.keys(formData).find(
          (key) => formData[key] < 0 && typeof formData[key] === "number"
        );
        if (check) {
          setError(`The ${check} field cannot have a negative value.`);
          return;
        }
    
        try {
          // Update Distribution in DB
          await updateDistribution(formData.expectedAnnualReturn._id, formData.expectedAnnualReturn);
          await updateDistribution(formData.expectedAnnualIncome._id, formData.expectedAnnualIncome);

          //  Update InvestmentType in DB
          await updateInvestmentType(investmentType._id, {
            name: formData.name,
            description: formData.description,
            expectedAnnualReturn: formData.expectedAnnualReturn._id,
            expenseRatio: Number(formData.expenseRatio),
            expectedAnnualIncome: formData.expectedAnnualIncome._id,
            taxability: formData.taxability,
          });

          const target = scenarios.find((s) => s.investmentTypes.some((i) => i._id === investmentType._id));
          const newupdatedScenario = await getScenario(target._id); // refetch from backend
          navigate(`/scenario/${target._id}`, { state: { scenario: newupdatedScenario }});
        } catch (err) {
          console.error("Error updating investment type or scenario:", err);
          setError("An error occurred while saving changes.");
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
                <InputField id="taxability" type="checkbox" checked={formData.taxability} onChange={handleInputChange}>Taxability</InputField>

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}