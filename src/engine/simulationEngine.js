import { US_HISTORICAL_DATA, SPAIN_HISTORICAL_DATA } from '../data/historicalData.js';

/**
 * Calculates cumulative inflation multipliers up to the target base year (2026)
 * @param {Object} inflationRates - Map of year -> annual inflation %
 * @param {number} baseYear - Target base year (e.g. 2026)
 * @returns {Object} Map of year -> multiplier to convert year's money to baseYear purchasing power
 */
export function calculateInflationMultipliers(inflationRates, baseYear = 2026) {
  const years = Object.keys(inflationRates).map(Number).sort((a, b) => a - b);
  const multipliers = {};

  for (let i = 0; i < years.length; i++) {
    const y = years[i];
    if (y > baseYear) {
      multipliers[y] = 1;
      continue;
    }

    // Multiply (1 + rate) for all years from y+1 up to baseYear
    let mult = 1.0;
    for (let k = y + 1; k <= baseYear; k++) {
      const rate = (inflationRates[k] ?? 2.0) / 100;
      mult *= (1 + rate);
    }
    multipliers[y] = mult;
  }

  return multipliers;
}

/**
 * Runs a complete historical simulation for the specified parameters
 * @param {Object} options
 * @param {'US'|'ES'} options.country - 'US' or 'ES'
 * @param {number} options.startYear - e.g. 1990
 * @param {number} options.duration - e.g. 30
 * @param {number} options.savingsRate - Percentage of salary saved monthly (e.g. 10)
 * @param {number} [options.customInitialSalary] - Optional override for starting salary (scaled historically)
 * @returns {Object} Full simulation results including annual breakdown and aggregate KPIs
 */
