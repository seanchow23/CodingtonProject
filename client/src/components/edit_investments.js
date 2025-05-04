import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";
import * as investmentApi from "../api/investmentApi";
import { updateScenario, getScenario } from "../api/scenarioApi";

export default function EditInvestments({ scenarios }) {
    const location = useLocation();
    const navigate = useNavigate();

    const { investment } = location.state;

    const [formData, setFormData] = useState({
        value: investment.value,
        taxStatus: investment.taxStatus,
    });

    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const submit = async (e) => {
        e.preventDefault();

        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        }

        try {
            // 1. Update the investment in the backend
            await investmentApi.updateInvestment(investment._id, {
                value: Number(formData.value),
                baseValue: Number(formData.value),
                taxStatus: formData.taxStatus,
            });

            // 2. Find the parent scenario with the updated investment
            const target = scenarios.find((s) =>
                s.investments.find((i) => i._id === investment._id)
            );

            if (!target) {
                setError("Scenario not found for this investment.");
                return;
            }

            // 3. Refetch the scenario from backend to ensure fresh state
            const freshScenario = await getScenario(target._id);

            navigate(`/scenario/${target._id}`, { state: { scenario: freshScenario } });

        } catch (err) {
            console.error("Error updating investment or scenario:", err);
            setError("Failed to update investment.");
        }
    };

    return (
        <div id="add_event">
            <form onSubmit={submit}>
                <InputField id="value" type="number" value={formData.value} onChange={handleInputChange}>
                    Value ($)
                </InputField>

                <label htmlFor="taxStatus">Account Type</label>
                <select
                    id="taxStatus"
                    name="taxStatus"
                    value={formData.taxStatus}
                    onChange={handleInputChange}
                    required
                >
                    <option value="non-retirement">non-retirement</option>
                    <option value="pre-tax retirement">pre-tax retirement</option>
                    <option value="after-tax retirement">after-tax retirement</option>
                </select>

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    );
}
