import React from 'react';
import { useNavigate } from "react-router-dom";

const Rebalance = ({ event, canEdit}) => {
    const navigate = useNavigate();
    const editEvent = () => {navigate(`/scenario/edit_event/${event._id}`, { state: { event } });};

    return (
        <div className="event_series">
            <h2 id={event._id}>{event.name}</h2>
            {event.description && <p>Description: {event.description}</p>}
            {event.description && <p>Description: {event.description}</p>}
            {event.startYear.type === "fixed" && <p>Start Year: {event.startYear.value1}</p>}
            {event.startYear.type === "normal" && <p>Start Year: Normal Distribution<br></br>Mean [{event.startYear.value1}], Deviation [{event.startYear.value2}]</p>}
            {event.startYear.type === "uniform" && <p>Start Year: Uniform Distribution<br></br>Min [{event.startYear.value1}], Max [{event.startYear.value2}]</p>}
            {event.startYear.type === "starts-with" && <p>Start Year: Starts with {event.startYear.event.name}</p>}
            {event.startYear.type === "starts-after" && <p>Start Year: Starts after {event.startYear.event.name}</p>}
            {event.duration.type === "fixed" && <p>Duration: {event.duration.value1} {event.duration.value1 === 1 ? 'Year' : 'Years'}</p>}
            {event.duration.type === "normal" && <p>Duration: Normal Distribution<br></br>Mean [{event.duration.value1}], Deviation [{event.duration.value2}]</p>}
            {event.duration.type === "uniform" && <p>Duration: Uniform Distribution<br></br>Min [{event.duration.value1}], Max [{event.duration.value2}]</p>}
            <p>Allocations:</p>
            {event.allocations.length !== 0 && event.allocations
                .filter(alloc => alloc.investment?.investmentType?.name !== "Cash")
                .map(alloc => (
                    <ul key={alloc._id}>
                        {alloc.investment?.investmentType?.name}: {alloc.percentage}%
                    </ul>
                ))}

            <button className="edit-button" onClick={editEvent} disabled={!canEdit} >Edit</button>
        </div>
    );
};

export default Rebalance;