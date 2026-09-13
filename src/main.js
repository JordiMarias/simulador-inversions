import { PRESETS } from './data/historicalData.js';
import { runHistoricalSimulation } from './engine/simulationEngine.js';
import { runMonteCarloSimulation } from './engine/monteCarloEngine.js';
import { renderHistoricalChart, renderMonteCarloChart, formatCurrency } from './ui/chartManager.js';
import { t, setLanguage, getLanguage } from './ui/i18n.js';

// Application State
const state = {
  mode: 'historical', // 'historical' | 'future'
  country: 'ES',      // 'ES' | 'US'
  startYear: 1995,
  duration: 30,
  savingsRate: 10,
  isRealMode: true,
  activePresetId: 'spain_euro_30',
  enabledAssets: {
    sp500: true,
    ibex35: true,
    eurostoxx: true,
    barcelonaRE: true,
    bankDeposit: true,
    cash: true,
    invested: true
  },
  // Future mode parameters
  futureSalary: 30500,
  futureSavingsRate: 10,
  futureDuration: 30,
  futureInflation: 2.5,
  futureWageGrowth: 1.5
};

// Cached simulation results
let currentHistoricalResult = null;
let currentMonteCarloResult = null;

// DOM Elements Cache
const elements = {
  // Mode Buttons
  btnHistorical: document.getElementById('btn-mode-historical'),
  btnFuture: document.getElementById('btn-mode-future'),
  historicalControls: document.getElementById('historical-controls'),
  futureControls: document.getElementById('future-controls'),
  
  // Language Buttons
  btnLangCa: document.getElementById('btn-lang-ca'),
  btnLangEn: document.getElementById('btn-lang-en'),

  // Historical Controls
  selectCountry: document.getElementById('select-country'),
  sliderStartYear: document.getElementById('slider-startYear'),
  badgeStartYear: document.getElementById('badge-startYear'),
  sliderDuration: document.getElementById('slider-duration'),
  badgeDuration: document.getElementById('badge-duration'),
  sliderSavingsRate: document.getElementById('slider-savingsRate'),
  badgeSavingsRate: document.getElementById('badge-savingsRate'),
  btnValReal: document.getElementById('btn-val-real'),
  btnValNominal: document.getElementById('btn-val-nominal'),
  presetsContainer: document.getElementById('presets-container'),

  // Asset Checkboxes
  chkSp500: document.getElementById('chk-sp500'),
  chkBarcelonaRE: document.getElementById('chk-barcelonaRE'),
  chkEurostoxx: document.getElementById('chk-eurostoxx'),
  chkIbex35: document.getElementById('chk-ibex35'),
  chkBankDeposit: document.getElementById('chk-bankDeposit'),
  chkCash: document.getElementById('chk-cash'),
  chkLabelRe: document.getElementById('chk-label-re'),
  chkLabelEurostoxx: document.getElementById('chk-label-eurostoxx'),
  chkLabelIbex: document.getElementById('chk-label-ibex'),

  // Future Controls
  inputFutureSalary: document.getElementById('input-futureSalary'),
  sliderFutureSavingsRate: document.getElementById('slider-futureSavingsRate'),
  badgeFutureSavingsRate: document.getElementById('badge-futureSavingsRate'),
  sliderFutureDuration: document.getElementById('slider-futureDuration'),
  badgeFutureDuration: document.getElementById('badge-futureDuration'),
  inputFutureInflation: document.getElementById('input-futureInflation'),
  inputFutureWageGrowth: document.getElementById('input-futureWageGrowth'),
  btnRecalculateFuture: document.getElementById('btn-recalculate-future'),
  futureMilestones: document.getElementById('future-milestones'),

  // KPI Elements
  kpiFinalWealth: document.getElementById('kpi-val-finalWealth'),
  kpiSubFinalWealth: document.getElementById('kpi-sub-finalWealth'),
  kpiTotalInvested: document.getElementById('kpi-val-totalInvested'),
  kpiSubTotalInvested: document.getElementById('kpi-sub-totalInvested'),
  kpiMultiplier: document.getElementById('kpi-val-multiplier'),
  kpiSubMultiplier: document.getElementById('kpi-sub-multiplier'),
  kpiCashLoss: document.getElementById('kpi-val-cashLoss'),
  kpiSubCashLoss: document.getElementById('kpi-sub-cashLoss'),

  // Real Estate Spotlight
  reSpotlight: document.getElementById('re-spotlight'),
  valReProperty: document.getElementById('val-reProperty'),
  valReMortgage: document.getElementById('val-reMortgage'),
  valReEquity: document.getElementById('val-reEquity'),
  valReM2: document.getElementById('val-reM2'),

  // Chart Elements
  chartCanvas: document.getElementById('mainChartCanvas'),
  chartTitle: document.getElementById('txt-chartTitle'),
  chartModeBadge: document.getElementById('chart-mode-badge'),

  // Table
  tableCard: document.getElementById('table-card-container'),
  tableHead: document.getElementById('table-head'),
  tableBody: document.getElementById('table-body'),
  btnExportCsv: document.getElementById('btn-export-csv')
};

