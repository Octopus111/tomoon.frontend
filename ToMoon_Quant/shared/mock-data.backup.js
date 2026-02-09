/**
 * ToMoon Quant — Mock Data
 * Realistic demo data for all pages (no backend required)
 */

const MOCK = (() => {
  const rnd = (a, b) => Math.random() * (b - a) + a;
  const rndi = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = arr => arr[rndi(0, arr.length - 1)];
  const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  const money = n => (n >= 0 ? '+' : '-') + '$' + Math.abs(n).toFixed(2);
  const pct = n => (n * 100).toFixed(1) + '%';

  /* ── Strategies (Registry) ── */
  const STATUSES = ['Idea','Spec','Backtest','PassedQA','Paper','Live','Retired'];
  const OWNERS   = ['Eddie','Quant-1','Quant-2'];
  const MARKETS  = ['CME_ES','CME_MES','BTC_PERP','XAUUSD_CFD'];
  const NAMES    = [
    'Pullback Continuation','Delta Divergence','Volume Exhaustion',
    'Sweep Reclaim','Momentum Breakout','Range Fade','Opening Drive',
    'Absorption Reversal','HTF Confluence','Micro Scalp'
  ];

  function genStrategy(i) {
    const status = pick(STATUSES);
    const sharpe = rnd(-0.3, 3.2);
    const maxDD  = -rnd(2, 18);
    return {
      strategy_id: `STR-${String(i).padStart(3,'0')}`,
      name: pick(NAMES),
      version: `v0.${rndi(1,9)}`,
      status,
      owner: pick(OWNERS),
      market_id: pick(MARKETS),
      last_run_id: `RUN-${uid()}`,
      last_dataset_id: `DS-${uid()}`,
      sharpe: sharpe,
      max_dd: maxDD,
      annual_return: rnd(-5, 45),
      trades: rndi(40, 800),
      profit_factor: rnd(0.6, 2.8),
      win_rate: rnd(0.35, 0.72),
      last_updated: new Date(Date.now() - rndi(0, 30) * 86400000).toISOString().slice(0, 10),
      decision_notes: status === 'Retired' ? 'Sharpe below threshold after regime shift' : '',
      gate_0: status !== 'Idea',
      gate_1: ['PassedQA','Paper','Live','Retired'].includes(status),
      gate_2: ['Live','Retired'].includes(status),
    };
  }

  const strategies = Array.from({ length: 18 }, (_, i) => genStrategy(i + 1));

  /* ── Components (Alpha Library) ── */
  const COMP_TYPES = ['Setup','Factor','Trigger','Filter','Entry','Exit','Risk'];
  const COMP_NAMES = {
    Setup:   ['Liquidity Sweep Zone','HTF Supply/Demand','Opening Range'],
    Factor:  ['trade_rate','delta','vol_proxy','CVD slope','bid_ask_imbalance','vwap_dev'],
    Trigger: ['Delta divergence trigger','Sweep reclaim trigger','Volume spike trigger'],
    Filter:  ['Session time filter','Regime filter','Spread filter','Correlation filter'],
    Entry:   ['Limit at level','Market on confirm','Scale-in plan'],
    Exit:    ['Partial at 1R','Trailing structure','Time-based exit'],
    Risk:    ['Fixed $ risk','ATR-based sizing','Vol-scaled position'],
  };

  const COMP_LOGIC = {
    Setup: {
      'Liquidity Sweep Zone': 'Define sweep zone as last swing high/low ± threshold. Mark active when stop-run wick exceeds threshold and closes back inside zone.',
      'HTF Supply/Demand': 'Detect higher-timeframe imbalance zones; keep most recent unmitigated zones; invalidate when fully traded through.',
      'Opening Range': 'Compute OR high/low for the first N minutes; expose OR range and breakout levels for downstream triggers/entries.',
    },
    Factor: {
      trade_rate: 'Compute trades-per-second over rolling window; normalize by session baseline; output series.',
      delta: 'Aggregate aggressor delta per bar; maintain rolling delta; output series for divergence / momentum checks.',
      vol_proxy: 'Estimate realized volatility from 1s returns over rolling window; output series and percentiles.',
      'CVD slope': 'Build CVD from delta; compute slope over window; output series for trend/flow regime detection.',
      bid_ask_imbalance: 'Estimate bid/ask imbalance proxy from trade prints; smooth over window; output series.',
      vwap_dev: 'Compute VWAP and deviation (price - VWAP) normalized by vol; output series.',
    },
    Trigger: {
      'Delta divergence trigger': 'Fire when price makes HH/LL but delta fails (lower high / higher low) with confirmation close.',
      'Sweep reclaim trigger': 'Fire when sweep occurs beyond zone then reclaims level within M seconds; attach direction and level.',
      'Volume spike trigger': 'Fire when volume proxy exceeds threshold percentile and price breaks micro-structure level.',
    },
    Filter: {
      'Session time filter': 'Allow signals only inside configured session window (RTH/ETH). Enforce daily cut alignment.',
      'Regime filter': 'Allow/score signals only when market regime ∈ allowed set with confidence ≥ min.',
      'Spread filter': 'Reject signals when spread (or proxy) exceeds threshold; prevents low-liquidity fills.',
      'Correlation filter': 'Downscore/disable when correlated exposure exceeds limit; prevents clustered risk.',
    },
    Entry: {
      'Limit at level': 'Place limit at reclaimed level with offset ticks; cancel if not filled within TTL; attach client_order_id.',
      'Market on confirm': 'Submit market after confirmation close with fixed latency model; enforce min tick/lot and session rules.',
      'Scale-in plan': 'Enter in tranches at predefined levels; stop adding after max adds; compute blended stop.',
    },
    Exit: {
      'Partial at 1R': 'Take partial at +1R; move stop to breakeven after fill; keep runner with trailing rule.',
      'Trailing structure': 'Trail stop behind swing structure; widen/lock based on volatility regime; no look-ahead.',
      'Time-based exit': 'Exit after max hold time or at session end; ensure liquidation before daily cut.',
    },
    Risk: {
      'Fixed $ risk': 'Size position so worst-case stop distance equals fixed $ risk; cap by max size and risk budget.',
      'ATR-based sizing': 'Use ATR/vol proxy to set stop distance and size; normalize across instruments.',
      'Vol-scaled position': 'Scale exposure inversely with realized vol; clamp to min/max; integrates with risk budget.',
    }
  };

  function genComponent(i) {
    const type = pick(COMP_TYPES);
    const name = pick(COMP_NAMES[type]);
    return {
      component_id: `CMP-${type.slice(0,3).toUpperCase()}-${String(i).padStart(3,'0')}`,
      type,
      name,
      version: `v${rndi(1,3)}.${rndi(0,9)}`,
      owner: pick(OWNERS),
      inputs: type === 'Factor' ? ['trades','bars_1s'] : ['context'],
      outputs: type === 'Factor' ? ['series'] : ['signal'],
      params: { window: rndi(5, 60), threshold: rnd(0.1, 2.0).toFixed(2) },
      logic: (COMP_LOGIC[type] && COMP_LOGIC[type][name]) ? COMP_LOGIC[type][name] : 'Logic: TBD (MVP mock).',
      failure_modes: ['Missing data → NaN fill','Divergent in low-vol regime'],
      status: pick(['Active','Deprecated','Draft']),
    };
  }

  const components = Array.from({ length: 24 }, (_, i) => genComponent(i + 1));

  /* ── Blueprints ── */
  function genBlueprint(strat) {
    return {
      strategy_id: strat.strategy_id,
      name: strat.name,
      market_id: strat.market_id,
      components: components.slice(0, rndi(4, 8)).map(c => c.component_id),
      params_snapshot: { commission: 2.50, slippage_ticks: 1, latency_ms: 15, fill_model: 'conservative' },
      risk_config: { max_risk_per_trade: 50, min_rr: 1.8, max_trades_session: 5, drawdown_levels: [-200, -400, -600] },
      regime: pick(['Trending','Ranging','Volatile','All']),
      version: strat.version,
    };
  }

  /* ── Backtest Runs ── */
  function genRun(strat, i) {
    return {
      run_id: `RUN-${uid()}`,
      strategy_id: strat.strategy_id,
      dataset_id: `DS-${uid()}`,
      commit_hash: uid() + uid(),
      config_snapshot: { cost: true, slippage: true, latency: true, constraints: true },
      started: new Date(Date.now() - rndi(1, 60) * 86400000).toISOString(),
      duration_s: rndi(12, 300),
      status: pick(['completed','completed','completed','failed','running']),
      metrics: {
        sharpe: strat.sharpe + rnd(-0.3, 0.3),
        max_dd: strat.max_dd + rnd(-3, 3),
        annual_return: strat.annual_return + rnd(-5, 5),
        trades: strat.trades + rndi(-20, 20),
        profit_factor: strat.profit_factor + rnd(-0.2, 0.2),
        win_rate: strat.win_rate + rnd(-0.05, 0.05),
      },
      qa_gate_0: true,
      qa_gate_1: Math.random() > 0.3,
      qa_gate_1_issues: Math.random() > 0.7 ? ['Cost sensitivity marginal'] : [],
    };
  }

  const runs = strategies.flatMap((s, i) => Array.from({ length: rndi(1, 4) }, (_, j) => genRun(s, j)));

  /* ── Execution / Live Strategies ── */
  const liveStrategies = strategies.filter(s => s.status === 'Live' || s.status === 'Paper');

  function genOrder(strat) {
    const side = pick(['Buy','Sell']);
    const price = 6000 + rnd(-20, 20);
    return {
      order_id: `ORD-${uid()}`,
      strategy_id: strat.strategy_id,
      market_id: strat.market_id,
      side,
      qty: rndi(1, 4),
      type: pick(['Market','Limit','Stop']),
      price: price.toFixed(2),
      status: pick(['Filled','Filled','PartialFill','Rejected','Cancelled']),
      signal_time: new Date(Date.now() - rndi(0, 7200) * 1000).toISOString(),
      fill_time: new Date(Date.now() - rndi(0, 7100) * 1000).toISOString(),
      latency_ms: rndi(3, 120),
      slippage_ticks: rndi(0, 3),
      pnl: rnd(-40, 60),
    };
  }

  /* ── Risk / Alerts ── */
  const alerts = [
    { id: 'ALT-001', level: 'warning', msg: 'Slippage > 2 ticks on STR-003', time: '14:32', action: 'reduce_size' },
    { id: 'ALT-002', level: 'danger',  msg: 'Daily drawdown -$380 approaching L1 (-$400)', time: '15:01', action: 'cooldown' },
    { id: 'ALT-003', level: 'info',    msg: 'Run RUN-A3F2 completed — Sharpe 1.82', time: '09:15', action: null },
    { id: 'ALT-004', level: 'warning', msg: 'Reject rate 8% on Paper strategy STR-007', time: '11:44', action: 'review' },
  ];

  /* ── Regime ── */
  const currentRegime = { label: 'Trending', confidence: 0.72, since: '2026-02-05' };

  function hashStringToUnit(s) {
    // Deterministic hash → [0, 1). Not cryptographic; good enough for mock data.
    let h = 2166136261;
    for (let i = 0; i < String(s).length; i++) {
      h ^= String(s).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
  }

  const REGIME_LABELS = ['Trending','Ranging','Volatile','MeanRevert','HighVol','LowVol'];

  function getRegimeForMarket(marketId) {
    const u = hashStringToUnit(marketId || 'UNKNOWN');
    const label = REGIME_LABELS[Math.floor(u * REGIME_LABELS.length) % REGIME_LABELS.length];
    const confidence = Math.max(0.50, Math.min(0.90, 0.55 + (u * 0.35)));

    const daysAgo = 1 + Math.floor((1 - u) * 9);
    const since = new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
    return { market_id: marketId || null, label, confidence, since };
  }

  const regimesByMarket = Object.fromEntries(MARKETS.map(m => [m, getRegimeForMarket(m)]));

  /* ── backtestRuns (formatted for Research Pipeline page) ── */
  const backtestRuns = runs.map(r => {
    const strat = strategies.find(s => s.strategy_id === r.strategy_id);
    const statusCap = r.status.charAt(0).toUpperCase() + r.status.slice(1);
    return {
      run_id: r.run_id,
      strategy_id: r.strategy_id,
      market_id: strat ? strat.market_id : 'CME_ES',
      dataset_id: r.dataset_id,
      commit_hash: r.commit_hash,
      config_snapshot: r.config_snapshot,
      period: '2024-01 — 2025-12',
      status: statusCap,
      results: {
        sharpe: r.metrics.sharpe,
        max_dd: r.metrics.max_dd / 100,   // decimal, e.g. -0.08
        total_trades: r.metrics.trades,
        profit_factor: r.metrics.profit_factor,
        win_rate: r.metrics.win_rate,
        annual_return: r.metrics.annual_return,
      },
      qa_gate_0: r.qa_gate_0,
      qa_gate_1: r.qa_gate_1,
      qa_gate_1_issues: r.qa_gate_1_issues,
      duration: Math.floor(r.duration_s / 60) + 'm ' + (r.duration_s % 60) + 's',
    };
  });

  /* ── Stress Test Scenarios ── */
  const stressScenarios = [
    { id: 'STRESS-001', name: 'Flash Crash 2010 replay', regime: 'Volatile', worst_dd: -18.5, sharpe_1pct: -0.82, survival: true },
    { id: 'STRESS-002', name: 'Overnight gap -3%', regime: 'HighVol', worst_dd: -12.3, sharpe_1pct: -0.45, survival: true },
    { id: 'STRESS-003', name: 'Low vol grind (60d)', regime: 'LowVol', worst_dd: -4.1, sharpe_1pct: 0.22, survival: true },
    { id: 'STRESS-004', name: 'Bid-ask spread 3x', regime: 'Volatile', worst_dd: -9.8, sharpe_1pct: 0.05, survival: true },
    { id: 'STRESS-005', name: 'Latency spike 200ms', regime: 'All', worst_dd: -7.2, sharpe_1pct: 0.38, survival: true },
    { id: 'STRESS-006', name: 'Commission doubled', regime: 'All', worst_dd: -6.5, sharpe_1pct: 0.61, survival: true },
    { id: 'STRESS-007', name: 'Regime shift mid-session', regime: 'MeanRevert', worst_dd: -14.0, sharpe_1pct: -0.30, survival: false },
    { id: 'STRESS-008', name: 'Correlated drawdown (3 strats)', regime: 'Volatile', worst_dd: -22.1, sharpe_1pct: -1.10, survival: false },
  ];

  /* ── Orders (for Execution page) ── */
  const orders = liveStrategies.slice(0, 6).flatMap(s =>
    Array.from({ length: rndi(2, 4) }, () => ({
      order_id: 'ORD-' + uid(),
      time: String(rndi(9,16)).padStart(2,'0') + ':' + String(rndi(0,59)).padStart(2,'0'),
      strategy_id: s.strategy_id,
      action: pick(['Open','Add','Close']),
      qty: rndi(1, 4),
      price: rndi(5940, 6060),
      status: pick(['Filled','Filled','Partial','Pending','Rejected']),
    }))
  ).sort((a, b) => b.time.localeCompare(a.time));

  /* ── Enrich liveStrategies with mode / pnl / trades for Execution page ── */
  const enrichedLive = liveStrategies.map(s => ({
    ...s,
    mode: s.status === 'Live' ? 'Live' : 'Paper',
    pnl: Math.round(rnd(-200, 800)),
    trades: rndi(3, 15),
  }));

  /* ── Public API ── */
  return {
    markets: MARKETS,
    strategies,
    components,
    genBlueprint,
    runs,
    backtestRuns,
    liveStrategies: enrichedLive,
    orders,
    genOrder,
    alerts,
    currentRegime,
    regimesByMarket,
    getRegimeForMarket,
    stressScenarios,
    pick, rnd, rndi, uid, money, pct,
  };
})();
