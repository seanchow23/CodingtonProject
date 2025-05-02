import React from 'react';
import InputField from "../input_field";
import { createAllocation } from '../../api/allocationApi';

export function AddIncomeEvent({ formData, onChange }) {
    return (
        <div>
            <InputField id="amount" type="number" value={formData.amount} onChange={onChange}>Inital Amount ($)</InputField>
            <InputField id="change" type="number" value={formData.change} onChange={onChange}>Yearly Change ($)</InputField>
            <InputField id="inflation" type="checkbox" checked={formData.inflation} onChange={onChange}>Inflation (%)</InputField>
            <InputField id="ss" type="checkbox" checked={formData.ss} onChange={onChange}>Social Security</InputField>
        </div>
    );
}

export function AddExpenseEvent({ formData, onChange }) {
    return (
        <div>
            <InputField id="amount" type="number" value={formData.amount} onChange={onChange}>Inital Amount ($)</InputField>
            <InputField id="change" type="number" value={formData.change} onChange={onChange}>Yearly Change ($)</InputField>
            <InputField id="inflation" type="checkbox" checked={formData.inflation} onChange={onChange}>Inflation (%)</InputField>
            <InputField id="discretionary" type="checkbox" checked={formData.discretionary} onChange={onChange}>Discretionary</InputField>
        </div>
    );
}

export function AddInvestEvent({ formData, onChange, scenario }) {
    const scenario_investments = scenario.investments.filter(i => i.taxStatus !== 'pre-tax retirement').filter(i => i.investmentType.name !== 'Cash');

    return (
        <div>
            <InputField id="max" type="number" value={formData.max} onChange={onChange}>Maximum Cash ($)</InputField>
            <label htmlFor="allocations">Allocations (%)
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                        <label htmlFor="glide">Glide</label>
                        <input type="checkbox" id="glide" name="glide" value={formData.glide} onChange={onChange}/>
                    </div>
                {scenario_investments.map((investment, index) => (
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

export function AddRebalanceEvent({ formData, onChange, scenario }) {
    const scenario_investments = scenario.investments.filter(i => i.taxStatus !== 'pre-tax retirement').filter(i => i.investmentType.name !== 'Cash');

    return (
        <div>
            <label htmlFor="allocations">Allocations (%)
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                        <label htmlFor="glide">Glide</label>
                        <input type="checkbox" id="glide" name="glide" value={formData.glide} onChange={onChange}/>
                    </div>
                {scenario_investments.map((investment, index) => (
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

export function addAllocations(inv) {
    const investments = inv.filter(i => i.taxStatus !== 'pre-tax retirement').filter(i => i.investmentType.name !== 'Cash');
    const allocations = [];
    investments.map(investment => {
        const newAllocation = {
            investment: investment._id,
            percentage: 0,
            finalPercentage: 0,
        }
        allocations.push(newAllocation);
    })
    console.log(allocations);
    return allocations;
}