/**
 * Initialize application
 */
function init() {
  bindEvents();
  renderPresets();
  updateI18nTexts();
  runSimulation();
}

/**
 * Bind UI event handlers
 */
function bindEvents() {
  // Mode toggle
  elements.btnHistorical.addEventListener('click', () => setMode('historical'));
  elements.btnFuture.addEventListener('click', () => setMode('future'));

  // Language toggle
  elements.btnLangCa.addEventListener('click', () => switchLanguage('ca'));
  elements.btnLangEn.addEventListener('click', () => switchLanguage('en'));

  // Country Change
  elements.selectCountry.addEventListener('change', (e) => {
    state.country = e.target.value;
    const isSpain = state.country === 'ES';

    // Adjust start year bounds
    if (isSpain) {
      elements.sliderStartYear.min = 1980;
      if (state.startYear < 1980) state.startYear = 1980;
      elements.inputFutureSalary.value = 30500;
      state.futureSalary = 30500;
    } else {
      elements.sliderStartYear.min = 1928;
      elements.inputFutureSalary.value = 85500;
      state.futureSalary = 85500;
    }
    elements.sliderStartYear.value = state.startYear;
    elements.badgeStartYear.textContent = state.startYear;

    // Toggle Spain specific assets visibility
    elements.chkLabelRe.style.display = isSpain ? 'flex' : 'none';
    elements.chkLabelEurostoxx.style.display = isSpain ? 'flex' : 'none';
    elements.chkLabelIbex.style.display = isSpain ? 'flex' : 'none';
    elements.reSpotlight.style.display = isSpain && state.mode === 'historical' ? 'block' : 'none';

    renderPresets();
    runSimulation();
  });

  // Start year slider
  elements.sliderStartYear.addEventListener('input', (e) => {
    state.startYear = parseInt(e.target.value, 10);
    elements.badgeStartYear.textContent = state.startYear;
    state.activePresetId = null;
    highlightActivePreset();
    runSimulation();
  });

  // Duration slider
  elements.sliderDuration.addEventListener('input', (e) => {
    state.duration = parseInt(e.target.value, 10);
    elements.badgeDuration.textContent = `${state.duration} ${getLanguage() === 'ca' ? 'anys' : 'years'}`;
    state.activePresetId = null;
    highlightActivePreset();
    runSimulation();
  });

  // Savings rate slider
  elements.sliderSavingsRate.addEventListener('input', (e) => {
    state.savingsRate = parseInt(e.target.value, 10);
    elements.badgeSavingsRate.textContent = `${state.savingsRate}%`;
    runSimulation();
  });

  // Valuation mode (Real vs Nominal)
  elements.btnValReal.addEventListener('click', () => {
    state.isRealMode = true;
    elements.btnValReal.classList.add('active');
    elements.btnValNominal.classList.remove('active');
    elements.chartModeBadge.textContent = t('realMode');
    elements.chartModeBadge.className = 'kpi-badge positive';
    updateViews();
  });

  elements.btnValNominal.addEventListener('click', () => {
    state.isRealMode = false;
    elements.btnValNominal.classList.add('active');
    elements.btnValReal.classList.remove('active');
    elements.chartModeBadge.textContent = t('nominalMode');
    elements.chartModeBadge.className = 'kpi-badge negative';
    updateViews();
  });

  // Asset Checkboxes
  const checkboxes = [
    { el: elements.chkSp500, key: 'sp500' },
    { el: elements.chkBarcelonaRE, key: 'barcelonaRE' },
    { el: elements.chkEurostoxx, key: 'eurostoxx' },
    { el: elements.chkIbex35, key: 'ibex35' },
    { el: elements.chkBankDeposit, key: 'bankDeposit' },
    { el: elements.chkCash, key: 'cash' }
  ];

  checkboxes.forEach(({ el, key }) => {
    el.addEventListener('change', (e) => {
      state.enabledAssets[key] = e.target.checked;
      updateViews();
    });
  });

  // Future Mode Inputs
  elements.inputFutureSalary.addEventListener('change', (e) => {
    state.futureSalary = parseFloat(e.target.value) || 30000;
  });

  elements.sliderFutureSavingsRate.addEventListener('input', (e) => {
    state.futureSavingsRate = parseInt(e.target.value, 10);
    elements.badgeFutureSavingsRate.textContent = `${state.futureSavingsRate}%`;
  });

  elements.sliderFutureDuration.addEventListener('input', (e) => {
    state.futureDuration = parseInt(e.target.value, 10);
    elements.badgeFutureDuration.textContent = `${state.futureDuration} ${getLanguage() === 'ca' ? 'anys' : 'years'}`;
  });

  elements.inputFutureInflation.addEventListener('change', (e) => {
    state.futureInflation = parseFloat(e.target.value) || 2.5;
  });

  elements.inputFutureWageGrowth.addEventListener('change', (e) => {
    state.futureWageGrowth = parseFloat(e.target.value) || 1.5;
  });

  elements.btnRecalculateFuture.addEventListener('click', () => {
    runFutureSimulation();
  });

  // CSV Export
  elements.btnExportCsv.addEventListener('click', exportToCsv);
}

