import React from 'react';
import { useNavigate } from "react-router-dom";

const Income = ({ event }) => {
    const navigate = useNavigate();
    const editEvent = () => {navigate(`/scenario/edit_event/${event._id}`, { state: { event } });};

    return (
        <div className="event_series">
            <h2 id={event._id}>{event.name}</h2>
            {event.description && <p>Description: {event.description}</p>}
            {event.random[0] === 0 && <p>Start Year: {event.startYear}</p>}
            {event.random[0] === 1 && <p>Start Year: Normal Distribution<br></br>Mean [{event.random[1]}], Deviation [{event.random[2]}]</p>}
            {event.random[0] === 2 && <p>Start Year: Uniform Distribution<br></br>Min [{event.random[1]}], Max [{event.random[2]}]</p>}
            {event.random[3] === 0 && <p>Duration: {event.duration} {event.duration === 1 ? 'Year' : 'Years'}</p>}
            {event.random[3] === 1 && <p>Duration: Normal Distribution<br></br>Mean [{event.random[4]}], Deviation [{event.random[5]}]</p>}
            {event.random[3] === 2 && <p>Duration: Uniform Distribution<br></br>Min [{event.random[4]}], Max [{event.random[5]}]</p>}
            <p>Initial Amount: ${Number(event.amount).toFixed(2)}</p>
            <p>Expected Annual Change: ${Number(event.change).toFixed(2)}</p>
            {event.inflation && <p>Inflation Adjusted</p>}
            {event.ss && <p>Social Security Income</p>}
            <button className="edit-button" onClick={editEvent}>Edit</button>
        </div>
    );
};

export default Income;