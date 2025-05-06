import React from 'react';
import { useNavigate } from "react-router-dom";

const InvestmentType = ({ investmentType, canEdit }) => {
    const navigate = useNavigate();
    const editInvestmentType = () => {navigate(`/scenario/edit_investment_type/${investmentType._id}`, { state: { investmentType } });};

    return (
        <div className="investments">
            <h2 id={investmentType._id}>{investmentType.name}</h2>
            {investmentType.description && <p>Description: {investmentType.description}</p>}
            {investmentType.expectedAnnualReturn?.type === "fixed" && (
                <p>Expected Annual Return: {investmentType.expectedAnnualReturn.value1}%</p>
            )}
            {investmentType.expectedAnnualReturn?.type === "normal" && (
                <p>
                    Expected Annual Return: Normal Distribution<br />
                    Mean [{investmentType.expectedAnnualReturn.value1}], Deviation [{investmentType.expectedAnnualReturn.value2}]
                </p>
            )}
            {investmentType.expectedAnnualReturn?.type === "uniform" && (
                <p>
                    Expected Annual Return: Uniform Distribution<br />
                    Min [{investmentType.expectedAnnualReturn.value1}], Max [{investmentType.expectedAnnualReturn.value2}]
                </p>
            )}
            <p>Expense Ratio: {investmentType.expenseRatio}%</p>
            {investmentType.expectedAnnualIncome?.type === "fixed" && (
                <p>Expected Annual Income: ${investmentType.expectedAnnualIncome.value1}</p>
            )}
            {investmentType.expectedAnnualIncome?.type === "normal" && (
                <p>
                    Expected Annual Income: Normal Distribution<br />
                    Mean [{investmentType.expectedAnnualIncome.value1}], Deviation [{investmentType.expectedAnnualIncome.value2}]
                </p>
            )}
            {investmentType.expectedAnnualIncome?.type === "uniform" && (
                <p>
                    Expected Annual Income: Uniform Distribution<br />
                    Min [{investmentType.expectedAnnualIncome.value1}], Max [{investmentType.expectedAnnualIncome.value2}]
                </p>
            )}
            <p>{investmentType.taxability ? 'Taxable' : 'Not Taxable'}</p>
            <button className="edit-button" onClick={editInvestmentType} disabled={!canEdit}>Edit</button>
        </div>
    );
};

export default InvestmentType;