import React from 'react';

const Expense = ({ event }) => {
    return (
        <div className="event_series">
            <h2 id={event._id}>{event.name}</h2>
            {event.description && <p>Description: {event.description}</p>}
            <p>Start Year: {event.start_year}</p>
            <p>Duration: {event.duration}</p>
            <p>Initial Amount: {event.amount}</p>
            <p>Expected Annual Change: {event.change}</p>
            {event.inflation && <p>Inflation Adjusted</p>}
            {event.discretionary && <p>Discretionary Expense</p>}
            <button>Edit</button>
        </div>
    );
};

export default Expense;