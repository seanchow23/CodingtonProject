import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "./input_field";

export default function EditEvent({ scenarios }) {
    const location = useLocation()
    const navigate = useNavigate();

    const {event} = location.state
    const target = scenarios.find(s => s.events.find(e => e._id === event._id));

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
        allocations: event.allocations,
        max: event.max
    });

    const [error, setError] = useState("");
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const handleInvestChange = (e) => {
        const { name, value } = e.target;
        if (name === "max") {setFormData({...formData, [name]: value});}
        else {
            const updatedAllocations = [...formData.allocations];
            updatedAllocations[name].percentage = Number(value);
            setFormData({ ...formData, allocations: updatedAllocations });
        }
    };

    const submit = (e) => {
        e.preventDefault();
        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        }
        const target_event = target.events.find(e => e._id === event._id);
        target_event.name = formData.name;
        target_event.description = formData.description;
        target_event.startYear = formData.startYear;
        target_event.duration = formData.duration;
        if (formData.type != "invest") {
            target_event.amount = formData.amount;
            target_event.change = formData.change;
            target_event.inflation = formData.inflation;
            if (formData.type == "income") { target_event.ss = formData.ss; }
            else { target_event.discretionary = formData.discretionary; }
        } else {
            target_event.allocations = formData.allocations;
            target_event.max = formData.max;
        }
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
                {formData.type === "invest" && <AddInvestEvent formData={formData} onChange={handleInvestChange} scenario={target}/>}

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}

function AddIncomeEvent({ formData, onChange }) {
    return (
        <div>
            <InputField id="amount" type="number" value={formData.amount} onChange={onChange}>Inital Amount ($)</InputField>
            <InputField id="change" type="number" value={formData.change} onChange={onChange}>Yearly Increase ($)</InputField>
            <InputField id="inflation" type="checkbox" checked={formData.inflation} onChange={onChange}>Inflation (%)</InputField>
            <InputField id="ss" type="checkbox" checked={formData.ss} onChange={onChange}>Social Security</InputField>
        </div>
    );
}

function AddExpenseEvent({ formData, onChange }) {
    return (
        <div>
            <InputField id="amount" type="number" value={formData.amount} onChange={onChange}>Inital Amount ($)</InputField>
            <InputField id="change" type="number" value={formData.change} onChange={onChange}>Yearly Decrease ($)</InputField>
            <InputField id="inflation" type="checkbox" checked={formData.inflation} onChange={onChange}>Inflation (%)</InputField>
            <InputField id="discretionary" type="checkbox" checked={formData.discretionary} onChange={onChange}>Discretionary</InputField>
        </div>
    );
}

function AddInvestEvent({ formData, onChange, scenario }) {
    return (
        <div>
            <InputField id="max" type="number" value={formData.max} onChange={onChange}>Maximum Cash ($)</InputField>
            <label htmlFor="allocations">Allocations (%)
                {scenario.investments.filter(investment => investment.taxStatus !== 'pre-tax retirement').map((investment, index) => (
                    <InputField key={index} id={index} type="number" value={formData.allocations[index].percentage} onChange={onChange}>{investment.investmentType.name}</InputField>
                ))}
            </label>
        </div>
    );
}