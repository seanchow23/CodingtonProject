import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "../input_field";
import {AddIncomeEvent, AddExpenseEvent, AddInvestEvent, AddRebalanceEvent, addAllocations} from "./add_event";
import * as eventApi from "../../api/eventsApi"; 
import * as scenarioApi from "../../api/scenarioApi"

export default function CreateEvent({ scenarios }) {
    const location = useLocation()
    const navigate = useNavigate();

    const {scenario} = location.state
    const event_allocations = addAllocations(scenario.investments); // Only applicable for invest and rebalance events

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
        allocations: event_allocations,
        max: "",
        glide: false
    });

    const [error, setError] = useState("");
    
    const handleRadioChange = (e) => {setFormData({ ...formData, type: e.target.value });};
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const handleAllocationChange = (e) => {
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

    const addEvent = async (newEvent) => {
      try {
        const currentScenario = await scenarioApi.getScenarioUnpop(scenarios.find(s => s._id === scenario._id)._id);
        currentScenario.events.push(newEvent._id);
    
        // If it's a discretionary expense, also push to spendingStrategy
        console.log("New Event:", newEvent);
        if (newEvent.type === 'expense' && newEvent.discretionary) {
          currentScenario.spendingStrategy.push(newEvent._id);
        }
    
        await scenarioApi.updateScenario(currentScenario._id, currentScenario);
    
        const updatedScenario = await scenarioApi.getScenario(currentScenario._id);
        navigate(`/scenario/${updatedScenario._id}`, { state: { scenario: updatedScenario } });
    
      } catch (err) {
        console.error("Failed to update scenario with new event:", err);
        setError("Failed to update scenario with new event.");
      }
    };
    
    const submit = async (e) => {
      e.preventDefault();
      const check = Object.keys(formData).find((key) => formData[key] < 0);
      if (check) {
        setError(`The ${check} field cannot have a negative value.`);
        return;
      }
    
      // Construct event object based on type
      const baseEvent = {
        type: formData.type,
        name: formData.name,
        description: formData.description,
        startYear: formData.startYear,
        duration: Number(formData.duration),
        random: formData.random,
      };
    
      let eventData;
    
      if (formData.type === "income") {
        eventData = {
          ...baseEvent,
          amount: Number(formData.amount),
          change: Number(formData.change),
          inflation: formData.inflation,
          ss: formData.ss,
        };
      } else if (formData.type === "expense") {
        eventData = {
          ...baseEvent,
          amount: Number(formData.amount),
          change: Number(formData.change),
          inflation: formData.inflation,
          discretionary: formData.discretionary,
        };
      } else if (formData.type === "invest") {
        eventData = {
          ...baseEvent,
          max: Number(formData.max),
          glide: formData.glide,
          allocations: formData.allocations,
        };
      } else if (formData.type === "rebalance") {
        eventData = {
          ...baseEvent,
          glide: formData.glide,
          allocations: formData.allocations,
        };
      } else {
        setError("Invalid event type.");
        return;
      }
    
      try {
        const response = await eventApi.createEvent(eventData);
        const newEvent = response.data;
        await addEvent(newEvent);
      } catch (err) {
        console.error("Failed to create event:", err);
        setError("Failed to create event.");
      }
    };
    
    
    
    return (
        <div id = "add_event">
            <form onSubmit={submit}>
                <label htmlFor="type">Select Event Type*</label>
                <input type="radio" name="type" value="income" onChange={handleRadioChange} required/> Income
                <input type="radio" name="type" value="expense" onChange={handleRadioChange} /> Expense
                <input type="radio" name="type" value="invest" onChange={handleRadioChange} /> Invest
                <input type="radio" name="type" value="rebalance" onChange={handleRadioChange} /> Rebalance

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
                {formData.type === "invest" && <AddInvestEvent formData={formData} onChange={handleAllocationChange} scenario={scenario}/>}
                {formData.type === "rebalance" && <AddRebalanceEvent formData={formData} onChange={handleAllocationChange} scenario={scenario}/>}

                <button type="submit">Submit</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}
