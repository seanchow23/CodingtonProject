import React from 'react';

const Invest = ({ event }) => {
    return (
        <div className="event_series">
            <h2 id={event._id}>{event.name}</h2>
            {event.description && <p>Description: {event.description}</p>}
            <p>Start Year: {event.start_year}</p>
            <p>Duration: {event.duration}</p>
            <p>Allocation: {event.allocation}</p>
            <p>Maximum: {event.max}</p>
        </div>
    );
};

export default Invest;