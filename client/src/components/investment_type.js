import React from 'react';
import { useNavigate } from "react-router-dom";

const InvestmentType = ({ investmentType }) => {
    const navigate = useNavigate();
    const editInvestmentType = () => {navigate(`/scenario/edit_investment_type/${investmentType._id}`, { state: { investmentType } });};

    return (
        <div className="investments">
            <h2 id={investmentType._id}>{investmentType.name}</h2>
            {investmentType.description && <p>Description: {investmentType.description}</p>}
            <p>Expected Annual Return: {investmentType.expectedAnnualReturn}%</p>
            <p>Expense Ratio: {investmentType.expenseRatio}%</p>
            <p>Expected Annual Income: ${investmentType.expectedAnnualIncome}</p>
            <p>{investmentType.taxability ? 'Taxable' : 'Not Taxable'}</p>
            <button className="edit-button" onClick={editInvestmentType}>Edit</button>
        </div>
    );
};

export default InvestmentType;