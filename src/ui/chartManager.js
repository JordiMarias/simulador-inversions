import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

let mainChartInstance = null;

/**
 * Format currency numbers with localized commas and symbols
 */
export function formatCurrency(val, symbol = '€') {
  if (val === null || val === undefined || isNaN(val)) return '-';
  return `${symbol}${Math.round(val).toLocaleString()}`;
}

/**
 * Renders or updates the Historical Multi-Asset Chart
 */
export function renderHistoricalChart(canvasEl, simResult, isRealMode = true, enabledAssets = {}) {
  if (!canvasEl) return;

  const ctx = canvasEl.getContext('2d');
  const symbol = simResult.currencySymbol;
  const labels = simResult.annualBreakdown.map(row => row.year);

  // Asset color schemes
  const colors = {
    sp500: { border: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' },      // Cyan
    ibex35: { border: '#EC4899', bg: 'rgba(236, 72, 153, 0.10)' },     // Pink
    eurostoxx: { border: '#3B82F6', bg: 'rgba(59, 130, 246, 0.10)' },  // Blue
    barcelonaRE: { border: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },// Purple
    bankDeposit: { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.10)' },// Amber
    cash: { border: '#94A3B8', bg: 'rgba(148, 163, 184, 0.08)' },       // Slate
    invested: { border: '#10B981', bg: 'rgba(16, 185, 129, 0.05)' }    // Emerald dashed
  };

  const datasets = [];

  // Invested baseline (Dashed line)
  if (enabledAssets.invested !== false) {
    datasets.push({
      label: isRealMode ? 'Real Invested Capital (2026)' : 'Nominal Invested Capital',
      data: simResult.annualBreakdown.map(r => isRealMode ? r.totalInvestedReal2026 : r.totalInvestedNominal),
      borderColor: colors.invested.border,
      backgroundColor: 'transparent',
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.1,
      order: 10
    });
  }

  // S&P 500
  if (enabledAssets.sp500 !== false) {
    datasets.push({
      label: `S&P 500 (${isRealMode ? 'Real 2026' : 'Nominal'})`,
      data: simResult.annualBreakdown.map(r => isRealMode ? r.sp500Real2026 : r.sp500Nominal),
      borderColor: colors.sp500.border,
      backgroundColor: colors.sp500.bg,
      fill: true,
      borderWidth: 3,
      pointRadius: simResult.annualBreakdown.length > 35 ? 0 : 2,
      pointHoverRadius: 6,
      tension: 0.3,
      order: 1
    });
  }

  // Barcelona Real Estate (if Spain)
  if (simResult.country === 'ES' && enabledAssets.barcelonaRE !== false) {
    datasets.push({
      label: `Barcelona Real Estate (${isRealMode ? 'Real 2026' : 'Nominal'})`,
      data: simResult.annualBreakdown.map(r => isRealMode ? r.barcelonaREReal2026 : r.barcelonaRENominal),
      borderColor: colors.barcelonaRE.border,
      backgroundColor: colors.barcelonaRE.bg,
      borderWidth: 2.5,
      pointRadius: 2,
      pointHoverRadius: 5,
      tension: 0.3,
      order: 2
    });
  }

  // Euro Stoxx 50 (if Spain)
  if (simResult.country === 'ES' && enabledAssets.eurostoxx !== false) {
    datasets.push({
      label: `Euro Stoxx 50 (${isRealMode ? 'Real 2026' : 'Nominal'})`,
      data: simResult.annualBreakdown.map(r => isRealMode ? r.eurostoxxReal2026 : r.eurostoxxNominal),
      borderColor: colors.eurostoxx.border,
      backgroundColor: colors.eurostoxx.bg,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
      order: 3
    });
  }

  // Ibex 35 (if Spain)
  if (simResult.country === 'ES' && enabledAssets.ibex35 !== false) {
    datasets.push({
      label: `IBEX 35 (${isRealMode ? 'Real 2026' : 'Nominal'})`,
      data: simResult.annualBreakdown.map(r => isRealMode ? r.ibexReal2026 : r.ibexNominal),
      borderColor: colors.ibex35.border,
      backgroundColor: colors.ibex35.bg,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
      order: 4
    });
  }

  // Bank Deposits
  if (enabledAssets.bankDeposit !== false) {
    datasets.push({
      label: `Bank Deposits (${isRealMode ? 'Real 2026' : 'Nominal'})`,
      data: simResult.annualBreakdown.map(r => isRealMode ? r.bankDepositReal2026 : r.bankDepositNominal),
      borderColor: colors.bankDeposit.border,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.2,
      order: 5
    });
  }

  // Cash / Mattress
  if (enabledAssets.cash !== false) {
    datasets.push({
      label: `Cash Mattress (${isRealMode ? 'Real 2026' : 'Nominal'})`,
      data: simResult.annualBreakdown.map(r => isRealMode ? r.cashReal2026 : r.cashNominal),
      borderColor: colors.cash.border,
      backgroundColor: colors.cash.bg,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.1,
      order: 6
    });
  }

  if (mainChartInstance) {
    mainChartInstance.destroy();
  }

  mainChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#94A3B8',
            font: { family: "'Inter', sans-serif", size: 12 },
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#F8FAFC',
          bodyColor: '#CBD5E1',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          titleFont: { family: "'Outfit', sans-serif", size: 14, weight: 'bold' },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              const val = context.parsed.y;
              return ` ${label}: ${formatCurrency(val, symbol)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#64748B',
            font: { family: "'Inter', sans-serif", size: 11 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12
          }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#64748B',
            font: { family: "'Inter', sans-serif", size: 11 },
            callback: (val) => formatCurrency(val, symbol)
          }
        }
      }
    }
  });

  return mainChartInstance;
}

/**
 * Renders the Monte Carlo Future Projection Fan Chart
 */
export function renderMonteCarloChart(canvasEl, mcResult, isRealMode = true) {
  if (!canvasEl) return;

  const ctx = canvasEl.getContext('2d');
  const symbol = mcResult.currencySymbol;
  const labels = mcResult.years;

  const series = mcResult.series;
  const p10 = isRealMode ? series.p10Real : series.p10Nominal;
  const p25 = isRealMode ? series.p25Real : series.p25Nominal;
  const p50 = isRealMode ? series.p50Real : series.p50Nominal;
  const p75 = isRealMode ? series.p75Real : series.p75Nominal;
  const p90 = isRealMode ? series.p90Real : series.p90Nominal;
  const invested = isRealMode ? series.investedReal : series.investedNominal;
  const cash = series.cashReal;

  const datasets = [
    // Invested capital (dashed emerald)
    {
      label: isRealMode ? 'Real Capital Contributed' : 'Nominal Capital Contributed',
      data: invested,
      borderColor: '#10B981',
      backgroundColor: 'transparent',
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: 0,
      order: 10
    },
    // Cash at 0%
    {
      label: 'Cash (0% interest, real value)',
      data: cash,
      borderColor: '#94A3B8',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      pointRadius: 0,
      order: 9
    },
    // 90th percentile (Bull)
    {
      label: '90th Percentile (Bull Market)',
      data: p90,
      borderColor: 'rgba(6, 182, 212, 0.4)',
      backgroundColor: 'rgba(6, 182, 212, 0.08)',
      fill: '+1', // Fill down to p75
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.3,
      order: 4
    },
    // 75th percentile
    {
      label: '75th Percentile (Optimistic)',
      data: p75,
      borderColor: 'rgba(6, 182, 212, 0.6)',
      backgroundColor: 'rgba(6, 182, 212, 0.15)',
      fill: '+1', // Fill down to p50
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.3,
      order: 3
    },
    // 50th percentile (Median Expected)
    {
      label: '50th Percentile (Expected Median)',
      data: p50,
      borderColor: '#06B6D4',
      backgroundColor: 'rgba(6, 182, 212, 0.15)',
      fill: '+1', // Fill down to p25
      borderWidth: 3.5,
      pointRadius: 0,
      pointHoverRadius: 6,
      tension: 0.3,
      order: 1
    },
    // 25th percentile
    {
      label: '25th Percentile (Conservative)',
      data: p25,
      borderColor: 'rgba(6, 182, 212, 0.6)',
      backgroundColor: 'rgba(6, 182, 212, 0.08)',
      fill: '+1', // Fill down to p10
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.3,
      order: 2
    },
    // 10th percentile (Bear)
    {
      label: '10th Percentile (Bear Market)',
      data: p10,
      borderColor: 'rgba(239, 68, 68, 0.6)',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.3,
      order: 5
    }
  ];

  if (mainChartInstance) {
    mainChartInstance.destroy();
  }

  mainChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#94A3B8',
            font: { family: "'Inter', sans-serif", size: 12 },
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            padding: 14,
            filter: (legendItem) => !legendItem.text.includes('Percentile') || legendItem.text.includes('50th') || legendItem.text.includes('10th') || legendItem.text.includes('90th')
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#F8FAFC',
          bodyColor: '#CBD5E1',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          titleFont: { family: "'Outfit', sans-serif", size: 14, weight: 'bold' },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              const val = context.parsed.y;
              return ` ${label}: ${formatCurrency(val, symbol)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#64748B',
            font: { family: "'Inter', sans-serif", size: 11 },
            maxTicksLimit: 10
          }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#64748B',
            font: { family: "'Inter', sans-serif", size: 11 },
            callback: (val) => formatCurrency(val, symbol)
          }
        }
      }
    }
  });

  return mainChartInstance;
}