/**
 * Switch between Historical Backtest and Future Projection modes
 */
function setMode(mode) {
  state.mode = mode;
  if (mode === 'historical') {
    elements.btnHistorical.classList.add('active');
    elements.btnFuture.classList.remove('active');
    elements.historicalControls.style.display = 'grid';
    elements.futureControls.style.display = 'none';
    elements.tableCard.style.display = 'block';
    elements.futureMilestones.style.display = 'none';
    elements.reSpotlight.style.display = state.country === 'ES' ? 'block' : 'none';
    elements.chartTitle.textContent = t('chartTitleHistorical');
    runSimulation();
  } else {
    elements.btnFuture.classList.add('active');
    elements.btnHistorical.classList.remove('active');
    elements.historicalControls.style.display = 'none';
    elements.futureControls.style.display = 'grid';
    elements.tableCard.style.display = 'none';
    elements.futureMilestones.style.display = 'grid';
    elements.reSpotlight.style.display = 'none';
    elements.chartTitle.textContent = t('chartTitleFuture');
    runFutureSimulation();
  }
}

/**
 * Switch Language between English and Catalan
 */
function switchLanguage(lang) {
  setLanguage(lang);
  if (lang === 'ca') {
    elements.btnLangCa.classList.add('active');
    elements.btnLangEn.classList.remove('active');
  } else {
    elements.btnLangEn.classList.add('active');
    elements.btnLangCa.classList.remove('active');
  }
  updateI18nTexts();
  renderPresets();
  updateViews();
}

/**
 * Update all text contents according to active language
 */
function updateI18nTexts() {
  document.querySelectorAll('[id^="txt-"]').forEach(el => {
    const key = el.id.replace('txt-', '');
    const translation = t(key);
    if (translation) {
      el.textContent = translation;
    }
  });

  // Update slider badge text
  elements.badgeDuration.textContent = `${state.duration} ${getLanguage() === 'ca' ? 'anys' : 'years'}`;
  elements.badgeFutureDuration.textContent = `${state.futureDuration} ${getLanguage() === 'ca' ? 'anys' : 'years'}`;
  elements.chartModeBadge.textContent = state.isRealMode ? t('realMode') : t('nominalMode');
  elements.chartTitle.textContent = state.mode === 'historical' ? t('chartTitleHistorical') : t('chartTitleFuture');
}

/**
 * Render Quick Preset Chips
 */
