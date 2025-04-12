import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "../input_field";

export default function CreateEvent({ scenarios }) {
    const location = useLocation()
    const navigate = useNavigate();

    const {scenario} = location.state

    const [formData, setFormData] = useState({
        type: "",
        name: "",
        description: "",
        startYear: new Date().getFullYear(),
        duration: 1,
        amount: "",
        change: "",
        inflation: false,
        ss: false,
        discretionary: false,
        allocations: scenario.investments.filter(investment => investment.taxStatus !== 'pre-tax retirement').map(() => 0),
        max: ""
    });

    const [error, setError] = useState("");
    
    const handleRadioChange = (e) => {setFormData({ ...formData, type: e.target.value });};
    
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

    const addEvent = (newEvent) => {
        const currentScenario = scenarios.find(s => s._id === scenario._id);
        currentScenario.events.push(newEvent);
        if (newEvent.type === "expense" && newEvent.discretionary === true) {currentScenario.spendingStrategy.push(newEvent);}
        navigate(`/scenario/${scenario._id}`, { state: { scenario: currentScenario}});
    }

    const submit = (e) => {
        e.preventDefault();
        const check = Object.keys(formData).find((key) => formData[key] < 0);
        if (check) {
            setError(`The ${check} field cannot have a negative value.`);
            return;
        }
        const newEvent = {
            _id: Math.floor(Math.random() * 1000) + 1000,
            name: formData.name,
            description: formData.description,
            startYear: formData.startYear,
            duration: formData.duration,
            amount: formData.amount,
            change: formData.change,
            inflation: formData.inflation,
            ss: formData.ss,
            type: formData.type,
            discretionary: formData.discretionary,
            allocations: formData.allocations,
            max: formData.max
        };
        addEvent(newEvent);
    };
    
    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <label htmlFor="type">Select Event Type*</label>
                <input type="radio" name="type" value="income" onChange={handleRadioChange} required/> Income
                <input type="radio" name="type" value="expense" onChange={handleRadioChange} /> Expense
                <input type="radio" name="type" value="invest" onChange={handleRadioChange} /> Invest

                <InputField id="name" type="text" value={formData.name} onChange={handleInputChange}>Event Name</InputField>

                <label htmlFor="description">Description</label>
                <textarea type="text" id="description" name="description" value={formData.description} onChange={handleInputChange}></textarea>

                <InputField id="startYear" type="number" value={formData.startYear} onChange={handleInputChange}>Start Year</InputField>
                <InputField id="duration" type="number" value={formData.duration} onChange={handleInputChange}>Duration (Years)</InputField>

                {formData.type === "income" && <AddIncomeEvent formData={formData} onChange={handleInputChange} />}
                {formData.type === "expense" && <AddExpenseEvent formData={formData} onChange={handleInputChange} />}
                {formData.type === "invest" && <AddInvestEvent formData={formData} onChange={handleInvestChange} scenario={scenario} />}

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
                    <InputField key={index} id={index} type="number" value={formData.allocations[index]} onChange={onChange}>{investment.investmentType.name}</InputField>
                ))}
            </label>
        </div>
    );
}