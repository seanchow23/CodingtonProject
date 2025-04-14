import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ScenarioList from "./scenario_list";

export default function Simulation({ scenarios }) {
    const location = useLocation();
    const navigate = useNavigate();
    const {scenario} = location.state;
    const [scenario_list, setScenarioList] = useState([structuredClone(scenario)]);

    useEffect(() => {
    var year = 2025;

    // Get Taxes (need to connect to the scraper)
    var federal_brackets = [
        { percentage: 10, min: 0, max: 11600 },
        { percentage: 12, min: 11601, max: 47150 },
        { percentage: 22, min: 47151, max: 100525 },
        { percentage: 24, min: 100526, max: 191950 },
        { percentage: 32, min: 191951, max: 243725 },
        { percentage: 35, min: 243726, max: 609350 },
        { percentage: 37, min: 609351, max: Infinity }
    ];
    var federal_deductions = 13850;
    if (scenario.married === true) {
        federal_brackets = [
            { percentage: 10, min: 0, max: 23200 },
            { percentage: 12, min: 23201, max: 94300 },
            { percentage: 22, min: 94301, max: 201050 },
            { percentage: 24, min: 201051, max: 383900 },
            { percentage: 32, min: 383901, max: 487450 },
            { percentage: 35, min: 487451, max: 731200 },
            { percentage: 37, min: 731201, max: Infinity }
        ];
        federal_deductions = 27700;
    }

    while (scenario.lifeExpectancyUser > 0) {
        year += 1

        // Extract Events and Strategies
        const IncomeEvents = scenario.events.filter(event => event.type === 'income');
        const ExpenseEvents = scenario.events.filter(event => event.type === 'expense');
        const Investments = scenario.investments;
    
        var cash = 0;
        var ss_cash = 0;
        var tax = 0;
        var expense = 0;
        var dis_expense = 0;

        // Run Income Events
        for (const income of IncomeEvents) {
            if (income.startYear <= year && income.duration > 0) {
                income.duration -= 1;
                income.amount = Number(income.amount);
                if (income.ss) { ss_cash += income.amount; }
                else { cash += income.amount; }
                income.amount += Number(income.change);
                income.amount *= (1 + (Number(income.inflation) / 100));
            }
        }
        tax += ss_cash * 0.15;

        // Perform RMD for previous year
        if (year - scenario.birthYearUser >= 75) {
            const rmd = Investments.filter(investment => (investment.taxStatus === "pre-tax retirement"));
            for (const investment of rmd) {
                const principle = Number(investment.value);
                const withdrawl = principle / scenario.lifeExpectancyUser;
                investment.baseValue = Number(investment.baseValue) * (1 - (withdrawl / principle));
                investment.value = principle - withdrawl;
                cash += withdrawl;
            }
        }

        // Update Investment
        for (const investment of Investments) {
            const data = investment.investmentType;
            if (data.taxability) { cash += Number(data.expectedAnnualIncome); }
            else { ss_cash += Number(data.expectedAnnualIncome); }
            const appreciated = Number(investment.value) * (1 + Number(data.expectedAnnualReturn));
            const expense = (Number(investment.value) + appreciated) * Number(data.expenseRatio) / 2;
            investment.value = appreciated - expense;
        }

        // Run Optimizer if enabled
        if (scenario.rothOptimizer && year >= Number(scenario.rothStrategy[0]) && year <= Number(scenario.rothStrategy[1])) {
            const retirement_account = scenario.investments.find(investment => (investment.taxStatus === "after-tax retirement"));
            if (retirement_account !== undefined) {
                const tax_bracket = federal_brackets.find(bracket => bracket.max > cash); // find bracket
                var withdrawl = tax_bracket.max - cash;
                const withdrawl_limit = withdrawl;
                const roth = Investments.filter(investment => (investment.taxStatus === "pre-tax retirement"));
                for (const investment of roth) {
                    const principle = Number(investment.value);
                    // withdraw from pre-tax accounts until limit
                    if (withdrawl < principle) {
                        retirement_account.value = Number(retirement_account.value) + withdrawl;
                        investment.baseValue = Number(investment.baseValue) * (1 - (withdrawl / principle));
                        investment.value = principle - withdrawl;
                        withdrawl = 0;
                        break;
                    } else {
                        retirement_account.value = Number(retirement_account.value) + principle;
                        retirement_account.baseValue = Number(retirement_account.baseValue) + principle;
                        investment.baseValue = 0;
                        investment.value = 0;
                        withdrawl -= principle;
                    }
                }
                tax += (withdrawl_limit - withdrawl) * tax_bracket.percentage; // calculate tax
            }
        }

        // Run Expense Events
        for (const expend of ExpenseEvents) {
            if (expend.startYear <= year && expend.duration > 0) {
                expend.duration -= 1;
                expend.amount = Number(expend.amount);
                if (expend.discretionary) { dis_expense += expend.amount; }
                else { expend += expend.amount; }
                expend.amount += Number(expend.change);
                expend.amount *= (1 + (Number(expend.inflation) / 100));
            }
        }

        // Calculate taxes
        for (const bracket of federal_brackets) {
            const taxable_income = cash - federal_deductions;
            if (taxable_income > bracket.max) { tax += (bracket.max - bracket.min) * (bracket.percentage / 100); }
            else { 
                tax += (taxable_income - bracket.min) * (bracket.percentage / 100); 
                break;
            }
        }

        // Pay Expense and Tax, Perform Withdrawals, Invest Extra Cash
        if (tax > 0) { cash -= tax; }
        cash -= expense;
        if (cash < 0) {
            // perform withdrawls
        } else { cash -= dis_expense; }
        if (cash > 0) { Investments[0].value += cash; }

        // Run rebalance

        // Subtract Life Expectancy
        scenario.lifeExpectancyUser--;
        if (scenario.lifeExpectancySpouse) {scenario.lifeExpectancySpouse--;}

        const copy = structuredClone(scenario);
        copy._id = Math.floor(Math.random() * 1000) + 1000;
        setScenarioList(prevList => [...prevList, copy]);
    }
    }, [scenario]);

    return (
        <div>
           <ScenarioList scenarios={scenario_list} simulate={true}/>
        </div>
    );
}