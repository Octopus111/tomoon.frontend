/**
 * ToMoon Quant — Canonical Component Library
 *
 * Single source of truth for executable, reusable, swappable components.
 * Core principle: the engine is a pure executor and all strategy logic
 * lives in components that conform to role-specific contracts.
 *
 * Component Types:
 *   Factor   — computes indicators from bar data    (ALMA, SMA, EMA, ATR, RSI)
 *   Trigger  — generates entry signals              (OC Cross, Golden Cross)
 *   Filter   — gates/filters signals                (Trend filter, Time filter)
 *   Exit     — manages position exits               (Scaled TP, Reversal, Trailing)
 *   Risk     — position sizing & risk limits        (Equity %, Fixed lot)
 *
 * Component Contract:
 *   type  : 'Foundation' | 'Factor' | 'Regime' | 'Setup' | 'Trigger'
 *         | 'Filter' | 'Scoring' | 'Entry' | 'Exit' | 'Risk' | 'Execution'
 *   id    : string  (matches component_id in CENTRAL_COMPONENTS)
 *   name  : string  (display name)
 *   init(params) : configure with user params
 *
 * Factor   → precompute(bars, indicators, signals, runtime) → { series, basis, signal, ...compatAliases }
 * Trigger  → precompute(...) → { trigger: number[] }
 * Filter   → precompute(...) → { filtered: number[] }
 * Scoring  → precompute(...) → { score?: number[], scored?: number[] }
 * Entry    → precompute(...) → { entry: number[] }
 * Exit     → computeStopDistance(entryPrice, direction) → number
 *          → onPositionOpen(pos, entryPrice, direction, cfg)
 *          → evaluateBar(pos, bar, barIndex, signals, cfg) → ExitAction
 * Risk     → calcSize(equity, entryPrice, stopDistance, cfg) → number
 * Foundation → prepareRuntime(bars, runtime) → { meta?, config? }
 * Execution  → beforeEntry(orderIntent, runtime?) → orderIntent
 *
 * ExitAction:
 *   { type: 'none' }
 *   { type: 'partial', price, qtyPct, label, pendingStageChange }
 *   { type: 'close', price, reason }
 */
