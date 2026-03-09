/**
 * ToMoon Quant — Frontend Backtest Engine (Component-Driven)
 *
 * The engine is a PURE EXECUTOR. It contains:
 *   - Bar-by-bar simulation loop
 *   - Position lifecycle management (open, partial, close)
 *   - Equity / MFE / MAE tracking
 *   - Metrics computation
 *
 * ALL strategy logic lives in swappable Components (see component-lib.js):
 *   Factor   → indicators       Trigger  → entry signals
 *   Filter   → signal gating    Exit     → TP/SL/Reversal/Trailing
 *   Risk     → position sizing
 *
 * Usage:
 *   // Component-driven (NEW — recommended):
 *   const components = ComponentLib.resolveComponents(blueprint);
 *   const result = BacktestEngine.runWithComponents(bars, components, accountConfig);
 *
 *   // Backward-compatible (auto-creates OC Cross components):
 *   const result = BacktestEngine.runBacktest(bars, config);
 */

const BacktestEngine = (() => {
  'use strict';

  // ═══════════════════════════════════════════
  // ALMA Calculator (kept for backward compat)
  // ═══════════════════════════════════════════
  function calcALMA(series, len, offset, sigma) {
    if (typeof ComponentLib !== 'undefined') return ComponentLib._calcALMA(series, len, offset, sigma);
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

  // ═══════════════════════════════════════════
  // Legacy signal detection (backward compat)
  // ═══════════════════════════════════════════
  function detectCrossSignals(bars, config) {
    const len = config.alma_len || 6;
    const offset = config.alma_offset || 0.85;
    const sigma = config.alma_sigma || 5;
    const delayOffset = config.delay_offset || 0;

    const closes = bars.map((b, i) => i >= delayOffset ? bars[i - delayOffset].close : b.close);
    const opens = bars.map((b, i) => i >= delayOffset ? bars[i - delayOffset].open : b.open);

    const maClose = calcALMA(closes, len, offset, sigma);
    const maOpen = calcALMA(opens, len, offset, sigma);

    const signals = new Array(bars.length).fill(0);
    for (let t = 1; t < bars.length; t++) {
      if (isNaN(maClose[t]) || isNaN(maOpen[t]) || isNaN(maClose[t - 1]) || isNaN(maOpen[t - 1])) continue;
      if (maClose[t] > maOpen[t] && maClose[t - 1] <= maOpen[t - 1]) signals[t] = 1;
      else if (maClose[t] < maOpen[t] && maClose[t - 1] >= maOpen[t - 1]) signals[t] = -1;
    }

    return { signals, maClose, maOpen };
  }

  // ═══════════════════════════════════════════════════════
  // GENERIC COMPONENT-DRIVEN ENGINE
  // ═══════════════════════════════════════════════════════
  // This is the core of the refactored architecture.
  // The engine knows NOTHING about any specific strategy.
  // All decisions are delegated to components.

  const _STAGE_SIGNAL_KEYS = new Set(['regime', 'setup', 'trigger', 'filtered', 'score', 'scored', 'entry']);

  function _createStageRuntime(bars, cfg, components) {
    return {
      bars,
      config: { ...cfg },
      indicators: {},
      signals: {
        regime: null,
        setup: null,
        trigger: null,
        filtered: null,
        score: null,
        scored: null,
        entry: null,
      },
      meta: {
        dataScope: null,
        stageComponents: components.stageSummary || {},
        stageOutputs: {},
      },
    };
  }

  function _countActiveSignals(series) {
    if (!Array.isArray(series)) return 0;
    let count = 0;
    for (const value of series) if (value) count += 1;
    return count;
  }

  function _mergeStageOutput(runtime, stageName, component, output) {
    if (!output) return;
    const stageMeta = runtime.meta.stageOutputs[stageName] || {
      components: [],
      signalKeys: new Set(),
      indicatorKeys: new Set(),
      activeSignals: {},
    };

    if (!stageMeta.components.includes(component.id)) stageMeta.components.push(component.id);

    if (output.meta && typeof output.meta === 'object') {
      Object.assign(runtime.meta, output.meta);
    }
    if (output.config && typeof output.config === 'object') {
      Object.assign(runtime.config, output.config);
    }

    for (const [key, value] of Object.entries(output)) {
      if (key === 'meta' || key === 'config') continue;
      // Stage-specific remapping takes priority: Trigger components
      // that output 'entry' should populate signals.trigger (not
      // signals.entry), so downstream Entry/Filter stages can find it.
      let signalKey = null;
      if (stageName === 'Trigger' && key === 'entry') signalKey = 'trigger';
      else if (stageName === 'Filter' && key === 'entry') signalKey = 'filtered';
      else if (stageName === 'Scoring' && key === 'filtered') signalKey = 'scored';
      else if (_STAGE_SIGNAL_KEYS.has(key)) signalKey = key;

      if (signalKey) {
        runtime.signals[signalKey] = value;
        stageMeta.signalKeys.add(signalKey);
        stageMeta.activeSignals[signalKey] = _countActiveSignals(value);
      } else {
        runtime.indicators[key] = value;
        stageMeta.indicatorKeys.add(key);
      }
    }

    runtime.meta.stageOutputs[stageName] = stageMeta;
  }

  function _executeStageComponents(stageName, stageComponents, runtime) {
    for (const component of (stageComponents || [])) {
      let output = null;
      if (stageName === 'Foundation' && typeof component.prepareRuntime === 'function') {
        output = component.prepareRuntime(runtime.bars, runtime);
      } else if (typeof component.precompute === 'function') {
        output = component.precompute(runtime.bars, runtime.indicators, runtime.signals, runtime);
      }
      _mergeStageOutput(runtime, stageName, component, output || null);
    }
  }

  function _resolveEntrySeries(signals, barsLength) {
    const fallback = signals.entry || signals.scored || signals.filtered || signals.trigger || signals.setup || signals.regime;
    return Array.isArray(fallback) ? fallback : new Array(barsLength).fill(0);
  }

  function _summarizeStageOutputs(runtime) {
    const summary = {};
    for (const [stageName, info] of Object.entries(runtime.meta.stageOutputs || {})) {
      summary[stageName] = {
        components: info.components || [],
        signalKeys: Array.from(info.signalKeys || []),
        indicatorKeys: Array.from(info.indicatorKeys || []),
        activeSignals: info.activeSignals || {},
      };
    }
    return summary;
  }

  function _pickSharedBranchBucket(components, bucket) {
    const list = components && Array.isArray(components[bucket]) ? components[bucket] : [];
    return list.length <= 1 ? list : [];
  }

  function _buildExecutionLanes(bars, cfg, components) {
    const branchDefs = (components && Array.isArray(components.branches) && components.branches.length)
      ? components.branches
      : [{
          id: 'main',
          label: 'Main Lane',
          foundation: components.foundation || [],
          factors: components.factors || [],
          regime: components.regime || [],
          setup: components.setup || [],
          triggers: components.triggers || [],
          filters: components.filters || [],
          scoring: components.scoring || [],
          entries: components.entries || [],
          exits: components.exits || [],
          risk: components.risk || [],
          execution: components.execution || [],
          stageSummary: components.stageSummary || {},
        }];

    const sharedExits = _pickSharedBranchBucket(components, 'exits');
    const sharedRisk = _pickSharedBranchBucket(components, 'risk');
    const sharedExecution = _pickSharedBranchBucket(components, 'execution');

    return branchDefs.map((branch, index) => {
      const runtime = _createStageRuntime(bars, cfg, branch);
      _executeStageComponents('Foundation', branch.foundation || [], runtime);
      _executeStageComponents('Factor', branch.factors || [], runtime);
      _executeStageComponents('Regime', branch.regime || [], runtime);
      _executeStageComponents('Setup', branch.setup || [], runtime);
      _executeStageComponents('Trigger', branch.triggers || [], runtime);
      _executeStageComponents('Filter', branch.filters || [], runtime);
      _executeStageComponents('Scoring', branch.scoring || [], runtime);
      _executeStageComponents('Entry', branch.entries || [], runtime);
      runtime.signals.entry = _resolveEntrySeries(runtime.signals, bars.length);

      const exits = (branch.exits && branch.exits.length) ? branch.exits : sharedExits;
      const riskList = (branch.risk && branch.risk.length) ? branch.risk : sharedRisk;
      const execution = (branch.execution && branch.execution.length) ? branch.execution : sharedExecution;

      return {
        id: branch.id || `lane_${index + 1}`,
        label: branch.label || branch.id || `lane_${index + 1}`,
        order: index,
        runtime,
        entrySeries: runtime.signals.entry,
        scoreSeries: runtime.signals.score,
        exits,
        risk: riskList[0] || null,
        execution,
        stageReport: _summarizeStageOutputs(runtime),
        stageSummary: branch.stageSummary || {},
        nodeIds: branch.nodeIds || [],
      };
    });
  }

  function _selectLaneEntryCandidate(lanes, signalIndex) {
    const candidates = [];
    for (const lane of lanes) {
      const sig = Array.isArray(lane.entrySeries) ? (lane.entrySeries[signalIndex] || 0) : 0;
      if (!sig) continue;
      const score = Array.isArray(lane.scoreSeries) && Number.isFinite(lane.scoreSeries[signalIndex])
        ? Math.abs(lane.scoreSeries[signalIndex])
        : 0;
      candidates.push({ lane, sig, score });
    }
    candidates.sort((a, b) => b.score - a.score || a.lane.order - b.lane.order);
    return candidates[0] || null;
  }

  function _mergeLaneIndicators(lanes) {
    const merged = {};
    for (const lane of lanes) {
      for (const [key, value] of Object.entries(lane.runtime.indicators || {})) {
        if (merged[key] == null) {
          merged[key] = value;
        } else if (merged[`${lane.id}_${key}`] == null) {
          merged[`${lane.id}_${key}`] = value;
        }
      }
    }
    return merged;
  }

  function _mergeLaneSignals(lanes, barsLength) {
    const merged = new Array(barsLength).fill(0);
    for (let i = 0; i < barsLength; i++) {
      const candidate = _selectLaneEntryCandidate(lanes, i);
      if (candidate) merged[i] = candidate.sig;
    }
    return merged;
  }

  function _aggregateStageReports(lanes) {
    const aggregate = {};
    for (const lane of lanes) {
      for (const [stageName, info] of Object.entries(lane.stageReport || {})) {
        const slot = aggregate[stageName] || {
          components: [],
          signalKeys: [],
          indicatorKeys: [],
          activeSignals: {},
        };
        for (const componentId of info.components || []) {
          if (!slot.components.includes(componentId)) slot.components.push(componentId);
        }
        for (const signalKey of info.signalKeys || []) {
          if (!slot.signalKeys.includes(signalKey)) slot.signalKeys.push(signalKey);
        }
        for (const indicatorKey of info.indicatorKeys || []) {
          if (!slot.indicatorKeys.includes(indicatorKey)) slot.indicatorKeys.push(indicatorKey);
        }
        for (const [signalKey, value] of Object.entries(info.activeSignals || {})) {
          slot.activeSignals[signalKey] = (slot.activeSignals[signalKey] || 0) + value;
        }
        aggregate[stageName] = slot;
      }
    }
    return aggregate;
  }

  function _upsertEquityPoint(equityCurve, point) {
    if (!Array.isArray(equityCurve) || !point) return;
    const lastPoint = equityCurve[equityCurve.length - 1];
    if (lastPoint && lastPoint.bar === point.bar) {
      equityCurve[equityCurve.length - 1] = point;
      return;
    }
    equityCurve.push(point);
  }

  function runWithComponents(bars, components, accountConfig) {
    const cfg = {
      initial_capital: 100000,
      commission_per_side: 3.50,
      spread: 0.30,
      slippage: 0.10,
      value_per_unit: 100,
      ...accountConfig,
    };

    if (!bars || bars.length < 20) {
      return { trades: [], equityCurve: [], metrics: {}, signals: [], error: 'Insufficient data (need >= 20 bars)' };
    }

    const lanes = _buildExecutionLanes(bars, cfg, components || {});
    const laneMap = new Map(lanes.map((lane) => [lane.id, lane]));
    const indicators = _mergeLaneIndicators(lanes);
    const signals = {
      entry: _mergeLaneSignals(lanes, bars.length),
      branches: Object.fromEntries(lanes.map((lane) => [lane.id, { ...lane.runtime.signals }])),
    };

    let equity = cfg.initial_capital;
    const equityCurve = [{ bar: 0, equity, timestamp: bars[0].timestamp }];
    const trades = [];
    let tradeId = 0;
    let pos = null;

    for (let t = 1; t < bars.length; t++) {
      const bar = bars[t];

      // ── Entry: signal at t-1, fill at t open ──
      if (pos === null && t >= 2) {
        const candidate = _selectLaneEntryCandidate(lanes, t - 1);
        const sig = candidate ? candidate.sig : 0;
        if (candidate && sig !== 0) {
          const entryLane = candidate.lane;
          const direction = sig > 0 ? 'LONG' : 'SHORT';
          let orderIntent = {
            signal: sig,
            direction,
            entryPrice: bar.open + (sig > 0 ? cfg.slippage : -cfg.slippage),
            barIndex: t,
            bar,
            allowEntry: true,
            laneId: entryLane.id,
            laneLabel: entryLane.label,
          };
          for (const executionComponent of (entryLane.execution || [])) {
            if (typeof executionComponent.beforeEntry === 'function') {
              orderIntent = executionComponent.beforeEntry(orderIntent, entryLane.runtime) || orderIntent;
            }
          }
          if (orderIntent.allowEntry === false) continue;
          const entryPrice = orderIntent.entryPrice;

          // Ask Exit components for stop distance
          let stopDistance = entryPrice * 0.005; // fallback 0.5%
          for (const exit of (entryLane.exits || [])) {
            if (typeof exit.computeStopDistance === 'function') {
              const sd = exit.computeStopDistance(entryPrice, direction);
              if (sd > 0) { stopDistance = sd; break; }
            }
          }

          // Ask Risk component for position size
          let lots = 0.01;
          if (entryLane.risk) {
            lots = entryLane.risk.calcSize(equity, entryPrice, stopDistance, cfg);
          }

          if (lots > 0) {
            pos = {
              id: ++tradeId,
              laneId: entryLane.id,
              laneLabel: entryLane.label,
              direction,
              entryPrice,
              entryBar: t,
              entryTimestamp: bar.timestamp,
              lots,
              originalLots: lots,
              remainingQtyPct: 100,
              partialExits: [],
              entryCost: cfg.commission_per_side + cfg.spread * cfg.value_per_unit * lots / 2,
              _bestPrice: entryPrice,
              _worstPrice: entryPrice,
              // Exit components populate these via onPositionOpen:
              sl: null, sl0: null, tp1: null, tp2: null, tp3: null,
              stage: 0, pendingStageChange: null, stopDistance: stopDistance,
            };

            // Let each Exit component initialize position state
            for (const exit of (entryLane.exits || [])) {
              if (typeof exit.onPositionOpen === 'function') {
                exit.onPositionOpen(pos, entryPrice, direction, cfg);
              }
            }
          }
        }
      }

      // ── Process open position ──
      if (pos !== null) {
        const activeLane = laneMap.get(pos.laneId) || lanes[0];
        const isLong = pos.direction === 'LONG';

        // Track MFE / MAE (engine responsibility — universal)
        if (isLong) {
          if (bar.high > pos._bestPrice) pos._bestPrice = bar.high;
          if (bar.low < pos._worstPrice) pos._worstPrice = bar.low;
        } else {
          if (bar.low < pos._bestPrice) pos._bestPrice = bar.low;
          if (bar.high > pos._worstPrice) pos._worstPrice = bar.high;
        }

        // Evaluate Exit components in priority order
        let closed = false;
        let closePrice = 0;
        let closeReason = '';
        let addRemainingPnl = true;

        for (const exit of (activeLane.exits || [])) {
          if (closed) break;
          const result = exit.evaluateBar(pos, bar, t, activeLane.runtime.signals, cfg);

          if (result.type === 'close') {
            closePrice = result.price;
            closeReason = result.reason;
            closed = true;
            addRemainingPnl = true;

          } else if (result.type === 'partial') {
            // Execute partial exit (engine handles accounting)
            const exitQtyPct = result.qtyPct;
            const exitLots = pos.originalLots * (exitQtyPct / 100);
            const exitPrice = result.price;
            const priceDiff = isLong ? (exitPrice - pos.entryPrice) : (pos.entryPrice - exitPrice);
            const partialPnl = priceDiff * cfg.value_per_unit * exitLots;
            const partialCost = cfg.commission_per_side + cfg.spread * cfg.value_per_unit * exitLots / 2;
            const netPartialPnl = partialPnl - partialCost;

            pos.remainingQtyPct -= exitQtyPct;
            pos.lots = pos.originalLots * (pos.remainingQtyPct / 100);

            pos.partialExits.push({
              bar: t, timestamp: bar.timestamp,
              price: exitPrice, qtyPct: exitQtyPct,
              lots: exitLots, pnl: netPartialPnl, label: result.label,
            });
            equity += netPartialPnl;

            // Apply pending stage change from Exit component
            if (result.pendingStageChange) {
              pos.pendingStageChange = result.pendingStageChange;
            }

            // Fully closed via partials (e.g. TP3 exits remaining)
            if (pos.remainingQtyPct <= 0) {
              closed = true;
              closeReason = result.label + ' (full exit)';
              closePrice = exitPrice;
              addRemainingPnl = false; // already accounted in partial
            }
          }
        }

        if (closed) {
          // Remaining-lots PnL (only if not fully exited via partials)
          const remainLots = pos.lots;
          if (addRemainingPnl && remainLots > 0) {
            const priceDiff = isLong ? (closePrice - pos.entryPrice) : (pos.entryPrice - closePrice);
            const remainPnl = priceDiff * cfg.value_per_unit * remainLots;
            const remainCost = cfg.commission_per_side + cfg.spread * cfg.value_per_unit * remainLots / 2;
            equity += remainPnl - remainCost;
          }

          // Build trade record with universal analytics
          _pushTradeRecord(trades, pos, closePrice, closeReason, t, bar, cfg, addRemainingPnl);
          pos = null;
        }
      }

      _upsertEquityPoint(equityCurve, { bar: t, equity, timestamp: bar.timestamp });
    }

    // Close remaining position at end of data
    if (pos !== null) {
      const lastBar = bars[bars.length - 1];
      const isLong = pos.direction === 'LONG';
      const remainLots = pos.lots;
      if (remainLots > 0) {
        const pd = isLong ? (lastBar.close - pos.entryPrice) : (pos.entryPrice - lastBar.close);
        const rc = cfg.commission_per_side + cfg.spread * cfg.value_per_unit * remainLots / 2;
        equity += pd * cfg.value_per_unit * remainLots - rc;
      }
      _pushTradeRecord(trades, pos, lastBar.close, 'End of data', bars.length - 1, lastBar, cfg, true);
      _upsertEquityPoint(equityCurve, { bar: bars.length - 1, equity, timestamp: lastBar.timestamp });
    }

    const metrics = calcMetrics(trades, equityCurve, cfg);

    return {
      trades,
      equityCurve,
      metrics,
      signals: signals.entry || [],
      indicators,
      stageSignals: { ...signals },
      stageReport: _aggregateStageReports(lanes),
      stageComponents: components.stageSummary || {},
      runtimeMeta: {
        stageComponents: components.stageSummary || {},
        branchLanes: lanes.map((lane) => ({
          id: lane.id,
          label: lane.label,
          nodeIds: lane.nodeIds || [],
          stageReport: lane.stageReport,
        })),
      },
      maClose: indicators.maClose,
      maOpen:  indicators.maOpen,
      config: cfg,
    };
  }


  // ═══════════════════════════════════════════
  // Trade record builder (universal analytics)
  // ═══════════════════════════════════════════
  function _pushTradeRecord(trades, pos, closePrice, closeReason, exitBar, exitBarObj, cfg, addRemainingPnl) {
    const isLong = pos.direction === 'LONG';
    const totalPartialPnl = pos.partialExits.reduce((s, pe) => s + pe.pnl, 0);
    let finalRemainPnl = 0;
    const remainLots = pos.lots;
    if (addRemainingPnl && remainLots > 0) {
      const pd = isLong ? (closePrice - pos.entryPrice) : (pos.entryPrice - closePrice);
      const rc = cfg.commission_per_side + cfg.spread * cfg.value_per_unit * remainLots / 2;
      finalRemainPnl = pd * cfg.value_per_unit * remainLots - rc;
    }
    const totalNetPnl = totalPartialPnl + finalRemainPnl;

    const stopDist = pos.stopDistance || 0;
    const riskPerR = stopDist * cfg.value_per_unit * pos.originalLots;
    const mfeDist = isLong ? pos._bestPrice - pos.entryPrice : pos.entryPrice - pos._bestPrice;
    const maeDist = isLong ? pos.entryPrice - pos._worstPrice : pos._worstPrice - pos.entryPrice;
    const mfeR = riskPerR > 0 ? (mfeDist * cfg.value_per_unit * pos.originalLots) / riskPerR : 0;
    const maeR = riskPerR > 0 ? (maeDist * cfg.value_per_unit * pos.originalLots) / riskPerR : 0;
    const pnlInR = riskPerR > 0 ? totalNetPnl / riskPerR : 0;
    const initialRR = (stopDist > 0 && pos.tp1 != null) ? Math.abs(pos.tp1 - pos.entryPrice) / stopDist : 0;

    trades.push({
      id: pos.id,
      laneId: pos.laneId || null,
      laneLabel: pos.laneLabel || null,
      direction: pos.direction,
      entryPrice: pos.entryPrice,
      entryBar: pos.entryBar,
      entryTimestamp: pos.entryTimestamp,
      exitPrice: closePrice,
      exitBar: exitBar,
      exitTimestamp: exitBarObj.timestamp,
      exitReason: closeReason,
      originalLots: pos.originalLots,
      finalStage: pos.stage,
      partialExits: pos.partialExits,
      netPnl: totalNetPnl,
      grossPnl: totalNetPnl + pos.entryCost + cfg.commission_per_side,
      totalCost: pos.entryCost + cfg.commission_per_side,
      sl0: pos.sl0,
      tp1: pos.tp1,
      tp2: pos.tp2,
      tp3: pos.tp3,
      barsHeld: exitBar - pos.entryBar,
      stopDistance: stopDist,
      initialRR: initialRR,
      pnlInR: pnlInR,
      mfe: mfeR,
      mae: maeR,
      tp1Hit: pos.partialExits.some(pe => pe.label === 'TP1'),
      tp2Hit: pos.partialExits.some(pe => pe.label === 'TP2'),
    });
  }


  // ═══════════════════════════════════════════
  // Backward-compatible wrapper
  // ═══════════════════════════════════════════
  // Creates OC Cross components from flat config and delegates
  // to the generic component-driven engine.

  function runBacktest(bars, config) {
    const cfg = {
      alma_len: 6, alma_offset: 0.85, alma_sigma: 5, delay_offset: 0,
      risk_pct: 1.0, sl_pct: 0.5,
      tp1_pct: 1.0, tp2_pct: 1.5, tp3_pct: 2.0,
      tp1_qty: 50, tp2_qty: 30, tp3_qty: 20,
      ratchet_after_tp2: 'TP1', conflict_policy: 'SL_FIRST', stage_effective: 'NEXT_BAR',
      initial_capital: 100000, commission_per_side: 3.50,
      spread: 0.30, slippage: 0.10, value_per_unit: 100,
      ...config,
    };

    // If ComponentLib is available, use component-driven engine
    if (typeof ComponentLib !== 'undefined') {
      const components = ComponentLib.getOCCrossDefaults(cfg);
      const accountConfig = {
        initial_capital: cfg.initial_capital,
        commission_per_side: cfg.commission_per_side,
        spread: cfg.spread,
        slippage: cfg.slippage,
        value_per_unit: cfg.value_per_unit,
      };
      return runWithComponents(bars, components, accountConfig);
    }

    // Fallback: if ComponentLib not loaded, use legacy inline logic
    return _runLegacyBacktest(bars, cfg);
  }

  // Legacy inline engine (kept as fallback if component-lib.js is not loaded)
  function _runLegacyBacktest(bars, cfg) {
    if (!bars || bars.length < 20) {
      return { trades: [], equityCurve: [], metrics: {}, signals: [], error: 'Insufficient data (need >= 20 bars)' };
    }
    const { signals, maClose, maOpen } = detectCrossSignals(bars, cfg);
    let equity = cfg.initial_capital;
    const equityCurve = [{ bar: 0, equity, timestamp: bars[0].timestamp }];
    const trades = [];
    let tradeId = 0;
    let pos = null;

    for (let t = 1; t < bars.length; t++) {
      const bar = bars[t];
      if (pos === null && t >= 2) {
        const sig = signals[t - 1];
        if (sig !== 0) {
          const direction = sig > 0 ? 'LONG' : 'SHORT';
          const entryPrice = bar.open + (sig > 0 ? cfg.slippage : -cfg.slippage);
          const isL = direction === 'LONG';
          const sl0 = isL ? entryPrice * (1 - cfg.sl_pct / 100) : entryPrice * (1 + cfg.sl_pct / 100);
          const riskDollar = equity * 0.01;
          const slDist = entryPrice * (cfg.sl_pct / 100);
          const effSl = slDist + cfg.spread + cfg.slippage;
          const lots = effSl > 0 ? Math.max(0.01, Math.round(riskDollar / (effSl * cfg.value_per_unit) * 100) / 100) : 0;
          if (lots > 0) {
            pos = {
              id: ++tradeId, direction, entryPrice, entryBar: t, entryTimestamp: bar.timestamp,
              lots, originalLots: lots, remainingQtyPct: 100,
              sl: sl0, sl0,
              tp1: isL ? entryPrice*(1+cfg.tp1_pct/100) : entryPrice*(1-cfg.tp1_pct/100),
              tp2: isL ? entryPrice*(1+cfg.tp2_pct/100) : entryPrice*(1-cfg.tp2_pct/100),
              tp3: isL ? entryPrice*(1+cfg.tp3_pct/100) : entryPrice*(1-cfg.tp3_pct/100),
              stage: 0, pendingStageChange: null, partialExits: [],
              entryCost: cfg.commission_per_side + cfg.spread * cfg.value_per_unit * lots / 2,
              stopDistance: Math.abs(entryPrice - sl0),
              _bestPrice: entryPrice, _worstPrice: entryPrice,
            };
          }
        }
      }
      if (pos !== null) {
        const isLong = pos.direction === 'LONG';
        if (isLong) { if (bar.high > pos._bestPrice) pos._bestPrice = bar.high; if (bar.low < pos._worstPrice) pos._worstPrice = bar.low; }
        else { if (bar.low < pos._bestPrice) pos._bestPrice = bar.low; if (bar.high > pos._worstPrice) pos._worstPrice = bar.high; }
        if (pos.pendingStageChange !== null) {
          pos.stage = pos.pendingStageChange.newStage;
          if (isLong) { if (pos.pendingStageChange.newSl > pos.sl) pos.sl = pos.pendingStageChange.newSl; }
          else { if (pos.pendingStageChange.newSl < pos.sl) pos.sl = pos.pendingStageChange.newSl; }
          pos.pendingStageChange = null;
        }
        let closed = false, closePrice = 0, closeReason = '';
        let tpTarget = null, tpPct = 0;
        if (pos.stage === 0) { tpTarget = pos.tp1; tpPct = cfg.tp1_qty; }
        else if (pos.stage === 1) { tpTarget = pos.tp2; tpPct = cfg.tp2_qty; }
        else if (pos.stage === 2) { tpTarget = pos.tp3; tpPct = cfg.tp3_qty; }
        const tpHit = tpTarget !== null && ((isLong && bar.high >= tpTarget) || (!isLong && bar.low <= tpTarget));
        const slHit = (isLong && bar.low <= pos.sl) || (!isLong && bar.high >= pos.sl);
        if (tpHit && slHit) { closePrice = pos.sl; closeReason = 'SL (conflict SL_FIRST)'; closed = true; }
        else if (slHit) { closePrice = pos.sl; closeReason = `SL (Stage ${pos.stage})`; closed = true; }
        else if (tpHit && pos.stage <= 2) {
          const exitLots = pos.originalLots * (tpPct / 100);
          const pd = isLong ? (tpTarget - pos.entryPrice) : (pos.entryPrice - tpTarget);
          const net = pd * cfg.value_per_unit * exitLots - cfg.commission_per_side - cfg.spread * cfg.value_per_unit * exitLots / 2;
          pos.remainingQtyPct -= tpPct; pos.lots = pos.originalLots * (pos.remainingQtyPct / 100);
          const lbl = pos.stage === 0 ? 'TP1' : pos.stage === 1 ? 'TP2' : 'TP3';
          pos.partialExits.push({ bar: t, timestamp: bar.timestamp, price: tpTarget, qtyPct: tpPct, lots: exitLots, pnl: net, label: lbl });
          equity += net;
          if (pos.stage === 0) { const buf = cfg.spread + cfg.slippage + cfg.commission_per_side / (cfg.value_per_unit * pos.lots || 1); pos.pendingStageChange = { newStage: 1, newSl: isLong ? pos.entryPrice + buf : pos.entryPrice - buf }; }
          else if (pos.stage === 1) { pos.pendingStageChange = { newStage: 2, newSl: pos.tp1 }; }
          if (pos.stage === 2 || pos.remainingQtyPct <= 0) { closed = true; closeReason = lbl + ' (full exit)'; closePrice = tpTarget; }
        }
        if (!closed && signals[t] !== 0) {
          const sigDir = signals[t] > 0 ? 'LONG' : 'SHORT';
          if (sigDir !== pos.direction) { closePrice = bar.close; closeReason = 'Reversal signal'; closed = true; }
        }
        if (closed) {
          const rl = pos.lots;
          if (rl > 0 && !closeReason.includes('full exit')) {
            const pd2 = isLong ? (closePrice - pos.entryPrice) : (pos.entryPrice - closePrice);
            equity += pd2 * cfg.value_per_unit * rl - cfg.commission_per_side - cfg.spread * cfg.value_per_unit * rl / 2;
          }
          _pushTradeRecord(trades, pos, closePrice, closeReason, t, bar, cfg, !closeReason.includes('full exit'));
          pos = null;
        }
      }
      _upsertEquityPoint(equityCurve, { bar: t, equity, timestamp: bar.timestamp });
    }
    if (pos !== null) {
      const lb = bars[bars.length - 1]; const isL = pos.direction === 'LONG'; const rl = pos.lots;
      if (rl > 0) { equity += (isL ? lb.close - pos.entryPrice : pos.entryPrice - lb.close) * cfg.value_per_unit * rl - cfg.commission_per_side - cfg.spread * cfg.value_per_unit * rl / 2; }
      _pushTradeRecord(trades, pos, lb.close, 'End of data', bars.length - 1, lb, cfg, true);
      _upsertEquityPoint(equityCurve, { bar: bars.length - 1, equity, timestamp: lb.timestamp });
    }
    return { trades, equityCurve, metrics: calcMetrics(trades, equityCurve, cfg), signals, maClose, maOpen, config: cfg };
  }

  // ═══════════════════════════════════════════
  // Metrics Calculator
  // ═══════════════════════════════════════════
  const _MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

  function _toTimestampMs(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function _sampleStd(values) {
    if (!Array.isArray(values) || values.length < 2) return 0;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
    return Math.sqrt(Math.max(0, variance));
  }

  function _inferMedianStepMs(equityCurve) {
    const deltas = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prevTs = _toTimestampMs(equityCurve[i - 1].timestamp);
      const curTs = _toTimestampMs(equityCurve[i].timestamp);
      if (prevTs == null || curTs == null) continue;
      const delta = curTs - prevTs;
      if (delta > 0) deltas.push(delta);
    }
    if (!deltas.length) return null;
    deltas.sort((a, b) => a - b);
    return deltas[Math.floor(deltas.length / 2)];
  }

  function _inferPeriodsPerYear(equityCurve) {
    const stepMs = _inferMedianStepMs(equityCurve);
    if (!stepMs || stepMs <= 0) return 252;
    return Math.max(1, _MS_PER_YEAR / stepMs);
  }

  function _inferYearsInData(equityCurve) {
    if (!Array.isArray(equityCurve) || equityCurve.length < 2) return 0;
    const firstTs = _toTimestampMs(equityCurve[0].timestamp);
    const lastTs = _toTimestampMs(equityCurve[equityCurve.length - 1].timestamp);
    if (firstTs != null && lastTs != null && lastTs > firstTs) {
      return (lastTs - firstTs) / _MS_PER_YEAR;
    }
    const stepMs = _inferMedianStepMs(equityCurve);
    if (stepMs && stepMs > 0) {
      return ((equityCurve.length - 1) * stepMs) / _MS_PER_YEAR;
    }
    return 0;
  }

  function _calcSharpeFromEquityCurve(equityCurve) {
    if (!Array.isArray(equityCurve) || equityCurve.length < 3) return 0;
    const periodReturns = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prevEquity = equityCurve[i - 1].equity;
      const curEquity = equityCurve[i].equity;
      if (!Number.isFinite(prevEquity) || !Number.isFinite(curEquity) || prevEquity <= 0) continue;
      periodReturns.push((curEquity - prevEquity) / prevEquity);
    }
    if (periodReturns.length < 2) return 0;
    const meanRet = periodReturns.reduce((sum, value) => sum + value, 0) / periodReturns.length;
    const stdRet = _sampleStd(periodReturns);
    if (stdRet <= 0) return 0;
    const annualFactor = Math.sqrt(_inferPeriodsPerYear(equityCurve));
    const sharpe = (meanRet / stdRet) * annualFactor;
    return Number.isFinite(sharpe) ? sharpe : 0;
  }

  function calcMetrics(trades, equityCurve, config) {
    const totalTrades = trades.length;
    if (totalTrades === 0) {
      return {
        total_trades: 0, win_rate: 0, profit_factor: 0, sharpe: 0,
        max_dd_pct: 0, max_dd_usd: 0, net_profit: 0, gross_profit: 0,
        gross_loss: 0, avg_trade: 0, avg_winner: 0, avg_loser: 0,
        max_consec_wins: 0, max_consec_losses: 0, calmar_ratio: 0,
        annual_return: 0, total_commission: 0, expectancy: 0,
        tuw_bars: 0, return_over_max_dd: 0,
        long_trades: 0, short_trades: 0, long_win_rate: 0, short_win_rate: 0,
        avg_bars_held: 0, avg_bars_winner: 0, avg_bars_loser: 0,
        stage_distribution: { stage0: 0, stage1: 0, stage2: 0, stage3: 0 },
      };
    }

    const winners = trades.filter(t => t.netPnl > 0);
    const losers = trades.filter(t => t.netPnl <= 0);
    const longs = trades.filter(t => t.direction === 'LONG');
    const shorts = trades.filter(t => t.direction === 'SHORT');
    const longWins = longs.filter(t => t.netPnl > 0);
    const shortWins = shorts.filter(t => t.netPnl > 0);

    const grossProfit = winners.reduce((s, t) => s + t.netPnl, 0);
    const grossLoss = Math.abs(losers.reduce((s, t) => s + t.netPnl, 0));
    const netProfit = grossProfit - grossLoss;
    const totalCost = trades.reduce((s, t) => s + t.totalCost, 0);

    const winRate = winners.length / totalTrades;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const avgTrade = netProfit / totalTrades;
    const avgWinner = winners.length > 0 ? grossProfit / winners.length : 0;
    const avgLoser = losers.length > 0 ? -grossLoss / losers.length : 0;

    // Consecutive wins/losses
    let maxConsecWins = 0, maxConsecLosses = 0, curWins = 0, curLosses = 0;
    trades.forEach(t => {
      if (t.netPnl > 0) { curWins++; curLosses = 0; maxConsecWins = Math.max(maxConsecWins, curWins); }
      else { curLosses++; curWins = 0; maxConsecLosses = Math.max(maxConsecLosses, curLosses); }
    });

    // Max drawdown from equity curve
    let peak = -Infinity, maxDDusd = 0, maxDDpct = 0;
    let tuwStart = 0, tuwMax = 0;
    equityCurve.forEach((p, i) => {
      if (p.equity > peak) {
        peak = p.equity;
        tuwStart = i;
      }
      const dd = peak - p.equity;
      const ddPct = peak > 0 ? dd / peak : 0;
      if (dd > maxDDusd) maxDDusd = dd;
      if (ddPct > maxDDpct) maxDDpct = ddPct;
      const tuw = i - tuwStart;
      if (tuw > tuwMax) tuwMax = tuw;
    });

    // Sharpe ratio and annual return are both derived from the equity curve timing,
    // so they stay consistent across Dukascopy/synthetic data and across timeframes.
    const sharpe = _calcSharpeFromEquityCurve(equityCurve);

    const initialEquity = Number.isFinite(config.initial_capital) ? config.initial_capital : (equityCurve[0] ? equityCurve[0].equity : 0);
    const endingEquity = equityCurve.length ? equityCurve[equityCurve.length - 1].equity : initialEquity;
    const totalReturn = initialEquity > 0 ? (endingEquity - initialEquity) / initialEquity : 0;
    const yearsInData = Math.max(1 / 365.25, _inferYearsInData(equityCurve));
    const annualReturn = initialEquity > 0 && endingEquity > 0
      ? Math.pow(endingEquity / initialEquity, 1 / yearsInData) - 1
      : -1;

    const calmar = maxDDpct > 0 ? annualReturn / maxDDpct : 0;

    // Stage distribution
    const stageDist = { stage0: 0, stage1: 0, stage2: 0, stage3: 0 };
    trades.forEach(t => {
      const key = 'stage' + t.finalStage;
      if (stageDist[key] !== undefined) stageDist[key]++;
    });

    // Average bars held
    const avgBarsHeld = trades.reduce((s, t) => s + t.barsHeld, 0) / totalTrades;
    const avgBarsWinner = winners.length > 0 ? winners.reduce((s, t) => s + t.barsHeld, 0) / winners.length : 0;
    const avgBarsLoser = losers.length > 0 ? losers.reduce((s, t) => s + t.barsHeld, 0) / losers.length : 0;

    return {
      total_trades: totalTrades,
      win_rate: winRate,
      profit_factor: profitFactor,
      sharpe: isFinite(sharpe) ? sharpe : 0,
      max_dd_pct: maxDDpct,
      max_dd_usd: maxDDusd,
      net_profit: netProfit,
      gross_profit: grossProfit,
      gross_loss: grossLoss,
      avg_trade: avgTrade,
      avg_winner: avgWinner,
      avg_loser: avgLoser,
      max_consec_wins: maxConsecWins,
      max_consec_losses: maxConsecLosses,
      calmar_ratio: isFinite(calmar) ? calmar : 0,
      annual_return: isFinite(annualReturn) ? annualReturn : 0,
      total_commission: totalCost,
      expectancy: avgTrade,
      tuw_bars: tuwMax,
      return_over_max_dd: maxDDpct > 0 ? totalReturn / maxDDpct : 0,
      long_trades: longs.length,
      short_trades: shorts.length,
      long_win_rate: longs.length > 0 ? longWins.length / longs.length : 0,
      short_win_rate: shorts.length > 0 ? shortWins.length / shorts.length : 0,
      avg_bars_held: avgBarsHeld,
      avg_bars_winner: avgBarsWinner,
      avg_bars_loser: avgBarsLoser,
      stage_distribution: stageDist,
    };
  }

  // ═══════════════════════════════════════════
  // Synthetic 15m OHLC Data Generator
  // ═══════════════════════════════════════════
  function generateSyntheticBars(numBars, startPrice, symbol) {
    numBars = numBars || 2000;
    startPrice = startPrice || 2650;  // Gold ~$2650

    // Geometric Brownian Motion parameters tuned for gold 15m
    const mu = 0.00001;    // slight drift
    const sigma = 0.0018;  // volatility per bar (~0.18%)
    const dt = 1;

    const bars = [];
    let price = startPrice;
    // Start from a realistic date
    let ts = new Date('2025-01-02T00:00:00Z').getTime();
    const barMs = 15 * 60 * 1000; // 15 minutes

    for (let i = 0; i < numBars; i++) {
      const drift = (mu - 0.5 * sigma * sigma) * dt;
      const diffusion = sigma * Math.sqrt(dt) * _randn();
      const ret = Math.exp(drift + diffusion);

      const open = price;
      // Intra-bar movement
      const move1 = open * (1 + _randn() * sigma * 0.5);
      const move2 = open * (1 + _randn() * sigma * 0.5);
      const high = Math.max(open, move1, move2) * (1 + Math.abs(_randn()) * sigma * 0.3);
      const low = Math.min(open, move1, move2) * (1 - Math.abs(_randn()) * sigma * 0.3);
      const close = open * ret;

      bars.push({
        timestamp: new Date(ts).toISOString(),
        open: _round(open, 2),
        high: _round(Math.max(high, open, close), 2),
        low: _round(Math.min(low, open, close), 2),
        close: _round(close, 2),
        volume: Math.floor(Math.random() * 5000 + 1000),
      });

      price = close;
      ts += barMs;

      // Skip weekends (Sat/Sun)
      const d = new Date(ts);
      if (d.getUTCDay() === 6) ts += 2 * 24 * 60 * 60 * 1000;
      else if (d.getUTCDay() === 0) ts += 1 * 24 * 60 * 60 * 1000;
    }

    return bars;
  }

  // Box-Muller transform for normal distribution
  function _randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function _round(v, dp) {
    const f = Math.pow(10, dp);
    return Math.round(v * f) / f;
  }

  // ═══════════════════════════════════════════
  // Extract strategy config from blueprint
  // ═══════════════════════════════════════════
  // Component type mapping: resolve node type to its role using
  // ComponentLib canonical specs or CENTRAL_COMPONENTS fallback.
  // This enables reusability: any Trigger component with the right
  // params will feed into the engine, not just oc-cross-trigger.

  const _ROLE_PARAM_MAP = {
    // Role → list of param keys this role can provide
    Trigger: ['alma_len', 'alma_offset', 'alma_sigma', 'delay_offset', 'fast', 'slow'],
    Factor:  ['alma_len', 'alma_offset', 'alma_sigma', 'source', 'window'],
    Regime:  ['atr_1h_period', 'ema50_period', 'trend_threshold'],
    Setup:   ['pullback_window', 'window'],
    Filter:  ['window', 'min_atr_pct', 'max_body_atr'],
    Scoring: ['min_score', 'lookback', 'method', 'weights'],
    Entry:   ['confirmation_bars', 'type', 'offset_ticks', 'max_entries'],
    Risk:    ['risk_pct', 'sl_pct'],
    Exit:    ['tp1_pct', 'tp2_pct', 'tp3_pct', 'tp1_qty', 'tp2_qty', 'tp3_qty',
              'ratchet_mode', 'conflict_policy', 'stage_effective'],
    Foundation: ['timeframe', 'instrument', 'source', 'tf_regime', 'tf_exec', 'start_date', 'end_date', 'bar_count'],
    Execution: ['entry_buffer_bps', 'allow_short', 'allow_long'],
  };

  function _resolveNodeRole(node) {
    if (typeof ComponentLib !== 'undefined' && typeof ComponentLib.getComponentSpec === 'function') {
      const spec = ComponentLib.getComponentSpec(node.type);
      if (spec) return spec.type;
    }
    // 1) Check CENTRAL_COMPONENTS registry
    if (typeof CENTRAL_COMPONENTS !== 'undefined') {
      const comp = CENTRAL_COMPONENTS.find(c => c.component_id === node.type);
      if (comp) return comp.type; // 'Trigger', 'Risk', 'Exit', etc.
    }
    // 2) Guess from node type string
    const t = (node.type || '').toLowerCase();
    if (t.includes('trigger') || t.includes('cross')) return 'Trigger';
    if (t.includes('risk') || t.includes('sizer')) return 'Risk';
    if (t.includes('exit') || t.includes('tp') || t.includes('sl') || t.includes('ratchet')) return 'Exit';
    if (t.includes('factor') || t.includes('alma') || t.includes('sma') || t.includes('ema')) return 'Factor';
    if (t === 'data_feed' || t === 'data_scope') return 'Foundation';
    return null;
  }

  function _collectBlueprintRoleEntries(blueprint) {
    const pipeline = blueprint && blueprint.pipeline ? blueprint.pipeline : null;
    const entries = [];

    if (pipeline) {
      const stageAwareRoleMap = [
        ['Foundation', pipeline.foundationEntries],
        ['Factor', pipeline.factorEntries],
        ['Regime', pipeline.regimeEntries],
        ['Setup', pipeline.setupEntries],
        ['Trigger', pipeline.triggerEntries],
        ['Filter', pipeline.filterEntries],
        ['Scoring', pipeline.scoringEntries],
        ['Entry', pipeline.entryEntries],
        ['Exit', pipeline.exitEntries],
        ['Risk', pipeline.riskEntries],
        ['Execution', pipeline.executionEntries],
      ];

      for (const [role, list] of stageAwareRoleMap) {
        for (const entry of list || []) {
          if (!entry || !entry.component_id) continue;
          entries.push({ role, component_id: entry.component_id, params: entry.params || {} });
        }
      }

      if (entries.length > 0) return entries;
    }

    if (!blueprint || !Array.isArray(blueprint.nodes)) return entries;

    for (const node of blueprint.nodes) {
      entries.push({
        role: _resolveNodeRole(node),
        component_id: node.type,
        params: node.params || {},
        node,
      });
    }

    return entries;
  }

  function extractStrategyConfig(blueprint) {
    if (!blueprint) return {};
    const cfg = {};
    const entries = _collectBlueprintRoleEntries(blueprint);

    for (const entry of entries) {
      const role = entry.role;
      const params = entry.params || {};

      // Merge all params from each node into cfg, keyed by param name
      // This allows ANY component with the right param names to feed the engine
      if (role) {
        const allowedKeys = _ROLE_PARAM_MAP[role] || [];
        for (const key of allowedKeys) {
          if (params[key] !== undefined && params[key] !== null) {
            cfg[key] = params[key];
          }
        }
      }

      // Special: ratchet_mode → ratchet_after_tp2
      if (params.ratchet_mode) cfg.ratchet_after_tp2 = params.ratchet_mode;
    }

    for (const node of (blueprint.nodes || [])) {
      if (node.type === 'data_feed') {
        const params = node.params || {};
        cfg.timeframe = params.timeframe || cfg.timeframe || '15m';
        cfg.instrument = params.instrument || cfg.instrument || 'XAUUSD';
      }
    }

    return cfg;
  }

  // ═══════════════════════════════════════════
  // Validate blueprint completeness
  // ═══════════════════════════════════════════
  function validateBlueprint(blueprint) {
    const result = { valid: false, errors: [], warnings: [], components: {} };
    if (!blueprint || !blueprint.nodes || blueprint.nodes.length === 0) {
      result.errors.push('Blueprint is empty — no components found.');
      return result;
    }

    const roles = {};
    for (const entry of _collectBlueprintRoleEntries(blueprint)) {
      const role = entry.role;
      if (role) {
        if (!roles[role]) roles[role] = [];
        roles[role].push(entry);
      }
    }
    result.components = roles;

    if ((!roles.Trigger || roles.Trigger.length === 0) && (!roles.Entry || roles.Entry.length === 0)) {
      result.errors.push('Missing Trigger/Entry components — need at least one signal generator or entry rule.');
    }
    if (!roles.Risk || roles.Risk.length === 0) {
      result.warnings.push('No Risk/Position Sizing component — will use default 1% equity risk.');
    }
    if (!roles.Exit || roles.Exit.length === 0) {
      result.warnings.push('No Exit component — will use default TP ladder (1%/1.5%/2%) and SL ratchet.');
    }
    if (!roles.Entry || roles.Entry.length === 0) {
      result.warnings.push('No explicit Entry stage — engine will promote the latest scored/filtered/trigger signal into final entry.');
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  // ═══════════════════════════════════════════
  // Drawdown series from equity curve
  // ═══════════════════════════════════════════
  function calcDrawdownSeries(equityCurve) {
    const dd = [];
    let peak = -Infinity;
    for (const p of equityCurve) {
      if (p.equity > peak) peak = p.equity;
      const drawdown = peak > 0 ? (p.equity - peak) / peak * 100 : 0;
      dd.push({ bar: p.bar, timestamp: p.timestamp, drawdown });
    }
    return dd;
  }

  // ═══════════════════════════════════════════
  // Public API
  // ═══════════════════════════════════════════
  return {
    // Core engine
    runWithComponents,   // NEW: generic component-driven backtest
    runBacktest,         // Backward-compatible OC Cross wrapper

    // Utilities
    calcMetrics,
    calcALMA,
    detectCrossSignals,
    generateSyntheticBars,
    extractStrategyConfig,
    validateBlueprint,
    calcDrawdownSeries,
  };
})();

if (typeof window !== 'undefined') window.BacktestEngine = BacktestEngine;