export function runHistoricalSimulation({
  country = 'ES',
  startYear = 1995,
  duration = 30,
  savingsRate = 10,
  customInitialSalary = null
}) {
  const isSpain = country === 'ES';
  const data = isSpain ? SPAIN_HISTORICAL_DATA : US_HISTORICAL_DATA;
  const currencySymbol = isSpain ? '€' : '$';
  const currencyCode = isSpain ? 'EUR' : 'USD';

  const endYear = Math.min(startYear + duration, 2026);
  const simYears = [];
  for (let y = startYear; y <= endYear; y++) {
    simYears.push(y);
  }

  const inflationRates = isSpain ? data.ipcInflation : data.cpiInflation;
  const multipliersTo2026 = calculateInflationMultipliers(inflationRates, 2026);

  // Determine salary scale factor if user provided a custom initial salary
  const baseHistoricalStartSalary = data.medianSalary[startYear] || (isSpain ? 14200 : 34000);
  const salaryScale = customInitialSalary ? customInitialSalary / baseHistoricalStartSalary : 1.0;

  // Asset Portfolios Tracking
  const portfolios = {
    sp500: { nominal: 0, balanceHistory: [] },
    cash: { nominal: 0, balanceHistory: [] },
    bankDeposit: { nominal: 0, balanceHistory: [] }
  };

  if (isSpain) {
    portfolios.ibex35 = { nominal: 0, balanceHistory: [] };
    portfolios.eurostoxx = { nominal: 0, balanceHistory: [] };
    portfolios.barcelonaRE = {
      nominal: 0,
      propertyValue: 0,
      remainingMortgage: 0,
      accumulatedRent: 0,
      balanceHistory: []
    };
  }

  const annualBreakdown = [];
  let totalNominalInvested = 0;
  let totalRealInvested2026 = 0;

  // Barcelona Real Estate initialization (Purchasing a 75m² apartment at startYear price)
  let reSquareMeters = 75;
  let reInitialPricePerM2 = 0;
  let reInitialPropertyValue = 0;
  let reInitialMortgage = 0;
  let reRemainingMortgage = 0;
  let reAccumulatedRent = 0;
  let reEquity = 0;

  if (isSpain) {
    reInitialPricePerM2 = SPAIN_HISTORICAL_DATA.barcelonaPricePerM2[startYear] || 1400;
    reInitialPropertyValue = reSquareMeters * reInitialPricePerM2;
    // 80% LTV Mortgage over the simulation duration
    reInitialMortgage = reInitialPropertyValue * 0.80;
    reRemainingMortgage = reInitialMortgage;
  }

  for (let i = 0; i < simYears.length; i++) {
    const year = simYears[i];
    const prevYear = i > 0 ? simYears[i - 1] : year;

    // 1. Median Salary and Contribution for this year
    const rawSalary = data.medianSalary[year] ?? (isSpain ? 25000 : 60000);
    const yearlySalary = rawSalary * salaryScale;
    const monthlySalary = yearlySalary / 12;
    const yearlyContribution = yearlySalary * (savingsRate / 100);
    const monthlyContribution = yearlyContribution / 12;

    totalNominalInvested += yearlyContribution;
    const multTo2026 = multipliersTo2026[year] || 1;
    totalRealInvested2026 += yearlyContribution * multTo2026;

    // 2. Inflation for this year
    const yearInflation = inflationRates[year] ?? 2.0;

    // 3. S&P 500 Return
    let sp500ReturnPct = US_HISTORICAL_DATA.sp500TotalReturn[year] ?? 8.0;
    if (isSpain) {
      // Currency adjusted for Spanish investor (USD to EUR)
      const eurUsdPrev = SPAIN_HISTORICAL_DATA.eurUsdRate[prevYear] ?? 1.2;
      const eurUsdCurr = SPAIN_HISTORICAL_DATA.eurUsdRate[year] ?? 1.2;
      // Formula: (1 + USD_return) * (eurUsdPrev / eurUsdCurr) - 1
      const fxMultiplier = eurUsdPrev / eurUsdCurr;
      const nominalUsdGrowth = 1 + (sp500ReturnPct / 100);
      sp500ReturnPct = ((nominalUsdGrowth * fxMultiplier) - 1) * 100;
    }

    // Monthly compounding for index assets: 12 monthly contributions with monthly growth
    const spMonthlyRate = Math.pow(1 + sp500ReturnPct / 100, 1 / 12) - 1;
    let spBalance = portfolios.sp500.nominal;
    for (let m = 0; m < 12; m++) {
      spBalance = (spBalance + monthlyContribution) * (1 + spMonthlyRate);
    }
    portfolios.sp500.nominal = spBalance;

    // 4. Cash / Mattress (Zero interest, pure accumulation)
    portfolios.cash.nominal += yearlyContribution;

    // 5. Bank Deposits / Savings
    const depositRate = isSpain
      ? (SPAIN_HISTORICAL_DATA.depositRate[year] ?? 1.5)
      : (US_HISTORICAL_DATA.savingsRate[year] ?? 2.0);
    const depositMonthlyRate = Math.pow(1 + depositRate / 100, 1 / 12) - 1;
    let bankBalance = portfolios.bankDeposit.nominal;
    for (let m = 0; m < 12; m++) {
      bankBalance = (bankBalance + monthlyContribution) * (1 + depositMonthlyRate);
    }
    portfolios.bankDeposit.nominal = bankBalance;

    // 6. Spain specific assets
    let ibexReturnPct = 0;
    let eurostoxxReturnPct = 0;

    if (isSpain) {
      // Ibex 35
      ibexReturnPct = SPAIN_HISTORICAL_DATA.ibex35TotalReturn[year] ?? 7.0;
      const ibexMonthlyRate = Math.pow(1 + ibexReturnPct / 100, 1 / 12) - 1;
      let ibexBalance = portfolios.ibex35.nominal;
      for (let m = 0; m < 12; m++) {
        ibexBalance = (ibexBalance + monthlyContribution) * (1 + ibexMonthlyRate);
      }
      portfolios.ibex35.nominal = ibexBalance;

      // Euro Stoxx 50
      eurostoxxReturnPct = SPAIN_HISTORICAL_DATA.eurostoxx50TotalReturn[year] ?? 7.5;
      const eurostoxxMonthlyRate = Math.pow(1 + eurostoxxReturnPct / 100, 1 / 12) - 1;
      let eurostoxxBalance = portfolios.eurostoxx.nominal;
      for (let m = 0; m < 12; m++) {
        eurostoxxBalance = (eurostoxxBalance + monthlyContribution) * (1 + eurostoxxMonthlyRate);
      }
      portfolios.eurostoxx.nominal = eurostoxxBalance;

      // Barcelona Real Estate Model
      const pricePerM2 = SPAIN_HISTORICAL_DATA.barcelonaPricePerM2[year] ?? 4000;
      const currentPropertyValue = reSquareMeters * pricePerM2;
      const mortgageInterestRate = (SPAIN_HISTORICAL_DATA.mortgageRate[year] ?? 3.5) / 100;

      // Amortization: monthly contribution goes towards paying mortgage interest & principal
      // Net rental yield / saved rent (4.2% average net yield in Barcelona)
      const annualRentalYield = currentPropertyValue * 0.042;
      const availableAnnualMortgageService = yearlyContribution + annualRentalYield;
      const annualInterestPaid = reRemainingMortgage * mortgageInterestRate;
      const annualPrincipalPaid = Math.max(0, availableAnnualMortgageService - annualInterestPaid);

      if (reRemainingMortgage > 0) {
        if (annualPrincipalPaid >= reRemainingMortgage) {
          const excessSavings = annualPrincipalPaid - reRemainingMortgage;
          reRemainingMortgage = 0;
          reAccumulatedRent += excessSavings;
        } else {
          reRemainingMortgage -= annualPrincipalPaid;
        }
      } else {
        // Mortgage fully repaid, net rent accumulates
        reAccumulatedRent += annualRentalYield + yearlyContribution;
      }

      reEquity = currentPropertyValue - reRemainingMortgage + reAccumulatedRent;
      portfolios.barcelonaRE.nominal = reEquity;
      portfolios.barcelonaRE.propertyValue = currentPropertyValue;
      portfolios.barcelonaRE.remainingMortgage = reRemainingMortgage;
      portfolios.barcelonaRE.accumulatedRent = reAccumulatedRent;
    }

    // Cumulative Real Value (in 2026 constant currency)
    const endMult = multipliersTo2026[year] || 1;
    const yearSnapshot = {
      year,
      salary: Math.round(yearlySalary),
      monthlySalary: Math.round(monthlySalary),
      contribution: Math.round(yearlyContribution),
      inflation: Number(yearInflation.toFixed(2)),
      sp500Return: Number(sp500ReturnPct.toFixed(2)),
      sp500Nominal: Math.round(portfolios.sp500.nominal),
      sp500Real2026: Math.round(portfolios.sp500.nominal * endMult),
      cashNominal: Math.round(portfolios.cash.nominal),
      cashReal2026: Math.round(portfolios.cash.nominal * endMult),
      bankDepositNominal: Math.round(portfolios.bankDeposit.nominal),
      bankDepositReal2026: Math.round(portfolios.bankDeposit.nominal * endMult),
      totalInvestedNominal: Math.round(totalNominalInvested),
      totalInvestedReal2026: Math.round(totalRealInvested2026)
    };

    if (isSpain) {
      yearSnapshot.ibexReturn = Number(ibexReturnPct.toFixed(2));
      yearSnapshot.ibexNominal = Math.round(portfolios.ibex35.nominal);
      yearSnapshot.ibexReal2026 = Math.round(portfolios.ibex35.nominal * endMult);

      yearSnapshot.eurostoxxReturn = Number(eurostoxxReturnPct.toFixed(2));
      yearSnapshot.eurostoxxNominal = Math.round(portfolios.eurostoxx.nominal);
      yearSnapshot.eurostoxxReal2026 = Math.round(portfolios.eurostoxx.nominal * endMult);

      yearSnapshot.barcelonaPricePerM2 = SPAIN_HISTORICAL_DATA.barcelonaPricePerM2[year];
      yearSnapshot.barcelonaRENominal = Math.round(reEquity);
      yearSnapshot.barcelonaREReal2026 = Math.round(reEquity * endMult);
      yearSnapshot.propertyValue = Math.round(portfolios.barcelonaRE.propertyValue);
      yearSnapshot.remainingMortgage = Math.round(reRemainingMortgage);
    }

    annualBreakdown.push(yearSnapshot);
  }

  // Calculate Summary KPIs
  const lastRow = annualBreakdown[annualBreakdown.length - 1];
  const finalMult = multipliersTo2026[endYear] || 1;

  // Real Multiplier = Real Final / Real Invested
  const sp500RealFinal = lastRow.sp500Real2026;
  const realTotalInvested = lastRow.totalInvestedReal2026;
  const sp500RealMultiplier = realTotalInvested > 0 ? (sp500RealFinal / realTotalInvested) : 1;
  const sp500RealGain = sp500RealFinal - realTotalInvested;

  // Cash Inflation Loss = Real Invested - Real Cash Final
  const cashRealFinal = lastRow.cashReal2026;
  const cashInflationLoss = realTotalInvested - cashRealFinal;
  const cashLossPercentage = realTotalInvested > 0 ? ((cashInflationLoss / realTotalInvested) * 100) : 0;

  // Calculate CAGR for S&P 500
  const yearsElapsed = simYears.length;
  // Approximate Money-Weighted Annual Return
  const sp500NominalFinal = lastRow.sp500Nominal;

  const result = {
    country,
    currencySymbol,
    currencyCode,
    startYear,
    endYear,
    duration: yearsElapsed,
    savingsRate,
    summary: {
      totalNominalInvested: lastRow.totalInvestedNominal,
      totalRealInvested2026: realTotalInvested,
      sp500: {
        nominalFinal: sp500NominalFinal,
        realFinal2026: sp500RealFinal,
        realGain: sp500RealGain,
        realMultiplier: Number(sp500RealMultiplier.toFixed(2)),
        nominalProfit: sp500NominalFinal - lastRow.totalInvestedNominal
      },
      cash: {
        nominalFinal: lastRow.cashNominal,
        realFinal2026: cashRealFinal,
        stealthLoss: cashInflationLoss,
        stealthLossPct: Number(cashLossPercentage.toFixed(1))
      },
      bankDeposit: {
        nominalFinal: lastRow.bankDepositNominal,
        realFinal2026: lastRow.bankDepositReal2026,
        realGain: lastRow.bankDepositReal2026 - realTotalInvested,
        realMultiplier: realTotalInvested > 0 ? Number((lastRow.bankDepositReal2026 / realTotalInvested).toFixed(2)) : 1
      }
    },
    annualBreakdown
  };

  if (isSpain) {
    result.summary.ibex35 = {
      nominalFinal: lastRow.ibexNominal,
      realFinal2026: lastRow.ibexReal2026,
      realGain: lastRow.ibexReal2026 - realTotalInvested,
      realMultiplier: realTotalInvested > 0 ? Number((lastRow.ibexReal2026 / realTotalInvested).toFixed(2)) : 1
    };
    result.summary.eurostoxx = {
      nominalFinal: lastRow.eurostoxxNominal,
      realFinal2026: lastRow.eurostoxxReal2026,
      realGain: lastRow.eurostoxxReal2026 - realTotalInvested,
      realMultiplier: realTotalInvested > 0 ? Number((lastRow.eurostoxxReal2026 / realTotalInvested).toFixed(2)) : 1
    };
    result.summary.barcelonaRE = {
      nominalFinal: lastRow.barcelonaRENominal,
      realFinal2026: lastRow.barcelonaREReal2026,
      realGain: lastRow.barcelonaREReal2026 - realTotalInvested,
      realMultiplier: realTotalInvested > 0 ? Number((lastRow.barcelonaREReal2026 / realTotalInvested).toFixed(2)) : 1,
      propertyValue: lastRow.propertyValue,
      remainingMortgage: lastRow.remainingMortgage
    };
  }

  return result;
}
