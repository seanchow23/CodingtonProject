import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";

export default function EditInvestments({ scenarios }) {
    const location = useLocation();
    const navigate = useNavigate();

    const {investment} = location.state

    const [formData, setFormData] = useState({
        value: investment.value,
        taxStatus: investment.taxStatus,
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
        const target = scenarios.find(s => s.investments.find(i => i._id === investment._id));
        const target_investment = target.investments.find(i => i._id === investment._id);
        target_investment.value = formData.value;
        target_investment.baseValue = formData.value;
        target_investment.taxStatus = formData.taxStatus;
        navigate(`/scenario/${target._id}`, { state: { scenario: target }});
    };

    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <InputField id="value" type="number" value={formData.value} onChange={handleInputChange}>Value ($)</InputField>

                <label htmlFor="taxStatus">Account Type</label>
                <select id="taxStatus" name="taxStatus" value={formData.taxStatus} onChange={handleInputChange} required>
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