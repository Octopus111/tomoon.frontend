/**
 * KPI Panel Component
 *
 * Standalone, reusable component for rendering backtest KPI summaries.
 * Can be imported into any page that needs strategy-level result overview.
 *
 * Usage:
 *   import { renderKpiPanel } from './components/kpi-panel.js';
 *   renderKpiPanel(containerEl, backtestResult);
 */

// ═══════════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════════

function _fmt(v, decimals = 2) {
  if (v == null || isNaN(v)) return '—';
  return Number(v).toFixed(decimals);
}

function _fmtPct(v, decimals = 1) {
  if (v == null || isNaN(v)) return '—';
  return `${Number(v).toFixed(decimals)}%`;
}

function _fmtUsd(v, decimals = 2) {
  if (v == null || isNaN(v)) return '—';
  const sign = v >= 0 ? '+' : '';
  return `${sign}$${Number(v).toFixed(decimals)}`;
}

function _colorClass(v) {
  if (v == null || isNaN(v)) return '';
  return v >= 0 ? 'kpi-positive' : 'kpi-negative';
}

// ═══════════════════════════════════════════════════════════════
//  KPI Definitions — grouped into sections
// ═══════════════════════════════════════════════════════════════

/**
 * Build KPI items from a backtest result object.
 * Returns an array of { section, items: [{ label, value, colorClass }] }
 */
