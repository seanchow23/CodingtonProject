import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "../input_field";
import {AddIncomeEvent, AddExpenseEvent, AddInvestEvent, AddRebalanceEvent, addAllocations} from "./add_event";
import * as eventApi from "../../api/eventsApi"; 
import * as scenarioApi from "../../api/scenarioApi"
import { createAllocation } from "../../api/allocationApi";
import { createDistribution } from "../../api/distributionApi";

export default function CreateEvent({ scenarios }) {
    const location = useLocation()
    const navigate = useNavigate();

    const {scenario} = location.state
    const event_allocations = addAllocations(scenario.investments); // Only applicable for invest and rebalance events

    const year_distribution = {
      type: "fixed",
      value1: 2025,
      value2: 0,
      event: null,
    }

    const duration_distribution = {
      type: "fixed",
      value1: 1,
      value2: 0,
    }

    const [formData, setFormData] = useState({
        type: "",
        name: "",
        description: "",
        startYear: year_distribution,
        duration: duration_distribution,
        amount: "",
        change: "",
        inflation: false,
        ss: false,
        discretionary: false,
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
            setFormData({ ...formData, startYear: { ...formData.startYear, type: value } });
        } else if (name === "v1") {
            setFormData({ ...formData, startYear: { ...formData.startYear, value1: Number(value) } });
        } else if (name === "v2") {
            setFormData({ ...formData, startYear: { ...formData.startYear, value2: Number(value) } });
        } else if (name === "v3") {
            setFormData({ ...formData, startYear: { ...formData.startYear, event: value } });
        } else if (name === "random_duration") {
            setFormData({ ...formData, duration: { ...formData.duration, type: value } });
        } else if (name === "v4") {
            setFormData({ ...formData, duration: { ...formData.duration, value1: Number(value) } });
        } else if (name === "v5") {
            setFormData({ ...formData, duration: { ...formData.duration, value2: Number(value) } });
        } else if (name == "startYear") {
            setFormData({ ...formData, startYear: { ...formData.startYear, value1: Number(value) } });
        } else if (name == "duration") {
            setFormData({ ...formData, duration: { ...formData.duration, value1: Number(value) } });
        }
    }

    const addEvent = async (newEvent) => {
      try {
        const currentScenario = await scenarioApi.getScenarioUnpop(scenarios.find(s => s._id === scenario._id)._id);
        currentScenario.events.push(newEvent._id);
    
        // If it's a discretionary expense, also push to spendingStrategy
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

      const yearDistributionResponse = await createDistribution(formData.startYear);
      const yearDistribution = yearDistributionResponse.data;
      const durationDistributionResponse = await createDistribution(formData.duration);
      const durationDistribution = durationDistributionResponse.data;
    
      // Construct event object based on type
      let baseEvent = {
        type: formData.type,
        name: formData.name,
        description: formData.description,
        startYear: yearDistribution._id,
        duration: durationDistribution._id,
      };

      // Update allocation array
      if (formData.type === "invest" || formData.type === "rebalance") {
        const updatedAllocations = await Promise.all(
          formData.allocations.map(async (allocation) => {
            const response = await createAllocation(allocation);
            return response.data._id;
          })
        );
        baseEvent = {
          ...baseEvent,
          glide: formData.glide,
          allocations: updatedAllocations,
        };
      }
    
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
        };
      } else if (formData.type === "rebalance") {
        eventData = {
          ...baseEvent,
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

                {formData.startYear.type === "fixed" && <InputField id="startYear" type="number" value={formData.startYear.value1} onChange={handleRandom}>Start Year</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_year" style={{ minWidth: '180px', marginTop: '10px' }}>Start Year Sampling</label>
                    <select name="random_year" value={formData.startYear.type} onChange={handleRandom}>
                        <option value={"fixed"}>Fixed</option>
                        <option value={"normal"}>Normal Distribution</option>
                        <option value={"uniform"}>Uniform Distribution</option>
                        <option value={"starts-with"}>Start With</option>
                        <option value={"starts-after"}>Start After</option>
                    </select>
                </div>
                {(formData.startYear.type === "normal" || formData.startYear.type === "uniform") && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="v1" style={{ marginBottom: '20px' }}>{formData.startYear.type === "normal" ? "Mean" : "Min"}</label>
                    <input type="number" name="v1" value={formData.startYear.value1} onChange={handleRandom} required />
                    <label htmlFor="v2" style={{ marginBottom: '20px' }}>{formData.startYear.type === "normal" ? "Standard Deviation" : "Max"}</label>
                    <input type="number" name="v2" value={formData.startYear.value2} onChange={handleRandom} required />
                </div>}
                {(formData.startYear.type === "starts-with" || formData.startYear.type === "starts-after") && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="v3">Choose Event</label>
                    <select name="v3" value={formData.startYear.event || ""} onChange={handleRandom}>
                        <option value="">--Select Event--</option>
                        {scenario.events.map((event, index) => (<option key={index} value={event._id}>{event.name}</option>))}
                    </select>
                </div>}

                {formData.duration.type === "fixed" && <InputField id="duration" type="number" value={formData.duration.value1} onChange={handleRandom}>Duration (Years)</InputField>}
                <div style={{ display: 'flex', gap: '10px'}}>
                    <label htmlFor="random_duration" style={{ minWidth: '180px', marginTop: '10px' }}>Duration Sampling</label>
                    <select name="random_duration" value={formData.duration.type} onChange={handleRandom}>
                        <option value={"fixed"}>Fixed</option>
                        <option value={"normal"}>Normal Distribution</option>
                        <option value={"uniform"}>Uniform Distribution</option>
                    </select>
                </div>
                {formData.duration.type !== "fixed" && <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label htmlFor="v4" style={{ marginBottom: '20px' }}>{formData.duration.type === "normal" ? "Mean" : "Min"}</label>
                    <input type="number" name="v4" value={formData.duration.value1} onChange={handleRandom} required />
                    <label htmlFor="v5" style={{ marginBottom: '20px' }}>{formData.duration.type === "normal" ? "Standard Deviation" : "Max"}</label>
                    <input type="number" name="v5" value={formData.duration.value2} onChange={handleRandom} required />
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
