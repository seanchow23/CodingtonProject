import React from 'react';

const Rebalance = ({ event }) => {
    return (
        <div className="event_series">
            <h2 id={event._id}>{event.name}</h2>
            {event.description && <p>Description: {event.description}</p>}
            <p>Start Year: {event.start_year}</p>
            <p>Duration: {event.duration}</p>
            <p>Allocation: {event.allocation}</p>
            <p>Change: {event.change}</p>
            <button>Edit</button>
        </div>
    );
};

export default Rebalance;