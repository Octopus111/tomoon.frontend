const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');

global.window = global;
global.self = global;

function loadScript(relativePath) {
  const absPath = path.join(repoRoot, relativePath);
  const code = fs.readFileSync(absPath, 'utf8');
  vm.runInThisContext(code, { filename: absPath });
}

loadScript(path.join('shared', 'component-lib.js'));
loadScript(path.join('shared', 'components.js'));
loadScript(path.join('shared', 'backtest-engine.js'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertStrictlyUniqueEquityBars(equityCurve, label) {
  let previousBar = -Infinity;
  for (const point of equityCurve || []) {
    assert(Number.isFinite(point.bar), `${label}: equity point missing bar index`);
    assert(point.bar > previousBar, `${label}: equity curve contains duplicate or non-monotonic bar indices`);
    previousBar = point.bar;
  }
}

function createBars(count = 600, start = 2650) {
  const bars = [];
  let price = start;
  let ts = Date.UTC(2025, 0, 2, 0, 0, 0);
  for (let index = 0; index < count; index += 1) {
    const drift = Math.sin(index / 37) * 1.8 + Math.cos(index / 12) * 0.7 + (index > 250 ? 0.45 : 0.18);
    const shock = Math.sin(index / 5) * 1.2 + Math.cos(index / 9) * 0.9;
    const open = price;
    const close = price + drift + shock * 0.35;
    const high = Math.max(open, close) + 0.9 + Math.abs(Math.sin(index / 7)) * 0.8;
    const low = Math.min(open, close) - 0.9 - Math.abs(Math.cos(index / 11)) * 0.8;
    bars.push({
      timestamp: new Date(ts).toISOString(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: 1000 + (index % 20) * 25,
    });
    price = close;
    ts += 5 * 60 * 1000;
  }
  return bars;
}

function makeNodesFromPipeline(pipeline) {
  const entries = [];
  for (const [stageKey, list] of Object.entries(pipeline)) {
    if (stageKey === 'branchLanes' || stageKey === 'executionModel') continue;
    for (const entry of list || []) {
      if (!entry || !entry.component_id) continue;
      entries.push({
        id: `${stageKey}-${entry.component_id}-${entries.length + 1}`,
        type: entry.component_id,
        label: entry.component_id,
        params: { ...(entry.params || {}) },
      });
    }
  }
  return entries;
}

function runCase(name, pipeline, checks) {
  const blueprint = {
    strategy_id: name,
    name,
    version: 'smoke',
    nodes: makeNodesFromPipeline(pipeline),
    connections: [],
    pipeline: JSON.parse(JSON.stringify(pipeline)),
  };

  const savedBlueprint = JSON.parse(JSON.stringify(blueprint));
  const validation = BacktestEngine.validateBlueprint(savedBlueprint);
  assert(validation.valid, `${name}: blueprint invalid: ${validation.errors.join('; ')}`);

  const components = ComponentLib.resolveComponents(savedBlueprint);
  const bars = createBars();
  const result = BacktestEngine.runWithComponents(bars, components, {
    initial_capital: 100000,
    commission_per_side: 3.5,
    spread: 0.3,
    slippage: 0.1,
    value_per_unit: 100,
  });

  assert(!result.error, `${name}: engine error: ${result.error}`);
  assert(Array.isArray(result.equityCurve) && result.equityCurve.length > 10, `${name}: missing equity curve`);
  assertStrictlyUniqueEquityBars(result.equityCurve, name);
  assert(result.stageComponents && Object.keys(result.stageComponents).length > 0, `${name}: missing stage components`);
  assert(result.stageReport && Object.keys(result.stageReport).length > 0, `${name}: missing stage report`);

  checks({ blueprint: savedBlueprint, components, result });

  return {
    name,
    trades: result.metrics.total_trades,
    sharpe: result.metrics.sharpe,
    net: result.metrics.net_profit,
    stageKeys: Object.keys(result.stageReport || {}),
    indicatorKeys: Object.keys(result.indicators || {}),
  };
}

const ocCrossPipeline = {
  factorEntries: [{ component_id: 'oc-alma-factor', params: { alma_len: 6, alma_offset: 0.85, alma_sigma: 5 } }],
  triggerEntries: [{ component_id: 'oc-cross-trigger', params: {} }],
  exitEntries: [
    { component_id: 'oc-tp-ladder-exit', params: { tp1_pct: 0.8, tp2_pct: 1.4, tp3_pct: 2.1, tp1_qty: 50, tp2_qty: 30, tp3_qty: 20 } },
    { component_id: 'oc-reversal-exit', params: {} },
  ],
  riskEntries: [{ component_id: 'oc-risk-sizer', params: { risk_pct: 1.0, sl_pct: 0.5 } }],
};

const goldenCrossReusable = {
  triggerEntries: [{ component_id: 'CMP-TRI-GOLDX', params: { fast: 10, slow: 36 } }],
  exitEntries: [{ component_id: 'oc-tp-ladder-exit', params: { tp1_pct: 0.9, tp2_pct: 1.5, tp3_pct: 2.2, tp1_qty: 50, tp2_qty: 30, tp3_qty: 20 } }],
  riskEntries: [{ component_id: 'oc-risk-sizer', params: { risk_pct: 0.8, sl_pct: 0.55 } }],
};

const goldenCrossRiskSwap = {
  triggerEntries: [{ component_id: 'CMP-TRI-GOLDX', params: { fast: 10, slow: 36 } }],
  exitEntries: [{ component_id: 'oc-tp-ladder-exit', params: { tp1_pct: 0.9, tp2_pct: 1.5, tp3_pct: 2.2, tp1_qty: 50, tp2_qty: 30, tp3_qty: 20 } }],
  riskEntries: [{ component_id: 'POSITION-SIZING', params: { risk_pct: 0.8, sl_pct: 0.55 } }],
};

const goldenCrossExitSwap = {
  triggerEntries: [{ component_id: 'CMP-TRI-GOLDX', params: { fast: 10, slow: 36 } }],
  exitEntries: [{ component_id: 'SCALED-EXIT', params: { tp1_r: 0.9, tp1_pct: 40, tp2_r: 1.8, runner_pct: 20, sl_pct: 0.55 } }],
  riskEntries: [{ component_id: 'POSITION-SIZING', params: { risk_pct: 0.8, sl_pct: 0.55 } }],
};

const layeredStagePipeline = {
  foundationEntries: [{ component_id: 'DATA-SCOPE', params: { tf_regime: '1H', tf_exec: '5m', instrument: 'XAUUSD' } }],
  factorEntries: [{ component_id: 'CMP-FAC-ATR', params: { window: 14 } }],
  regimeEntries: [{ component_id: 'REGIME-GATE', params: { atr_1h_period: 14, ema50_period: 34, trend_threshold: 2 } }],
  setupEntries: [{ component_id: 'TREND-SETUP', params: { window: 21, pullback_window: 5 } }],
  triggerEntries: [{ component_id: 'PULLBACK-TRIGGER', params: { ema20_5m_period: 13, pullback_window: 5 } }],
  filterEntries: [
    { component_id: 'HARD-RULES', params: { max_body_atr: 2.0 } },
    { component_id: 'USD-FILTER', params: {} },
  ],
  scoringEntries: [{ component_id: 'SIGNAL-RANKER', params: { min_score: 0.1, lookback: 3 } }],
  entryEntries: [{ component_id: 'BREAK-ENTRY', params: { confirmation_bars: 1 } }],
  exitEntries: [{ component_id: 'SCALED-EXIT', params: { tp1_r: 0.8, tp1_pct: 40, tp2_r: 1.8, runner_pct: 20, sl_pct: 0.5 } }],
  riskEntries: [{ component_id: 'POSITION-SIZING', params: { risk_pct: 0.8, sl_pct: 0.5 } }],
  executionEntries: [{ component_id: 'EXECUTION-LAYER', params: { entry_buffer_bps: 0, allow_long: true, allow_short: true } }],
};

const branchAwarePipeline = {
  foundationEntries: [{ component_id: 'DATA-SCOPE', params: { tf_regime: '1H', tf_exec: '5m', instrument: 'XAUUSD' } }],
  regimeEntries: [{ component_id: 'REGIME-GATE', params: { atr_1h_period: 14, ema50_period: 34, trend_threshold: 2 } }],
  setupEntries: [
    { component_id: 'TREND-SETUP', params: { window: 21, pullback_window: 5 }, node_id: 101 },
    { component_id: 'TREND-SETUP', params: { window: 34, pullback_window: 8 }, node_id: 201 },
  ],
  triggerEntries: [
    { component_id: 'PULLBACK-TRIGGER', params: { ema20_5m_period: 13, pullback_window: 5 }, node_id: 102 },
    { component_id: 'CMP-TRI-GOLDX', params: { fast: 9, slow: 28 }, node_id: 202 },
  ],
  filterEntries: [
    { component_id: 'HARD-RULES', params: { max_body_atr: 2.0 }, node_id: 103 },
    { component_id: 'USD-FILTER', params: {}, node_id: 203 },
  ],
  entryEntries: [
    { component_id: 'BREAK-ENTRY', params: { confirmation_bars: 1 }, node_id: 104 },
    { component_id: 'BREAK-ENTRY', params: { confirmation_bars: 2 }, node_id: 204 },
  ],
  exitEntries: [
    { component_id: 'SCALED-EXIT', params: { tp1_r: 0.8, tp1_pct: 40, tp2_r: 1.8, runner_pct: 20, sl_pct: 0.5 }, node_id: 105 },
    { component_id: 'SCALED-EXIT', params: { tp1_r: 1.0, tp1_pct: 50, tp2_r: 2.0, runner_pct: 20, sl_pct: 0.6 }, node_id: 205 },
  ],
  riskEntries: [
    { component_id: 'POSITION-SIZING', params: { risk_pct: 0.8, sl_pct: 0.5 }, node_id: 106 },
    { component_id: 'POSITION-SIZING', params: { risk_pct: 0.6, sl_pct: 0.6 }, node_id: 206 },
  ],
  executionEntries: [
    { component_id: 'EXECUTION-LAYER', params: { entry_buffer_bps: 0, allow_long: true, allow_short: true }, node_id: 107 },
    { component_id: 'EXECUTION-LAYER', params: { entry_buffer_bps: 1, allow_long: true, allow_short: true }, node_id: 207 },
  ],
  branchLanes: [
    {
      id: 'trend_pullback_lane',
      label: 'Trend Pullback Lane',
      nodeIds: [1, 2, 101, 102, 103, 104, 105, 106, 107],
      stages: {
        foundationEntries: [{ component_id: 'DATA-SCOPE', params: { tf_regime: '1H', tf_exec: '5m', instrument: 'XAUUSD' }, node_id: 1 }],
        regimeEntries: [{ component_id: 'REGIME-GATE', params: { atr_1h_period: 14, ema50_period: 34, trend_threshold: 2 }, node_id: 2 }],
        setupEntries: [{ component_id: 'TREND-SETUP', params: { window: 21, pullback_window: 5 }, node_id: 101 }],
        triggerEntries: [{ component_id: 'PULLBACK-TRIGGER', params: { ema20_5m_period: 13, pullback_window: 5 }, node_id: 102 }],
        filterEntries: [{ component_id: 'HARD-RULES', params: { max_body_atr: 2.0 }, node_id: 103 }],
        entryEntries: [{ component_id: 'BREAK-ENTRY', params: { confirmation_bars: 1 }, node_id: 104 }],
        exitEntries: [{ component_id: 'SCALED-EXIT', params: { tp1_r: 0.8, tp1_pct: 40, tp2_r: 1.8, runner_pct: 20, sl_pct: 0.5 }, node_id: 105 }],
        riskEntries: [{ component_id: 'POSITION-SIZING', params: { risk_pct: 0.8, sl_pct: 0.5 }, node_id: 106 }],
        executionEntries: [{ component_id: 'EXECUTION-LAYER', params: { entry_buffer_bps: 0, allow_long: true, allow_short: true }, node_id: 107 }],
      },
    },
    {
      id: 'golden_cross_lane',
      label: 'Golden Cross Lane',
      nodeIds: [1, 2, 201, 202, 203, 204, 205, 206, 207],
      stages: {
        foundationEntries: [{ component_id: 'DATA-SCOPE', params: { tf_regime: '1H', tf_exec: '5m', instrument: 'XAUUSD' }, node_id: 1 }],
        regimeEntries: [{ component_id: 'REGIME-GATE', params: { atr_1h_period: 14, ema50_period: 34, trend_threshold: 2 }, node_id: 2 }],
        setupEntries: [{ component_id: 'TREND-SETUP', params: { window: 34, pullback_window: 8 }, node_id: 201 }],
        triggerEntries: [{ component_id: 'CMP-TRI-GOLDX', params: { fast: 9, slow: 28 }, node_id: 202 }],
        filterEntries: [{ component_id: 'USD-FILTER', params: {}, node_id: 203 }],
        entryEntries: [{ component_id: 'BREAK-ENTRY', params: { confirmation_bars: 2 }, node_id: 204 }],
        exitEntries: [{ component_id: 'SCALED-EXIT', params: { tp1_r: 1.0, tp1_pct: 50, tp2_r: 2.0, runner_pct: 20, sl_pct: 0.6 }, node_id: 205 }],
        riskEntries: [{ component_id: 'POSITION-SIZING', params: { risk_pct: 0.6, sl_pct: 0.6 }, node_id: 206 }],
        executionEntries: [{ component_id: 'EXECUTION-LAYER', params: { entry_buffer_bps: 1, allow_long: true, allow_short: true }, node_id: 207 }],
      },
    },
  ],
  executionModel: 'graph-v2',
};

const summaries = [];

summaries.push(runCase('oc-cross-baseline', ocCrossPipeline, ({ result }) => {
  assert(result.metrics.total_trades > 0, 'oc-cross-baseline: expected trades');
  assert(Array.isArray(result.indicators.maClose), 'oc-cross-baseline: missing maClose for chart');
  assert(Array.isArray(result.indicators.maOpen), 'oc-cross-baseline: missing maOpen for chart');
}));

summaries.push(runCase('golden-cross-trigger-swap', goldenCrossReusable, ({ result, components }) => {
  assert(result.metrics.total_trades > 0, 'golden-cross-trigger-swap: expected trades');
  assert(Array.isArray(result.indicators.fastSma), 'golden-cross-trigger-swap: missing fastSma for chart');
  assert(Array.isArray(result.indicators.slowSma), 'golden-cross-trigger-swap: missing slowSma for chart');
  assert((components.triggers || []).some((item) => item.id === 'CMP-TRI-GOLDX'), 'golden-cross-trigger-swap: trigger replacement failed');
}));

summaries.push(runCase('golden-cross-risk-swap', goldenCrossRiskSwap, ({ result, components }) => {
  assert(result.metrics.total_trades > 0, 'golden-cross-risk-swap: expected trades');
  assert((components.risk || []).some((item) => item.id === 'POSITION-SIZING'), 'golden-cross-risk-swap: risk replacement failed');
}));

summaries.push(runCase('golden-cross-exit-swap', goldenCrossExitSwap, ({ result, components }) => {
  assert(result.metrics.total_trades > 0, 'golden-cross-exit-swap: expected trades');
  assert((components.exits || []).some((item) => item.id === 'SCALED-EXIT'), 'golden-cross-exit-swap: exit replacement failed');
}));

summaries.push(runCase('layered-stage-pipeline', layeredStagePipeline, ({ result, components }) => {
  assert(result.metrics.total_trades > 0, 'layered-stage-pipeline: expected trades');
  assert(result.stageReport.Entry, 'layered-stage-pipeline: missing Entry stage report');
  assert(result.stageReport.Regime, 'layered-stage-pipeline: missing Regime stage report');
  assert(result.stageReport.Execution || (components.execution || []).length > 0, 'layered-stage-pipeline: missing Execution stage');
  assert((components.entries || []).some((item) => item.id === 'BREAK-ENTRY'), 'layered-stage-pipeline: entry stage missing replacement');
}));

summaries.push(runCase('branch-aware-regime-pipeline', branchAwarePipeline, ({ result, components }) => {
  assert(Array.isArray(components.branches) && components.branches.length === 2, 'branch-aware-regime-pipeline: expected two resolved branches');
  assert(result.runtimeMeta && Array.isArray(result.runtimeMeta.branchLanes) && result.runtimeMeta.branchLanes.length === 2, 'branch-aware-regime-pipeline: runtime missing branch lanes');
  assert(result.metrics.total_trades > 0, 'branch-aware-regime-pipeline: expected trades');
  assert((result.trades || []).every((trade) => trade.laneId), 'branch-aware-regime-pipeline: trades missing lane ids');
  assert(result.runtimeMeta.branchLanes.some((lane) => lane.id === 'trend_pullback_lane'), 'branch-aware-regime-pipeline: missing trend lane');
  assert(result.runtimeMeta.branchLanes.some((lane) => lane.id === 'golden_cross_lane'), 'branch-aware-regime-pipeline: missing golden cross lane');
}));

// Regression test: Golden Cross with explicit Entry stage (oc-signal-entry)
// This is the exact scenario that was broken — Trigger outputs 'entry' key,
// Entry component expects 'trigger' signal. The engine must remap correctly.
const goldenCrossWithEntryStage = {
  triggerEntries: [{ component_id: 'CMP-TRI-GOLDX', params: { fast: 10, slow: 36 } }],
  entryEntries: [{ component_id: 'oc-signal-entry', params: {} }],
  exitEntries: [{ component_id: 'oc-tp-ladder-exit', params: { tp1_pct: 0.9, tp2_pct: 1.5, tp3_pct: 2.2, tp1_qty: 50, tp2_qty: 30, tp3_qty: 20 } }],
  riskEntries: [{ component_id: 'oc-risk-sizer', params: { risk_pct: 0.8, sl_pct: 0.55 } }],
};

summaries.push(runCase('golden-cross-with-entry-stage', goldenCrossWithEntryStage, ({ result, components }) => {
  assert(result.metrics.total_trades > 0, 'golden-cross-with-entry-stage: expected trades (signal must flow Trigger→Entry)');
  assert(result.stageReport.Entry, 'golden-cross-with-entry-stage: missing Entry stage report');
  assert(result.stageReport.Trigger, 'golden-cross-with-entry-stage: missing Trigger stage report');
  assert(Array.isArray(result.indicators.fastSma), 'golden-cross-with-entry-stage: missing fastSma');
}));

// Regression test: OC Cross with explicit Entry stage
const ocCrossWithEntryStage = {
  factorEntries: [{ component_id: 'oc-alma-factor', params: { alma_len: 6, alma_offset: 0.85, alma_sigma: 5 } }],
  triggerEntries: [{ component_id: 'oc-cross-trigger', params: {} }],
  entryEntries: [{ component_id: 'oc-signal-entry', params: {} }],
  exitEntries: [
    { component_id: 'oc-tp-ladder-exit', params: { tp1_pct: 0.8, tp2_pct: 1.4, tp3_pct: 2.1, tp1_qty: 50, tp2_qty: 30, tp3_qty: 20 } },
    { component_id: 'oc-reversal-exit', params: {} },
  ],
  riskEntries: [{ component_id: 'oc-risk-sizer', params: { risk_pct: 1.0, sl_pct: 0.5 } }],
};

summaries.push(runCase('oc-cross-with-entry-stage', ocCrossWithEntryStage, ({ result }) => {
  assert(result.metrics.total_trades > 0, 'oc-cross-with-entry-stage: expected trades (signal must flow Trigger→Entry)');
  assert(result.stageReport.Entry, 'oc-cross-with-entry-stage: missing Entry stage report');
}));

console.log('Smoke test passed.');
for (const summary of summaries) {
  console.log(`${summary.name}: trades=${summary.trades}, sharpe=${Number(summary.sharpe || 0).toFixed(2)}, net=${Number(summary.net || 0).toFixed(2)}, stages=${summary.stageKeys.join('|')}, indicators=${summary.indicatorKeys.join('|')}`);
}