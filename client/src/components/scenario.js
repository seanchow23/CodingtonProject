import React, { useEffect, useState } from "react";
import Income from "./event_series/income";
import Expense from "./event_series/expense";
import Invest from "./event_series/invest";
import Rebalance from "./event_series/rebalance";
import Investment from "./investment";
import InvestmentType from "./investment_type";
import { useLocation, useNavigate } from "react-router-dom";
import { getScenario } from "../api/scenarioApi";
import * as scenarioApi from "../api/scenarioApi";
import * as userApi from "../api/userApi";


const exportScenario = () => {
    // Directly trigger a file download by creating a link to the export endpoint
    window.open(`${process.env.REACT_APP_API_URL}/api/scenarios/export/${scenario._id}`, '_blank');
  };


export default function Scenario() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialScenario = location.state?.scenario;


  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);


  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('read');
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');


  useEffect(() => {
    async function fetchData() {
      try {
        const scenarioData = await getScenario(initialScenario._id);
        setScenario(scenarioData);


        try {
          const { data: user } = await userApi.getCurrentUser();
          setCurrentUser(user);
        } catch {
          setCurrentUser(null); // guest
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }


    fetchData();
  }, []);


  /*const handleShare = async () => {
    setShareError('');
    setShareSuccess('');
    try {
      const result = await scenarioApi.shareScenario(scenario._id, {
        email: shareEmail,
        access: accessLevel,
      });
      setShareSuccess(`Shared with ${shareEmail} as ${accessLevel} access.`);
      setShareEmail('');
      console.log("Scenario shared successfully:", result);
    } catch (err) {
      console.error(err);
      setShareError('Failed to share scenario. Check email or permissions.');
    }
  };*/


  const isOwner = currentUser && scenario.user && currentUser._id === scenario.user._id;
  const hasWriteAccess = currentUser && scenario.sharedWrite?.some(u => u._id === currentUser._id);
  const isGuest = !currentUser;


  const canEdit = isOwner || hasWriteAccess || isGuest;
  const canShare = isOwner; // only owners can share


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!scenario) return <p>No scenario found</p>;


  const createEvent = () => navigate(`/scenario/create_event/${scenario._id}`, { state: { scenario } });
  const editScenario = () => navigate(`/scenario/edit/${scenario._id}`, { state: { scenario } });
  const createInvestment = () => navigate(`/scenario/create_investment/${scenario._id}`, { state: { scenario } });
  const createInvestmentType = () => navigate(`/scenario/create_investment_type/${scenario._id}`, { state: { scenario } });
  const runSimulation = () => navigate(`/simulation/${scenario._id}`, { state: { scenario } });


  return (
    <div className="scenario">
      <h1>{scenario.name}<button className="edit-button" onClick={editScenario} disabled={!canEdit}>Edit</button></h1>
      {canShare && (<button className="edit-button" onClick={() => setShowShareModal(true)}>Share</button>)}
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
      <ul className="list_event_series">
        {scenario.investmentTypes.map(type => (
          <InvestmentType key={type._id} investmentType={type} canEdit={canEdit}/>
        ))}
      </ul>


      <h2>Investment Types</h2>
            <div className="scenario_investments">
                <ul className="list_event_series">
                    {scenario.investmentTypes.map(investmentType => (
                        <InvestmentType key={investmentType._id} investmentType={investmentType} canEdit={canEdit}/>
                    ))}
                </ul>      
            </div>
            <h2>Investments</h2>
            <div className="scenario_investments">
                <ul className="list_event_series">
                    {scenario.investments.map(investment => (
                        <Investment key={investment._id} investment={investment} canEdit={canEdit}/>
                    ))}
                </ul>      
            </div>
            <h2>Event Series</h2>
            <div className="scenario_event_series">
                <div className="income_event_series">
                    <h3>Income Events</h3>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'income').map(event => (
                            <Income key={event._id} event={event} canEdit={canEdit}/>
                        ))}
                    </ul>
                </div>
                <div className="expense_event_series">
                    <h3>Expense Events</h3>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'expense').map(event => (
                            <Expense key={event._id} event={event} canEdit={canEdit}/>
                        ))}
                    </ul>
                </div>
                <div className="invest_event_series">
                    <h3>Invest Events</h3>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'invest').map(event => (
                            <Invest key={event._id} event={event} canEdit={canEdit}/>
                        ))}
                    </ul>
                </div>
                <div className="rebalance_event_series">
                    <h3>Rebalance</h3>
                    <ul className="list_event_series">
                        {scenario.events.filter(event => event.type === 'rebalance').map(event => (
                            <Rebalance key={event._id} event={event} canEdit={canEdit}/>
                        ))}
                    </ul>
                </div>
            </div>
            <h2>Strategies</h2>
            <div className="scenario_strategies">
                <h3>Spending Strategy</h3>
                <ul className="list_event_series">
                    {scenario.spendingStrategy.map(event => (
                        <Expense key={event._id} event={event} canEdit={canEdit}/>
                    ))}
                </ul>
                <h3>Withdrawal Strategy</h3>
                <ul className="list_event_series">
                    {scenario.withdrawalStrategy.map(investment => (
                        <Investment key={investment._id} investment={investment} canEdit={canEdit}/>
                    ))}
                </ul>  
                {scenario.rothOptimizer && <h3>Roth Optimizer Strategy</h3>}
                {scenario.rothOptimizer && <ul className="list_event_series">
                    {scenario.rothStrategy.map(investment => (
                        <Investment key={investment._id} investment={investment} canEdit={canEdit}/>
                    ))}
                </ul>}
            </div>
      <div className="button_div">
        <button className="edit-button" onClick={createInvestmentType} disabled={!canEdit}>Add Investment Type</button>
        <button className="edit-button" onClick={createInvestment} disabled={!canEdit}>Add Investment</button>
        <button className="edit-button" onClick={createEvent} disabled={!canEdit}>Add Event Series</button>
        <button className="edit-button" onClick={runSimulation}>Run Simulation</button>
        <button className="edit-button" onClick={exportScenario}>Export YAML</button>
      </div>


      {showShareModal && (
        <div className="modal">
          <h3>Share This Scenario</h3>
          <input
            type="email"
            placeholder="User's email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
          <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)}>
            <option value="read">Read-Only</option>
            <option value="write">Read-Write</option>
          </select>
          {/* <button onClick={handleShare}>Share</button> */}
          <button onClick={() => setShowShareModal(false)}>Cancel</button>
          {shareError && <p style={{ color: "red" }}>{shareError}</p>}
          {shareSuccess && <p style={{ color: "green" }}>{shareSuccess}</p>}
        </div>
      )}
    </div>
  );
}