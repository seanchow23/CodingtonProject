import React from 'react';
import { useNavigate } from "react-router-dom";

const Investment = ({ investment, canEdit }) => {
    const navigate = useNavigate();
    const editInvestment = () => {navigate(`/scenario/edit_investment/${investment._id}`, { state: { investment } });};

    return (
        <div className="investments">
            <h2 id={investment._id}>{investment.investmentType.name}</h2>
            <p>Value: ${investment.value.toFixed(2)}</p>
            <p>Tax Status: {investment.taxStatus}</p>
            <button className="edit-button" onClick={editInvestment} disabled={!canEdit}>Edit</button>
        </div>
    );
};

export default Investment;