const ComponentLib = (() => {
  'use strict';

  // ═══════════════════════════════════════════
  // Helper: ALMA computation
  // ═══════════════════════════════════════════
  function _calcALMA(series, len, offset, sigma) {
    if (!series || series.length < len) return new Array(series.length).fill(NaN);
    const result = new Array(series.length).fill(NaN);
    const m = offset * (len - 1);
    const s = len / sigma;
    const weights = new Array(len);
    let wSum = 0;
    for (let i = 0; i < len; i++) {
      weights[i] = Math.exp(-((i - m) * (i - m)) / (2 * s * s));
      wSum += weights[i];
    }
    for (let i = 0; i < len; i++) weights[i] /= wSum;
    for (let t = len - 1; t < series.length; t++) {
      let val = 0;
      for (let i = 0; i < len; i++) val += series[t - (len - 1) + i] * weights[i];
      result[t] = val;
    }
    return result;
  }

  function _calcSMA(series, window) {
    const result = new Array(series.length).fill(NaN);
    if (!series || series.length < window || window <= 0) return result;
    for (let t = window - 1; t < series.length; t++) {
      let sum = 0;
      for (let index = 0; index < window; index++) sum += series[t - index];
      result[t] = sum / window;
    }
    return result;
  }

  function _calcEMA(series, window) {
    const result = new Array(series.length).fill(NaN);
    if (!series || !series.length || window <= 0) return result;
    const k = 2 / (window + 1);
    result[0] = series[0];
    for (let t = 1; t < series.length; t++) result[t] = (series[t] - result[t - 1]) * k + result[t - 1];
    for (let t = 0; t < Math.max(0, window - 1); t++) result[t] = NaN;
    return result;
  }

  function _calcATRSeries(bars, window) {
    const atr = new Array(bars.length).fill(NaN);
    if (!bars || !bars.length) return atr;
    const tr = new Array(bars.length).fill(0);
    tr[0] = bars[0].high - bars[0].low;
    for (let t = 1; t < bars.length; t++) {
      tr[t] = Math.max(
        bars[t].high - bars[t].low,
        Math.abs(bars[t].high - bars[t - 1].close),
        Math.abs(bars[t].low - bars[t - 1].close)
      );
    }
    const k = 2 / (window + 1);
    atr[0] = tr[0];
    for (let t = 1; t < bars.length; t++) atr[t] = (tr[t] - atr[t - 1]) * k + atr[t - 1];
    for (let t = 0; t < Math.max(0, window - 1); t++) atr[t] = NaN;
    return atr;
  }

  function _pickSignalSeries(signals, keys) {
    for (const key of keys) {
      if (Array.isArray(signals[key])) return signals[key];
    }
    return null;
  }

  function _cloneSignal(series) {
    return Array.isArray(series) ? series.slice() : null;
  }

  function _lastFiniteValue(series) {
    if (!Array.isArray(series)) return null;
    for (let index = series.length - 1; index >= 0; index -= 1) {
      const value = series[index];
      if (Number.isFinite(value)) return value;
    }
    return null;
  }

  function _buildStandardFactorOutput(primarySeries, options) {
    const opts = options || {};
    const output = {
      series: Array.isArray(primarySeries) ? primarySeries : [],
      basis: Array.isArray(opts.basisSeries) ? opts.basisSeries : [],
      signal: opts.signalValue != null ? opts.signalValue : _lastFiniteValue(primarySeries),
    };

    if (opts.aliasKey && Array.isArray(primarySeries)) output[opts.aliasKey] = primarySeries;
    if (opts.extra && typeof opts.extra === 'object') Object.assign(output, opts.extra);
    return output;
  }


  // ═══════════════════════════════════════════════════════
  //  FACTOR COMPONENTS
  // ═══════════════════════════════════════════════════════

  class ALMAFactor {
    constructor() { this.type = 'Factor'; this.id = 'oc-alma-factor'; this.name = 'ALMA Factor (OC Cross)'; }
    init(params) {
      this.len = params.alma_len || 6;
      this.offset = params.alma_offset || 0.85;
      this.sigma = params.alma_sigma || 5;
      this.delayOffset = params.delay_offset || 0;
    }
    precompute(bars) {
      const d = this.delayOffset;
      const closes = bars.map((b, i) => i >= d ? bars[i - d].close : b.close);
      const opens  = bars.map((b, i) => i >= d ? bars[i - d].open  : b.open);
      const maClose = _calcALMA(closes, this.len, this.offset, this.sigma);
      const maOpen = _calcALMA(opens,  this.len, this.offset, this.sigma);
      return {
        ..._buildStandardFactorOutput(maClose, {
          basisSeries: maOpen,
          aliasKey: 'maClose',
          extra: { maOpen },
        }),
      };
    }
  }

  class SMAFactor {
    constructor() { this.type = 'Factor'; this.id = 'CMP-FAC-SMA'; this.name = 'SMA Factor'; }
    init(params) { this.window = params.window || 20; }
    precompute(bars) {
      const closes = bars.map(b => b.close);
      const r = new Array(bars.length).fill(NaN);
      for (let t = this.window - 1; t < bars.length; t++) {
        let s = 0;
        for (let i = 0; i < this.window; i++) s += closes[t - i];
        r[t] = s / this.window;
      }
      return _buildStandardFactorOutput(r, {
        basisSeries: closes,
        aliasKey: 'sma',
        extra: { factor_basis_close: closes },
      });
    }
  }

  class EMAFactor {
    constructor() { this.type = 'Factor'; this.id = 'CMP-FAC-EMA'; this.name = 'EMA Factor'; }
    init(params) { this.window = params.window || 20; }
    precompute(bars) {
      const closes = bars.map(b => b.close);
      const r = new Array(bars.length).fill(NaN);
      const k = 2 / (this.window + 1);
      r[0] = closes[0];
      for (let t = 1; t < bars.length; t++) r[t] = (closes[t] - r[t - 1]) * k + r[t - 1];
      for (let t = 0; t < this.window - 1; t++) r[t] = NaN;
      return _buildStandardFactorOutput(r, {
        basisSeries: closes,
        aliasKey: 'ema',
        extra: { factor_basis_close: closes },
      });
    }
  }

  class ATRFactor {
    constructor() { this.type = 'Factor'; this.id = 'CMP-FAC-ATR'; this.name = 'ATR Factor'; }
    init(params) { this.window = params.window || 14; }
    precompute(bars) {
      const r = new Array(bars.length).fill(NaN);
      const tr = new Array(bars.length);
      const closes = bars.map((bar) => bar.close);
      tr[0] = bars[0].high - bars[0].low;
      for (let t = 1; t < bars.length; t++) {
        tr[t] = Math.max(
          bars[t].high - bars[t].low,
          Math.abs(bars[t].high - bars[t - 1].close),
          Math.abs(bars[t].low  - bars[t - 1].close)
        );
      }
      const k = 2 / (this.window + 1);
      r[0] = tr[0];
      for (let t = 1; t < bars.length; t++) r[t] = (tr[t] - r[t - 1]) * k + r[t - 1];
      for (let t = 0; t < this.window - 1; t++) r[t] = NaN;
      return _buildStandardFactorOutput(r, {
        basisSeries: closes,
        aliasKey: 'atr',
        extra: { factor_basis_close: closes, trueRange: tr },
      });
    }
  }

  class RSIFactor {
    constructor() { this.type = 'Factor'; this.id = 'CMP-FAC-RSI'; this.name = 'RSI Factor'; }
    init(params) { this.window = params.window || 14; }
    precompute(bars) {
      const closes = bars.map(b => b.close);
      const r = new Array(bars.length).fill(NaN);
      if (bars.length < this.window + 1) return { rsi: r };
      const gains = [], losses = [];
      for (let t = 1; t <= this.window; t++) {
        const d = closes[t] - closes[t - 1];
        gains.push(d > 0 ? d : 0);
        losses.push(d < 0 ? -d : 0);
      }
      let ag = gains.reduce((a, b) => a + b, 0) / this.window;
      let al = losses.reduce((a, b) => a + b, 0) / this.window;
      r[this.window] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
      for (let t = this.window + 1; t < bars.length; t++) {
        const d = closes[t] - closes[t - 1];
        ag = (ag * (this.window - 1) + (d > 0 ? d : 0)) / this.window;
        al = (al * (this.window - 1) + (d < 0 ? -d : 0)) / this.window;
        r[t] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
      }
      const neutralLine = new Array(bars.length).fill(50);
      return _buildStandardFactorOutput(r, {
        basisSeries: neutralLine,
        aliasKey: 'rsi',
        extra: { factor_basis_neutral: neutralLine },
      });
    }
  }


  // ═══════════════════════════════════════════════════════
  //  TRIGGER COMPONENTS
  // ═══════════════════════════════════════════════════════

  /** OC Cross: ALMA(Close) crosses ALMA(Open) → Long/Short signal */
  class OCCrossTrigger {
    constructor() { this.type = 'Trigger'; this.id = 'oc-cross-trigger'; this.name = 'OC Cross Trigger'; }
    init(_params) {}
    precompute(bars, indicators) {
      const mc = indicators.series || indicators.maClose;
      const mo = indicators.basis || indicators.maOpen;
      if (!mc || !mo) return { trigger: new Array(bars.length).fill(0) };
      const sig = new Array(bars.length).fill(0);
      for (let t = 1; t < bars.length; t++) {
        if (isNaN(mc[t]) || isNaN(mo[t]) || isNaN(mc[t - 1]) || isNaN(mo[t - 1])) continue;
        if (mc[t] > mo[t] && mc[t - 1] <= mo[t - 1]) sig[t] = 1;
        else if (mc[t] < mo[t] && mc[t - 1] >= mo[t - 1]) sig[t] = -1;
      }
      return { trigger: sig };
    }
  }

  /** Golden Cross / Death Cross: fast SMA crosses slow SMA */
  class GoldenCrossTrigger {
    constructor() { this.type = 'Trigger'; this.id = 'CMP-TRI-GOLDX'; this.name = 'Golden Cross Trigger'; }
    init(params) { this.fast = params.fast || 10; this.slow = params.slow || 50; }
    precompute(bars, _indicators) {
      const closes = bars.map(b => b.close);
      const f = _calcSMA(closes, this.fast);
      const s = _calcSMA(closes, this.slow);
      const sig = new Array(bars.length).fill(0);
      for (let t = 1; t < bars.length; t++) {
        if (isNaN(f[t]) || isNaN(s[t]) || isNaN(f[t - 1]) || isNaN(s[t - 1])) continue;
        if (f[t] > s[t] && f[t - 1] <= s[t - 1]) sig[t] = 1;
        else if (f[t] < s[t] && f[t - 1] >= s[t - 1]) sig[t] = -1;
      }
      return { trigger: sig, fastSma: f, slowSma: s };
    }
  }

  class TrendRegimeComponent {
    constructor() { this.type = 'Regime'; this.id = 'REGIME-GATE'; this.name = 'Regime Gate'; }
    init(params) {
      this.emaPeriod = params.ema50_period || 50;
      this.atrPeriod = params.atr_1h_period || 14;
      this.threshold = params.trend_threshold || 3;
    }
    precompute(bars) {
      const closes = bars.map(b => b.close);
      const ema = _calcEMA(closes, this.emaPeriod);
      const atr = _calcATRSeries(bars, this.atrPeriod);
      const regime = new Array(bars.length).fill(0);
      const atrPct = atr.map((value, index) => value && bars[index] ? value / Math.max(1e-9, bars[index].close) : NaN);
      const minAtrPct = this.threshold / 1000;
      for (let t = 1; t < bars.length; t++) {
        if (isNaN(ema[t]) || isNaN(atrPct[t])) continue;
        if (closes[t] > ema[t] && atrPct[t] >= minAtrPct) regime[t] = 1;
        else if (closes[t] < ema[t] && atrPct[t] >= minAtrPct) regime[t] = -1;
      }
      return { regime, regimeEma: ema, regimeAtrPct: atrPct };
    }
  }

  class TrendSetupComponent {
    constructor() { this.type = 'Setup'; this.id = 'TREND-SETUP'; this.name = 'Trend Setup'; }
    init(params) {
      this.window = params.window || 20;
      this.pullbackLookback = params.pullback_window || 5;
    }
    precompute(bars, _indicators, signals) {
      const closes = bars.map(b => b.close);
      const lows = bars.map(b => b.low);
      const highs = bars.map(b => b.high);
      const ema = _calcEMA(closes, this.window);
      const regime = _pickSignalSeries(signals || {}, ['regime']) || new Array(bars.length).fill(0);
      const setup = new Array(bars.length).fill(0);
      for (let t = Math.max(1, this.pullbackLookback); t < bars.length; t++) {
        if (isNaN(ema[t]) || !regime[t]) continue;
        const recentLow = Math.min(...lows.slice(t - this.pullbackLookback, t + 1));
        const recentHigh = Math.max(...highs.slice(t - this.pullbackLookback, t + 1));
        if (regime[t] > 0 && closes[t] > ema[t] && recentLow <= ema[t] * 1.002) setup[t] = 1;
        if (regime[t] < 0 && closes[t] < ema[t] && recentHigh >= ema[t] * 0.998) setup[t] = -1;
      }
      return { setup, setupEma: ema };
    }
  }

  class PullbackTriggerComponent {
    constructor() { this.type = 'Trigger'; this.id = 'PULLBACK-TRIGGER'; this.name = 'Pullback Trigger'; }
    init(params) {
      this.emaPeriod = params.ema20_5m_period || 20;
      this.pullbackWindow = params.pullback_window || 8;
    }
    precompute(bars, _indicators, signals) {
      const closes = bars.map(b => b.close);
      const lows = bars.map(b => b.low);
      const highs = bars.map(b => b.high);
      const ema = _calcEMA(closes, this.emaPeriod);
      const base = _pickSignalSeries(signals || {}, ['setup', 'regime']) || new Array(bars.length).fill(0);
      const trigger = new Array(bars.length).fill(0);
      for (let t = Math.max(2, this.pullbackWindow); t < bars.length; t++) {
        if (isNaN(ema[t]) || !base[t]) continue;
        const recentLow = Math.min(...lows.slice(t - this.pullbackWindow, t + 1));
        const recentHigh = Math.max(...highs.slice(t - this.pullbackWindow, t + 1));
        if (base[t] > 0 && closes[t] > ema[t] && recentLow <= ema[t] * 1.001) trigger[t] = 1;
        if (base[t] < 0 && closes[t] < ema[t] && recentHigh >= ema[t] * 0.999) trigger[t] = -1;
      }
      return { trigger, pullbackEma: ema };
    }
  }

  class TrendFilterComponent {
    constructor() { this.type = 'Filter'; this.id = 'CMP-FIL-TREND'; this.name = 'Trend Filter'; }
    init(params) {
      this.window = params.window || 50;
      this.minAtrPct = params.min_atr_pct || 0.005;
    }
    precompute(bars, indicators, signals) {
      const base = _pickSignalSeries(signals || {}, ['trigger', 'setup', 'entry']) || new Array(bars.length).fill(0);
      const closes = bars.map(b => b.close);
      const ema = indicators.trendFilterEma || _calcEMA(closes, this.window);
      const atr = indicators.atr || _calcATRSeries(bars, Math.min(14, this.window));
      const filtered = new Array(bars.length).fill(0);
      for (let t = 0; t < bars.length; t++) {
        if (!base[t] || isNaN(ema[t]) || isNaN(atr[t])) continue;
        const atrPct = atr[t] / Math.max(1e-9, closes[t]);
        if (base[t] > 0 && closes[t] > ema[t] && atrPct >= this.minAtrPct) filtered[t] = base[t];
        if (base[t] < 0 && closes[t] < ema[t] && atrPct >= this.minAtrPct) filtered[t] = base[t];
      }
      return { filtered, trendFilterEma: ema };
    }
  }

  class HardRulesFilter {
    constructor() { this.type = 'Filter'; this.id = 'HARD-RULES'; this.name = 'Hard Rules Filter'; }
    init(params) {
      this.maxBodyAtr = params.max_body_atr || 1.8;
    }
    precompute(bars, indicators, signals) {
      const base = _pickSignalSeries(signals || {}, ['filtered', 'trigger', 'setup']) || new Array(bars.length).fill(0);
      const atr = indicators.atr || _calcATRSeries(bars, 14);
      const filtered = new Array(bars.length).fill(0);
      for (let t = 0; t < bars.length; t++) {
        if (!base[t] || isNaN(atr[t])) continue;
        const body = Math.abs(bars[t].close - bars[t].open);
        if (body <= atr[t] * this.maxBodyAtr) filtered[t] = base[t];
      }
      return { filtered };
    }
  }

  class USDFilter {
    constructor() { this.type = 'Filter'; this.id = 'USD-FILTER'; this.name = 'USD Filter'; }
    init(_params) {}
    precompute(bars, _indicators, signals) {
      const base = _pickSignalSeries(signals || {}, ['filtered', 'trigger', 'setup']);
      return { filtered: _cloneSignal(base) || new Array(bars.length).fill(0) };
    }
  }

  class SignalRankerComponent {
    constructor() { this.type = 'Scoring'; this.id = 'SIGNAL-RANKER'; this.name = 'Signal Ranker'; }
    init(params) {
      this.minScore = params.min_score || 0.25;
      this.lookback = params.lookback || 5;
    }
    precompute(bars, indicators, signals) {
      const base = _pickSignalSeries(signals || {}, ['filtered', 'trigger', 'setup']) || new Array(bars.length).fill(0);
      const atr = indicators.atr || _calcATRSeries(bars, 14);
      const score = new Array(bars.length).fill(0);
      const scored = new Array(bars.length).fill(0);
      for (let t = Math.max(1, this.lookback); t < bars.length; t++) {
        if (!base[t] || isNaN(atr[t])) continue;
        const move = Math.abs(bars[t].close - bars[t - this.lookback].close);
        score[t] = move / Math.max(1e-9, atr[t]);
        if (score[t] >= this.minScore) scored[t] = base[t];
      }
      return { score, scored };
    }
  }

  class BreakEntryComponent {
    constructor() { this.type = 'Entry'; this.id = 'BREAK-ENTRY'; this.name = 'Breakout Entry'; }
    init(params) {
      this.confirmationBars = params.confirmation_bars || 1;
    }
    precompute(bars, _indicators, signals) {
      const base = _pickSignalSeries(signals || {}, ['scored', 'filtered', 'trigger', 'setup']) || new Array(bars.length).fill(0);
      const entry = new Array(bars.length).fill(0);
      for (let t = Math.max(1, this.confirmationBars); t < bars.length; t++) {
        if (!base[t]) continue;
        const prev = bars[t - 1];
        if (base[t] > 0 && (bars[t].high >= prev.high || bars[t].close > prev.close)) entry[t] = 1;
        if (base[t] < 0 && (bars[t].low <= prev.low || bars[t].close < prev.close)) entry[t] = -1;
      }
      return { entry };
    }
  }

  class SignalConfirmedEntryComponent {
    constructor() { this.type = 'Entry'; this.id = 'SIGNAL-CONFIRMED-ENTRY'; this.name = 'Signal Confirmed Entry'; }
    init(params) {
      this.allowLong = params.allow_long !== false;
      this.allowShort = params.allow_short !== false;
    }
    precompute(bars, _indicators, signals) {
      const base = _pickSignalSeries(signals || {}, ['scored', 'filtered', 'trigger', 'setup', 'regime']) || new Array(bars.length).fill(0);
      const entry = new Array(bars.length).fill(0);
      for (let t = 0; t < bars.length; t++) {
        const sig = base[t] || 0;
        if (sig > 0 && this.allowLong) entry[t] = 1;
        if (sig < 0 && this.allowShort) entry[t] = -1;
      }
      return { entry };
    }
  }

  function _makePort(name, type, description) {
    return { name, type, description: description || '' };
  }

  function _cloneComponentSpec(spec) {
    return {
      ...spec,
      inputs: (spec.inputs || []).map((port) => ({ ...port })),
      outputs: (spec.outputs || []).map((port) => ({ ...port })),
      params: { ...(spec.params || {}) },
      params_spec: Object.fromEntries(Object.entries(spec.params_spec || {}).map(([key, value]) => [key, { ...value }])) ,
      tags: Array.isArray(spec.tags) ? spec.tags.slice() : [],
      market_tags: Array.isArray(spec.market_tags) ? spec.market_tags.slice() : [],
    };
  }

  const _COMPONENT_SPECS = Object.freeze([
    {
      component_id: 'CMP-FAC-SMA', type: 'Factor', name: 'SMA Factor', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Simple moving average factor with the canonical Factor contract.', logic: 'Returns standardized `series` + `basis` + `signal`, while preserving `sma` for charts and legacy consumers.',
      inputs: [_makePort('bars', 'bars', 'OHLC K-line data')], outputs: [_makePort('series', 'data', 'Primary factor series'), _makePort('basis', 'data', 'Reference/basis series'), _makePort('signal', 'signal', 'Latest factor value')],
      params: { window: 20 }, params_spec: { window: { kind: 'number', default: 20, min: 2, max: 500, step: 1 } },
      group: 'Factors（特征）', color: '#10b981', market_tags: [], tags: ['core', 'factor', 'legacy'], executable: true, source: 'core',
      contract_family: 'factor.standardized.v2', strict_swappable: true,
    },
    {
      component_id: 'CMP-FAC-EMA', type: 'Factor', name: 'EMA Factor', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Exponential moving average factor with the canonical Factor contract.', logic: 'Returns standardized `series` + `basis` + `signal`, while preserving `ema` for charts and legacy consumers.',
      inputs: [_makePort('bars', 'bars', 'OHLC K-line data')], outputs: [_makePort('series', 'data', 'Primary factor series'), _makePort('basis', 'data', 'Reference/basis series'), _makePort('signal', 'signal', 'Latest factor value')],
      params: { window: 20 }, params_spec: { window: { kind: 'number', default: 20, min: 2, max: 500, step: 1 } },
      group: 'Factors（特征）', color: '#10b981', market_tags: [], tags: ['core', 'factor', 'legacy'], executable: true, source: 'core',
      contract_family: 'factor.standardized.v2', strict_swappable: true,
    },
    {
      component_id: 'CMP-FAC-ATR', type: 'Factor', name: 'ATR Factor', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Average true range factor with the canonical Factor contract.', logic: 'Returns standardized `series` + `basis` + `signal`, while preserving `atr` for charts and legacy consumers.',
      inputs: [_makePort('bars', 'bars', 'OHLC K-line data')], outputs: [_makePort('series', 'data', 'Primary factor series'), _makePort('basis', 'data', 'Reference/basis series'), _makePort('signal', 'signal', 'Latest factor value')],
      params: { window: 14 }, params_spec: { window: { kind: 'number', default: 14, min: 2, max: 200, step: 1 } },
      group: 'Factors（特征）', color: '#10b981', market_tags: [], tags: ['core', 'factor', 'volatility'], executable: true, source: 'core',
      contract_family: 'factor.standardized.v2', strict_swappable: true,
    },
    {
      component_id: 'CMP-FAC-RSI', type: 'Factor', name: 'RSI Factor', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Relative strength index factor with the canonical Factor contract.', logic: 'Returns standardized `series` + `basis` + `signal`, while preserving `rsi` for charts and legacy consumers.',
      inputs: [_makePort('bars', 'bars', 'OHLC K-line data')], outputs: [_makePort('series', 'data', 'Primary factor series'), _makePort('basis', 'data', 'Reference/basis series'), _makePort('signal', 'signal', 'Latest factor value')],
      params: { window: 14 }, params_spec: { window: { kind: 'number', default: 14, min: 2, max: 200, step: 1 } },
      group: 'Factors（特征）', color: '#10b981', market_tags: [], tags: ['core', 'factor', 'momentum'], executable: true, source: 'core',
      contract_family: 'factor.standardized.v2', strict_swappable: true,
    },
    {
      component_id: 'oc-alma-factor', type: 'Factor', name: 'ALMA Factor (OC Cross)', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'ALMA-based factor with the canonical Factor contract.', logic: 'Returns standardized `series` + `basis` + `signal`, while preserving `maClose` + `maOpen` for OC Cross compatibility.',
      inputs: [_makePort('bars', 'bars', 'OHLC K-line data')], outputs: [_makePort('series', 'data', 'Primary factor series'), _makePort('basis', 'data', 'Reference/basis series'), _makePort('signal', 'signal', 'Latest factor value')],
      params: { alma_len: 6, alma_offset: 0.85, alma_sigma: 5, delay_offset: 0 }, params_spec: {
        alma_len: { kind: 'number', default: 6, min: 2, max: 100, step: 1 }, alma_offset: { kind: 'number', default: 0.85, min: 0.01, max: 1.0, step: 0.01 }, alma_sigma: { kind: 'number', default: 5, min: 1, max: 20, step: 0.5 }, delay_offset: { kind: 'number', default: 0, min: 0, max: 5, step: 1 },
      },
      group: 'Factors（特征）', color: '#10b981', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'factor', 'oc-cross'], executable: true, source: 'core',
      contract_family: 'factor.standardized.v2', strict_swappable: true,
    },
    {
      component_id: 'CMP-TRI-GOLDX', type: 'Trigger', name: 'Golden Cross / Death Cross', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Fast SMA crosses slow SMA and emits standardized trigger signals.', logic: 'Returns `trigger` and exposes fast/slow SMA indicators for charting.',
      inputs: [_makePort('bars', 'bars', 'OHLC K-line data')], outputs: [_makePort('trigger', 'signal', 'Standardized trigger series')],
      params: { fast: 10, slow: 50 }, params_spec: { fast: { kind: 'number', default: 10, min: 2, max: 200, step: 1 }, slow: { kind: 'number', default: 50, min: 5, max: 500, step: 1 } },
      group: 'Triggers（触发）', color: '#16a34a', market_tags: [], tags: ['core', 'trigger'], executable: true, source: 'core',
      contract_family: 'trigger.signal-generator.v1', strict_swappable: true,
    },
    {
      component_id: 'oc-cross-trigger', type: 'Trigger', name: 'OC Cross Trigger', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'ALMA close/open cross emits standardized trigger signals.', logic: 'Returns `trigger` when ALMA close crosses ALMA open.',
      inputs: [_makePort('bars', 'bars', 'OHLC K-line data')], outputs: [_makePort('trigger', 'signal', 'Standardized trigger series')],
      params: { alma_len: 6, alma_offset: 0.85, alma_sigma: 5, delay_offset: 0 }, params_spec: {
        alma_len: { kind: 'number', default: 6, min: 2, max: 100, step: 1 }, alma_offset: { kind: 'number', default: 0.85, min: 0.01, max: 1.0, step: 0.01 }, alma_sigma: { kind: 'number', default: 5, min: 1, max: 20, step: 0.5 }, delay_offset: { kind: 'number', default: 0, min: 0, max: 5, step: 1 },
      },
      group: 'Triggers（触发）', color: '#16a34a', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'trigger', 'oc-cross'], executable: true, source: 'core',
      contract_family: 'trigger.signal-generator.v1', strict_swappable: true,
    },
    {
      component_id: 'PULLBACK-TRIGGER', type: 'Trigger', name: 'Pullback Trigger', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Layered pullback trigger that emits standardized trigger signals.', logic: 'Consumes upstream setup/regime signals and emits `trigger`.',
      inputs: [_makePort('signal', 'signal', 'Upstream setup or regime signal')], outputs: [_makePort('trigger', 'signal', 'Standardized trigger series')],
      params: { ema20_5m_period: 20, pullback_window: 8 }, params_spec: { ema20_5m_period: { kind: 'number', default: 20, min: 5, max: 50, step: 1 }, pullback_window: { kind: 'number', default: 8, min: 4, max: 20, step: 1 } },
      group: 'Triggers（触发）', color: '#16a34a', market_tags: ['XAUUSD', 'XAGUSD', 'FOREX', 'INDEX'], tags: ['core', 'trigger', 'layered'], executable: true, source: 'core',
      contract_family: 'trigger.signal-generator.v1', strict_swappable: true,
    },
    {
      component_id: 'CMP-FIL-TREND', type: 'Filter', name: 'Trend Filter', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Trend-aware signal filter.', logic: 'Consumes trigger/setup signals and emits `filtered`.',
      inputs: [_makePort('signal', 'signal', 'Upstream signal')], outputs: [_makePort('filtered', 'filtered', 'Filtered signal series')],
      params: { window: 50, min_atr_pct: 0.005 }, params_spec: { window: { kind: 'number', default: 50, min: 2, max: 500, step: 1 }, min_atr_pct: { kind: 'number', default: 0.005, min: 0.0001, max: 0.1, step: 0.0001 } },
      group: 'Filters（过滤）', color: '#ef4444', market_tags: [], tags: ['core', 'filter'], executable: true, source: 'core',
      contract_family: 'filter.signal-gate.v1', strict_swappable: true,
    },
    {
      component_id: 'HARD-RULES', type: 'Filter', name: 'Hard Rules Filter', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Rejects signals that violate hard candle-body constraints.', logic: 'Consumes signals and emits `filtered`.',
      inputs: [_makePort('signal', 'signal', 'Upstream signal')], outputs: [_makePort('filtered', 'filtered', 'Filtered signal series')],
      params: { max_body_atr: 1.8 }, params_spec: { max_body_atr: { kind: 'number', default: 1.8, min: 0.5, max: 5.0, step: 0.1 } },
      group: 'Filters（过滤）', color: '#ef4444', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'filter', 'layered'], executable: true, source: 'core',
      contract_family: 'filter.signal-gate.v1', strict_swappable: true,
    },
    {
      component_id: 'USD-FILTER', type: 'Filter', name: 'USD Filter', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Pass-through filter placeholder for macro/USD gating.', logic: 'Consumes signals and emits `filtered`.',
      inputs: [_makePort('signal', 'signal', 'Upstream signal')], outputs: [_makePort('filtered', 'filtered', 'Filtered signal series')],
      params: {}, params_spec: {},
      group: 'Filters（过滤）', color: '#ef4444', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'filter', 'layered'], executable: true, source: 'core',
      contract_family: 'filter.signal-gate.v1', strict_swappable: true,
    },
    {
      component_id: 'REGIME-GATE', type: 'Regime', name: 'Regime Gate', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Market state classifier.', logic: 'Returns `regime` signal series.',
      inputs: [_makePort('bars', 'bars', 'OHLC K-line data')], outputs: [_makePort('regime', 'signal', 'Regime signal series')],
      params: { atr_1h_period: 14, ema50_period: 50, trend_threshold: 3 }, params_spec: { atr_1h_period: { kind: 'number', default: 14, min: 5, max: 50, step: 1 }, ema50_period: { kind: 'number', default: 50, min: 10, max: 200, step: 1 }, trend_threshold: { kind: 'number', default: 3, min: 2, max: 4, step: 1 } },
      group: 'Regime（市场状态）', color: '#d97706', market_tags: ['XAUUSD', 'XAGUSD', 'FOREX', 'INDEX'], tags: ['core', 'regime'], executable: true, source: 'core',
      contract_family: 'regime.classifier.v1', strict_swappable: true,
    },
    {
      component_id: 'TREND-SETUP', type: 'Setup', name: 'Trend Setup', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Structure detector that returns setup signals.', logic: 'Returns `setup` signal series.',
      inputs: [_makePort('signal', 'signal', 'Upstream regime signal')], outputs: [_makePort('setup', 'signal', 'Setup signal series')],
      params: { window: 20, pullback_window: 5 }, params_spec: { window: { kind: 'number', default: 20, min: 5, max: 100, step: 1 }, pullback_window: { kind: 'number', default: 5, min: 2, max: 20, step: 1 } },
      group: 'Setups（场景结构）', color: '#f59e0b', market_tags: ['XAUUSD', 'XAGUSD', 'FOREX', 'INDEX'], tags: ['core', 'setup'], executable: true, source: 'core',
      contract_family: 'setup.signal-generator.v1', strict_swappable: true,
    },
    {
      component_id: 'SIGNAL-RANKER', type: 'Scoring', name: 'Signal Ranker', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Scores filtered signals and emits `score` plus `scored`.', logic: 'Standard scoring stage contract.',
      inputs: [_makePort('filtered', 'filtered', 'Filtered signal')], outputs: [_makePort('score', 'score', 'Confidence score series'), _makePort('scored', 'signal', 'Accepted scored signal')],
      params: { min_score: 0.25, lookback: 5 }, params_spec: { min_score: { kind: 'number', default: 0.25, min: 0, max: 10, step: 0.05 }, lookback: { kind: 'number', default: 5, min: 1, max: 50, step: 1 } },
      group: 'Scoring & Confidence（评分与置信）', color: '#7c3aed', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'scoring'], executable: true, source: 'core',
      contract_family: 'scoring.signal-ranker.v1', strict_swappable: true,
    },
    {
      component_id: 'BREAK-ENTRY', type: 'Entry', name: 'Breakout Entry', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Entry stage that converts scored signals into executable entries.', logic: 'Returns `entry`.',
      inputs: [_makePort('signal', 'signal', 'Accepted signal')], outputs: [_makePort('entry', 'signal', 'Executable entry series')],
      params: { confirmation_bars: 1 }, params_spec: { confirmation_bars: { kind: 'number', default: 1, min: 1, max: 10, step: 1 } },
      group: 'Entry Rules（进场规则）', color: '#22c55e', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'entry'], executable: true, source: 'core',
      contract_family: 'entry.signal-to-entry.v1', strict_swappable: true,
    },
    {
      component_id: 'SIGNAL-CONFIRMED-ENTRY', type: 'Entry', name: 'Signal Confirmed Entry', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Pass-through confirmed entry stage with long/short gating.', logic: 'Returns `entry`.',
      inputs: [_makePort('signal', 'signal', 'Accepted signal')], outputs: [_makePort('entry', 'signal', 'Executable entry series')],
      params: { allow_long: true, allow_short: true }, params_spec: { allow_long: { kind: 'bool', default: true }, allow_short: { kind: 'bool', default: true } },
      group: 'Entry Rules（进场规则）', color: '#22c55e', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'entry'], executable: true, source: 'core',
      contract_family: 'entry.signal-to-entry.v1', strict_swappable: true,
    },
    {
      component_id: 'DATA-SCOPE', type: 'Foundation', name: 'Data Scope', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Foundation component that injects runtime data-scope metadata.', logic: 'prepareRuntime() only.',
      inputs: [_makePort('bars', 'bars', 'Raw bar data')], outputs: [_makePort('meta', 'data', 'Runtime metadata')],
      params: { tf_regime: '1H', tf_exec: '5m', start_date: '2026-01-01', end_date: '2026-02-24', bar_count: 1000 }, params_spec: { tf_regime: { kind: 'select', default: '1H', options: ['1H', '4H'] }, tf_exec: { kind: 'select', default: '5m', options: ['1m', '5m', '15m', '30m'] }, start_date: { kind: 'text', default: '2026-01-01', placeholder: 'YYYY-MM-DD' }, end_date: { kind: 'text', default: '2026-02-24', placeholder: 'YYYY-MM-DD' }, bar_count: { kind: 'number', default: 1000, min: 50, max: 5000, step: 50 } },
      group: 'Foundation（基础必填）', color: '#2563eb', market_tags: ['XAUUSD', 'XAGUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'foundation'], executable: true, source: 'core',
      contract_family: 'foundation.runtime-config.v1', strict_swappable: true, hidden: true,
    },
    {
      component_id: 'POSITION-SIZING', type: 'Risk', name: 'Position Sizing', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Generic risk-based position sizer.', logic: 'calcSize(equity, entryPrice, stopDistance, cfg) -> lots.',
      inputs: [_makePort('signal', 'signal', 'Entry context')], outputs: [_makePort('sized', 'sized', 'Sized trade intent')],
      params: { risk_pct: 1.0, sl_pct: 0.5 }, params_spec: { risk_pct: { kind: 'number', default: 1.0, min: 0.1, max: 5.0, step: 0.1 }, sl_pct: { kind: 'number', default: 0.5, min: 0.1, max: 3.0, step: 0.1 } },
      group: 'Risk Rules（风控规则）', color: '#ef4444', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'risk'], executable: true, source: 'core',
      contract_family: 'risk.position-sizer.v1', strict_swappable: true,
    },
    {
      component_id: 'oc-risk-sizer', type: 'Risk', name: 'OC Risk Sizer (1% Equity)', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'OC Cross-flavored equity risk sizer.', logic: 'calcSize(equity, entryPrice, stopDistance, cfg) -> lots.',
      inputs: [_makePort('signal', 'signal', 'Entry context')], outputs: [_makePort('sized', 'sized', 'Sized trade intent')],
      params: { risk_pct: 1.0, sl_pct: 0.5 }, params_spec: { risk_pct: { kind: 'number', default: 1.0, min: 0.1, max: 5.0, step: 0.1 }, sl_pct: { kind: 'number', default: 0.5, min: 0.1, max: 3.0, step: 0.1 } },
      group: 'Risk Rules（风控规则）', color: '#ef4444', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'risk', 'oc-cross'], executable: true, source: 'core',
      contract_family: 'risk.position-sizer.v1', strict_swappable: true,
    },
    {
      component_id: 'SCALED-EXIT', type: 'Exit', name: 'Scaled Exit (Canvas)', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Scaled exit with TP ladder and stage-based SL ratchet.', logic: 'Exit contract implementation for layered canvas strategies.',
      inputs: [_makePort('entry', 'signal', 'Open position context')], outputs: [_makePort('trades', 'trades', 'Exit actions applied by engine')],
      params: { tp1_r: 1.0, tp1_pct: 40, tp2_r: 2.2, runner_pct: 20, sl_pct: 0.6 }, params_spec: { tp1_r: { kind: 'number', default: 1.0, min: 0.5, max: 3, step: 0.1 }, tp1_pct: { kind: 'number', default: 40, min: 10, max: 80, step: 1 }, tp2_r: { kind: 'number', default: 2.2, min: 1, max: 5, step: 0.1 }, runner_pct: { kind: 'number', default: 20, min: 5, max: 50, step: 1 }, sl_pct: { kind: 'number', default: 0.6, min: 0.1, max: 3.0, step: 0.1 } },
      group: 'Exit Rules（出场规则）', color: '#0284c7', market_tags: ['XAUUSD', 'XAGUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'exit'], executable: true, source: 'core',
      contract_family: 'exit.position-manager.v1', strict_swappable: true,
    },
    {
      component_id: 'oc-tp-ladder-exit', type: 'Exit', name: 'OC TP Ladder Exit', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'OC Cross TP ladder exit with same exit contract.', logic: 'Exit contract implementation for OC Cross.',
      inputs: [_makePort('entry', 'signal', 'Open position context')], outputs: [_makePort('trades', 'trades', 'Exit actions applied by engine')],
      params: { tp1_pct: 1.0, tp2_pct: 1.5, tp3_pct: 2.0, tp1_qty: 50, tp2_qty: 30, tp3_qty: 20 }, params_spec: { tp1_pct: { kind: 'number', default: 1.0, min: 0.1, max: 5.0, step: 0.1 }, tp2_pct: { kind: 'number', default: 1.5, min: 0.2, max: 8.0, step: 0.1 }, tp3_pct: { kind: 'number', default: 2.0, min: 0.3, max: 10.0, step: 0.1 }, tp1_qty: { kind: 'number', default: 50, min: 10, max: 80, step: 5 }, tp2_qty: { kind: 'number', default: 30, min: 5, max: 60, step: 5 }, tp3_qty: { kind: 'number', default: 20, min: 5, max: 50, step: 5 } },
      group: 'Exit Rules（出场规则）', color: '#0284c7', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'exit', 'oc-cross'], executable: true, source: 'core',
      contract_family: 'exit.position-manager.v1', strict_swappable: true,
    },
    {
      component_id: 'oc-reversal-exit', type: 'Exit', name: 'Reversal Exit', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Exit component that closes on opposite trigger signal.', logic: 'Same exit contract with reversal-specific evaluateBar().',
      inputs: [_makePort('entry', 'signal', 'Open position context')], outputs: [_makePort('trades', 'trades', 'Exit actions applied by engine')],
      params: {}, params_spec: {},
      group: 'Exit Rules（出场规则）', color: '#0284c7', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'exit', 'oc-cross'], executable: true, source: 'core',
      contract_family: 'exit.position-manager.v1', strict_swappable: true,
    },
    {
      component_id: 'EXECUTION-LAYER', type: 'Execution', name: 'Execution Layer', version: 'v2.0', owner: 'Core', status: 'Active',
      description: 'Execution constraint layer applied before order entry.', logic: 'beforeEntry(orderIntent) -> orderIntent',
      inputs: [_makePort('entry', 'signal', 'Entry intent')], outputs: [_makePort('orders', 'orders', 'Order intent')],
      params: { entry_buffer_bps: 0, allow_long: true, allow_short: true }, params_spec: { entry_buffer_bps: { kind: 'number', default: 0, min: 0, max: 100, step: 1 }, allow_long: { kind: 'bool', default: true }, allow_short: { kind: 'bool', default: true } },
      group: 'Execution Rules（执行规则）', color: '#3b82f6', market_tags: ['XAUUSD', 'FOREX', 'CRYPTO', 'INDEX'], tags: ['core', 'execution'], executable: true, source: 'core',
      contract_family: 'execution.order-gate.v1', strict_swappable: true,
    },
  ]);

  const _COMPONENT_ALIASES = Object.freeze({
    data_scope: 'DATA-SCOPE',
    regime_gate: 'REGIME-GATE',
    trend_setup: 'TREND-SETUP',
    pullback_trigger: 'PULLBACK-TRIGGER',
    hard_rules: 'HARD-RULES',
    usd_filter: 'USD-FILTER',
    signal_ranker: 'SIGNAL-RANKER',
    break_entry: 'BREAK-ENTRY',
    signal_confirmed_entry: 'SIGNAL-CONFIRMED-ENTRY',
    'oc-signal-entry': 'SIGNAL-CONFIRMED-ENTRY',
    'CMP-FAC-SMA-STANDARD': 'CMP-FAC-SMA',
    'CMP-FAC-EMA-STANDARD': 'CMP-FAC-EMA',
    'CMP-FAC-RSI-STANDARD': 'CMP-FAC-RSI',
    scaled_exit: 'SCALED-EXIT',
    position_sizing: 'POSITION-SIZING',
    execution_layer: 'EXECUTION-LAYER',
    'oc-sl-ratchet': 'oc-tp-ladder-exit',
  });

  const _SPEC_BY_ID = new Map(_COMPONENT_SPECS.map((spec) => [spec.component_id, spec]));

  function _resolveComponentId(componentId) {
    return _COMPONENT_ALIASES[componentId] || componentId;
  }

  function getComponentSpec(componentId) {
    const requestedId = componentId;
    const resolvedId = _resolveComponentId(componentId);
    const baseSpec = _SPEC_BY_ID.get(resolvedId);
    if (!baseSpec) return null;
    const spec = _cloneComponentSpec(baseSpec);
    if (requestedId !== resolvedId) {
      spec.component_id = requestedId;
      spec.alias_of = resolvedId;
      spec.hidden = true;
      spec.tags = [...new Set([...(spec.tags || []), 'alias'])];
    }
    return spec;
  }

  function getCatalog(options) {
    const opts = options || {};
    const includeAliases = opts.includeAliases !== false;
    const includeHidden = opts.includeHidden !== false;
    const list = _COMPONENT_SPECS.map((spec) => _cloneComponentSpec(spec));

    if (includeAliases) {
      for (const [aliasId, canonicalId] of Object.entries(_COMPONENT_ALIASES)) {
        const aliasSpec = getComponentSpec(aliasId);
        if (!aliasSpec) continue;
        aliasSpec.description = `${aliasSpec.description} Alias of ${canonicalId}.`;
        list.push(aliasSpec);
      }
    }

    return includeHidden ? list : list.filter((spec) => !spec.hidden);
  }

  class DataScopeFoundation {
    constructor() { this.type = 'Foundation'; this.id = 'DATA-SCOPE'; this.name = 'Data Scope'; }
    init(params) { this.params = { ...(params || {}) }; }
    prepareRuntime(_bars, _runtime) {
      return { meta: { dataScope: { ...this.params } } };
    }
  }

  class PositionSizingRisk {
    constructor() {
      this.type = 'Risk';
      this.id = 'POSITION-SIZING';
      this.name = 'Position Sizing';
    }
    init(params) {
      this.riskPct = params.risk_pct ?? 1.0;
      this.slPct = params.sl_pct ?? 0.5;
    }
    calcSize(equity, _entryPrice, stopDistance, cfg) {
      const riskDollar = equity * (this.riskPct / 100);
      const effectiveSlDist = stopDistance + cfg.spread + cfg.slippage;
      if (effectiveSlDist <= 0) return 0;
      const lots = riskDollar / (effectiveSlDist * cfg.value_per_unit);
      return Math.max(0.01, Math.round(lots * 100) / 100);
    }
  }

  class ExecutionLayerComponent {
    constructor() { this.type = 'Execution'; this.id = 'EXECUTION-LAYER'; this.name = 'Execution Layer'; }
    init(params) {
      this.bufferBps = params.entry_buffer_bps || 0;
      this.allowShort = params.allow_short !== false;
      this.allowLong = params.allow_long !== false;
    }
    beforeEntry(orderIntent) {
      if ((orderIntent.direction === 'LONG' && !this.allowLong) || (orderIntent.direction === 'SHORT' && !this.allowShort)) {
        return { ...orderIntent, allowEntry: false };
      }
      const buffer = orderIntent.entryPrice * (this.bufferBps / 10000);
      return {
        ...orderIntent,
        entryPrice: orderIntent.direction === 'LONG' ? orderIntent.entryPrice + buffer : orderIntent.entryPrice - buffer,
      };
    }
  }


  // ═══════════════════════════════════════════════════════
  //  EXIT COMPONENTS
  // ═══════════════════════════════════════════════════════

  /**
   * Scaled Exit (TP Ladder + SL Ratchet)
   *
   * TP1/TP2/TP3 partial exits with stage-based SL ratchet:
   *   Stage 0 → SL = SL0 (initial)
   *   Stage 1 (after TP1) → SL moves to breakeven
   *   Stage 2 (after TP2) → SL moves to TP1
   *   Stage 3 (after TP3) → fully closed
   *
   * Same-bar TP+SL conflict resolved by SL_FIRST policy.
   * Stage changes effective NEXT_BAR.
   */
  class ScaledExit {
    constructor() { this.type = 'Exit'; this.id = 'oc-tp-ladder-exit'; this.name = 'TP Ladder + SL Ratchet'; }
    init(params) {
      this.tp1Pct = params.tp1_pct ?? 1.0;
      this.tp2Pct = params.tp2_pct ?? 1.5;
      this.tp3Pct = params.tp3_pct ?? 2.0;
      this.tp1Qty = params.tp1_qty ?? 50;
      this.tp2Qty = params.tp2_qty ?? 30;
      this.tp3Qty = params.tp3_qty ?? 20;
      this.slPct  = params.sl_pct ?? 0.5;
      this.conflictPolicy = params.conflict_policy || 'SL_FIRST';
    }

    computeStopDistance(entryPrice, _direction) {
      return entryPrice * (this.slPct / 100);
    }

    onPositionOpen(pos, entryPrice, direction, _cfg) {
      const isLong = direction === 'LONG';
      const slDist = this.computeStopDistance(entryPrice, direction);
      pos.sl0 = isLong ? entryPrice - slDist : entryPrice + slDist;
      pos.sl  = pos.sl0;
      pos.tp1 = isLong ? entryPrice * (1 + this.tp1Pct / 100) : entryPrice * (1 - this.tp1Pct / 100);
      pos.tp2 = isLong ? entryPrice * (1 + this.tp2Pct / 100) : entryPrice * (1 - this.tp2Pct / 100);
      pos.tp3 = isLong ? entryPrice * (1 + this.tp3Pct / 100) : entryPrice * (1 - this.tp3Pct / 100);
      pos.stage = 0;
      pos.pendingStageChange = null;
      pos.stopDistance = slDist;
    }

    evaluateBar(pos, bar, _barIndex, _signals, cfg) {
      const isLong = pos.direction === 'LONG';

      // Apply pending stage change (NEXT_BAR effective)
      if (pos.pendingStageChange !== null) {
        const p = pos.pendingStageChange;
        pos.stage = p.newStage;
        if (isLong) { if (p.newSl > pos.sl) pos.sl = p.newSl; }
        else        { if (p.newSl < pos.sl) pos.sl = p.newSl; }
        pos.pendingStageChange = null;
      }

      // Current TP target by stage
      let tpTarget = null, tpQty = 0;
      if (pos.stage === 0)      { tpTarget = pos.tp1; tpQty = this.tp1Qty; }
      else if (pos.stage === 1) { tpTarget = pos.tp2; tpQty = this.tp2Qty; }
      else if (pos.stage === 2) { tpTarget = pos.tp3; tpQty = this.tp3Qty; }

      const tpHit = tpTarget !== null && (
        (isLong && bar.high >= tpTarget) || (!isLong && bar.low <= tpTarget)
      );
      const slHit = (isLong && bar.low <= pos.sl) || (!isLong && bar.high >= pos.sl);

      // Same-bar conflict: SL_FIRST
      if (tpHit && slHit && this.conflictPolicy === 'SL_FIRST') {
        return { type: 'close', price: pos.sl, reason: 'SL (conflict SL_FIRST)' };
      }

      // SL hit
      if (slHit) {
        return { type: 'close', price: pos.sl, reason: `SL (Stage ${pos.stage})` };
      }

      // TP hit
      if (tpHit && pos.stage <= 2) {
        const tpLabel = pos.stage === 0 ? 'TP1' : pos.stage === 1 ? 'TP2' : 'TP3';

        // Compute pending SL ratchet
        let newSl = pos.sl;
        const newStage = pos.stage + 1;
        if (pos.stage === 0) {
          // TP1 → SL to breakeven
          const beBuffer = cfg.spread + cfg.slippage +
            cfg.commission_per_side / (cfg.value_per_unit * pos.lots || 1);
          newSl = isLong ? (pos.entryPrice + beBuffer) : (pos.entryPrice - beBuffer);
        } else if (pos.stage === 1) {
          // TP2 → SL to TP1
          newSl = pos.tp1;
        }

        return {
          type: 'partial',
          price: tpTarget,
          qtyPct: tpQty,
          label: tpLabel,
          pendingStageChange: { newStage, newSl },
        };
      }

      return { type: 'none' };
    }
  }


  /**
   * Reversal Exit
   *
   * Closes the position when the trigger fires a signal in the
   * opposite direction. This is a COMPONENT, not hardcoded in the engine.
   */
  class ReversalExit {
    constructor() { this.type = 'Exit'; this.id = 'oc-reversal-exit'; this.name = 'Reversal Exit'; }
    init(_params) {}

    computeStopDistance() { return 0; }
    onPositionOpen() {}

    evaluateBar(pos, bar, barIndex, signals, _cfg) {
      const sig = signals.entry ? signals.entry[barIndex] : 0;
      if (sig !== 0) {
        const sigDir = sig > 0 ? 'LONG' : 'SHORT';
        if (sigDir !== pos.direction) {
          return { type: 'close', price: bar.close, reason: 'Reversal signal' };
        }
      }
      return { type: 'none' };
    }
  }

  class CanvasScaledExit extends ScaledExit {
    constructor() {
      super();
      this.type = 'Exit';
      this.id = 'SCALED-EXIT';
      this.name = 'Scaled Exit (Canvas)';
    }

    init(params) {
      const tp1Qty = params.tp1_pct ?? 40;
      const runnerQty = params.runner_pct ?? 20;
      const tp2Qty = Math.max(0, 100 - tp1Qty - runnerQty);
      super.init({
        tp1_pct: params.tp1_r ?? 1.0,
        tp2_pct: params.tp2_r ?? 2.2,
        tp3_pct: params.tp3_r ?? Math.max((params.tp2_r ?? 2.2) * 1.35, (params.tp2_r ?? 2.2) + 0.6),
        tp1_qty: tp1Qty,
        tp2_qty: tp2Qty,
        tp3_qty: runnerQty,
        sl_pct: params.sl_pct ?? 0.6,
        conflict_policy: params.conflict_policy || 'SL_FIRST',
      });
    }
  }


  // ═══════════════════════════════════════════════════════
  //  RISK COMPONENTS
  // ═══════════════════════════════════════════════════════

  /** 1% Equity Risk Sizer: lots = riskDollar / effectiveStopDistance */
  class EquityRiskSizer {
    constructor() { this.type = 'Risk'; this.id = 'oc-risk-sizer'; this.name = '1% Equity Risk Sizer'; }
    init(params) {
      this.riskPct = params.risk_pct ?? 1.0;
    }
    calcSize(equity, entryPrice, stopDistance, cfg) {
      const riskDollar = equity * (this.riskPct / 100);
      const effectiveSlDist = stopDistance + cfg.spread + cfg.slippage;
      if (effectiveSlDist <= 0) return 0;
      const lots = riskDollar / (effectiveSlDist * cfg.value_per_unit);
      return Math.max(0.01, Math.round(lots * 100) / 100);
    }
  }


  // ═══════════════════════════════════════════════════════
  //  COMPONENT REGISTRY
  // ═══════════════════════════════════════════════════════

  const _CLASSES = {
    // Stage-aware canvas components
    'DATA-SCOPE':        DataScopeFoundation,
    'data_scope':        DataScopeFoundation,
    'REGIME-GATE':       TrendRegimeComponent,
    'regime_gate':       TrendRegimeComponent,
    'TREND-SETUP':       TrendSetupComponent,
    'trend_setup':       TrendSetupComponent,
    'PULLBACK-TRIGGER':  PullbackTriggerComponent,
    'pullback_trigger':  PullbackTriggerComponent,
    'CMP-FIL-TREND':     TrendFilterComponent,
    'HARD-RULES':        HardRulesFilter,
    'hard_rules':        HardRulesFilter,
    'USD-FILTER':        USDFilter,
    'usd_filter':        USDFilter,
    'SIGNAL-RANKER':     SignalRankerComponent,
    'signal_ranker':     SignalRankerComponent,
    'BREAK-ENTRY':       BreakEntryComponent,
    'break_entry':       BreakEntryComponent,
    'SIGNAL-CONFIRMED-ENTRY': SignalConfirmedEntryComponent,
    'signal_confirmed_entry': SignalConfirmedEntryComponent,
    'SCALED-EXIT':       CanvasScaledExit,
    'scaled_exit':       CanvasScaledExit,
    'POSITION-SIZING':   PositionSizingRisk,
    'position_sizing':   PositionSizingRisk,
    'EXECUTION-LAYER':   ExecutionLayerComponent,
    'execution_layer':   ExecutionLayerComponent,
    // OC Cross strategy components
    'oc-alma-factor':     ALMAFactor,
    'oc-cross-trigger':   OCCrossTrigger,
    'oc-signal-entry':    SignalConfirmedEntryComponent,
    'oc-tp-ladder-exit':  ScaledExit,
    'oc-sl-ratchet':      ScaledExit,      // alias — same class, merged params
    'oc-reversal-exit':   ReversalExit,
    'oc-risk-sizer':      EquityRiskSizer,
    // Generic factors
    'CMP-FAC-SMA':    SMAFactor,
    'CMP-FAC-EMA':    EMAFactor,
    'CMP-FAC-ATR':    ATRFactor,
    'CMP-FAC-RSI':    RSIFactor,
    // Generic triggers
    'CMP-TRI-GOLDX':  GoldenCrossTrigger,
  };


  /**
   * Create a single component instance by ID.
   * Returns null if the component_id is unknown.
   */
  function createComponent(componentId, params) {
    const resolvedId = _resolveComponentId(componentId);
    const Cls = _CLASSES[resolvedId] || _CLASSES[componentId];
    if (!Cls) return null;
    const inst = new Cls();
    const spec = getComponentSpec(componentId) || getComponentSpec(resolvedId);
    if (spec) {
      inst.id = componentId;
      inst.name = spec.name;
      inst.contractFamily = spec.contract_family || null;
      inst.componentSpec = spec;
    }
    inst.init(params || {});
    return inst;
  }

  const _ROLE_TO_BUCKET = {
    Foundation: 'foundation',
    Factor: 'factors',
    Regime: 'regime',
    Setup: 'setup',
    Trigger: 'triggers',
    Filter: 'filters',
    Scoring: 'scoring',
    Entry: 'entries',
    Exit: 'exits',
    Risk: 'risk',
    Execution: 'execution',
  };

  const _PIPELINE_STAGE_MAP = {
    foundationEntries: 'Foundation',
    factorEntries: 'Factor',
    regimeEntries: 'Regime',
    setupEntries: 'Setup',
    triggerEntries: 'Trigger',
    filterEntries: 'Filter',
    scoringEntries: 'Scoring',
    entryEntries: 'Entry',
    exitEntries: 'Exit',
    riskEntries: 'Risk',
    executionEntries: 'Execution',
  };

  function _createEmptyResolvedComponents() {
    return {
      foundation: [],
      factors: [],
      regime: [],
      setup: [],
      triggers: [],
      filters: [],
      scoring: [],
      entries: [],
      exits: [],
      risk: [],
      execution: [],
      branches: [],
      branchSummary: [],
    };
  }

  function _mergeExitStageEntries(entries) {
    const list = (entries || []).map((entry) => ({
      component_id: entry.component_id,
      params: { ...(entry.params || {}) },
    }));
    const tpIndex = list.findIndex((entry) => entry.component_id === 'oc-tp-ladder-exit');
    const slIndex = list.findIndex((entry) => entry.component_id === 'oc-sl-ratchet');
    if (tpIndex >= 0 && slIndex >= 0) {
      list[tpIndex].params = { ...list[tpIndex].params, ...list[slIndex].params };
      list.splice(slIndex, 1);
    }
    return list;
  }

  function _pushResolvedComponent(comps, role, componentId, params) {
    const bucket = _ROLE_TO_BUCKET[role];
    if (!bucket || !componentId) return;
    const component = createComponent(componentId, params || {});
    if (!component) return;
    comps[bucket].push(component);
  }

  function _buildStageSummary(comps) {
    const summary = {};
    for (const [role, bucket] of Object.entries(_ROLE_TO_BUCKET)) {
      summary[role] = (comps[bucket] || []).map((component) => ({
        id: component.id,
        type: component.type,
        name: component.name,
      }));
    }
    return summary;
  }

  function _entryFingerprint(role, entry) {
    return `${role}:${entry && entry.node_id != null ? entry.node_id : (entry ? entry.component_id : 'unknown')}:${JSON.stringify((entry && entry.params) || {})}`;
  }

  function _resolveStageEntriesInto(target, stageEntriesMap) {
    for (const [entryKey, role] of Object.entries(_PIPELINE_STAGE_MAP)) {
      const stageEntries = entryKey === 'exitEntries'
        ? _mergeExitStageEntries((stageEntriesMap && stageEntriesMap[entryKey]) || [])
        : ((stageEntriesMap && stageEntriesMap[entryKey]) || []);
      for (const entry of stageEntries) {
        if (!entry || !entry.component_id) continue;
        _pushResolvedComponent(target, role, entry.component_id, entry.params || {});
      }
    }
  }

  function _buildBranchSummary(branches) {
    return (branches || []).map((branch, index) => ({
      id: branch.id || `lane_${index + 1}`,
      label: branch.label || branch.id || `lane_${index + 1}`,
      nodeIds: branch.nodeIds || [],
      stageSummary: _buildStageSummary(branch),
    }));
  }


  /**
   * Resolve a canvas blueprint into engine-ready component sets.
   *
   * Blueprint format (from canvas):
   *   { nodes: [{ type: component_id, params: {...} }, ...], ... }
   *
   * Returns:
   *   { factors: [], triggers: [], filters: [], exits: [], risk: [] }
   */
  function resolveComponents(blueprint) {
    const comps = _createEmptyResolvedComponents();
    if (!blueprint) return comps;

    const pipeline = blueprint.pipeline || {};
    const hasPipelineEntries = Object.keys(_PIPELINE_STAGE_MAP)
      .some((key) => Array.isArray(pipeline[key]) && pipeline[key].length > 0);
    const hasBranchLanes = Array.isArray(pipeline.branchLanes) && pipeline.branchLanes.length > 0;

    if (hasPipelineEntries || hasBranchLanes) {
      const aggregateSeen = new Set();

      if (hasPipelineEntries) {
        _resolveStageEntriesInto(comps, pipeline);
        for (const [entryKey, role] of Object.entries(_PIPELINE_STAGE_MAP)) {
          for (const entry of pipeline[entryKey] || []) aggregateSeen.add(_entryFingerprint(role, entry));
        }
      }

      if (hasBranchLanes) {
        comps.branches = pipeline.branchLanes.map((lane, index) => {
          const branch = _createEmptyResolvedComponents();
          branch.id = lane.id || `lane_${index + 1}`;
          branch.label = lane.label || branch.id;
          branch.nodeIds = Array.isArray(lane.nodeIds) ? lane.nodeIds.slice() : [];
          branch.splitNodeIds = Array.isArray(lane.splitNodeIds) ? lane.splitNodeIds.slice() : [];
          _resolveStageEntriesInto(branch, lane.stages || lane.compiledEntries || {});
          branch.stageSummary = _buildStageSummary(branch);
          return branch;
        });

        if (!hasPipelineEntries) {
          for (const lane of pipeline.branchLanes) {
            const stages = lane.stages || lane.compiledEntries || {};
            for (const [entryKey, role] of Object.entries(_PIPELINE_STAGE_MAP)) {
              for (const entry of stages[entryKey] || []) {
                const key = _entryFingerprint(role, entry);
                if (aggregateSeen.has(key)) continue;
                aggregateSeen.add(key);
                _pushResolvedComponent(comps, role, entry.component_id, entry.params || {});
              }
            }
          }
        }
      }

      comps.stageSummary = _buildStageSummary(comps);
      comps.branchSummary = _buildBranchSummary(comps.branches);
      return comps;
    }

    if (!blueprint.nodes) return comps;

    // Collect all nodes, merging oc-tp-ladder-exit + oc-sl-ratchet params
    const tpNode = blueprint.nodes.find(n => n.type === 'oc-tp-ladder-exit');
    const slNode = blueprint.nodes.find(n => n.type === 'oc-sl-ratchet');
    let mergedScaledExit = false;

    for (const node of blueprint.nodes) {
      // Skip oc-sl-ratchet — its params are merged into oc-tp-ladder-exit
      if (node.type === 'oc-sl-ratchet') {
        if (!mergedScaledExit && tpNode) continue; // will be merged below
        // If there's no TP node but there is an SL node, create standalone
      }

      let params = { ...(node.params || {}) };

      // Merge SL ratchet params into TP ladder
      if (node.type === 'oc-tp-ladder-exit' && slNode && !mergedScaledExit) {
        params = { ...params, ...(slNode.params || {}) };
        mergedScaledExit = true;
      }

      const c = createComponent(node.type, params);
      if (!c) continue;

      const bucket = _ROLE_TO_BUCKET[c.type];
      if (bucket) comps[bucket].push(c);
    }

    comps.stageSummary = _buildStageSummary(comps);
    comps.branchSummary = [];
    return comps;
  }


  /**
   * Get the default OC Cross strategy component set.
   * Used for backward compatibility when no blueprint is provided.
   */
  function getOCCrossDefaults(config) {
    const cfg = config || {};
    const comps = _createEmptyResolvedComponents();
    comps.factors = [createComponent('oc-alma-factor', cfg)];
    comps.triggers = [createComponent('oc-cross-trigger', cfg)];
    comps.entries = [createComponent('oc-signal-entry', cfg)];
    comps.exits = [
        createComponent('oc-tp-ladder-exit', cfg),
        createComponent('oc-reversal-exit',  cfg),
      ];
    comps.risk = [createComponent('oc-risk-sizer', cfg)];
    comps.stageSummary = _buildStageSummary(comps);
    comps.branchSummary = [];
    return comps;
  }


  /**
   * Register a custom component class.
   * Enables extending the platform with new components.
   */
  function registerComponent(componentId, ComponentClass) {
    _CLASSES[componentId] = ComponentClass;
  }


  /**
   * List all registered component IDs.
   */
  function listRegistered() {
    return getCatalog({ includeAliases: true, includeHidden: true }).map((spec) => spec.component_id);
  }


  // ═══════════════════════════════════════════════════════
  //  PUBLIC API
  // ═══════════════════════════════════════════════════════

  return {
    // Component creation & resolution
    createComponent,
    resolveComponents,
    getOCCrossDefaults,
    getComponentSpec,
    getCatalog,
    registerComponent,
    listRegistered,

    // Component classes (for extension / instanceof checks)
    ALMAFactor,
    SMAFactor,
    EMAFactor,
    ATRFactor,
    RSIFactor,
    OCCrossTrigger,
    GoldenCrossTrigger,
    ScaledExit,
    CanvasScaledExit,
    ReversalExit,
    EquityRiskSizer,

    // Internal helper (exposed for testing)
    _calcALMA,
  };
})();

if (typeof window !== 'undefined') window.ComponentLib = ComponentLib;
