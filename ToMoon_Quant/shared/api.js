/**
 * ToMoon Quant — API Client
 * Connects frontend pages to the FastAPI backend.
 *
 * Usage:
 *   const components = await API.getComponents();
 *   const result     = await API.runBacktest({ symbol: 'AAPL', ... });
 */

const API = (() => {
  const BASE = 'http://localhost:8000';

  async function _fetch(path, opts = {}) {
    const url = BASE + path;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API ${res.status}: ${body}`);
    }
    return res.json();
  }

  // ── Components ──
  async function getComponents(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return _fetch('/api/components' + (qs ? '?' + qs : ''));
  }

  async function createComponent(data) {
    return _fetch('/api/components', { method: 'POST', body: JSON.stringify(data) });
  }

  async function updateComponent(componentId, data) {
    return _fetch(`/api/components/${componentId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async function deleteComponent(componentId) {
    return _fetch(`/api/components/${componentId}`, { method: 'DELETE' });
  }

  // ── Reusable Component Registry ──
  async function getRegistryComponents(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return _fetch('/api/component-registry' + (qs ? '?' + qs : ''));
  }

  async function getRegistryComponent(componentId) {
    return _fetch(`/api/component-registry/${componentId}`);
  }

  async function executeRegistryComponent(componentId, data) {
    return _fetch(`/api/component-registry/${componentId}/execute`, { method: 'POST', body: JSON.stringify(data) });
  }

  async function executeRegistryBlueprint(data) {
    return _fetch('/api/component-registry/execute-blueprint', { method: 'POST', body: JSON.stringify(data) });
  }

  // ── Strategies ──
  async function getStrategies(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return _fetch('/api/strategies' + (qs ? '?' + qs : ''));
  }

  async function createStrategy(data) {
    return _fetch('/api/strategies', { method: 'POST', body: JSON.stringify(data) });
  }

  async function updateStrategy(strategyId, data) {
    return _fetch(`/api/strategies/${strategyId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // ── Blueprints ──
  async function getBlueprints(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return _fetch('/api/blueprints' + (qs ? '?' + qs : ''));
  }

  async function saveBlueprint(data) {
    return _fetch('/api/blueprints', { method: 'POST', body: JSON.stringify(data) });
  }

  async function getBlueprint(id) {
    return _fetch(`/api/blueprints/${id}`);
  }

  // ── Backtest ──
  async function runBacktest(data) {
    return _fetch('/api/backtest/run', { method: 'POST', body: JSON.stringify(data) });
  }

  async function getBacktestRuns(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return _fetch('/api/backtest/runs' + (qs ? '?' + qs : ''));
  }

  async function getBacktestRun(runId) {
    return _fetch(`/api/backtest/runs/${runId}`);
  }

  async function getBacktestRunChart(runId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return _fetch(`/api/backtest/runs/${runId}/chart` + (qs ? '?' + qs : ''));
  }

  // ── Datasets ──
  async function getDatasets() {
    return _fetch('/api/datasets');
  }

  // ── Health ──
  async function health() {
    return _fetch('/api/health');
  }

  // ── Report URL helper ──
  function reportUrl(filename) {
    return BASE + '/reports/' + filename;
  }

  // ── XAUUSD Alpha Dedicated ──
  async function getXauusdDefaults() {
    return _fetch('/api/backtest/xauusd/defaults');
  }

  async function runXauusdBacktest(data) {
    return _fetch('/api/backtest/xauusd/run', { method: 'POST', body: JSON.stringify(data) });
  }

  // ── Market Data (Dukascopy via backend) ──
  async function fetchMarketBars(market, timeframe, startDate, endDate) {
    const qs = new URLSearchParams({ market, timeframe, start_date: startDate, end_date: endDate }).toString();
    return _fetch('/api/market-data/bars?' + qs);
  }

  // ── Canvas Node Types (backend-managed) ──
  async function getCanvasNodeTypes(market) {
    const qs = market ? '?market=' + encodeURIComponent(market) : '';
    return _fetch('/api/canvas/node-types' + qs);
  }

  // ── Port Types (standardized I/O vocabulary) ──
  async function getPortTypes() {
    return _fetch('/api/port-types');
  }

  // ── Public API ──
  return {
    BASE,
    getComponents, createComponent, updateComponent, deleteComponent,
    getRegistryComponents, getRegistryComponent, executeRegistryComponent, executeRegistryBlueprint,
    getStrategies, createStrategy, updateStrategy,
    getBlueprints, saveBlueprint, getBlueprint,
    runBacktest, getBacktestRuns, getBacktestRun, getBacktestRunChart,
    getDatasets, health, reportUrl,
    getXauusdDefaults, runXauusdBacktest,
    fetchMarketBars,
    getCanvasNodeTypes, getPortTypes,
  };
})();
