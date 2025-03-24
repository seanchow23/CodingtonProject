import React from 'react';

const Investment = ({ investment }) => {
    return (
        <div className="investments">
            <h2 id={investment._id}>{investment.investmentType.name}</h2>
            <p>Value: {investment.value}</p>
            <p>Tax Status: {investment.taxStatus}</p>
            <button>Edit</button>
        </div>
    );
};

export default Investment;