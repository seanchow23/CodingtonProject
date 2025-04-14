import React from 'react';
import { useNavigate } from "react-router-dom";

const Invest = ({ event }) => {
    const navigate = useNavigate();
    const editEvent = () => {navigate(`/scenario/edit_event/${event._id}`, { state: { event } });};

    return (
        <div className="event_series">
            <h2 id={event._id}>{event.name}</h2>
            {event.description && <p>Description: {event.description}</p>}
            <p>Start Year: {event.startYear}</p>
            <p>Duration: {event.duration} {event.duration === 1 ? 'Year' : 'Years'}</p>
            <p>Maximum: ${event.max.toFixed(2)}</p>
            <p>Allocations:</p>
            {event.allocations.map(((alloc) => (<ul key={alloc._id}>{alloc.investment.investmentType.name}: {alloc.percentage}%</ul>)))}
            <button className="edit-button" onClick={editEvent}>Edit</button>
        </div>
    );
};

export default Invest;