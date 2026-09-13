export const TRANSLATIONS = {
  en: {
    appTitle: 'Real Returns Investment Simulator',
    appSubtitle: 'Realistic backtesting & future projections adjusted for real inflation and historical salaries',
    modeHistorical: 'Historical Backtest (1928–2026)',
    modeFuture: 'Future Projection (2026+)',
    countrySelector: 'Country / Economic Context',
    spainLabel: 'Spain (EUR / ESP)',
    usLabel: 'United States (USD)',
    timeHorizon: 'Time Horizon & Era',
    startYear: 'Start Year',
    duration: 'Duration (Years)',
    savingsRate: 'Monthly Savings Rate (% of Salary)',
    customSalaryLabel: 'Starting Annual Salary',
    customSalaryPlaceholder: 'Auto (Historical Median)',
    presetLabel: 'Quick Historical Eras',
    selectPreset: 'Choose an era preset...',
    valueMode: 'Valuation Mode',
    nominalMode: 'Nominal ($ / € at the time)',
    realMode: 'Real (2026 Constant Purchasing Power)',
    assetsToCompare: 'Assets & Benchmarks to Compare',
    assetSp500: 'S&P 500 (Total Return)',
    assetIbex35: 'IBEX 35 (Spain Dividends Reinv.)',
    assetEurostoxx: 'Euro Stoxx 50 (Europe)',
    assetBarcelonaRE: 'Barcelona Real Estate (Flat + Mortgage)',
    assetBankDeposit: 'Bank Deposits / Savings Interest',
    assetCash: 'Cash under the Mattress (0% interest)',
    
    // KPI Cards
    kpiFinalWealth: 'Final Portfolio Wealth',
    kpiTotalInvested: 'Total Capital Saved / Invested',
    kpiRealGain: 'Net Real Profit',
    kpiRealMultiplier: 'Real Purchasing Power Multiplier',
    kpiCashErosion: 'Inflation Theft on Idle Cash',
    kpiCashLossNote: 'Loss of purchasing power by just holding cash in a 0% account',
    
    // Charts
    chartTitle: 'Wealth Trajectory Over Time',
    chartTitleHistorical: 'Wealth Trajectory Over Time',
    chartTitleFuture: 'Monte Carlo Wealth Distribution (1,000 Simulations)',
    chartYAxisNominal: 'Nominal Value',
    chartYAxisReal: 'Real Value (2026 Purchasing Power)',
    chartLegendP10: 'Pessimistic / Bear (10th Percentile)',
    chartLegendP50: 'Median Expected (50th Percentile)',
    chartLegendP90: 'Optimistic / Bull (90th Percentile)',
    chartLegendInvested: 'Cumulative Real Capital Contributed',
    chartLegendCash: 'Cash Kept at 0% (Real Value)',
    
    // Real Estate Section
    reTitle: 'Barcelona Real Estate Case Study (Flat + Mortgage)',
    reExplainer: 'Simulates buying a standard 75 m² flat in Barcelona at the historical price of the start year, using the 10% monthly savings to service an 80% mortgage (Euribor/Mibor + spread) plus receiving historical net rental yield (~4.2%) vs property appreciation.',
    rePropertyVal: 'Property Market Value',
    reMortgageRemain: 'Remaining Mortgage Debt',
    reNetEquity: 'Net Real Estate Wealth (Equity + Rent)',
    reM2Price: 'Price per m²',
    
    // Reality check
    realityCheckTitle: 'The Harsh Reality of Inflation: Equities vs Idle Cash',
    realityCheckText: 'Over 30 years, putting 10% of your salary under the mattress is guaranteed wealth destruction due to cumulative inflation. Meanwhile, broad-market equity compounding preserved and expanded real purchasing power.',
    
    // Table
    tableTitle: 'Year-by-Year Historical Deep Dive',
    colYear: 'Year',
    colSalary: 'Median Salary',
    colMonthlySavings: 'Monthly (10%)',
    colInflation: 'Inflation (CPI/IPC)',
    colSp500Return: 'S&P 500 Return',
    colSp500Balance: 'S&P 500 Balance',
    colIbexBalance: 'IBEX 35 Balance',
    colEurostoxxBalance: 'Euro Stoxx Balance',
    colREBalance: 'Barcelona Flat Equity',
    colBankBalance: 'Bank Deposits',
    colCashBalance: 'Cash (Mattress)',
    exportCsv: 'Export Breakdown to CSV',
    
    // Future mode controls
    futureStartSalary: '2026 Starting Salary',
    futureInflation: 'Expected Annual Inflation (%)',
    futureRealWageGrowth: 'Real Career Wage Growth (%)',
    futureSimulateBtn: 'Recalculate 1,000 Monte Carlo Paths',
    futureMilestonesTitle: 'Projected Wealth Milestones',
    milestone10yr: '10 Years (2036)',
    milestone20yr: '20 Years (2046)',
    milestone30yr: '30 Years (2056)',
    
    // Tooltips / Glossary
    helpDCA: 'Dollar Cost Averaging: Investing a fixed percentage of salary monthly automates buying more shares when prices are low and fewer when high.',
    helpRealVsNominal: 'Nominal is the raw number on the statement. Real adjusts for inflation, showing what that money can actually buy in 2026 purchasing power.',
    helpFxAdjustment: 'For European/Spanish investors, S&P 500 returns are converted to EUR using historical USD/EUR and ESP exchange rates.',
    footerCredits: 'Real Returns Investment Simulator • Built with verified historical series (BLS, SSA, INE, Damodaran, BME, Idealista).'
  },
  ca: {
    appTitle: 'Simulador de Rendiments Reals d\'Inversió',
    appSubtitle: 'Backtesting realista i projeccions futures ajustades per inflació real i salaris històrics',
    modeHistorical: 'Backtesting Històric (1928–2026)',
    modeFuture: 'Projecció de Futur (2026+)',
    countrySelector: 'País / Context Econòmic',
    spainLabel: 'Espanya / Catalunya (EUR / PTA)',
    usLabel: 'Estats Units (USD)',
    timeHorizon: 'Horitzó Temporal i Època',
    startYear: 'Any d\'Inici',
    duration: 'Durada (Anys)',
    savingsRate: 'Taxa d\'Estalvi Mensual (% del Sou)',
    customSalaryLabel: 'Salari Anual Inicial',
    customSalaryPlaceholder: 'Auto (Mediana Històrica)',
    presetLabel: 'Èpoques Històriques Destacades',
    selectPreset: 'Tria una època històrica...',
    valueMode: 'Mode de Valoració',
    nominalMode: 'Nominal ($ / € de l\'època)',
    realMode: 'Real (Poder Adquisitiu Constant 2026)',
    assetsToCompare: 'Actius i Benchmarks a Comparar',
    assetSp500: 'S&P 500 (Rendiment Total amb Dividends)',
    assetIbex35: 'IBEX 35 (Dividends Reinvertits)',
    assetEurostoxx: 'Euro Stoxx 50 (Europa)',
    assetBarcelonaRE: 'Immobiliari a Barcelona (Pis + Hipoteca)',
    assetBankDeposit: 'Dipòsits Bancaris / Interessos',
    assetCash: 'Diners sota el matalàs (0% interès)',
    
    // KPI Cards
    kpiFinalWealth: 'Patrimoni Final del Portafoli',
    kpiTotalInvested: 'Capital Total Estalviat / Invertit',
    kpiRealGain: 'Guany Real Net',
    kpiRealMultiplier: 'Multiplicador de Poder Adquisitiu',
    kpiCashErosion: 'Erosió per Inflació dels Diners Aturats',
    kpiCashLossNote: 'Pèrdua de poder de compra per deixar els diners en un compte al 0%',
    
    // Charts
    chartTitle: 'Trajectòria del Patrimoni al Llarg del Temps',
    chartTitleHistorical: 'Trajectòria del Patrimoni al Llarg del Temps',
    chartTitleFuture: 'Distribució de Riquesa Monte Carlo (1.000 Simulacions)',
    chartYAxisNominal: 'Valor Nominal',
    chartYAxisReal: 'Valor Real (Poder de Compra 2026)',
    chartLegendP10: 'Pessimista / Baixista (Percentil 10)',
    chartLegendP50: 'Mediana Esperada (Percentil 50)',
    chartLegendP90: 'Optimista / Alcista (Percentil 90)',
    chartLegendInvested: 'Capital Real Acumulat Aportat',
    chartLegendCash: 'Diners al 0% (Valor Real)',
    
    // Real Estate Section
    reTitle: 'Cas Pràctic Immobiliari a Barcelona (Pis + Hipoteca)',
    reExplainer: 'Simula la compra d\'un pis estàndard de 75 m² a Barcelona al preu històric de l\'any d\'inici, utilitzant el 10% del sou mensual per pagar una hipoteca al 80% (Euríbor/Míbor + diferencial) sumat a la rendibilitat neta de lloguer (~4,2%) enfront de la revalorització.',
    rePropertyVal: 'Valor de Mercat de l\'Immoble',
    reMortgageRemain: 'Deute Hipotecari Pendent',
    reNetEquity: 'Patrimoni Immobiliari Net (Capital + Lloguers)',
    reM2Price: 'Preu per m²',
    
    // Reality check
    realityCheckTitle: 'La Crua Realitat de la Inflació: Borsa vs Diners Parats',
    realityCheckText: 'Al llarg de 30 anys, guardar el 10% del sou sota el matalàs suposa una destrucció garantida de patrimoni per la inflació acumulada. Mentrestant, la inversió indexada ha preservat i multiplicat el poder adquisitiu real.',
    
    // Table
    tableTitle: 'Desglossament Detallat Any per Any',
    colYear: 'Any',
    colSalary: 'Salari Mediana',
    colMonthlySavings: 'Mensual (10%)',
    colInflation: 'Inflació (IPC)',
    colSp500Return: 'Rendiment S&P 500',
    colSp500Balance: 'Saldo S&P 500',
    colIbexBalance: 'Saldo IBEX 35',
    colEurostoxxBalance: 'Saldo Euro Stoxx',
    colREBalance: 'Patrimoni Pis Barcelona',
    colBankBalance: 'Dipòsits Bancaris',
    colCashBalance: 'Efectiu (Matalàs)',
    exportCsv: 'Exportar Dades a CSV',
    
    // Future mode controls
    futureStartSalary: 'Salari Inicial 2026',
    futureInflation: 'Inflació Anual Esperada (%)',
    futureRealWageGrowth: 'Creixement Salarial Real (%)',
    futureSimulateBtn: 'Recalcular 1.000 Escenaris Monte Carlo',
    futureMilestonesTitle: 'Fites de Patrimoni Projectades',
    milestone10yr: '10 Anys (2036)',
    milestone20yr: '20 Anys (2046)',
    milestone30yr: '30 Anys (2056)',
    
    // Tooltips / Glossary
    helpDCA: 'Dollar Cost Averaging (DCA): Invertir un % fix del salari cada mes automatitza la compra de més participacions quan els preus baixen i menys quan pugen.',
    helpRealVsNominal: 'El valor Nominal és la xifra absoluta del compte. El valor Real descompta la inflació, mostrant el poder de compra real en euros de 2026.',
    helpFxAdjustment: 'Per a inversors europeus/catalans, el rendiment del S&P 500 es converteix a EUR aplicant el tipus de canvi històric USD/EUR i de la pesseta.',
    footerCredits: 'Simulador de Rendiments Reals d\'Inversió • Creat amb sèries històriques verificades (INE, BLS, SSA, Damodaran, BME, Idealista).'
  }
};

let currentLanguage = 'ca'; // Default to Catalan as requested by user

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(lang) {
  if (lang === 'en' || lang === 'ca') {
    currentLanguage = lang;
  }
}

export function t(key) {
  return TRANSLATIONS[currentLanguage]?.[key] ?? TRANSLATIONS['en']?.[key] ?? key;
}
