// ToMoon MVP - Shared Blueprints Registry (demo source of truth)
// Keep this file lightweight and stable: Home wizard + Execute should both rely on it.
// This is a demo dataset (can be replaced by real persistence later).

(function () {
  const BLUEPRINTS = {
    bp1: {
      id: 'bp1',
      name: 'NQ Morning Gap',
      market: { symbol: 'NQ', name: 'E-mini Nasdaq 100' },
      tradingStyle: 'Scalping',
      holdingDuration: 'Intraday Only',
      tags: ['NQ', 'Gap', 'Breakout'],
      strategyType: 'Breakout',
      entryCriteria: [
        'Opening range breaks with volume confirmation',
        'Gap fill rejection at key level',
        'No trade during high-impact news window'
      ],
      exitCriteria: [
        'Take profit at predefined R multiple',
        'Exit on failed breakout / momentum stall',
        'Hard stop at invalidation level'
      ],
      noiseFilters: [
        'Skip trades when spread widens',
        'Avoid chop: require trend bias / ADX (+DI/-DI) confirmation'
      ],
      profitMethod: 'Fixed Target',
      stopLossMethod: 'Fixed Stop',
      maxRiskPerTrade: '$200',
      minRR: '1:1.5',
      riskTolerance: '±10%',
      boundaries: { earlyTP: 'Limited', earlySL: 'Limited', addPosition: 'No', nonPlan: 'No', emotional: 'No' },
      // Performance (demo)
      netPnL: 4250, winRate: 68, avgRR: 1.8, maxDD: -4.5, trades: 42,
      dmiTrend: 'Up', riskStatus: 'Stable', isActive: true,
      linkedAccount: 'Main Account'
    },
    bp2: {
      id: 'bp2',
      name: 'Gold Swing',
      market: { symbol: 'GC', name: 'Gold Futures' },
      tradingStyle: 'Swing Trade',
      holdingDuration: 'Multi-Day Hold',
      tags: ['GC', 'Swing'],
      strategyType: 'Trend Following',
      entryCriteria: [
        'Pullback to structure support/resistance',
        'Trend direction confirmed (ADX/+DI/-DI or MA slope)',
        'Risk fits max risk per trade'
      ],
      exitCriteria: [
        'Structure-based exit (swing high/low break)',
        'Partial at 1R, trail remainder',
        'Time stop if thesis invalidates'
      ],
      noiseFilters: [
        'No new entries before major news',
        'Avoid late entries after extended move'
      ],
      profitMethod: 'Structure Exit',
      stopLossMethod: 'ATR Stop',
      maxRiskPerTrade: '$150',
      minRR: '1:2',
      riskTolerance: '±20%',
      boundaries: { earlyTP: 'Yes', earlySL: 'Limited', addPosition: 'Limited', nonPlan: 'No', emotional: 'No' },
      // Performance (demo)
      netPnL: -320, winRate: 40, avgRR: 2.5, maxDD: -8.2, trades: 12,
      dmiTrend: 'Flat', riskStatus: 'Inactive', isActive: false
    },
    bp3: {
      id: 'bp3',
      name: 'ES Range Play',
      market: { symbol: 'ES', name: 'E-mini S&P 500' },
      tradingStyle: 'Day Trade',
      holdingDuration: 'Intraday Only',
      tags: ['ES', 'Range'],
      strategyType: 'Mean Reversion',
      entryCriteria: [
        'Fade range extremes at validated level',
        'Confirm with rejection / absorption',
        'Define stop beyond range boundary'
      ],
      exitCriteria: [
        'Target mid-range / opposite extreme',
        'Exit if range breaks and holds',
        'Reduce size into volatility expansion'
      ],
      noiseFilters: [
        'Skip if range is too wide for risk',
        'Avoid entries into high-impact events'
      ],
      profitMethod: 'Fixed Target',
      stopLossMethod: 'Structure Stop',
      maxRiskPerTrade: '$250',
      minRR: '1:2',
      riskTolerance: '±10%',
      boundaries: { earlyTP: 'Limited', earlySL: 'No', addPosition: 'No', nonPlan: 'No', emotional: 'No' },
      // Performance (demo)
      netPnL: 1850, winRate: 55, avgRR: 2.1, maxDD: -3.8, trades: 28,
      dmiTrend: 'Up', riskStatus: 'Stable', isActive: true,
      linkedAccount: 'Trading Account A'
    }
  };

  function listBlueprints() {
    const arr = Object.keys(BLUEPRINTS).map(id => BLUEPRINTS[id]);
    // Active first, then name
    return arr.sort((a, b) => {
      const aa = !!a.isActive, bb = !!b.isActive;
      if (aa && !bb) return -1;
      if (!aa && bb) return 1;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }

  // Export to global
  window.TM_MVP_BLUEPRINTS = BLUEPRINTS;
  window.tmGetMvpBlueprintsList = listBlueprints;
})();