function renderPresets() {
  elements.presetsContainer.innerHTML = '';
  const lang = getLanguage();
  const availablePresets = PRESETS.filter(p => p.country === state.country);

  availablePresets.forEach(preset => {
    const chip = document.createElement('button');
    chip.className = `preset-chip ${state.activePresetId === preset.id ? 'active' : ''}`;
    chip.textContent = preset.name[lang] || preset.name.en;
    chip.title = preset.description[lang] || preset.description.en;

    chip.addEventListener('click', () => {
      state.activePresetId = preset.id;
      state.startYear = preset.startYear;
      state.duration = preset.duration;
      state.savingsRate = preset.savingsRate;

      elements.sliderStartYear.value = preset.startYear;
      elements.badgeStartYear.textContent = preset.startYear;
      elements.sliderDuration.value = preset.duration;
      elements.badgeDuration.textContent = `${preset.duration} ${lang === 'ca' ? 'anys' : 'years'}`;
      elements.sliderSavingsRate.value = preset.savingsRate;
      elements.badgeSavingsRate.textContent = `${preset.savingsRate}%`;

      highlightActivePreset();
      runSimulation();
    });

    elements.presetsContainer.appendChild(chip);
  });
}

function highlightActivePreset() {
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.classList.remove('active');
  });
}

/**
 * Run Historical Simulation and Update UI
 */
function runSimulation() {
  currentHistoricalResult = runHistoricalSimulation({
    country: state.country,
    startYear: state.startYear,
    duration: state.duration,
    savingsRate: state.savingsRate
  });

  updateViews();
}

/**
 * Run Future Monte Carlo Simulation and Update UI
 */
function runFutureSimulation() {
  currentMonteCarloResult = runMonteCarloSimulation({
    country: state.country,
    initialSalary: state.futureSalary,
    savingsRate: state.futureSavingsRate,
    durationYears: state.futureDuration,
    expectedInflation: state.futureInflation,
    realWageGrowth: state.futureWageGrowth,
    iterations: 1000
  });

  updateFutureViews();
}

/**
 * Update UI Views (KPIs, Charts, Table) for Historical Simulation
 */
function updateViews() {
  if (state.mode === 'future') {
    updateFutureViews();
    return;
  }

  if (!currentHistoricalResult) return;

  const res = currentHistoricalResult;
  const isReal = state.isRealMode;
  const sym = res.currencySymbol;
  const summary = res.summary;

  // 1. Update KPI Cards
  const finalSp500 = isReal ? summary.sp500.realFinal2026 : summary.sp500.nominalFinal;
  elements.kpiFinalWealth.textContent = formatCurrency(finalSp500, sym);
  elements.kpiSubFinalWealth.textContent = isReal
    ? `Nominal: ${formatCurrency(summary.sp500.nominalFinal, sym)}`
    : `Poder de compra real: ${formatCurrency(summary.sp500.realFinal2026, sym)}`;

  const totalInv = isReal ? summary.totalRealInvested2026 : summary.totalNominalInvested;
  elements.kpiTotalInvested.textContent = formatCurrency(totalInv, sym);
  elements.kpiSubTotalInvested.textContent = `${t('savingsRate')}: ${state.savingsRate}%`;

  elements.kpiMultiplier.textContent = `${summary.sp500.realMultiplier}x`;
  elements.kpiSubMultiplier.textContent = `${t('kpiRealGain')}: ${formatCurrency(summary.sp500.realGain, sym)}`;

  elements.kpiCashLoss.textContent = `-${formatCurrency(summary.cash.stealthLoss, sym)}`;
  elements.kpiSubCashLoss.textContent = `-${summary.cash.stealthLossPct}% ${getLanguage() === 'ca' ? 'perdut per inflació' : 'lost to inflation'}`;

  // 2. Update Barcelona Real Estate Spotlight
  if (res.country === 'ES' && summary.barcelonaRE) {
    const re = summary.barcelonaRE;
    elements.valReProperty.textContent = formatCurrency(re.propertyValue, sym);
    elements.valReMortgage.textContent = formatCurrency(re.remainingMortgage, sym);
    elements.valReEquity.textContent = formatCurrency(isReal ? re.realFinal2026 : re.nominalFinal, sym);
    const lastRow = res.annualBreakdown[res.annualBreakdown.length - 1];
    elements.valReM2.textContent = `${formatCurrency(lastRow.barcelonaPricePerM2, sym)}/m²`;
  }

  // 3. Render Historical Multi-Asset Chart
  renderHistoricalChart(elements.chartCanvas, res, isReal, state.enabledAssets);

  // 4. Populate Table
  renderTable(res, isReal);
}

/**
 * Update UI Views for Future Monte Carlo Simulation
 */
