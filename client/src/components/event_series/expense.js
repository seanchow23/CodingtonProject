import React from 'react';

export default class Expense extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const event = this.props.event;
        return (
            <div className="event_series">
                <h2 id={event._id} onClick = {() => this.props.change(event)}>{event.name}</h2>
                <h3>Event Type: Expense</h3>
                {event.description && <p>Description: {event.description}</p>}
                <p>Start Year: {event.start_year}</p>
                <p>Duration: {event.duration}</p>
                <p>Initial Amount: {event.amount}</p>
                <p>Expected Annual Change: {event.change}</p>
                {event.inflation && <p>Inflation Adjusted</p>}
                {event.discretionary && <p>Discretionary Expense</p>}
            </div>
        );
    }
}