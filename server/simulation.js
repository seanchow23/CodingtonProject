async function simulation({ scenario, seed = null, csvLogger = null, eventLogger = null }) {

    // TAXES
    // 1) Fetch all four endpoints in parallel
    const [dedRes, rmdRes, gainsRes, fedRes, ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/tax/deductions`),
        fetch(`${process.env.REACT_APP_API_URL}/api/tax/rmd-table`),
        fetch(`${process.env.REACT_APP_API_URL}/api/tax/capital-gains`),
        fetch(`${process.env.REACT_APP_API_URL}/api/tax/federal`),
    ]);

    // 2) Parse JSON
    const [dedData, rmdTable, gainsData, fedData,] = await Promise.all([
        dedRes.json(),
        rmdRes.json(),
        gainsRes.json(),
        fedRes.json()
    ]);

    // State Taxes
    var state_tax = [];
    var state_tax_married = [];

    const stateAbbrevToKey = {
        AL: "alabama", AK: "alaska", AZ: "arizona", AR: "arkansas", CA: "california",
        CO: "colorado", CT: "connecticut", DE: "delaware", FL: "florida", GA: "georgia",
        HI: "hawaii", ID: "idaho", IL: "illinois", IN: "indiana", IA: "iowa",
        KS: "kansas", KY: "kentucky", LA: "louisiana", ME: "maine", MD: "maryland",
        MA: "massachusetts", MI: "michigan", MN: "minnesota", MS: "mississippi", MO: "missouri",
        MT: "montana", NE: "nebraska", NV: "nevada", NH: "new_hampshire", NJ: "new_jersey",
        NM: "new_mexico", NY: "new_york", NC: "north_carolina", ND: "north_dakota", OH: "ohio",
        OK: "oklahoma", OR: "oregon", PA: "pennsylvania", RI: "rhode_island", SC: "south_carolina",
        SD: "south_dakota", TN: "tennessee", TX: "texas", UT: "utah", VT: "vermont",
        VA: "virginia", WA: "washington", WV: "west_virginia", WI: "wisconsin", WY: "wyoming"
    };
      
    const getStateKeyFromAbbreviation = (abbrev) => {
        return stateAbbrevToKey[abbrev?.toUpperCase()] || null;
    };
    

    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tax/state`);
        const stateTaxData = await response.json();

        const stateKey = getStateKeyFromAbbreviation(scenario.state);
        const stateData = stateTaxData[stateKey];

        if (stateData && stateData.filing_statuses) {
            const singleBrackets = stateData.filing_statuses['single'];
            const marriedBrackets = stateData.filing_statuses['married'];

            if (singleBrackets) {
                state_tax = singleBrackets.map(({ min, max, rate }) => ({
                    min,
                    max,
                    percentage: rate * 100
                }));
                console.log(`State tax brackets for single filers in ${scenario.state}:`, state_tax);
            } else {
                console.warn(`No tax brackets found for single filers in state: ${scenario.state}`);
            }

            if (marriedBrackets) {
                state_tax_married = marriedBrackets.map(({ min, max, rate }) => ({
                    min,
                    max,
                    percentage: rate * 100
                }));
                console.log(`State tax brackets for married filers in ${scenario.state}:`, state_tax_married);
            } else {
                console.warn(`No tax brackets found for married filers in state: ${scenario.state}`);
            }
        } else {
            console.warn(`No tax data found for state: ${scenario.state}`);
        }
    } catch (error) {
        console.error('Error fetching state tax data:', error);
    }

    // Getting Deductions
    var federal_deductions = dedData.find(e => e.filingStatus.includes('Single'))?.standardDeduction ?? 0;
    var federal_deductions_married = dedData.find(e => e.filingStatus.includes('Married filing jointly'))?.standardDeduction ?? 0;

    console.log('here is federal_deductionss for simulation single', federal_deductions);
    console.log('here is federal_deductionss for simulation married', federal_deductions_married);

    // --- RMD distributions ---
    const rmd_distributions = rmdTable
        .filter(item => item.age >= 72 && item.age <= 120)  // only ages 72–120
        .sort ((a, b) => a.age - b.age)                     // sort ascending by age
        .map  (item => item.divisor);                       // pull out just the number
    console.log('here is rmd dist new', rmd_distributions);

    // Capital Gains
    console.log('capital gain scrape to ',gainsData );
   
    var capital_gains = gainsData["single"]
        .map(br => ({ ...br }))
        .sort((a, b) => a.percentage - b.percentage);
    for (let i = 0; i < capital_gains.length - 1; i++) {
        capital_gains[i].max = capital_gains[i + 1].min - 1;
    }
    capital_gains[capital_gains.length - 1].max = Infinity;

    var capital_gains_married = gainsData["married"]
        .map(br => ({ ...br }))
        .sort((a, b) => a.percentage - b.percentage);
    for (let i = 0; i < capital_gains_married.length - 1; i++) {
        capital_gains_married[i].max = capital_gains_married[i + 1].min - 1;
    }
    capital_gains_married[capital_gains_married.length - 1].max = Infinity;

    console.log('single capital_gains :', capital_gains);
    console.log('married capital_gains :', capital_gains_married);

    // Federal Income 
    console.log('scrape to work with fed',fedData);

    const BRACKET_COUNT = 7;

    const singleRaw = fedData.slice(0, BRACKET_COUNT);
    const marriedRaw = fedData.slice(BRACKET_COUNT, BRACKET_COUNT * 2);
    const rates = [10, 12, 22, 24, 32, 35, 37];
    
    var federal_brackets = singleRaw.map((entry, idx) => ({
      percentage: rates[idx],
      min: parseInt(entry.incomeRange, 10),
      max: entry.taxRate === 'And up' ? Infinity : parseInt(entry.taxRate, 10)
    }));
    
    var federal_brackets_married = marriedRaw.map((entry, idx) => ({
      percentage: rates[idx],
      min: parseInt(entry.incomeRange, 10),
      max: entry.taxRate === 'And up' ? Infinity : parseInt(entry.taxRate, 10)
    }));

    console.log('new fed brack for single',federal_brackets);
    console.log('new fed brack for married',federal_brackets_married);
    // END TAXES

    // Keep only one cash investment
    scenario.investments = scenario.investments.filter((investment, index, self) => {
        if (investment.investmentType.name.toLowerCase() === 'cash') {
          return self.findIndex(i => i.investmentType.name.toLowerCase() === 'cash') === index;
        }
        return true;
    });

    const rng = seed !== null ? mulberry32(seed) : Math.random;

    let user_life_expectancy = 0;
    let spouse_life_expectancy = 0;
    let inflation = 0;

    // Check and perform random sampling
    user_life_expectancy = getDistributionResult(scenario.lifeExpectancyUser, null, rng);
    spouse_life_expectancy = getDistributionResult(scenario.lifeExpectancySpouse, null, rng);
    inflation = getDistributionResult(scenario.inflation, null, rng);

    const scenario_list = [structuredClone(scenario)];
    const output = [[], [[],[],[],[],[]], [[], [], []]];

    var year = 2025;

    // Prev variables
    var prev_curYearIncome = 0;
    var prev_curYearSS = 0;
    var prev_curYearGains = 0;
    var prev_curYearEarlyWithdrawals = 0;
    var prev_federal_brackets = federal_brackets;
    var prev_federal_brackets_married = federal_brackets_married;
    var prev_federal_deductions = federal_deductions;
    var prev_federal_deductions_married = federal_deductions_married;
    var prev_capital_gains = capital_gains;
    var prev_capital_gains_married = capital_gains_married;
    var prev_state_tax = state_tax;
    var prev_state_tax_married = state_tax_married;

    // Randomness in Event Duration/Start Year
    let unresolved = scenario.events.filter(event => ["starts-with", "starts-after"].includes(event.startYear.type));   
    let resolved = scenario.events.filter(event => !["starts-with", "starts-after"].includes(event.startYear.type));

    for (const event of resolved) {
        event.startYear.value1 = getDistributionResult(event.startYear, null, rng);
        event.duration.value1 = getDistributionResult(event.duration, null, rng);
    }

    let maxIterations = 100;

    while (unresolved.length > 0 && maxIterations-- > 0) {
        for (const event of [...unresolved]) {
            const dependencyId = event.startYear.event?._id?.toString?.() || event.startYear.event?.toString?.();
            const resolvedEvent = resolved.find(e => e._id.toString() === dependencyId);
            if (resolvedEvent) {
                event.startYear.value1 = getDistributionResult(event.startYear, resolvedEvent, rng);
                event.duration.value1 = getDistributionResult(event.duration, null, rng);
                resolved.push(event);
                unresolved = unresolved.filter(e => e._id.toString() !== event._id.toString());
            }
        }
    }

    if (maxIterations <= 0) {throw new Error("Circular or unresolved event dependency detected.");}

    // Extract Events and Strategies
    const CashInvestment = scenario.investments.find(investment => (investment?.investmentType?.name?.toLowerCase() === "cash"))
    const IncomeEvents = scenario.events.filter(event => event.type === 'income');
    const ExpenseEvents = scenario.events.filter(event => event.type === 'expense');
    const Investments = scenario.investments;

    // Glide Calculation
    for (const glideEvent of scenario.events.filter(event => event.type === 'invest' || event.type === 'rebalance').filter(event => event.glide)) {
        const allocations = glideEvent.allocations.filter(allocation => (allocation.investment?.investmentType?.name?.toLowerCase() !== "cash"));
        allocations.map(allocation => allocation.investment = Investments.find(investment => allocation.investment._id === investment._id));
        const totalPercentage = allocations.reduce((percentage, allocation) => percentage + allocation.finalPercentage, 0);
        if (totalPercentage === 0) {
            allocations.map(allocation => allocation.finalPercentage = 100 / allocations.length);
        }
        if (totalPercentage != 100) {
            const scale_factor = 1 / (totalPercentage / 100);
            allocations.map(allocation => allocation.finalPercentage *= scale_factor);
        }
        for (const allocation of allocations) {
            allocation.glide = (allocation.finalPercentage - allocation.percentage) / user_life_expectancy;
        }
    }

    if (csvLogger) { csvLogger.logYear(year, Investments.map(inv => inv.value)); }

    // Add to Output
    const total_asset = scenario.investments.reduce((sum, investment) => sum + investment.value, 0);
    output[0].push(Number(scenario.financialGoal) <= total_asset);
    output[1].push([total_asset, 0, 0, 0, 0]);
    output[2][0].push(structuredClone(scenario.events.filter(event => event.type === 'income').filter(event => event.startYear.value1 <= year && event.duration.value1 > 0)));
    output[2][1].push(structuredClone(scenario.events.filter(event => event.type === 'expense').filter(event => event.startYear.value1 <= year && event.duration.value1 > 0)));
    output[2][2].push(structuredClone(scenario.investments));

    let life = 0;

    while (life < user_life_expectancy) {
        var curYearIncome = 0;
        var curYearSS = 0;
        var curYearGains = 0;
        var curYearEarlyWithdrawals = 0;

        // Run Income Events
        for (const income of IncomeEvents) {
            if (income.startYear.value1 <= year && income.duration.value1 > 0) {
                if (eventLogger) { eventLogger.logEvent(year, "Income", income.amount, income.name); }
                income.duration.value1 -= 1;
                income.amount = Number(income.amount);
                curYearIncome += income.amount;
                if (income.ss) { curYearSS += income.amount; }
                CashInvestment.value += income.amount;
                CashInvestment.baseValue += income.amount;
                income.amount += Number(income.change);
                if (income.inflation) { income.amount *= (1 + (Number(inflation) / 100)); }
            }
        }

        // Perform RMD for previous year
        var age = year - scenario.birthYearUser;
        if (age > 120) { age = 120; }
        if (age >= 74 && Investments.find(investment => (investment.taxStatus === "pre-tax retirement"))) {
            const rmd = scenario.rmd;
            rmd.map(inv => inv = Investments.find(investment => inv._id === investment._id));
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
                    Investments.push(recipient);
                }
                if (withdrawal < principle) {
                    if (eventLogger) { 
                        const name = investment.investmentType.name;
                        eventLogger.logEvent(year, "RMD: pre-tax retirement", -withdrawal, name);
                        eventLogger.logEvent(year, "RMD: non-retirement", withdrawal, name);
                    }
                    curYearIncome += withdrawal;
                    recipient.value += withdrawal;
                    recipient.baseValue += withdrawal;
                    investment.baseValue = Number(investment.baseValue) * (1 - (withdrawal / principle));
                    investment.value = principle - withdrawal;
                    withdrawal = 0;
                    break;
                } else {
                    if (eventLogger) { 
                        const name = investment.investmentType.name;
                        eventLogger.logEvent(year, "RMD: pre-tax retirement", -principle, name);
                        eventLogger.logEvent(year, "RMD: non-retirement", principle, name);
                    }
                    curYearIncome += principle;
                    recipient.value += principle;
                    recipient.baseValue += principle;
                    investment.baseValue = 0;
                    investment.value = 0;
                    withdrawal -= principle;
                }
            }
        }

        for (const investment of Investments) {
            const data = investment.investmentType;
            const ear = getDistributionResult(data.expectedAnnualReturn, null, rng);
            const eai = getDistributionResult(data.expectedAnnualIncome, null, rng);
            investment.value = Number(investment.value);
            investment.baseValue = Number(investment.baseValue);
            const prev = investment.value;
            if (data.taxability && investment.taxStatus === "non-retirement") { curYearIncome += Number(eai); }
            investment.value *= 1 + Number(ear) / 100;
            investment.value += Number(eai);
            const expense_ratio = (prev + investment.value) * Number(data.expenseRatio) / 2;
            investment.value -= expense_ratio;
        }

        // Run Optimizer if enabled
        if (scenario.rothOptimizer && year >= Number(scenario.rothYears[0]) && year <= Number(scenario.rothYears[1])) {
            const curYearFedTaxableIncome = curYearIncome - 0.15 * curYearSS;
            let tax_bracket;
            if (scenario.married) { tax_bracket = federal_brackets_married.find(bracket => bracket.max > curYearFedTaxableIncome - federal_deductions_married); }
            else { tax_bracket = federal_brackets.find(bracket => bracket.max > curYearFedTaxableIncome - federal_deductions); }
            var rc = tax_bracket.max - (curYearFedTaxableIncome - federal_deductions);
            const rothStrategy = scenario.rothStrategy;
            rothStrategy.map(inv => inv = Investments.find(investment => inv._id === investment._id));
            for (const investment of rothStrategy) {
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
                    Investments.push(recipient);
                }
                if (rc < principle) {
                    if (eventLogger) { 
                        const name = investment.investmentType.name;
                        eventLogger.logEvent(year, "Roth: pre-tax retirement", -rc, name);
                        eventLogger.logEvent(year, "Roth: after-tax retirement", rc, name);
                    }
                    curYearIncome += rc;
                    recipient.value += rc;
                    recipient.baseValue += rc;
                    investment.baseValue = Number(investment.baseValue) * (1 - (rc / principle));
                    investment.value = principle - rc;
                    rc = 0;
                    break;
                } else {
                    if (eventLogger) { 
                        const name = investment.investmentType.name;
                        eventLogger.logEvent(year, "Roth: pre-tax retirement", -principle, name);
                        eventLogger.logEvent(year, "Roth: after-tax retirement", principle, name);
                    }
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
        const tax_bracket = scenario.married ? prev_federal_brackets_married : prev_federal_brackets;
        const tax_deduction = scenario.married ? prev_federal_deductions_married : prev_federal_deductions;
        for (const bracket of tax_bracket) {
            const taxable_income = Math.max(0, prev_curYearIncome - (0.15 * prev_curYearSS) - tax_deduction);
            if (taxable_income > bracket.max) { federal_tax += (bracket.max - bracket.min) * (bracket.percentage / 100); }
            else { 
                federal_tax += (taxable_income - bracket.min) * (bracket.percentage / 100); 
                break;
            }
        }

        var capital_gains_tax = 0;
        const gains_bracket = scenario.married ? prev_capital_gains_married : prev_capital_gains;
        for (const bracket of gains_bracket) {
            const taxable_income = prev_curYearGains;
            if (taxable_income > bracket.max) { capital_gains_tax += (bracket.max - bracket.min) * (bracket.percentage / 100); }
            else { 
                capital_gains_tax += (taxable_income - bracket.min) * (bracket.percentage / 100); 
                break;
            }
        }
        if (capital_gains_tax < 0) { capital_gains_tax = 0; }

        var early_withdrawal_tax = curYearEarlyWithdrawals * 0.1;

        var state_taxes = 0;
        const state_bracket = scenario.married ? prev_state_tax_married :  prev_state_tax;
        for (const bracket of state_bracket) {
            const taxable_income = Math.max(0, prev_curYearIncome - 0.15 * prev_curYearSS);
            if (taxable_income > bracket.max) { state_taxes += (bracket.max - bracket.min) * (bracket.percentage / 100); }
            else { 
                state_taxes += (taxable_income - bracket.min) * (bracket.percentage / 100); 
                break;
            }
        }
        if (state_bracket.length > 0 && Math.max(0, prev_curYearIncome - 0.15 * prev_curYearSS) > state_bracket[state_bracket.length - 1].max) {
            const last_bracket = state_bracket[state_bracket.length - 1];
            state_taxes += (Math.max(0, prev_curYearIncome - 0.15 * prev_curYearSS) - last_bracket.max) * (last_bracket.percentage / 100);
        }
        for (const bracket of state_bracket) {
            const taxable_income = prev_curYearGains;
            if (taxable_income > bracket.max) { state_taxes += (bracket.max - bracket.min) * (bracket.percentage / 100); }
            else { 
                state_taxes += (taxable_income - bracket.min) * (bracket.percentage / 100); 
                break;
            }
        }
        if (state_bracket.length > 0 && prev_curYearGains > state_bracket[state_bracket.length - 1].max) {
            const last_bracket = state_bracket[state_bracket.length - 1];
            state_taxes += (prev_curYearGains - last_bracket.max) * (last_bracket.percentage / 100);
        }

        if (eventLogger) {
            if (federal_tax > 0) { eventLogger.logEvent(year, "Tax", federal_tax, "Federal Income"); }
            if (capital_gains_tax > 0) { eventLogger.logEvent(year, "Tax", capital_gains_tax, "Capital Gains"); }
            if (early_withdrawal_tax > 0) { eventLogger.logEvent(year, "Tax", early_withdrawal_tax, "Early Withdrawal"); }
            if (state_taxes > 0) { eventLogger.logEvent(year, "Tax", state_taxes, "State Tax"); }
        }

        // Check if spouse is alive
        if (scenario.married && spouse_life_expectancy <= 0) { scenario.married = false; }

        // Run Non-Discretionary Expense Events
        var non_discretionary = 0;
        for (const expense of ExpenseEvents.filter(event => event.discretionary === false)) {
            if (expense.startYear.value1 <= year && expense.duration.value1 > 0) {
                if (eventLogger) { eventLogger.logEvent(year, "Expense (Non-Discretionary)", expense.amount, expense.name); }
                expense.duration.value1 -= 1;
                expense.amount = Number(expense.amount);
                non_discretionary += expense.amount;
                expense.amount += Number(expense.change);
                if (expense.inflation) { expense.amount *= (1 + (Number(inflation) / 100)); }
            }
        }

        const payment = federal_tax + capital_gains_tax + early_withdrawal_tax + non_discretionary + state_taxes;

        // Pay Expense and Tax, Perform Withdrawals, Invest Extra Cash
        var withdrawal_amount = payment - CashInvestment.value;
        if (withdrawal_amount > 0) {
            CashInvestment.value = 0;
            CashInvestment.baseValue = 0;
            const withdrawalStrategy = scenario.withdrawalStrategy;
            withdrawalStrategy.map(withdraw => withdraw = Investments.find(investment => withdraw._id === investment._id));
            for (const withdraw of withdrawalStrategy) {
                const principle = Number(withdraw.value);
                if (withdrawal_amount < principle) {
                    if (eventLogger) { eventLogger.logEvent(year, "Withdrawal: " + withdraw.taxStatus, withdrawal_amount, withdrawal.investmentType.name); }
                    if (withdraw.taxStatus === "non-retirement") { curYearGains += withdrawal_amount * ((principle - Number(withdraw.baseValue)) / principle); }
                    else if (age < 59) { curYearEarlyWithdrawals += withdrawal_amount; }
                    if (withdraw.taxStatus === "pre-tax retirement") { curYearIncome += withdrawal_amount; }
                    withdraw.baseValue = Number(withdraw.baseValue) * (1 - (withdrawal_amount / principle));
                    withdraw.value = principle - withdrawal_amount;
                    withdrawal_amount = 0;
                    break;
                } else {
                    if (eventLogger) { eventLogger.logEvent(year, "Withdrawal: " + withdraw.taxStatus, principle, withdrawal.investmentType.name); }
                    if (withdraw.taxStatus === "non-retirement") { curYearGains += principle - Number(withdraw.baseValue); }
                    else if (age < 59) { curYearEarlyWithdrawals += principle; }
                    if (withdraw.taxStatus === "pre-tax retirement") { curYearIncome += principle; }
                    withdraw.baseValue = 0;
                    withdraw.value = 0;
                    withdrawal_amount -= principle;
                }
            }
        } else if (payment > 0) {
            CashInvestment.baseValue -= payment;
            CashInvestment.value -= payment;
            if (eventLogger) { eventLogger.logEvent(year, "Withdrawal: non-retirement", payment, "Cash"); }
        }

        if (withdrawal_amount > 0) {
            console.log("Simulation Error: Not enough cash to pay expenses and taxes. Please check your scenario settings.");
            break;
        }

        // Pay Discretionary Expense
        var discretionary = 0;
        const spendingStrategy = scenario.spendingStrategy;
        spendingStrategy.map(expense => expense = ExpenseEvents.find(event => expense._id === event._id));
        for (const expense of spendingStrategy) {
            if (expense.startYear.value1 <= year && expense.duration.value1 > 0) {
                if (eventLogger) { eventLogger.logEvent(year, "Expense (Discretionary)", expense.amount, expense.name); }
                expense.duration.value1 -= 1;
                expense.amount = Number(expense.amount);
                discretionary += expense.amount;
                expense.amount += Number(expense.change);
                if (expense.inflation) { expense.amount *= (1 + (Number(inflation) / 100)); }
                const expenseEvent = ExpenseEvents.find(event => event._id === expense._id);
                expenseEvent.amount = expense.amount;
                expenseEvent.duration.value1 = expense.duration.value1;
            }
        }

        withdrawal_amount = discretionary - CashInvestment.value;
        if (withdrawal_amount > 0) {
            CashInvestment.value = 0;
            CashInvestment.baseValue = 0;
            const withdrawalStrategy = scenario.withdrawalStrategy;
            withdrawalStrategy.map(withdraw => withdraw = Investments.find(investment => withdraw._id === investment._id));
            for (const withdraw of withdrawalStrategy) {
                const principle = Number(withdraw.value);
                if (withdrawal_amount < principle) {
                    if (eventLogger) { eventLogger.logEvent(year, "Withdrawal: " + withdraw.taxStatus, withdrawal_amount, withdrawal.investmentType.name); }
                    if (withdraw.taxStatus === "non-retirement") { curYearGains += withdrawal_amount * ((principle - Number(withdraw.baseValue)) / principle); }
                    else if (age < 59) { curYearEarlyWithdrawals += withdrawal_amount; }
                    if (withdraw.taxStatus === "pre-tax retirement") { curYearIncome += withdrawal_amount; }
                    withdraw.baseValue = Number(withdraw.baseValue) * (1 - (withdrawal_amount / principle));
                    withdraw.value = principle - withdrawal_amount;
                    withdrawal_amount = 0;
                    break;
                } else {
                    if (eventLogger) { eventLogger.logEvent(year, "Withdrawal: " + withdraw.taxStatus, principle, withdrawal.investmentType.name); }
                    if (withdraw.taxStatus === "non-retirement") { curYearGains += principle - Number(withdraw.baseValue); }
                    else if (age < 59) { curYearEarlyWithdrawals += principle; }
                    if (withdraw.taxStatus === "pre-tax retirement") { curYearIncome += principle; }
                    withdraw.baseValue = 0;
                    withdraw.value = 0;
                    withdrawal_amount -= principle;
                }
            }
        } else if (discretionary > 0) {
            CashInvestment.baseValue -= discretionary;
            CashInvestment.value -= discretionary;
            if (eventLogger) { eventLogger.logEvent(year, "Withdrawal: non-retirement", discretionary, "Cash"); }
        }

        // Run Invest
        const InvestEvent = scenario.events.find(event => event.type === 'invest' && event.startYear.value1 <= year && event.duration.value1 > 0);
        if (InvestEvent) {
            const allocations = InvestEvent.allocations.filter(allocation => (allocation.investment?.investmentType?.name?.toLowerCase() !== "cash"));
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

            InvestEvent.duration.value1 -= 1;

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
                    if (eventLogger && sum !== 0) { eventLogger.logEvent(year, "Invest Event: " + InvestEvent.name, sum, alloc_investment.investmentType.name); }
                }
            }

            // Glide Path
            for (const allocation of allocations) {
                allocation.percentage += allocation.glide;
            }
        }
        
        const RebalanceEvent = scenario.events.find(event => event.type === 'rebalance' && event.startYear.value1 <= year && event.duration.value1 > 0);
        if (RebalanceEvent) {
            const allocations = RebalanceEvent.allocations.filter(allocation => (allocation.investment?.investmentType?.name?.toLowerCase() !== "cash"));
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

            RebalanceEvent.duration.value1 -= 1;

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
                    if (eventLogger) { eventLogger.logEvent(year, "Rebalance Event: " + RebalanceEvent.name, difference, alloc_investment.investmentType.name); }
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
                    if (eventLogger) { eventLogger.logEvent(year, "Rebalance Event: " + RebalanceEvent.name, difference, alloc_investment.investmentType.name); }
                }
            }

            // Glide Path
            for (const allocation of allocations) {
                allocation.percentage += allocation.glide;
            }
        }

        // Adjust for inflation
        inflation = 1 + Number(inflation) / 100;
        prev_federal_brackets = federal_brackets;
        prev_federal_brackets_married = federal_brackets_married;
        prev_federal_deductions = federal_deductions;
        prev_federal_deductions_married = federal_deductions_married;
        prev_capital_gains = capital_gains;
        prev_capital_gains_married = capital_gains_married;
        prev_state_tax = state_tax;
        prev_state_tax_married = state_tax_married;
        for (const bracket of federal_brackets) {
            bracket.min = bracket.min * inflation;
            bracket.max = bracket.max * inflation;
        }
        for (const bracket of federal_brackets_married) {
            bracket.min = bracket.min * inflation;
            bracket.max = bracket.max * inflation;
        }
        federal_deductions = federal_deductions * inflation;
        federal_deductions_married = federal_deductions_married * inflation;
        for (const bracket of capital_gains) {
            bracket.min = bracket.min * inflation;
            bracket.max = bracket.max * inflation;
        }
        for (const bracket of capital_gains_married) {
            bracket.min = bracket.min * inflation;
            bracket.max = bracket.max * inflation;
        }
        for (const bracket of state_tax) {
            bracket.min = bracket.min * inflation;
            bracket.max = bracket.max * inflation;
        }
        for (const bracket of state_tax_married) {
            bracket.min = bracket.min * inflation;
            bracket.max = bracket.max * inflation;
        }
        scenario.annualLimit *= inflation;
        inflation = getDistributionResult(scenario.inflation, null, rng);

        // Subtract Life Expectancy
        life++;
        spouse_life_expectancy--;

        // Keep track of previous values
        prev_curYearIncome = curYearIncome;
        prev_curYearSS = curYearSS;
        prev_curYearGains = curYearGains;
        prev_curYearEarlyWithdrawals = curYearEarlyWithdrawals;
        year += 1;

        if (csvLogger) { csvLogger.logYear(year, Investments.map(inv => inv.value)); }
        
        // Add to Output
        const total_asset = Investments.reduce((sum, investment) => sum + investment.value, 0);
        output[0].push(Number(scenario.financialGoal) <= total_asset);
        output[1][0].push(total_asset);
        output[1][1].push(curYearIncome);
        output[1][2].push(payment + discretionary);
        output[1][3].push(curYearEarlyWithdrawals);
        output[1][4].push(discretionary / (discretionary + non_discretionary));
        output[2][0].push(structuredClone(IncomeEvents.filter(event => event.startYear.value1 <= year && event.duration.value1 > 0)));
        output[2][1].push(structuredClone(ExpenseEvents.filter(event => event.startYear.value1 <= year && event.duration.value1 > 0)));
        output[2][2].push(structuredClone(Investments));

        const copy = structuredClone(scenario);
        copy._id = Math.floor(Math.random() * 1000) + 1000;
        scenario_list.push(copy);
    }

    if (csvLogger) { csvLogger.flush(Investments.map(inv => inv.investmentType.name)); }
    if (eventLogger) { eventLogger.flush(); }

    return output;
}

function sampleNormal(mean, sd, rng = Math.random) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * sd + mean;
}

function mulberry32(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
function getDistributionResult(distribution, event = null, rng = Math.random) {
    if (distribution.type === "fixed") {
        return distribution.value1;
    } else if (distribution.type === "normal") {
        return Math.floor(sampleNormal(distribution.value1, distribution.value2, rng));
    } else if (distribution.type === "uniform") {
        const min = distribution.value1;
        const max = distribution.value2;
        return Math.floor(rng() * (max - min) + min);
    } else if (distribution.type === "starts-with") {
        return event.startYear.value1;
    } else if (distribution.type === "starts-after") {
        return event.startYear.value1 + event.duration.value1 + 1;
    } else {
        return 0;
    }
}

module.exports = simulation;