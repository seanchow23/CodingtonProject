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
        random: [0, 0, 0, 0, 0, 0],
    });

    const [error, setError] = useState("");
    
    const handleRadioChange = (e) => {setFormData({ ...formData, type: e.target.value });};
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const handleRandom = (e) => {
        const { name, value } = e.target;
        if (name === "random_year") {
            setFormData({ ...formData, random: [Number(value), formData.random[1], formData.random[2], formData.random[3], formData.random[4], formData.random[5]] });
        } else if (name === "v1") {
            setFormData({ ...formData, random: [formData.random[0], Number(value), formData.random[2], formData.random[3], formData.random[4], formData.random[5]] });
        } else if (name === "v2") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], Number(value), formData.random[3], formData.random[4], formData.random[5]] });
        } else if (name === "random_duration") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], formData.random[2], Number(value), formData.random[4], formData.random[5]] });
        } else if (name === "v3") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], formData.random[2], formData.random[3], Number(value), formData.random[5]] });
        } else if (name === "v4") {
            setFormData({ ...formData, random: [formData.random[0], formData.random[1], formData.random[2], formData.random[3], formData.random[4], Number(value)] });
        }
    }

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
            duration: Number(formData.duration),
            amount: Number(formData.amount),
            change: Number(formData.change),
            inflation: Number(formData.inflation),
            random: formData.random,

            // These fields are different for income and expense events
            ss: formData.ss,
            type: formData.type,
            discretionary: formData.discretionary,
        };
        addEvent(newEvent);
    };
    
    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <label htmlFor="type">Select Event Type*</label>
                <input type="radio" name="type" value="income" onChange={handleRadioChange} required/> Income
                <input type="radio" name="type" value="expense" onChange={handleRadioChange} /> Expense

                <InputField id="name" type="text" value={formData.name} onChange={handleInputChange}>Event Name</InputField>

                <label htmlFor="description">Description</label>
                <textarea type="text" id="description" name="description" value={formData.description} onChange={handleInputChange}></textarea>

                {formData.random[0] === 0 && <InputField id="startYear" type="number" value={formData.startYear} onChange={handleInputChange}>Start Year</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_year" style={{ minWidth: '180px', marginTop: '10px' }}>Start Year Sampling</label>
                    <select name="random_year" value={formData.random[0]} onChange={handleRandom}>
                        <option value={0}>Fixed</option>
                        <option value={1}>Normal Distribution</option>
                        <option value={2}>Uniform Distribution</option>
                    </select>
                </div>
                {formData.random[0] !== 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="v1" style={{ marginBottom: '20px' }}>{formData.random[0] === 1 ? "Mean" : "Min"}</label>
                    <input type="number" name="v1" value={formData.random[1]} onChange={handleRandom} required />
                    <label htmlFor="v2" style={{ marginBottom: '20px' }}>{formData.random[0] === 1 ? "Standard Deviation" : "Max"}</label>
                    <input type="number" name="v2" value={formData.random[2]} onChange={handleRandom} required />
                </div>}

                {formData.random[3] === 0 && <InputField id="duration" type="number" value={formData.duration} onChange={handleInputChange}>Duration (Years)</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_duration" style={{ minWidth: '180px', marginTop: '10px' }}>Duration Sampling</label>
                    <select name="random_duration" value={formData.random[3]} onChange={handleRandom}>
                        <option value={0}>Fixed</option>
                        <option value={1}>Normal Distribution</option>
                        <option value={2}>Uniform Distribution</option>
                    </select>
                </div>
                {formData.random[3] !== 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="v3" style={{ marginBottom: '20px' }}>{formData.random[3] === 1 ? "Mean" : "Min"}</label>
                    <input type="number" name="v3" value={formData.random[4]} onChange={handleRandom} required />
                    <label htmlFor="v4" style={{ marginBottom: '20px' }}>{formData.random[3] === 1 ? "Standard Deviation" : "Max"}</label>
                    <input type="number" name="v4" value={formData.random[5]} onChange={handleRandom} required />
                </div>}

                {formData.type === "income" && <AddIncomeEvent formData={formData} onChange={handleInputChange} />}
                {formData.type === "expense" && <AddExpenseEvent formData={formData} onChange={handleInputChange} />}

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
            <InputField id="change" type="number" value={formData.change} onChange={onChange}>Yearly Change ($)</InputField>
            <InputField id="inflation" type="checkbox" checked={formData.inflation} onChange={onChange}>Inflation (%)</InputField>
            <InputField id="ss" type="checkbox" checked={formData.ss} onChange={onChange}>Social Security</InputField>
        </div>
    );
}

function AddExpenseEvent({ formData, onChange }) {
    return (
        <div>
            <InputField id="amount" type="number" value={formData.amount} onChange={onChange}>Inital Amount ($)</InputField>
            <InputField id="change" type="number" value={formData.change} onChange={onChange}>Yearly Change ($)</InputField>
            <InputField id="inflation" type="checkbox" checked={formData.inflation} onChange={onChange}>Inflation (%)</InputField>
            <InputField id="discretionary" type="checkbox" checked={formData.discretionary} onChange={onChange}>Discretionary</InputField>
        </div>
    );
}
