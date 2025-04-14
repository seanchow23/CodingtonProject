import React from 'react';
import { useNavigate } from "react-router-dom";

const Expense = ({ event }) => {
    const navigate = useNavigate();
    const editEvent = () => {navigate(`/scenario/edit_event/${event._id}`, { state: { event } });};

    return (
        <div className="event_series">
            <h2 id={event._id}>{event.name}</h2>
            {event.description && <p>Description: {event.description}</p>}
            <p>Start Year: {event.startYear}</p>
            <p>Duration: {event.duration} {event.duration === 1 ? 'Year' : 'Years'}</p>
            <p>Initial Amount: ${Number(event.amount).toFixed(2)}</p>
            <p>Expected Annual Change: ${Number(event.change).toFixed(2)}</p>
            {event.inflation && <p>Inflation Adjusted</p>}
            {event.discretionary && <p>Discretionary Expense</p>}
            <button className="edit-button" onClick={editEvent}>Edit</button>
        </div>
    );
};

export default Expense;