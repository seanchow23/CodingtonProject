import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";

export default function EditEvent({ scenarios }) {
    const location = useLocation()
    const navigate = useNavigate();

    const {event} = location.state

    const [formData, setFormData] = useState({
        type: event.type,
        name: event.name,
        description: event.description,
        startYear: event.startYear,
        duration: event.duration,
        amount: event.amount,
        change: event.change,
        inflation: event.inflation,
        ss: event.ss,
        discretionary: event.discretionary,
        allocation: event.allocation,
        max: event.max
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
        const target = scenarios.find(s => s.events.find(e => e._id === event._id));
        const target_event = target.events.find(e => e._id === event._id);
        target_event.type = formData.type;
        target_event.name = formData.name;
        target_event.description = formData.description;
        target_event.startYear = formData.startYear;
        target_event.duration = formData.duration;
        target_event.amount = formData.amount;
        target_event.change = formData.change;
        target_event.inflation = formData.inflation;
        target_event.ss = formData.ss;
        target_event.discretionary = formData.discretionary;
        target_event.allocation = formData.allocation;
        target_event.max = formData.max;
        navigate(`/scenario/${target._id}`, { state: { scenario: target }});
    };
    
    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <InputField id="name" type="text" value={formData.name} onChange={handleInputChange}>Event Name</InputField>

                <label htmlFor="description">Description</label>
                <textarea type="text" id="description" name="description" value={formData.description} onChange={handleInputChange}></textarea>

                <InputField id="startYear" type="number" value={formData.startYear} onChange={handleInputChange}>Start Year</InputField>
                <InputField id="duration" type="number" value={formData.duration} onChange={handleInputChange}>Duration (Years)</InputField>

                {formData.type === "income" && <AddIncomeEvent formData={formData} onChange={handleInputChange} />}
                {formData.type === "expense" && <AddExpenseEvent formData={formData} onChange={handleInputChange} />}
                {formData.type === "invest" && <AddInvestEvent formData={formData} onChange={handleInputChange} />}

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}

function AddIncomeEvent({ formData, onChange }) {
    return (
        <div>
            <InputField id="amount" type="number" value={formData.amount} onChange={onChange}>Inital Amount</InputField>
            <InputField id="change" type="number" value={formData.change} onChange={onChange}>Yearly Increase</InputField>
            <InputField id="inflation" type="checkbox" checked={formData.inflation} onChange={onChange}>Inflation</InputField>
            <InputField id="ss" type="checkbox" checked={formData.ss} onChange={onChange}>Social Security</InputField>
        </div>
    );
}

function AddExpenseEvent({ formData, onChange }) {
    return (
        <div>
            <InputField id="amount" type="number" value={formData.amount} onChange={onChange}>Inital Amount</InputField>
            <InputField id="change" type="number" value={formData.change} onChange={onChange}>Yearly Decrease</InputField>
            <InputField id="inflation" type="checkbox" checked={formData.inflation} onChange={onChange}>Inflation</InputField>
            <InputField id="discretionary" type="checkbox" checked={formData.discretionary} onChange={onChange}>Discretionary</InputField>
        </div>
    );
}

function AddInvestEvent({ formData, onChange }) {
    return (
        <div>
            <InputField id="allocation" type="number" value={formData.allocation} onChange={onChange}>Allocation (Percentage)</InputField>
            <InputField id="max" type="number" value={formData.max} onChange={onChange}>Maximum Cash</InputField>
        </div>
    );
}