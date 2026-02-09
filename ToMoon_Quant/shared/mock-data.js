/**
 * ToMoon Quant — Mock Data (MVP)
 * Minimal demo data to verify end-to-end framework flow
 */

const MOCK = (() => {
  const rnd = (a, b) => Math.random() * (b - a) + a;
  const rndi = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = arr => arr[rndi(0, arr.length - 1)];
  const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  const money = n => (n >= 0 ? '+' : '-') + '$' + Math.abs(n).toFixed(2);
  const pct = n => (n * 100).toFixed(1) + '%';

  /* ── Strategies (6 — one per lifecycle status) ── */
  /* Pipeline: Draft → Backtest → QA Passed → Forward Test → Validated → Archived */
  const MARKETS = ['CME_ES','CME_MES','BTC_PERP','XAUUSD_CFD'];

  const strategies = [
    { strategy_id:'STR-006', name:'VWAP Breakout',         version:'v0.1', status:'Draft',         owner:'Eddie',   market_id:'CME_MES',  sharpe:0,    max_dd:0,     annual_return:0,  trades:0,   profit_factor:0,    win_rate:0,    last_updated:'2026-02-08', last_run_id:'—',        gate_0:false, gate_1:false, gate_2:false },
    { strategy_id:'STR-001', name:'Pullback Continuation', version:'v0.3', status:'Backtest',      owner:'Eddie',   market_id:'CME_ES',   sharpe:1.45, max_dd:-7.2,  annual_return:18, trades:260, profit_factor:1.65, win_rate:0.54, last_updated:'2025-06-01', last_run_id:'RUN-A001', gate_0:true,  gate_1:false, gate_2:false },
    { strategy_id:'STR-002', name:'Delta Divergence',      version:'v0.5', status:'QA Passed',     owner:'Quant-1', market_id:'CME_MES',  sharpe:1.82, max_dd:-5.8,  annual_return:24, trades:310, profit_factor:1.90, win_rate:0.58, last_updated:'2025-05-28', last_run_id:'RUN-A002', gate_0:true,  gate_1:true,  gate_2:false },
    { strategy_id:'STR-003', name:'Volume Exhaustion',     version:'v0.7', status:'Forward Test',  owner:'Eddie',   market_id:'CME_ES',   sharpe:1.60, max_dd:-6.5,  annual_return:20, trades:280, profit_factor:1.72, win_rate:0.56, last_updated:'2025-05-25', last_run_id:'RUN-A003', gate_0:true,  gate_1:true,  gate_2:false },
    { strategy_id:'STR-004', name:'Sweep Reclaim',         version:'v1.0', status:'Validated',     owner:'Eddie',   market_id:'CME_ES',   sharpe:2.10, max_dd:-4.8,  annual_return:32, trades:350, profit_factor:2.15, win_rate:0.61, last_updated:'2025-05-20', last_run_id:'RUN-A004', gate_0:true,  gate_1:true,  gate_2:true  },
    { strategy_id:'STR-005', name:'Range Fade',            version:'v0.4', status:'Archived',      owner:'Quant-2', market_id:'BTC_PERP',  sharpe:0.35, max_dd:-14.2, annual_return:-3, trades:180, profit_factor:0.85, win_rate:0.42, last_updated:'2025-04-10', last_run_id:'RUN-A005', gate_0:true,  gate_1:false, gate_2:false },
  ];

  /* ── Components (7 — one per type) ── */
  const components = [
    { component_id:'CMP-SET-001', type:'Setup',   name:'Liquidity Sweep Zone',     version:'v1.0', owner:'Eddie',   inputs:['context'],        outputs:['signal'], params:{ window:20, threshold:'0.80' }, logic:'Detect sweep zone at last swing ± threshold.', failure_modes:['Missing data → NaN fill'], status:'Active' },
    { component_id:'CMP-FAC-001', type:'Factor',  name:'Delta',                    version:'v2.1', owner:'Quant-1', inputs:['trades','bars_1s'],outputs:['series'], params:{ window:30, threshold:'0.60' }, logic:'Aggregate aggressor delta per bar; rolling delta.', failure_modes:['Divergent in low-vol regime'], status:'Active' },
    { component_id:'CMP-TRI-001', type:'Trigger', name:'Delta Divergence Trigger', version:'v1.3', owner:'Eddie',   inputs:['context'],        outputs:['signal'], params:{ window:15, threshold:'1.20' }, logic:'Fire when price vs delta divergence confirmed.', failure_modes:['Late trigger in fast markets'], status:'Active' },
    { component_id:'CMP-FIL-001', type:'Filter',  name:'Session Time Filter',      version:'v1.0', owner:'Eddie',   inputs:['context'],        outputs:['signal'], params:{ window:10, threshold:'0.50' }, logic:'Allow signals only inside configured session.', failure_modes:['Timezone misconfiguration'], status:'Active' },
    { component_id:'CMP-ENT-001', type:'Entry',   name:'Limit at Level',           version:'v1.2', owner:'Quant-1', inputs:['context'],        outputs:['signal'], params:{ window:5,  threshold:'1.00' }, logic:'Place limit at reclaimed level with offset.', failure_modes:['No fill in fast markets'], status:'Active' },
    { component_id:'CMP-EXI-001', type:'Exit',    name:'Partial at 1R',            version:'v1.1', owner:'Eddie',   inputs:['context'],        outputs:['signal'], params:{ window:10, threshold:'1.50' }, logic:'Take partial at +1R; trail the runner.', failure_modes:['Early exit in trend'], status:'Active' },
    { component_id:'CMP-RSK-001', type:'Risk',    name:'Fixed $ Risk',             version:'v1.0', owner:'Eddie',   inputs:['context'],        outputs:['signal'], params:{ window:1,  threshold:'50'   }, logic:'Size so stop distance = fixed $ risk.', failure_modes:['Over-sizing in low-vol'], status:'Active' },
  ];

  /* ── Blueprints ── */
  function genBlueprint(strat) {
    return {
      strategy_id: strat.strategy_id,
      name: strat.name,
      market_id: strat.market_id,
      components: components.slice(0, 5).map(c => c.component_id),
      params_snapshot: { commission: 2.50, slippage_ticks: 1, latency_ms: 15, fill_model: 'conservative' },
      risk_config: { max_risk_per_trade: 50, min_rr: 1.8, max_trades_session: 5, drawdown_levels: [-200, -400, -600] },
      regime: 'All',
      version: strat.version,
    };
  }

  /* ── Backtest Runs (5 fixed — one per strategy) ── */
  const runs = [
    { run_id:'RUN-A001', strategy_id:'STR-001', dataset_id:'DS-001', commit_hash:'a1b2c3d4e5f6', config_snapshot:{ cost:true, slippage:true, latency:true, constraints:true }, started:'2025-06-01T08:00:00Z', duration_s:145, status:'completed', metrics:{ sharpe:1.45, max_dd:-7.2, annual_return:18, trades:260, profit_factor:1.65, win_rate:0.54 }, qa_gate_0:true, qa_gate_1:false, qa_gate_1_issues:['Cost sensitivity marginal'] },
    { run_id:'RUN-A002', strategy_id:'STR-002', dataset_id:'DS-002', commit_hash:'b2c3d4e5f6a7', config_snapshot:{ cost:true, slippage:true, latency:true, constraints:true }, started:'2025-05-28T09:00:00Z', duration_s:198, status:'completed', metrics:{ sharpe:1.82, max_dd:-5.8, annual_return:24, trades:310, profit_factor:1.90, win_rate:0.58 }, qa_gate_0:true, qa_gate_1:true,  qa_gate_1_issues:[] },
    { run_id:'RUN-A003', strategy_id:'STR-003', dataset_id:'DS-003', commit_hash:'c3d4e5f6a7b8', config_snapshot:{ cost:true, slippage:true, latency:true, constraints:true }, started:'2025-05-25T10:00:00Z', duration_s:167, status:'completed', metrics:{ sharpe:1.60, max_dd:-6.5, annual_return:20, trades:280, profit_factor:1.72, win_rate:0.56 }, qa_gate_0:true, qa_gate_1:true,  qa_gate_1_issues:[] },
    { run_id:'RUN-A004', strategy_id:'STR-004', dataset_id:'DS-004', commit_hash:'d4e5f6a7b8c9', config_snapshot:{ cost:true, slippage:true, latency:true, constraints:true }, started:'2025-05-20T07:30:00Z', duration_s:220, status:'completed', metrics:{ sharpe:2.10, max_dd:-4.8, annual_return:32, trades:350, profit_factor:2.15, win_rate:0.61 }, qa_gate_0:true, qa_gate_1:true,  qa_gate_1_issues:[] },
    { run_id:'RUN-A005', strategy_id:'STR-005', dataset_id:'DS-005', commit_hash:'e5f6a7b8c9d0', config_snapshot:{ cost:true, slippage:true, latency:true, constraints:true }, started:'2025-04-10T11:00:00Z', duration_s:95,  status:'failed',    metrics:{ sharpe:0.35, max_dd:-14.2, annual_return:-3, trades:180, profit_factor:0.85, win_rate:0.42 }, qa_gate_0:true, qa_gate_1:false, qa_gate_1_issues:['Sharpe below threshold','Max DD exceeded'] },
  ];

  /* ── Formatted backtestRuns (for Research Pipeline page) ── */
  const backtestRuns = runs.map(r => {
    const strat = strategies.find(s => s.strategy_id === r.strategy_id);
    const statusCap = r.status.charAt(0).toUpperCase() + r.status.slice(1);
    return {
      run_id: r.run_id, strategy_id: r.strategy_id,
      market_id: strat ? strat.market_id : 'CME_ES',
      dataset_id: r.dataset_id, commit_hash: r.commit_hash, config_snapshot: r.config_snapshot,
      period: '2024-01 — 2025-12', status: statusCap,
      results: { sharpe: r.metrics.sharpe, max_dd: r.metrics.max_dd / 100, total_trades: r.metrics.trades, profit_factor: r.metrics.profit_factor, win_rate: r.metrics.win_rate, annual_return: r.metrics.annual_return },
      qa_gate_0: r.qa_gate_0, qa_gate_1: r.qa_gate_1, qa_gate_1_issues: r.qa_gate_1_issues,
      duration: Math.floor(r.duration_s / 60) + 'm ' + (r.duration_s % 60) + 's',
    };
  });

  /* ── Test Monitor / Forward-Test Strategies ── */
  /* Only 'Forward Test' and 'Validated' strategies appear on the Test Monitor page */
  const testStrategies = strategies.filter(s => s.status === 'Forward Test' || s.status === 'Validated');

  const enrichedTest = testStrategies.map(s => ({
    ...s,
    mode: s.status === 'Forward Test' ? 'Forward Test' : 'Validated',
    dataSource: s.status === 'Forward Test' ? 'Live Feed' : 'Historical',
    pnl: s.status === 'Forward Test' ? 85 : 420,
    trades: s.status === 'Forward Test' ? 5 : 12,
  }));

  function genOrder(strat) {
    return { order_id:`ORD-${uid()}`, strategy_id:strat.strategy_id, market_id:strat.market_id, side:pick(['Buy','Sell']), qty:rndi(1,3), type:pick(['Market','Limit']), price:(6000+rnd(-20,20)).toFixed(2), status:pick(['Filled','Partial','Rejected']), signal_time:new Date().toISOString(), fill_time:new Date().toISOString(), latency_ms:rndi(5,45), slippage_ticks:rndi(0,2), pnl:rnd(-30,50) };
  }

  /* ── Simulated Orders (for Test Monitor page) ── */
  const baseDay = new Date();
  baseDay.setHours(0, 0, 0, 0);
  const baseTs = baseDay.getTime();

  const orders = testStrategies.flatMap(s =>
    Array.from({ length: 3 }, () => {
      const hh = rndi(9, 15);
      const mm = rndi(0, 59);
      const ts = baseTs + ((hh * 60 + mm) * 60 + rndi(0, 59)) * 1000;
      const status = pick(['Filled','Filled','Partial','Rejected']);
      const reject_reason = status === 'Rejected' ? pick(['risk_policy', 'market_rules', 'throttle', 'unknown']) : null;
      const pnl = (status === 'Filled' || status === 'Partial') ? rnd(-40, 65) : 0;
      const latency_ms = rndi(5, 55) + (Math.random() > 0.93 ? rndi(20, 60) : 0);
      const slippage_ticks = (status === 'Filled' || status === 'Partial') ? rndi(0, 3) : 0;

      return {
        order_id: 'ORD-' + uid(),
        ts,
        time: String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0'),
        strategy_id: s.strategy_id,
        market_id: s.market_id,
        action: pick(['Open','Close']),
        qty: rndi(1, 3),
        price: rndi(5940, 6060),
        status,
        signal_time: new Date(ts - rndi(50, 250)).toISOString(),
        fill_time: status === 'Rejected' ? null : new Date(ts).toISOString(),
        latency_ms,
        slippage_ticks,
        reject_reason,
        pnl,
      };
    })
  ).sort((a, b) => (b.ts || 0) - (a.ts || 0));

  /* ── Alerts (2) ── */
  const alerts = [
    { id: 'ALT-001', level: 'warning', msg: 'Slippage > 2 ticks on STR-003', time: '14:32', action: 'reduce_size' },
    { id: 'ALT-002', level: 'info', msg: 'Run RUN-A004 completed — Sharpe 2.10', time: '09:15', action: null },
  ];

  /* ── Regime ── */
  const currentRegime = { label: 'Trending', confidence: 0.72, since: '2026-02-05' };

  function getRegimeForMarket(marketId) {
    const map = { CME_ES:'Trending', CME_MES:'Trending', BTC_PERP:'Volatile', XAUUSD_CFD:'Ranging' };
    return { market_id: marketId, label: map[marketId] || 'Trending', confidence: 0.72, since: '2026-02-05' };
  }

  const regimesByMarket = Object.fromEntries(MARKETS.map(m => [m, getRegimeForMarket(m)]));

  /* ── Stress Scenarios (minimal) ── */
  const stressScenarios = [
    { id:'STRESS-001', name:'Flash Crash replay', regime:'Volatile', worst_dd:-18.5, sharpe_1pct:-0.82, survival:true },
    { id:'STRESS-002', name:'Overnight gap -3%',  regime:'HighVol',  worst_dd:-12.3, sharpe_1pct:-0.45, survival:true },
  ];

  /* ── Public API ── */
  return {
    markets: MARKETS, strategies, components, genBlueprint, runs, backtestRuns,
    testStrategies: enrichedTest, orders, genOrder, alerts,
    currentRegime, regimesByMarket, getRegimeForMarket, stressScenarios,
    pick, rnd, rndi, uid, money, pct,
  };
})();
