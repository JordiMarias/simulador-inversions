import { US_HISTORICAL_DATA } from '../data/historicalData.js';

/**
 * Runs a Monte Carlo simulation for future investing starting from 2026
 * @param {Object} options
 * @param {'US'|'ES'} options.country - 'US' or 'ES'
 * @param {number} options.initialSalary - Starting salary in 2026
 * @param {number} options.savingsRate - Percentage of salary saved monthly (e.g. 10)
 * @param {number} options.durationYears - Number of projection years (e.g. 30)
 * @param {number} options.expectedInflation - Expected annual inflation % (e.g. 2.5)
 * @param {number} options.realWageGrowth - Expected annual real wage growth % (e.g. 1.5)
 * @param {number} [options.iterations=1000] - Number of Monte Carlo iterations
 * @returns {Object} Percentile paths and projected milestones
 */
export function runMonteCarloSimulation({
  country = 'ES',
  initialSalary = 30500,
  savingsRate = 10,
  durationYears = 30,
  expectedInflation = 2.5,
  realWageGrowth = 1.5,
  iterations = 1000
}) {
  const currencySymbol = country === 'ES' ? '€' : '$';
  const startYear = 2026;
  const endYear = startYear + durationYears;

  // Extract historical S&P 500 returns pool for bootstrapping
  const historicalReturns = Object.values(US_HISTORICAL_DATA.sp500TotalReturn);

  // We will run `iterations` simulations and collect portfolio values for each year
  // yearIndex: 0 to durationYears
  const nominalPaths = Array.from({ length: iterations }, () => [0]);
  const realPaths = Array.from({ length: iterations }, () => [0]);
  const investedNominalPaths = Array.from({ length: iterations }, () => [0]);
  const investedRealPaths = Array.from({ length: iterations }, () => [0]);
  const cashRealPaths = Array.from({ length: iterations }, () => [0]);

  const years = Array.from({ length: durationYears + 1 }, (_, i) => startYear + i);

  // Pre-calculate salary and contribution trajectories
  // Nominal wage growth = (1 + realWageGrowth) * (1 + inflation) - 1
  const nominalWageGrowthRate = (1 + realWageGrowth / 100) * (1 + expectedInflation / 100) - 1;
  const inflationRate = expectedInflation / 100;

  for (let iter = 0; iter < iterations; iter++) {
    let currentNominalSalary = initialSalary;
    let currentPortfolioNominal = 0;
    let totalInvestedNominal = 0;
    let totalInvestedReal = 0;
    let cashNominal = 0;

    for (let yr = 1; yr <= durationYears; yr++) {
      const yearlyContribution = currentNominalSalary * (savingsRate / 100);
      const monthlyContribution = yearlyContribution / 12;

      // Cumulative inflation discount factor from year `yr` back to 2026
      const inflationDiscountTo2026 = Math.pow(1 + inflationRate, yr);

      totalInvestedNominal += yearlyContribution;
      totalInvestedReal += yearlyContribution / Math.pow(1 + inflationRate, yr - 0.5);
      cashNominal += yearlyContribution;

      // Randomly sample an annual return from historical distribution (with realistic sequence variance)
      const sampledReturnPct = historicalReturns[Math.floor(Math.random() * historicalReturns.length)];
      const monthlyReturn = Math.pow(1 + sampledReturnPct / 100, 1 / 12) - 1;

      // Compound across 12 months
      for (let m = 0; m < 12; m++) {
        currentPortfolioNominal = (currentPortfolioNominal + monthlyContribution) * (1 + monthlyReturn);
      }

      // Record trajectory
      nominalPaths[iter].push(Math.round(currentPortfolioNominal));
      realPaths[iter].push(Math.round(currentPortfolioNominal / inflationDiscountTo2026));
      investedNominalPaths[iter].push(Math.round(totalInvestedNominal));
      investedRealPaths[iter].push(Math.round(totalInvestedReal));
      cashRealPaths[iter].push(Math.round(cashNominal / inflationDiscountTo2026));

      // Advance nominal salary
      currentNominalSalary *= (1 + nominalWageGrowthRate);
    }
  }

  // Calculate percentiles for each year
  function getPercentile(values, p) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return Math.round(sorted[lower] * (1 - weight) + sorted[upper] * weight);
  }

  const p10Nominal = [];
  const p25Nominal = [];
  const p50Nominal = [];
  const p75Nominal = [];
  const p90Nominal = [];

  const p10Real = [];
  const p25Real = [];
  const p50Real = [];
  const p75Real = [];
  const p90Real = [];

  const avgInvestedNominal = [];
  const avgInvestedReal = [];
  const avgCashReal = [];

  for (let yr = 0; yr <= durationYears; yr++) {
    const nominalAtYr = nominalPaths.map(p => p[yr]);
    const realAtYr = realPaths.map(p => p[yr]);
    const invNomAtYr = investedNominalPaths.map(p => p[yr]);
    const invRealAtYr = investedRealPaths.map(p => p[yr]);
    const cashRealAtYr = cashRealPaths.map(p => p[yr]);

    p10Nominal.push(getPercentile(nominalAtYr, 10));
    p25Nominal.push(getPercentile(nominalAtYr, 25));
    p50Nominal.push(getPercentile(nominalAtYr, 50));
    p75Nominal.push(getPercentile(nominalAtYr, 75));
    p90Nominal.push(getPercentile(nominalAtYr, 90));

    p10Real.push(getPercentile(realAtYr, 10));
    p25Real.push(getPercentile(realAtYr, 25));
    p50Real.push(getPercentile(realAtYr, 50));
    p75Real.push(getPercentile(realAtYr, 75));
    p90Real.push(getPercentile(realAtYr, 90));

    avgInvestedNominal.push(Math.round(invNomAtYr.reduce((a, b) => a + b, 0) / iterations));
    avgInvestedReal.push(Math.round(invRealAtYr.reduce((a, b) => a + b, 0) / iterations));
    avgCashReal.push(Math.round(cashRealAtYr.reduce((a, b) => a + b, 0) / iterations));
  }

  // Milestones at 10, 20, 30 years
  const milestones = [10, 20, 30].filter(y => y <= durationYears).map(y => {
    return {
      yearLabel: `Year ${y} (${2026 + y})`,
      yearIndex: y,
      investedReal: avgInvestedReal[y],
      cashReal: avgCashReal[y],
      p10Real: p10Real[y],
      p50Real: p50Real[y],
      p90Real: p90Real[y],
      p50Nominal: p50Nominal[y],
      p50Multiplier: avgInvestedReal[y] > 0 ? Number((p50Real[y] / avgInvestedReal[y]).toFixed(2)) : 1
    };
  });

  return {
    country,
    currencySymbol,
    startYear,
    endYear,
    durationYears,
    years,
    milestones,
    series: {
      p10Nominal,
      p25Nominal,
      p50Nominal,
      p75Nominal,
      p90Nominal,
      p10Real,
      p25Real,
      p50Real,
      p75Real,
      p90Real,
      investedNominal: avgInvestedNominal,
      investedReal: avgInvestedReal,
      cashReal: avgCashReal
    }
  };
}
