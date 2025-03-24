import React, { useState } from "react";
import Income from "./event_series/income";
import Expense from "./event_series/expense";
import Invest from "./event_series/income";
import Rebalance from "./event_series/rebalance";
import { useLocation, useNavigate } from "react-router-dom";


const Scenario = () => {
    const location = useLocation()
    const navigate = useNavigate();
    const {scenario} = location.state;

    const createEvent = () => { navigate(`/scenario/create_event/${scenario._id}`, { state: { scenario } });};

    return (
        <div className="scenario">
            <h1>{scenario.name} <button className="edit-button" onClick={() => navigate(`/scenario/edit/${scenario._id}`, { state: { scenario } })}>Edit</button></h1>
            <div className="scenario_event_series">
                <div className="income_event_series">
                    <h2>Income Events</h2>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'income').map(event => (
                            <Income key={event._id} event={event}/>
                        ))}
                    </ul>
                </div>
                <div className="expense_event_series">
                    <h2>Expense Events</h2>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'expense').map(event => (
                            <Expense key={event._id} event={event}/>
                        ))}
                    </ul>
                </div>
                <div className="invest_event_series">
                    <h2>Invest Events</h2>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'invest').map(event => (
                            <Invest key={event._id} event={event}/>
                        ))}
                    </ul>
                </div>
                <div className="rebalance_event_series">
                    <h2>Rebalance</h2>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'rebalance').map(event => (
                            <Rebalance key={event._id} event={event}/>
                        ))}
                    </ul>
                </div>
            </div>
            <button onClick={createEvent}>Add Event Series</button>
        </div>
    );
}

export default Scenario