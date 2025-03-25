import React from 'react';
import { useNavigate } from "react-router-dom";

const Invest = ({ event }) => {
    const navigate = useNavigate();
    const editEvent = () => {navigate(`/scenario/edit_event/${event._id}`, { state: { event } });};

    return (
        <div className="event_series">
            <h2 id={event._id}>{event.name}</h2>
            {event.description && <p>Description: {event.description}</p>}
            <p>Start Year: {event.start_year}</p>
            <p>Duration: {event.duration}</p>
            <p>Allocation: {event.allocation}</p>
            <p>Maximum: {event.max}</p>
            <button className="edit-button" onClick={editEvent}>Edit</button>
        </div>
    );
};

export default Invest;