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
        random: event.random,
        allocations: event.allocations,
        max: event.max,
        glide: event.glide
    });

    const [error, setError] = useState("");
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const handleInvestChange = (e) => {
        const { name, value, checked, id } = e.target;
        if (name === "max") {setFormData({...formData, [name]: value});}
        else if (name === "glide") {setFormData({...formData, [name]: checked});}
        else if (id === "final") {
            const updatedAllocations = [...formData.allocations];
            updatedAllocations[name].finalPercentage = Number(value);
            setFormData({ ...formData, allocations: updatedAllocations });
        }
        else {
            const updatedAllocations = [...formData.allocations];
            updatedAllocations[name].percentage = Number(value);
            setFormData({ ...formData, allocations: updatedAllocations });
        }
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
        target_event.duration = Number(formData.duration);
        if (formData.type != "invest") {
            target_event.amount = Number(formData.amount);
            target_event.change = Number(formData.change);
            target_event.inflation = Number(formData.inflation);
            target_event.random = formData.random;
            if (formData.type == "income") { target_event.ss = formData.ss; }
            else { target_event.discretionary = formData.discretionary; }
        } else {
            target_event.allocations = formData.allocations;
            target_event.max = Number(formData.max);
            target_event.glide = formData.glide;
        }
        navigate(`/scenario/${target._id}`, { state: { scenario: target }});
    };
    
    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <InputField id="name" type="text" value={formData.name} onChange={handleInputChange}>Event Name</InputField>

                <label htmlFor="description">Description</label>
                <textarea type="text" id="description" name="description" value={formData.description} onChange={handleInputChange}></textarea>

                {formData.type === "invest" && <InputField id="startYear" type="number" value={formData.startYear} onChange={handleInputChange}>Start Year</InputField>}
                {formData.type === "invest" && <InputField id="duration" type="number" value={formData.duration} onChange={handleInputChange}>Duration (Years)</InputField>}

                {formData.type !== "invest" && formData.random[0] === 0 && <InputField id="startYear" type="number" value={formData.startYear} onChange={handleInputChange}>Start Year</InputField>}
                {formData.type !== "invest" && <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_year" style={{ minWidth: '180px', marginTop: '10px' }}>Start Year Sampling</label>
                    <select name="random_year" value={formData.random[0]} onChange={handleRandom}>
                        <option value={0}>Fixed</option>
                        <option value={1}>Normal Distribution</option>
                        <option value={2}>Uniform Distribution</option>
                    </select>
                </div>}
                {formData.type !== "invest" && formData.random[0] !== 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="v1" style={{ marginBottom: '20px' }}>{formData.random[0] === 1 ? "Mean" : "Min"}</label>
                    <input type="number" name="v1" value={formData.random[1]} onChange={handleRandom} required />
                    <label htmlFor="v2" style={{ marginBottom: '20px' }}>{formData.random[0] === 1 ? "Standard Deviation" : "Max"}</label>
                    <input type="number" name="v2" value={formData.random[2]} onChange={handleRandom} required />
                </div>}

                {formData.type !== "invest" && formData.random[3] === 0 && <InputField id="duration" type="number" value={formData.duration} onChange={handleInputChange}>Duration (Years)</InputField>}
                {formData.type !== "invest" && <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_duration" style={{ minWidth: '180px', marginTop: '10px' }}>Duration Sampling</label>
                    <select name="random_duration" value={formData.random[3]} onChange={handleRandom}>
                        <option value={0}>Fixed</option>
                        <option value={1}>Normal Distribution</option>
                        <option value={2}>Uniform Distribution</option>
                    </select>
                </div>}
                {formData.type !== "invest" && formData.random[3] !== 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="v3" style={{ marginBottom: '20px' }}>{formData.random[3] === 1 ? "Mean" : "Min"}</label>
                    <input type="number" name="v3" value={formData.random[4]} onChange={handleRandom} required />
                    <label htmlFor="v4" style={{ marginBottom: '20px' }}>{formData.random[3] === 1 ? "Standard Deviation" : "Max"}</label>
                    <input type="number" name="v4" value={formData.random[5]} onChange={handleRandom} required />
                </div>}

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

function AddInvestEvent({ formData, onChange, scenario }) {
    return (
        <div>
            <InputField id="max" type="number" value={formData.max} onChange={onChange}>Maximum Cash ($)</InputField>
            <label htmlFor="allocations">Allocations (%)
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                        <label htmlFor="glide">Glide</label>
                        <input type="checkbox" id="glide" name="glide" value={formData.glide} onChange={onChange}/>
                    </div>
                {scenario.investments.filter(investment => investment.taxStatus !== 'pre-tax retirement').map((investment, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                        <label htmlFor={index} style={{ marginBottom: '20px', flex: '0 0 50px' }}>{investment.investmentType.name}</label>
                        <input type="number" name={index} value={formData.allocations[index].percentage} onChange={onChange} required />
                        {formData.glide && <p style={{ marginBottom: '30px' }}>To</p>}
                        {formData.glide && <input type="number" id="final" name={index} value={formData.allocations[index].finalPercentage} onChange={onChange}/>}
                    </div>
                ))}
            </label>
        </div>
    );
}