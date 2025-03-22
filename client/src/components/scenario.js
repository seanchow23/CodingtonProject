import React from "react";
import Income from "./event_series/income";
import Expense from "./event_series/expense";
import Invest from "./event_series/income";
import Rebalance from "./event_series/rebalance";

export default class Scenario extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="scenario">
                <h1>{this.props.name}</h1>
                <div className="scenario_event_series">
                    <div className="income_event_series">
                        <h2>Income Events</h2>
                        <ul className="list_event_series">
                            {this.props.events.filter(event => event.type === 'income').map(event => (
                                <Income key={event._id} tag={event}/>
                            ))}
                        </ul>
                    </div>
                    <div className="expense_event_series">
                        <h2>Expense Events</h2>
                        <ul className="list_event_series">
                            {this.props.events.filter(event => event.type === 'expense').map(event => (
                                <Expense key={event._id} tag={event}/>
                            ))}
                        </ul>
                    </div>
                    <div className="invest_event_series">
                        <h2>Invest Events</h2>
                        <ul className="list_event_series">
                            {this.props.events.filter(event => event.type === 'invest').map(event => (
                                <Invest key={event._id} tag={event}/>
                            ))}
                        </ul>
                    </div>
                    <div className="rebalance_event_series">
                        <h2>Rebalance</h2>
                        <ul className="list_event_series">
                            {this.props.events.filter(event => event.type === 'rebalance').map(event => (
                                <Rebalance key={event._id} tag={event}/>
                            ))}
                        </ul>
                    </div>
                </div>
                <button>Add Event Series</button>
            </div>
        );
    }
}