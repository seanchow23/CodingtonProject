import React from 'react';
import { useNavigate } from "react-router-dom";

const InvestmentType = ({ investmentType }) => {
    const navigate = useNavigate();
    const editInvestmentType = () => {navigate(`/scenario/edit_investment_type/${investmentType._id}`, { state: { investmentType } });};

    return (
        <div className="investments">
            <h2 id={investmentType._id}>{investmentType.name}</h2>
            {investmentType.description && <p>Description: {investmentType.description}</p>}
            {investmentType.random[0] === 0 && <p>Expected Annual Return: {investmentType.expectedAnnualReturn}%</p>}
            {investmentType.random[0] !== 0 && <p>Expected Annual Return:<br></br>Sampled, Mean [{investmentType.random[1]}], Deviation [{investmentType.random[2]}]</p>}
            <p>Expense Ratio: {investmentType.expenseRatio}%</p>
            {investmentType.random[3] === 0 && <p>Expected Annual Income: ${investmentType.expectedAnnualIncome}</p>}
            {investmentType.random[3] !== 0 && <p>Expected Annual Income:<br></br>Sampled, Mean [{investmentType.random[4]}], Deviation [{investmentType.random[5]}]</p>}
            <p>{investmentType.taxability ? 'Taxable' : 'Not Taxable'}</p>
            <button className="edit-button" onClick={editInvestmentType}>Edit</button>
        </div>
    );
};

export default InvestmentType;