function updateFutureViews() {
  if (!currentMonteCarloResult) return;

  const mc = currentMonteCarloResult;
  const isReal = state.isRealMode;
  const sym = mc.currencySymbol;
  const lastIndex = mc.durationYears;

  // 1. Update KPIs with Median (50th percentile) projections
  const p50Val = isReal ? mc.series.p50Real[lastIndex] : mc.series.p50Nominal[lastIndex];
  const investedVal = isReal ? mc.series.investedReal[lastIndex] : mc.series.investedNominal[lastIndex];
  const cashVal = mc.series.cashReal[lastIndex];
  const mult = investedVal > 0 ? (p50Val / investedVal).toFixed(2) : '1.0';

  elements.kpiFinalWealth.textContent = formatCurrency(p50Val, sym);
  elements.kpiSubFinalWealth.textContent = `Mediana Esperada (${mc.durationYears} anys)`;

  elements.kpiTotalInvested.textContent = formatCurrency(investedVal, sym);
  elements.kpiSubTotalInvested.textContent = `Estalvi ${state.futureSavingsRate}% del sou`;

  elements.kpiMultiplier.textContent = `${mult}x`;
  elements.kpiSubMultiplier.textContent = `Guany: +${formatCurrency(p50Val - investedVal, sym)}`;

  const cashLoss = investedVal - cashVal;
  const cashLossPct = investedVal > 0 ? ((cashLoss / investedVal) * 100).toFixed(1) : 0;
  elements.kpiCashLoss.textContent = `-${formatCurrency(cashLoss, sym)}`;
  elements.kpiSubCashLoss.textContent = `-${cashLossPct}% de poder de compra en efectiu`;

  // 2. Render Future Fan Chart
  renderMonteCarloChart(elements.chartCanvas, mc, isReal);

  // 3. Render Milestone Cards
  renderMilestones(mc, sym);
}

/**
 * Render Milestone Cards in Future Mode
 */
function renderMilestones(mc, sym) {
  elements.futureMilestones.innerHTML = '';
  const lang = getLanguage();

  mc.milestones.forEach(m => {
    const card = document.createElement('div');
    card.className = 'milestone-card';
    card.innerHTML = `
      <div class="milestone-year">
        <span>${m.yearLabel}</span>
        <span style="font-size: 0.9rem; color: var(--status-success);">+${m.p50Multiplier}x</span>
      </div>
      <div class="milestone-row">
        <span>${lang === 'ca' ? 'Capital Aportat (Real)' : 'Real Capital Contributed'}</span>
        <span class="val">${formatCurrency(m.investedReal, sym)}</span>
      </div>
      <div class="milestone-row">
        <span>${lang === 'ca' ? 'Pessimista (Percentil 10)' : 'Bear (10th Percentile)'}</span>
        <span class="val" style="color: var(--status-danger);">${formatCurrency(m.p10Real, sym)}</span>
      </div>
      <div class="milestone-row">
        <span>${lang === 'ca' ? 'Mediana (Percentil 50)' : 'Median (50th Percentile)'}</span>
        <span class="val" style="color: var(--blue-accent); font-size: 1.05rem;">${formatCurrency(m.p50Real, sym)}</span>
      </div>
      <div class="milestone-row">
        <span>${lang === 'ca' ? 'Optimista (Percentil 90)' : 'Bull (90th Percentile)'}</span>
        <span class="val" style="color: var(--status-success);">${formatCurrency(m.p90Real, sym)}</span>
      </div>
      <div class="milestone-row">
        <span>${lang === 'ca' ? 'Efectiu al 0% (Real)' : 'Cash at 0% (Real)'}</span>
        <span class="val" style="color: var(--text-muted);">${formatCurrency(m.cashReal, sym)}</span>
      </div>
    `;
    elements.futureMilestones.appendChild(card);
  });
}

/**
 * Render Annual Breakdown Table
 */
