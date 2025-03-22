import React from 'react';

export default class Invest extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const event = this.props.event;
        return (
            <div className="event_series">
                <h2 id={event._id} onClick = {() => this.props.change(event)}>{event.name}</h2>
                <h3>Event Type: Invest</h3>
                {event.description && <p>Description: {event.description}</p>}
                <p>Start Year: {event.start_year}</p>
                <p>Duration: {event.duration}</p>
                <p>Allocation: {event.allocation}</p>
                <p>Maximum: {event.max}</p>
            </div>
        );
    }
}