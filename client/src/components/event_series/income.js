import React from 'react';
import { useNavigate } from "react-router-dom";

const Income = ({ event }) => {
    const navigate = useNavigate();
    const editEvent = () => {navigate(`/scenario/edit_event/${event._id}`, { state: { event } });};

    return (
        <div className="event_series">
            <h2 id={event._id}>{event.name}</h2>
            {event.description && <p>Description: {event.description}</p>}
            <p>Start Year: {event.start_year}</p>
            <p>Duration: {event.duration}</p>
            <p>Initial Amount: {event.amount}</p>
            <p>Expected Annual Change: {event.change}</p>
            {event.inflation && <p>Inflation Adjusted</p>}
            {event.ss && <p>Social Security Income</p>}
            <button onClick={editEvent}>Edit</button>
        </div>
    );
};

export default Income;