function buildKpiSections(r) {
  if (!r) return [];

  const trades = r.total_trades ?? 0;
  const winRate = r.win_rate ?? 0;
  const netProfit = r.net_profit ?? r.total_pnl ?? 0;
  const maxDD = r.max_drawdown_pct ?? 0;
  const sharpe = r.sharpe_ratio ?? 0;
  const pf = r.profit_factor ?? 0;
  const expectancy = r.expectancy ?? 0;
  const avgW = r.avg_winner ?? 0;
  const avgL = r.avg_loser ?? 0;
  const consecL = r.consecutive_losses ?? 0;
  const consecW = r.consecutive_wins ?? 0;
  const tuw = r.time_under_water_days ?? 0;
  const retDD = r.return_over_max_dd ?? 0;
  const annualRet = r.annual_return_pct ?? 0;
  const commission = r.total_commission ?? 0;

  return [
    {
      section: 'Returns',
      items: [
        { label: 'Net Profit',    value: _fmtUsd(netProfit),        colorClass: _colorClass(netProfit) },
        { label: 'Annual Return', value: _fmtPct(annualRet),        colorClass: _colorClass(annualRet) },
        { label: 'Commission',    value: `$${_fmt(commission)}`,    colorClass: '' },
        { label: 'Return / Max DD', value: `${_fmt(retDD)}x`,      colorClass: _colorClass(retDD) },
      ],
    },
    {
      section: 'Risk',
      items: [
        { label: 'Max Drawdown',  value: _fmtPct(maxDD),            colorClass: 'kpi-negative' },
        { label: 'Sharpe',        value: _fmt(sharpe),               colorClass: _colorClass(sharpe) },
        { label: 'Time Under Water', value: `${_fmt(tuw, 1)} days`, colorClass: '' },
        { label: 'Consec Losses', value: String(consecL),            colorClass: '' },
      ],
    },
    {
      section: 'Execution',
      items: [
        { label: 'Trade Count',   value: String(trades),             colorClass: '' },
        { label: 'Win Rate',      value: _fmtPct(winRate * 100),     colorClass: '' },
        { label: 'Profit Factor', value: pf === Infinity ? '∞' : _fmt(pf), colorClass: _colorClass(pf - 1) },
        { label: 'Expectancy',    value: _fmtUsd(expectancy),        colorClass: _colorClass(expectancy) },
      ],
    },
    {
      section: 'Win / Loss Detail',
      items: [
        { label: 'Avg Winner',    value: _fmtUsd(avgW),              colorClass: 'kpi-positive' },
        { label: 'Avg Loser',     value: _fmtUsd(avgL),              colorClass: 'kpi-negative' },
        { label: 'Consec Wins',   value: String(consecW),            colorClass: '' },
        { label: 'Consec Losses', value: String(consecL),            colorClass: '' },
      ],
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
//  Monthly Returns mini-chart (text table)
// ═══════════════════════════════════════════════════════════════

function buildMonthlyHTML(distribution) {
  if (!distribution || !distribution.length) return '';

  let html = '<div class="kpi-monthly">';
  html += '<div class="kpi-section-title">Monthly Returns</div>';
  html += '<div class="kpi-monthly-grid">';
  for (const m of distribution) {
    const color = m.pnl >= 0 ? 'var(--green, #16a34a)' : 'var(--red, #ef4444)';
    html += `<div class="kpi-month-item">
      <span class="kpi-month-label">${m.month}</span>
      <span class="kpi-month-value" style="color:${color}">${_fmtUsd(m.pnl)}</span>
    </div>`;
  }
  html += '</div></div>';
  return html;
}

function buildOpportunityLogicHTML(diag) {
  const ol = diag?.opportunity_logic;
  if (!ol) return '';

  const funnel = ol.logic_funnel || {};
  const dropoff = ol.funnel_dropoff || {};
  const fe = ol.filter_effectiveness || {};
  const combo = ol.core_logic_combo || {};
  const rows = combo.rows || [];
  const flags = ol.issue_flags || {};

  let html = '<div class="kpi-monthly">';
  html += '<div class="kpi-section-title">Opportunity & Logic</div>';

  html += '<div class="kpi-mini-grid">';
  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Logic Funnel</div>
    <div class="kpi-mini-row"><span>Candidate Opportunity Count</span><b>${funnel.candidate_opportunity_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Passed Regime Count</span><b>${funnel.passed_regime_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Passed Setup Count</span><b>${funnel.passed_setup_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Trigger Fired Count</span><b>${funnel.trigger_fired_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Passed Filter Count</span><b>${funnel.passed_filter_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Order Sent Count</span><b>${funnel.order_sent_count ?? 0}</b></div>
  </div>`;

  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Funnel Drop-off</div>
    <div class="kpi-mini-row"><span>Failed at Regime Gate</span><b>${dropoff.failed_at_regime_gate ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Failed at Setup Conditions</span><b>${dropoff.failed_at_setup_conditions ?? 0}</b></div>
    <div class="kpi-mini-row"><span>No Trigger Fired</span><b>${dropoff.no_trigger_fired ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Rejected by Filter</span><b>${dropoff.rejected_by_filter ?? 0}</b></div>
  </div>`;

  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Filter Effectiveness</div>
    <div class="kpi-mini-row"><span>Blocked Count</span><b>${fe.blocked_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Blocked Winner Count</span><b>${fe.blocked_winner_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Blocked Loser Count</span><b>${fe.blocked_loser_count ?? 0}</b></div>
  </div>`;
  html += '</div>';

  html += '<div class="kpi-section-title" style="margin-top:8px;">Core Logic Combo Diagnostics (Regime × Setup)</div>';
  if (rows.length) {
    html += '<table class="kpi-table"><thead><tr><th>Combo</th><th>Trades</th><th>Loss Count</th><th>Large Loss Count</th></tr></thead><tbody>';
    for (const r of rows) {
      html += `<tr><td>${r.combo}</td><td>${r.trades ?? 0}</td><td>${r.loss_count ?? 0}</td><td>${r.large_loss_count ?? 0}</td></tr>`;
    }
    html += '</tbody></table>';
  } else {
    html += '<div class="kpi-placeholder" style="padding:8px 0;">No combo stats yet</div>';
  }

  html += '<div class="kpi-section-title" style="margin-top:8px;">Issue Flags (Phase 1)</div>';
  const toxic = flags.toxic_regime_setup_pair ? `Toxic Pair: ${flags.toxic_regime_setup_pair}` : 'Toxic Pair: none';
  html += `<div class="kpi-mini-row"><span>Over-Filtered</span><b>${flags.over_filtered ? 'YES' : 'NO'}</b></div>`;
  html += `<div class="kpi-mini-row"><span>Weak Trigger Conversion</span><b>${flags.weak_trigger_conversion ? 'YES' : 'NO'}</b></div>`;
  html += `<div class="kpi-mini-row"><span>Sparse Opportunity</span><b>${flags.sparse_opportunity ? 'YES' : 'NO'}</b></div>`;
  html += `<div class="kpi-mini-row"><span>Toxic Regime × Setup Pair</span><b>${toxic}</b></div>`;
  html += '</div>';
  return html;
}

function buildExecutionRealityHTML(diag) {
  const er = diag?.execution_reality;
  if (!er) return '';

  const ss = er.signal_summary || {};
  const eq = er.execution_quality || {};
  const ci = er.cost_impact || {};

  let html = '<div class="kpi-monthly">';
  html += '<div class="kpi-section-title">Execution Reality</div>';
  html += '<div class="kpi-mini-grid">';
  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Signal Summary</div>
    <div class="kpi-mini-row"><span>Signal Count</span><b>${ss.signal_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Qualified Signal Count</span><b>${ss.qualified_signal_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Fill Count</span><b>${ss.fill_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Missed Trade Count</span><b>${ss.missed_trade_count ?? 0}</b></div>
  </div>`;

  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Execution Quality</div>
    <div class="kpi-mini-row"><span>Avg Entry Slippage</span><b>${_fmt(eq.avg_entry_slippage, 4)}</b></div>
    <div class="kpi-mini-row"><span>Avg Exit Slippage</span><b>${_fmt(eq.avg_exit_slippage, 4)}</b></div>
  </div>`;

  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Cost Impact</div>
    <div class="kpi-mini-row"><span>Total Cost</span><b>${_fmtUsd(ci.total_cost ?? 0)}</b></div>
    <div class="kpi-mini-row"><span>Gross PnL</span><b>${_fmtUsd(ci.gross_pnl ?? 0)}</b></div>
    <div class="kpi-mini-row"><span>Net PnL</span><b>${_fmtUsd(ci.net_pnl ?? 0)}</b></div>
  </div>`;
  html += '</div></div>';

  return html;
}

function buildOpportunityLogicSummaryHTML(diag) {
  const ol = diag?.opportunity_logic;
  if (!ol) return '';
  const funnel = ol.logic_funnel || {};
  const drop = ol.funnel_dropoff || {};
  const flags = ol.issue_flags || {};

  let html = '<div class="kpi-monthly">';
  html += '<div class="kpi-section-title">Opportunity & Logic (Summary)</div>';
  html += '<div class="kpi-mini-grid">';
  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Funnel</div>
    <div class="kpi-mini-row"><span>Candidate</span><b>${funnel.candidate_opportunity_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Setup Pass</span><b>${funnel.passed_setup_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Trigger Fired</span><b>${funnel.trigger_fired_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Order Sent</span><b>${funnel.order_sent_count ?? 0}</b></div>
  </div>`;
  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Drop-off</div>
    <div class="kpi-mini-row"><span>Failed Regime</span><b>${drop.failed_at_regime_gate ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Failed Setup</span><b>${drop.failed_at_setup_conditions ?? 0}</b></div>
    <div class="kpi-mini-row"><span>No Trigger</span><b>${drop.no_trigger_fired ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Rejected Filter</span><b>${drop.rejected_by_filter ?? 0}</b></div>
  </div>`;
  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Issue Flags</div>
    <div class="kpi-mini-row"><span>Over-Filtered</span><b>${flags.over_filtered ? 'YES' : 'NO'}</b></div>
    <div class="kpi-mini-row"><span>Weak Trigger</span><b>${flags.weak_trigger_conversion ? 'YES' : 'NO'}</b></div>
    <div class="kpi-mini-row"><span>Sparse Opp.</span><b>${flags.sparse_opportunity ? 'YES' : 'NO'}</b></div>
    <div class="kpi-mini-row"><span>Toxic Pair</span><b>${flags.toxic_regime_setup_pair ?? 'none'}</b></div>
  </div>`;
  html += '</div>';
  html += '<div class="kpi-month-label" style="margin-top:4px;">Full tables remain in Diagnostics tab.</div>';
  html += '</div>';
  return html;
}

function buildExecutionRealitySummaryHTML(diag) {
  const er = diag?.execution_reality;
  if (!er) return '';
  const ss = er.signal_summary || {};
  const ci = er.cost_impact || {};

  let html = '<div class="kpi-monthly">';
  html += '<div class="kpi-section-title">Execution Reality (Summary)</div>';
  html += '<div class="kpi-mini-grid">';
  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Signal Flow</div>
    <div class="kpi-mini-row"><span>Signal</span><b>${ss.signal_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Qualified</span><b>${ss.qualified_signal_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Filled</span><b>${ss.fill_count ?? 0}</b></div>
    <div class="kpi-mini-row"><span>Missed</span><b>${ss.missed_trade_count ?? 0}</b></div>
  </div>`;
  html += `<div class="kpi-mini-card"><div class="kpi-mini-title">Cost Impact</div>
    <div class="kpi-mini-row"><span>Total Cost</span><b>${_fmtUsd(ci.total_cost ?? 0)}</b></div>
    <div class="kpi-mini-row"><span>Gross PnL</span><b>${_fmtUsd(ci.gross_pnl ?? 0)}</b></div>
    <div class="kpi-mini-row"><span>Net PnL</span><b>${_fmtUsd(ci.net_pnl ?? 0)}</b></div>
  </div>`;
  html += '</div>';
  html += '<div class="kpi-month-label" style="margin-top:4px;">Full tables remain in Diagnostics tab.</div>';
  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════════════════════════
//  Main render function
// ═══════════════════════════════════════════════════════════════

/**
 * Render the full KPI panel into a container element.
 *
 * @param {HTMLElement} container - The target DOM element
 * @param {Object|null} result   - Backtest result object (null to show placeholder)
 */
function renderKpiPanel(container, result) {
  if (!container) return;

  if (!result) {
    container.innerHTML = '<div class="kpi-placeholder">Run a backtest to see KPIs</div>';
    return;
  }

  const sections = buildKpiSections(result);
  let html = '<div class="kpi-panel">';

  // Status badge
  const status = result.status ?? 'unknown';
  const statusColor = status === 'completed' ? 'var(--green, #16a34a)' : 'var(--red, #ef4444)';
  html += `<div class="kpi-status" style="border-left: 3px solid ${statusColor}; padding-left: 8px; margin-bottom: 8px;">
    <span style="font-weight:700; font-size:12px;">${status.toUpperCase()}</span>
    <span style="opacity:0.6; font-size:11px; margin-left:8px;">${result.run_id ?? ''}</span>
  </div>`;

  for (const sec of sections) {
    html += `<div class="kpi-section">`;
    html += `<div class="kpi-section-title">${sec.section}</div>`;
    html += '<div class="kpi-grid">';
    for (const item of sec.items) {
      html += `<div class="kpi-cell">
        <div class="kpi-label">${item.label}</div>
        <div class="kpi-value ${item.colorClass}">${item.value}</div>
      </div>`;
    }
    html += '</div></div>';
  }

  // Monthly returns
  const monthlyDist = result.monthly_return_distribution || result.diagnostics?.monthly_returns || [];
  html += buildMonthlyHTML(monthlyDist);

  // Compact diagnostics summary in KPI area
  html += buildOpportunityLogicSummaryHTML(result.diagnostics || {});
  html += buildExecutionRealitySummaryHTML(result.diagnostics || {});

  html += '</div>';
  container.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
//  CSS (injected once)
// ═══════════════════════════════════════════════════════════════

(function injectKpiStyles() {
  if (document.getElementById('kpi-panel-styles')) return;
  const style = document.createElement('style');
  style.id = 'kpi-panel-styles';
  style.textContent = `
    .kpi-panel { }
    .kpi-placeholder { text-align: center; padding: 20px; opacity: 0.5; font-size: 12px; }
    .kpi-section { margin-bottom: 10px; }
    .kpi-section-title {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--muted, rgba(0,0,0,0.55));
      margin-bottom: 4px; padding-bottom: 2px;
      border-bottom: 1px solid var(--border, rgba(0,0,0,0.08));
    }
    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;
    }
    .kpi-cell {
      border: 1px solid var(--border, rgba(0,0,0,0.08));
      border-radius: 6px; padding: 6px; text-align: center;
    }
    .kpi-label { font-size: 10px; color: var(--muted, rgba(0,0,0,0.55)); }
    .kpi-value { font-size: 14px; font-weight: 700; font-family: var(--mono, monospace); }
    .kpi-positive { color: var(--green, #16a34a); }
    .kpi-negative { color: var(--red, #ef4444); }
    .kpi-monthly { margin-top: 8px; }
    .kpi-monthly-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 3px;
    }
    .kpi-month-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 3px 6px; background: #f9fafb; border-radius: 4px; font-size: 11px;
    }
    .kpi-month-label { color: var(--muted, rgba(0,0,0,0.55)); font-size: 10px; }
    .kpi-month-value { font-weight: 600; font-family: var(--mono, monospace); font-size: 11px; }
    .kpi-mini-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .kpi-mini-card { border: 1px solid var(--border, rgba(0,0,0,0.08)); border-radius: 6px; padding: 6px; }
    .kpi-mini-title { font-size: 10px; font-weight: 700; margin-bottom: 4px; color: var(--muted, rgba(0,0,0,0.55)); }
    .kpi-mini-row { display: flex; justify-content: space-between; font-size: 11px; padding: 1px 0; gap: 8px; }
    .kpi-mini-row b { font-family: var(--mono, monospace); font-weight: 700; }
    .kpi-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; }
    .kpi-table th, .kpi-table td { border: 1px solid var(--border, rgba(0,0,0,0.08)); padding: 3px 6px; text-align: left; }
    .kpi-table th { background: #f9fafb; font-weight: 700; }
  `;
  document.head.appendChild(style);
})();

// Export for use in other scripts (global attach for non-module env)
window.KpiPanel = { renderKpiPanel, buildKpiSections };
