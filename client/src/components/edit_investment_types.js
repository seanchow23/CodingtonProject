import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";
import { updateInvestmentType } from "../api/investmentTypeApi";
import { updateScenario } from "../api/scenarioApi";
import { getScenario } from "../api/scenarioApi";

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
        random: investmentType.random,
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
          //  Update InvestmentType in DB
          await updateInvestmentType(investmentType._id, {
            name: formData.name,
            description: formData.description,
            expectedAnnualReturn: Number(formData.expectedAnnualReturn),
            expenseRatio: Number(formData.expenseRatio),
            expectedAnnualIncome: Number(formData.expectedAnnualIncome),
            taxability: formData.taxability,
            random: formData.random,
          });
    
          //  Update Scenario with correct structure
          const target = scenarios.find((s) =>
            s.investmentTypes.some((i) => i._id === investmentType._id)
          );
    
          const updatedScenario = {
            ...target,
            investments: target.investments.map((i) => i._id),
            investmentTypes: target.investmentTypes.map((i) => i._id),
            events: target.events.map((e) => e._id),
            spendingStrategy: target.spendingStrategy.map((e) => e._id),
            withdrawalStrategy: target.withdrawalStrategy.map((i) => i._id),
            rmd: target.rmd.map((i) => i._id),
            rothStrategy: target.rothStrategy.map((i) => i._id),
          };
    
          await updateScenario(target._id, updatedScenario);
    
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
                    <label htmlFor="random_income">Annual Income Sampling</label>
                    <input type="checkbox" id="random_income" name="random_income" value={formData.random[0] === 0} onChange={handleRandom} style={{ marginBottom: '15px' }}/>
                </div>
                {formData.random[3] !== 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="mean_income" style={{ marginBottom: '20px' }}>Mean</label>
                    <input type="number" name="mean_income" value={formData.random[4]} onChange={handleRandom} required />
                    <label htmlFor="sd_income" style={{ marginBottom: '20px' }}>Standard Deviation</label>
                    <input type="number" name="sd_income" value={formData.random[5]} onChange={handleRandom} required />
                </div>}

                <InputField id="expenseRatio" type="number" value={formData.expenseRatio} onChange={handleInputChange}>Expense Ratio (%)</InputField>
                <InputField id="taxability" type="checkbox" checked={formData.taxability} onChange={handleInputChange}>Taxability</InputField>

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}