function renderTable(res, isReal) {
  const sym = res.currencySymbol;
  const isSpain = res.country === 'ES';

  // Table Headers
  let headHtml = `
    <tr>
      <th>${t('colYear')}</th>
      <th>${t('colSalary')}</th>
      <th>${t('colMonthlySavings')}</th>
      <th>${t('colInflation')}</th>
      <th>${t('colSp500Return')}</th>
      <th>${t('colSp500Balance')}</th>
  `;

  if (isSpain) {
    headHtml += `
      <th>${t('colREBalance')}</th>
      <th>${t('colEurostoxxBalance')}</th>
      <th>${t('colIbexBalance')}</th>
    `;
  }

  headHtml += `
      <th>${t('colBankBalance')}</th>
      <th>${t('colCashBalance')}</th>
    </tr>
  `;
  elements.tableHead.innerHTML = headHtml;

  // Table Rows
  let bodyHtml = '';
  res.annualBreakdown.forEach(row => {
    const spBal = isReal ? row.sp500Real2026 : row.sp500Nominal;
    const bankBal = isReal ? row.bankDepositReal2026 : row.bankDepositNominal;
    const cashBal = isReal ? row.cashReal2026 : row.cashNominal;
    const retClass = row.sp500Return >= 0 ? 'positive-cell' : 'negative-cell';

    let rowHtml = `
      <tr>
        <td style="font-weight: 700; color: var(--navy-primary);">${row.year}</td>
        <td>${formatCurrency(row.salary, sym)}</td>
        <td>${formatCurrency(row.monthlySalary * (state.savingsRate / 100), sym)}</td>
        <td style="color: ${row.inflation > 4 ? 'var(--status-danger)' : 'var(--text-secondary)'};">${row.inflation}%</td>
        <td class="${retClass}">${row.sp500Return > 0 ? '+' : ''}${row.sp500Return}%</td>
        <td style="font-weight: 700; color: var(--blue-accent);">${formatCurrency(spBal, sym)}</td>
    `;

    if (isSpain) {
      const reBal = isReal ? row.barcelonaREReal2026 : row.barcelonaRENominal;
      const euroBal = isReal ? row.eurostoxxReal2026 : row.eurostoxxNominal;
      const ibexBal = isReal ? row.ibexReal2026 : row.ibexNominal;

      rowHtml += `
        <td style="color: var(--status-purple); font-weight: 600;">${formatCurrency(reBal, sym)}</td>
        <td style="color: #2563eb; font-weight: 600;">${formatCurrency(euroBal, sym)}</td>
        <td style="color: #db2777; font-weight: 600;">${formatCurrency(ibexBal, sym)}</td>
      `;
    }

    rowHtml += `
        <td style="color: var(--status-warning); font-weight: 600;">${formatCurrency(bankBal, sym)}</td>
        <td style="color: var(--text-muted); font-weight: 600;">${formatCurrency(cashBal, sym)}</td>
      </tr>
    `;

    bodyHtml += rowHtml;
  });

  elements.tableBody.innerHTML = bodyHtml;
}

/**
 * Export Breakdown to CSV
 */
function exportToCsv() {
  if (!currentHistoricalResult) return;

  const res = currentHistoricalResult;
  const isSpain = res.country === 'ES';
  const isReal = state.isRealMode;

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // Add BOM for Excel UTF-8

  // Header
  let headers = ['Year', 'Median Salary', 'Monthly Savings', 'Inflation (%)', 'S&P 500 Return (%)', 'S&P 500 Balance', 'Bank Deposits', 'Cash Mattress', 'Total Invested'];
  if (isSpain) {
    headers = ['Year', 'Median Salary', 'Monthly Savings', 'Inflation (%)', 'S&P 500 Return (%)', 'S&P 500 Balance', 'Barcelona Real Estate', 'Euro Stoxx 50', 'IBEX 35', 'Bank Deposits', 'Cash Mattress', 'Total Invested'];
  }
  csvContent += headers.join(',') + '\r\n';

  // Data rows
  res.annualBreakdown.forEach(r => {
    const spBal = isReal ? r.sp500Real2026 : r.sp500Nominal;
    const bankBal = isReal ? r.bankDepositReal2026 : r.bankDepositNominal;
    const cashBal = isReal ? r.cashReal2026 : r.cashNominal;
    const totalInv = isReal ? r.totalInvestedReal2026 : r.totalInvestedNominal;

    let row = [r.year, r.salary, Math.round(r.monthlySalary * (state.savingsRate / 100)), r.inflation, r.sp500Return, spBal];
    if (isSpain) {
      const reBal = isReal ? r.barcelonaREReal2026 : r.barcelonaRENominal;
      const euroBal = isReal ? r.eurostoxxReal2026 : r.eurostoxxNominal;
      const ibexBal = isReal ? r.ibexReal2026 : r.ibexNominal;
      row.push(reBal, euroBal, ibexBal);
    }
    row.push(bankBal, cashBal, totalInv);
    csvContent += row.join(',') + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `real_returns_simulation_${res.country}_${res.startYear}_${res.endYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Start application on DOM Ready
document.addEventListener('DOMContentLoaded', init);
