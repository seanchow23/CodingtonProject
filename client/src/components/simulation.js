export default function simulation({ scenario }) {

    // Check and perform random sampling
    if (scenario.random[0] !== 0) {
        scenario.lifeExpectancyUser = Math.floor(sampleNormal(scenario.random[1], scenario.random[2]));
        scenario.lifeExpectancySpouse = Math.floor(sampleNormal(scenario.random[1], scenario.random[2]));
    }
    if (scenario.random[3] !== 0) {
        scenario.inflation = sampleNormal(scenario.random[4], scenario.random[5]);
    }

    const scenario_list = [structuredClone(scenario)];
    const output = [[], [[],[],[],[],[]], [[], [], []]];

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
    var capital_gains = [
        { percentage: 0, min: 0, max: 47025 },
        { percentage: 15, min: 47026, max: 518900 },
        { percentage: 20, min: 518901, max: Infinity }
    ]
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
        capital_gains = [
            { percentage: 0, min: 0, max: 94050 },
            { percentage: 15, min: 94051, max: 583750 },
            { percentage: 20, min: 583751, max: Infinity }
        ]
    }

    const rmd_distributions = [
        27.4, 26.5, 25.5, 24.6, 23.7, 22.9, 22.0, 21.1, 20.2, 19.4, 18.5, 17.7, 16.8, 16.0, 
        15.2, 14.4, 13.7, 12.9, 12.2, 11.5, 10.8, 10.1, 9.5, 8.9, 8.4, 7.8, 7.3, 6.8, 6.4, 6.0, 5.6, 
        5.2, 4.9, 4.6, 4.3, 4.1, 3.9, 3.7, 3.5, 3.4, 3.3, 3.1, 3.0, 2.9, 2.8, 2.7, 2.5, 2.3, 2.0
    ];

    // Prev variables
    var prev_curYearIncome = 0;
    var prev_curYearSS = 0;
    var prev_curYearGains = 0;
    var prev_curYearEarlyWithdrawals = 0;
    var prev_federal_brackets = federal_brackets;
    var prev_federal_deductions = federal_deductions;
    var prev_capital_gains = capital_gains;

    // Extract Events and Strategies
    const CashInvestment = scenario.investments.find(investment => (investment.investmentType.name === "Cash"))
    const IncomeEvents = scenario.events.filter(event => event.type === 'income');
    const ExpenseEvents = scenario.events.filter(event => event.type === 'expense');
    const Investments = scenario.investments;

    // Randomness in Event Duration/Start Year
    for (const event of IncomeEvents) {
        if (event.random[0] === 1) {
            event.startYear = Math.floor(sampleNormal(event.random[1], event.random[2]));
        } else if (event.random[0] === 2) {
            event.startYear = Math.floor(Math.random() * (event.random[2] - event.random[1]) + event.random[1]);
        }
        if (event.random[3] === 1) {
            event.duration = Math.floor(sampleNormal(event.random[4], event.random[5]));
        } else if (event.random[3] === 2) {
            event.duration = Math.floor(Math.random() * (event.random[5] - event.random[4]) + event.random[4]);
        }
    }
    for (const event of ExpenseEvents) {
        if (event.random[0] === 1) {
            event.startYear = Math.floor(sampleNormal(event.random[1], event.random[2]));
        } else if (event.random[0] === 2) {
            event.startYear = Math.floor(Math.random() * (event.random[2] - event.random[1]) + event.random[1]);
        }
        if (event.random[3] === 1) {
            event.duration = Math.floor(sampleNormal(event.random[4], event.random[5]));
        } else if (event.random[3] === 2) {
            event.duration = Math.floor(Math.random() * (event.random[5] - event.random[4]) + event.random[4]);
        }
    }

    // Add to Output
    const total_asset = scenario.investments.reduce((sum, investment) => sum + investment.value, 0);
    output[0].push(Number(scenario.financialGoal) <= total_asset);
    output[1].push([total_asset, 0, 0, 0, 0]);
    output[2][0].push(structuredClone(scenario.events.filter(event => event.type === 'income').filter(event => event.startYear <= year)));
    output[2][1].push(structuredClone(scenario.events.filter(event => event.type === 'expense').filter(event => event.startYear <= year)));
    output[2][2].push(structuredClone(scenario.investments));

    while (scenario.lifeExpectancyUser > 0) {
        var curYearIncome = 0;
        var curYearSS = 0;
        var curYearGains = 0;
        var curYearEarlyWithdrawals = 0;

        // Run Income Events
        for (const income of IncomeEvents) {
            if (income.startYear <= year && income.duration > 0) {
                income.duration -= 1;
                income.amount = Number(income.amount);
                curYearIncome += income.amount;
                if (income.ss) { curYearSS += income.amount; }
                CashInvestment.value += income.amount;
                CashInvestment.baseValue += income.amount;
                income.amount += Number(income.change);
                if (income.inflation) { income.amount *= (1 + (Number(scenario.inflation) / 100)); }
            }
        }

        // Perform RMD for previous year
        var age = year - scenario.birthYearUser;
        if (age > 120) { age = 120; }
        if (age >= 74 && Investments.find(investment => (investment.taxStatus === "pre-tax retirement"))) {
            const rmd = scenario.rmd;
            var total = rmd.reduce((sum, investment) => sum + Number(investment.value), 0);
            var withdrawal = total / rmd_distributions[age - 72];

            for (const investment of rmd) {
                const principle = Number(investment.value);
                var recipient = Investments.filter(inv => (inv.investmentType._id === investment.investmentType._id)).find(inv => (inv.taxStatus === "non-retirement"));
                if (recipient === undefined) {
                    recipient = {
                        _id: Math.floor(Math.random() * 1000) + 1000,
                        investmentType: investment.investmentType,
                        value: 0,
                        baseValue: 0,
                        taxStatus: "non-retirement"
                    };
                    scenario.investments.push(recipient);
                }
                if (withdrawal < principle) {
                    curYearIncome += withdrawal;
                    recipient.value += withdrawal;
                    recipient.baseValue += withdrawal;
                    investment.baseValue = Number(investment.baseValue) * (1 - (withdrawal / principle));
                    investment.value = principle - withdrawal;
                    withdrawal = 0;
                    break;
                } else {
                    curYearIncome += principle;
                    recipient.value += principle;
                    recipient.baseValue += principle;
                    investment.baseValue = 0;
                    investment.value = 0;
                    withdrawal -= principle;
                }
            }
        }

        // Update Investment
        for (const types of scenario.investmentTypes) {
            if (types.random[0] !== 0) {
                types.expectedAnnualReturn = sampleNormal(types.random[1], types.random[2]);
            }
            if (types.random[3] !== 0) {
                types.expectedAnnualIncome = sampleNormal(types.random[4], types.random[5]);
            }
        }
        for (const investment of Investments) {
            const data = investment.investmentType;
            investment.value = Number(investment.value);
            investment.baseValue = Number(investment.baseValue);
            const prev = investment.value;
            if (data.taxability && investment.taxStatus === "non-retirement") { curYearIncome += Number(data.expectedAnnualIncome); }
            investment.value *= 1 + Number(data.expectedAnnualReturn) / 100;
            investment.value += Number(data.expectedAnnualIncome);
            const expense_ratio = (prev + investment.value) * Number(data.expenseRatio) / 2;
            investment.value -= expense_ratio;
        }

        // Run Optimizer if enabled
        if (scenario.rothOptimizer && year >= Number(scenario.rothYears[0]) && year <= Number(scenario.rothYears[1])) {
            const curYearFedTaxableIncome = curYearIncome - 0.15 * curYearSS;
            const tax_bracket = federal_brackets.find(bracket => bracket.max > curYearFedTaxableIncome - federal_deductions);
            var rc = tax_bracket.max - (curYearFedTaxableIncome - federal_deductions);
            for (const investment of scenario.rothStrategy) {
                const principle = Number(investment.value);
                var recipient = scenario.investments.filter(investment => (investment.investmentType._id === investment.investmentType._id)).find(investment => (investment.taxStatus === "after-tax retirement"));
                if (recipient === undefined) {
                    recipient = {
                        _id: Math.floor(Math.random() * 1000) + 1000,
                        investmentType: investment.investmentType,
                        value: 0,
                        baseValue: 0,
                        taxStatus: "after-tax retirement"
                    };
                    scenario.investments.push(recipient);
                }
                if (rc < principle) {
                    curYearIncome += rc;
                    recipient.value += rc;
                    recipient.baseValue += rc;
                    investment.baseValue = Number(investment.baseValue) * (1 - (rc / principle));
                    investment.value = principle - rc;
                    rc = 0;
                    break;
                } else {
                    curYearIncome += principle;
                    recipient.value += principle;
                    recipient.baseValue += principle;
                    investment.baseValue = 0;
                    investment.value = 0;
                    rc -= principle;
                }
            }
        }

        // Calculate taxes
        var federal_tax = 0;
        for (const bracket of prev_federal_brackets) {
            const taxable_income = Math.max(0, prev_curYearIncome - prev_federal_deductions);
            if (taxable_income > bracket.max) { federal_tax += (bracket.max - bracket.min) * (bracket.percentage / 100); }
            else { 
                federal_tax += (taxable_income - bracket.min) * (bracket.percentage / 100); 
                break;
            }
        }

        var capital_gains_tax = 0;
        for (const bracket of prev_capital_gains) {
            const taxable_income = prev_curYearGains;
            if (taxable_income > bracket.max) { capital_gains_tax += (bracket.max - bracket.min) * (bracket.percentage / 100); }
            else { 
                capital_gains_tax += (taxable_income - bracket.min) * (bracket.percentage / 100); 
                break;
            }
        }
        if (capital_gains_tax < 0) { capital_gains_tax = 0; }

        var early_withdrawal_tax = curYearEarlyWithdrawals * 0.1;

        // Run Non-Discretionary Expense Events
        var non_discretionary = 0;
        for (const expense of ExpenseEvents.filter(event => event.discretionary === false)) {
            if (expense.startYear <= year && expense.duration > 0) {
                expense.duration -= 1;
                expense.amount = Number(expense.amount);
                non_discretionary += expense.amount;
                expense.amount += Number(expense.change);
                if (expense.inflation) { expense.amount *= (1 + (Number(scenario.inflation) / 100)); }
            }
        }

        const payment = federal_tax + capital_gains_tax + early_withdrawal_tax + non_discretionary;

        // Pay Expense and Tax, Perform Withdrawals, Invest Extra Cash
        var withdrawal_amount = payment - CashInvestment.value;
        if (withdrawal_amount > 0) {
            CashInvestment.value = 0;
            CashInvestment.baseValue = 0;
            for (const withdraw of scenario.withdrawalStrategy) {
                const principle = Number(withdraw.value);
                if (withdrawal_amount < principle) {
                    if (withdraw.taxStatus === "non-retirement") { curYearGains += withdrawal_amount * ((principle - Number(withdraw.baseValue)) / principle); }
                    else if (age < 59) { curYearEarlyWithdrawals += withdrawal_amount; }
                    if (withdraw.taxStatus === "pre-tax retirement") { curYearIncome += withdrawal_amount; }
                    withdraw.baseValue = Number(withdraw.baseValue) * (1 - (withdrawal_amount / principle));
                    withdraw.value = principle - withdrawal_amount;
                    withdrawal_amount = 0;
                    break;
                } else {
                    if (withdraw.taxStatus === "non-retirement") { curYearGains += principle - Number(withdraw.baseValue); }
                    else if (age < 59) { curYearEarlyWithdrawals += principle; }
                    if (withdraw.taxStatus === "pre-tax retirement") { curYearIncome += principle; }
                    withdraw.baseValue = 0;
                    withdraw.value = 0;
                    withdrawal_amount -= principle;
                }
            }
        } else {
            CashInvestment.baseValue -= payment;
            CashInvestment.value -= payment;
        }

        if (withdrawal_amount > 0) {
            console.log("Simulation Error: Not enough cash to pay expenses and taxes. Please check your scenario settings.");
            break;
        }

        // Pay Discretionary Expense
        var discretionary = 0;
        for (const expense of scenario.spendingStrategy) {
            if (expense.startYear <= year && expense.duration > 0) {
                expense.duration -= 1;
                expense.amount = Number(expense.amount);
                discretionary += expense.amount;
                expense.amount += Number(expense.change);
                if (expense.inflation) { expense.amount *= (1 + (Number(scenario.inflation) / 100)); }
                const expenseEvent = ExpenseEvents.find(event => event._id === expense._id);
                expenseEvent.amount = expense.amount;
                expenseEvent.duration = expense.duration;
            }
        }

        withdrawal_amount = discretionary - CashInvestment.value;
        if (withdrawal_amount > 0) {
            CashInvestment.value = 0;
            CashInvestment.baseValue = 0;
            for (const withdraw of scenario.withdrawalStrategy) {
                const principle = Number(withdraw.value);
                if (withdrawal_amount < principle) {
                    if (withdraw.taxStatus === "non-retirement") { curYearGains += withdrawal_amount * ((principle - Number(withdraw.baseValue)) / principle); }
                    else if (age < 59) { curYearEarlyWithdrawals += withdrawal_amount; }
                    if (withdraw.taxStatus === "pre-tax retirement") { curYearIncome += withdrawal_amount; }
                    withdraw.baseValue = Number(withdraw.baseValue) * (1 - (withdrawal_amount / principle));
                    withdraw.value = principle - withdrawal_amount;
                    withdrawal_amount = 0;
                    break;
                } else {
                    if (withdraw.taxStatus === "non-retirement") { curYearGains += principle - Number(withdraw.baseValue); }
                    else if (age < 59) { curYearEarlyWithdrawals += principle; }
                    if (withdraw.taxStatus === "pre-tax retirement") { curYearIncome += principle; }
                    withdraw.baseValue = 0;
                    withdraw.value = 0;
                    withdrawal_amount -= principle;
                }
            }
        } else {
            CashInvestment.baseValue -= discretionary;
            CashInvestment.value -= discretionary;
        }

        // Run Invest
        const InvestEvent = scenario.events.find(event => event.type === 'invest' && event.startYear <= year && event.duration > 0);
        if (InvestEvent) {
            const allocations = InvestEvent.allocations.filter(allocation => (allocation.investment.investmentType.name !== "Cash"));
            allocations.map(allocation => allocation.investment = Investments.find(investment => allocation.investment._id === investment._id));
            
            // Ensure 100% total for Invest Event
            const sumPercentage = allocations.reduce((percentage, allocation) => percentage + allocation.percentage, 0);
            if (sumPercentage === 0) { 
                allocations.map(allocation => allocation.percentage = 100 / allocations.length);
            }
            else if (sumPercentage != 100) {
                const scale_factor = 1 / (sumPercentage / 100);
                allocations.map(allocation => allocation.percentage *= scale_factor);
            }

            // Glide Calculation
            if (InvestEvent.glide) {
                const totalPercentage = allocations.reduce((percentage, allocation) => percentage + allocation.finalPercentage, 0);
                if (totalPercentage === 0) {
                    allocations.map(allocation => allocation.finalPercentage = 100 / allocations.length);
                }
                if (totalPercentage != 100) {
                    const scale_factor = 1 / (totalPercentage / 100);
                    allocations.map(allocation => allocation.finalPercentage *= scale_factor);
                }
                for (const allocation of allocations) {
                    allocation.glide = (allocation.finalPercentage - allocation.percentage) / scenario.lifeExpectancyUser;
                }
            }

            InvestEvent.duration -= 1;

            const retirement_assets = allocations.filter(allocation => allocation.investment.taxStatus === "after-tax retirement")
            const non_retirement_assets = allocations.filter(allocation => allocation.investment.taxStatus === "non-retirement")
            var after_percentage = retirement_assets.reduce((percentage, allocation) => percentage + allocation.percentage, 0);
            var other_percentage = non_retirement_assets.reduce((percentage, allocation) => percentage + allocation.percentage, 0);
            var after_scale_factor = 1 / (after_percentage / 100);
            var other_scale_factor = 1 / (other_percentage / 100);

            if (CashInvestment.value > InvestEvent.max && allocations.length > 0) {
                const excess = CashInvestment.value - InvestEvent.max;
                var after_excess = excess * (after_percentage / 100);
                if (after_excess > scenario.annualLimit) { after_excess = scenario.annualLimit; }
                var other_excess = excess - after_excess;

                CashInvestment.value = InvestEvent.max;
                CashInvestment.baseValue = InvestEvent.max;

                for (const allocation of allocations) {
                    var sum = other_excess * allocation.percentage / 100 * other_scale_factor;
                    const alloc_investment = Investments.find(investment => allocation.investment._id === investment._id);
                    if (alloc_investment.taxStatus === "after-tax retirement") {
                        sum = after_excess * allocation.percentage / 100 * after_scale_factor;
                    }
                    alloc_investment.value += sum;
                    alloc_investment.baseValue += sum;
                }
            }

            // Glide Path
            for (const allocation of allocations) {
                allocation.percentage += allocation.glide;
            }
        }
        
        const RebalanceEvent = scenario.events.find(event => event.type === 'rebalance' && event.startYear <= year && event.duration > 0);
        if (RebalanceEvent) {
            const allocations = RebalanceEvent.allocations.filter(allocation => (allocation.investment.investmentType.name !== "Cash"));
            allocations.map(allocation => allocation.investment = Investments.find(investment => allocation.investment._id === investment._id));
            
            // Ensure 100% total percentage for Rebalance Event
            const sumPercentage = allocations.reduce((percentage, allocation) => percentage + allocation.percentage, 0);
            if (sumPercentage === 0) { 
                allocations.map(allocation => allocation.percentage = 100 / allocations.length);
            }
            else if (sumPercentage != 100) {
                const scale_factor = 1 / (sumPercentage / 100);
                allocations.map(allocation => allocation.percentage *= scale_factor);
            }

            RebalanceEvent.duration -= 1;

            const retirement_assets = allocations.filter(allocation => allocation.investment.taxStatus === "after-tax retirement")
            const non_retirement_assets = allocations.filter(allocation => allocation.investment.taxStatus === "non-retirement")
            const retirement_value = retirement_assets.reduce((sum, allocation) => sum + allocation.investment.value, 0);
            const non_retirement_value = non_retirement_assets.reduce((sum, allocation) => sum + allocation.investment.value, 0);

            for (const allocation of retirement_assets) {
                const expected_value = retirement_value * allocation.percentage / 100;
                const alloc_investment = Investments.find(investment => allocation.investment._id === investment._id);
                const difference = expected_value - alloc_investment.value;
                if (difference != 0) {
                    if (difference > 0) {
                        alloc_investment.baseValue += difference;
                    } else {
                        alloc_investment.baseValue *= (1 - (-difference / alloc_investment.value));
                    }
                    alloc_investment.value += difference;
                }
            }
            for (const allocation of non_retirement_assets) {
                const expected_value = non_retirement_value * allocation.percentage / 100;
                const alloc_investment = Investments.find(investment => allocation.investment._id === investment._id);
                const difference = expected_value - alloc_investment.value;
                if (difference != 0) {
                    if (difference > 0) {
                        alloc_investment.baseValue += difference;
                    } else {
                        alloc_investment.baseValue *= (1 - (-difference / alloc_investment.value));
                    }
                    alloc_investment.value += difference;
                }
            }
        }

        // Adjust for inflation
        const inflation = 1 + Number(scenario.inflation) / 100;
        prev_federal_brackets = federal_brackets;
        prev_federal_deductions = federal_deductions;
        prev_capital_gains = capital_gains;
        for (const bracket of federal_brackets) {
            bracket.min = bracket.min * inflation;
            bracket.max = bracket.max * inflation;
        }
        federal_deductions = federal_deductions * inflation;
        for (const bracket of capital_gains) {
            bracket.min = bracket.min * inflation;
            bracket.max = bracket.max * inflation;
        }
        scenario.annualLimit *= inflation;
        if (scenario.random[3] !== 0) {
            scenario.inflation = sampleNormal(scenario.random[4], scenario.random[5]);
        }

        // Subtract Life Expectancy
        scenario.lifeExpectancyUser--;
        if (scenario.lifeExpectancySpouse) {scenario.lifeExpectancySpouse--;}

        // Keep track of previous values
        prev_curYearIncome = curYearIncome;
        prev_curYearSS = curYearSS;
        prev_curYearGains = curYearGains;
        prev_curYearEarlyWithdrawals = curYearEarlyWithdrawals;
        year += 1;
        
        // Add to Output
        const total_asset = Investments.reduce((sum, investment) => sum + investment.value, 0);
        output[0].push(Number(scenario.financialGoal) <= total_asset);
        output[1][0].push(total_asset);
        output[1][1].push(curYearIncome);
        output[1][2].push(payment + discretionary);
        output[1][3].push(curYearEarlyWithdrawals);
        output[1][4].push(discretionary / (discretionary + non_discretionary));
        output[2][0].push(structuredClone(IncomeEvents.filter(event => event.startYear <= year)));
        output[2][1].push(structuredClone(ExpenseEvents.filter(event => event.startYear <= year)));
        output[2][2].push(structuredClone(Investments));

        const copy = structuredClone(scenario);
        copy._id = Math.floor(Math.random() * 1000) + 1000;
        scenario_list.push(copy);
    }

    return output;
}

function sampleNormal(mean, sd) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * sd + mean;
}