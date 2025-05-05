import React, { useEffect, useState } from "react";
import Income from "./event_series/income";
import Expense from "./event_series/expense";
import Invest from "./event_series/invest";
import Rebalance from "./event_series/rebalance";
import Investment from "./investment";
import InvestmentType from "./investment_type";
import { useLocation, useNavigate } from "react-router-dom";
import { getScenario } from "../api/scenarioApi";

export default function Scenario() {
    const location = useLocation()
    const navigate = useNavigate();
    const initialScenario = location.state?.scenario;

    const [scenario, setScenario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      async function fetchScenario() {
        try {
          const data = await getScenario(initialScenario._id);
          setScenario(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchScenario();
    }, []);
  
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!scenario) return <p>No scenario found</p>;

    const createEvent = () => {navigate(`/scenario/create_event/${scenario._id}`, { state: { scenario } });};
    const editScenario = () => {navigate(`/scenario/edit/${scenario._id}`, { state: { scenario } }); }
    const createInvestment = () => {navigate(`/scenario/create_investment/${scenario._id}`, { state: { scenario } });};
    const createInvestmentType = () => {navigate(`/scenario/create_investment_type/${scenario._id}`, { state: { scenario } });};
    const runSimulation = () => {navigate(`/simulation/${scenario._id}`, { state: { scenario } });};

    return (
        <div className="scenario">
            <h1>{scenario.name}<button className="edit-button" onClick={editScenario}>Edit</button></h1>
            <h2>Scenario Details</h2>
            <div className="details_div">
                <p>Marital Status: {scenario.married == "true" ? "Married" : "Single"}</p>
                <p>User Birth Year: {scenario.birthYearUser}, Life Expectancy: {scenario.lifeExpectancyUser.type === "fixed" ? scenario.lifeExpectancyUser.value1 : "Sampled"}</p>
                {scenario.lifeExpectancyUser.type === "normal" && <p>Sampled Life Expectancy, Mean [{scenario.lifeExpectancyUser.value1}], Deviation [{scenario.lifeExpectancyUser.value2}]</p>}
                {scenario.lifeExpectancyUser.type === "uniform" && <p>Sampled Life Expectancy, Min [{scenario.lifeExpectancyUser.value1}], Max [{scenario.lifeExpectancyUser.value2}]</p>}
                {scenario.married == "true" && <p>Spouse Birth Year: {scenario.birthYearSpouse}, Life Expectancy: {scenario.lifeExpectancySpouse.type === "fixed" ? scenario.lifeExpectancySpouse.value1 : "Sampled"}</p>}
                {scenario.married == "true" && scenario.lifeExpectancySpouse.type === "normal" && <p>Sampled Life Expectancy, Mean [{scenario.lifeExpectancySpouse.value1}], Deviation [{scenario.lifeExpectancySpouse.value2}]</p>}
                {scenario.married == "true" && scenario.lifeExpectancySpouse.type === "uniform" && <p>Sampled Life Expectancy, Min [{scenario.lifeExpectancySpouse.value1}], Max [{scenario.lifeExpectancySpouse.value2}]</p>}
                {scenario.inflation.type === "fixed" && <p>Inflation: {scenario.inflation.value1}%</p>}
                {scenario.inflation.type === "normal" && <p>Sampled Inflation, Mean [{scenario.inflation.value1}], Deviation [{scenario.inflation.value2}]</p>}
                {scenario.inflation.type === "uniform" && <p>Sampled Inflation, Min [{scenario.inflation.value1}], Max [{scenario.inflation.value2}]</p>}
                <p>Annual Contribution Limit: ${scenario.annualLimit}</p>
                <p>Roth Optimizer: {scenario.rothOptimizer === true ? "Active" : "Inactive"}</p>
                {scenario.rothOptimizer && scenario.lifeExpectancyUser.type === 'fixed' && <p>---- Start Year: {scenario.rothYears[0]} - End Year: {scenario.rothYears[1]} ----</p>}
                {scenario.rothOptimizer && scenario.lifeExpectancyUser.type !== 'fixed' && <p>---- Start Year: {scenario.rothYears[0]} ----</p>}
                {scenario.sharing !== "" && <p>Shared With: {scenario.sharing}</p>}
                <p>Financial Goal: ${scenario.financialGoal}</p>
                <p>State: {scenario.state}</p>
            </div>
            <h2>Investment Types</h2>
            <div className="scenario_investments">
                <ul className="list_event_series">
                    {scenario.investmentTypes.map(investmentType => (
                        <InvestmentType key={investmentType._id} investmentType={investmentType}/>
                    ))}
                </ul>       
            </div>
            <h2>Investments</h2>
            <div className="scenario_investments">
                <ul className="list_event_series">
                    {scenario.investments.map(investment => (
                        <Investment key={investment._id} investment={investment}/>
                    ))}
                </ul>       
            </div>
            <h2>Event Series</h2>
            <div className="scenario_event_series">
                <div className="income_event_series">
                    <h3>Income Events</h3>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'income').map(event => (
                            <Income key={event._id} event={event}/>
                        ))}
                    </ul>
                </div>
                <div className="expense_event_series">
                    <h3>Expense Events</h3>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'expense').map(event => (
                            <Expense key={event._id} event={event}/>
                        ))}
                    </ul>
                </div>
                <div className="invest_event_series">
                    <h3>Invest Events</h3>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'invest').map(event => (
                            <Invest key={event._id} event={event}/>
                        ))}
                    </ul>
                </div>
                <div className="rebalance_event_series">
                    <h3>Rebalance</h3>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'rebalance').map(event => (
                            <Rebalance key={event._id} event={event}/>
                        ))}
                    </ul>
                </div>
            </div>
            <h2>Strategies</h2>
            <div className="scenario_strategies">
                <h3>Spending Strategy</h3>
                <ul className="list_event_series">
                    {scenario.spendingStrategy.map(event => (
                        <Expense key={event._id} event={event}/>
                    ))}
                </ul>
                <h3>Withdrawal Strategy</h3>
                <ul className="list_event_series">
                    {scenario.withdrawalStrategy.map(investment => (
                        <Investment key={investment._id} investment={investment}/>
                    ))}
                </ul>  
                {scenario.rothOptimizer && <h3>Roth Optimizer Strategy</h3>}
            </div>
            <div className="button_div">
                <button className="edit-button" onClick={createInvestmentType}>Add Investment Type</button>
                <button className="edit-button" onClick={createInvestment}>Add Investment</button>
                <button className="edit-button" onClick={createEvent}>Add Event Series</button>
                <button className="edit-button" onClick={runSimulation}>Run Simulation</button>
            </div>
        </div>
    );
}