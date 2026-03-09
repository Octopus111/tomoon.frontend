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

loadScript(path.join('shared', 'backtest-engine.js'));

function assertNear(actual, expected, tolerance, label) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assert(condition, label) {
  if (!condition) throw new Error(label);
}

function sampleStd(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

const config = { initial_capital: 100000 };

const trades = [
  { direction: 'LONG', netPnl: 1000, totalCost: 10, barsHeld: 10, finalStage: 1 },
  { direction: 'SHORT', netPnl: -500, totalCost: 10, barsHeld: 8, finalStage: 0 },
  { direction: 'LONG', netPnl: 1500, totalCost: 10, barsHeld: 12, finalStage: 2 },
  { direction: 'SHORT', netPnl: -1000, totalCost: 10, barsHeld: 6, finalStage: 0 },
];

const equityCurve = [
  { timestamp: '2024-01-01T00:00:00Z', equity: 100000 },
  { timestamp: '2024-03-31T00:00:00Z', equity: 101000 },
  { timestamp: '2024-06-30T00:00:00Z', equity: 100500 },
  { timestamp: '2024-09-30T00:00:00Z', equity: 102000 },
  { timestamp: '2024-12-31T00:00:00Z', equity: 110000 },
];

const metrics = BacktestEngine.calcMetrics(trades, equityCurve, config);

const grossProfit = 2500;
const grossLoss = 1500;
const netProfit = 1000;
const winRate = 0.5;
const profitFactor = grossProfit / grossLoss;
const avgTrade = netProfit / trades.length;
const annualReturn = 0.10;
const maxDrawdownPct = (101000 - 100500) / 101000;
const calmar = annualReturn / maxDrawdownPct;
const periodReturns = [
  (101000 - 100000) / 100000,
  (100500 - 101000) / 101000,
  (102000 - 100500) / 100500,
  (110000 - 102000) / 102000,
];
const periodsPerYear = 365.25 / 91; // quarterly-ish spacing from timestamps above
const sharpe = (periodReturns.reduce((sum, value) => sum + value, 0) / periodReturns.length) / sampleStd(periodReturns) * Math.sqrt(periodsPerYear);

assertNear(metrics.gross_profit, grossProfit, 1e-9, 'gross_profit');
assertNear(metrics.gross_loss, grossLoss, 1e-9, 'gross_loss');
assertNear(metrics.net_profit, netProfit, 1e-9, 'net_profit');
assertNear(metrics.win_rate, winRate, 1e-9, 'win_rate');
assertNear(metrics.profit_factor, profitFactor, 1e-9, 'profit_factor');
assertNear(metrics.avg_trade, avgTrade, 1e-9, 'avg_trade');
assertNear(metrics.annual_return, annualReturn, 5e-3, 'annual_return');
assertNear(metrics.max_dd_pct, maxDrawdownPct, 1e-9, 'max_dd_pct');
assertNear(metrics.calmar_ratio, calmar, 0.05, 'calmar_ratio');
assertNear(metrics.sharpe, sharpe, 0.05, 'sharpe');
assert(metrics.avg_loser < 0, 'avg_loser should remain negative');
assert(metrics.stage_distribution.stage0 === 2, 'stage0 distribution mismatch');
assert(metrics.stage_distribution.stage1 === 1, 'stage1 distribution mismatch');
assert(metrics.stage_distribution.stage2 === 1, 'stage2 distribution mismatch');
assert(metrics.stage_distribution.stage3 === 0, 'stage3 distribution mismatch');

console.log('Metrics validation passed.');
console.log(JSON.stringify({
  sharpe: metrics.sharpe,
  annual_return: metrics.annual_return,
  max_dd_pct: metrics.max_dd_pct,
  calmar_ratio: metrics.calmar_ratio,
  profit_factor: metrics.profit_factor,
}, null, 2));