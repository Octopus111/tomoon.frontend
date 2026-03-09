/**
 * Account Reality Component
 *
 * Reusable component for defining and displaying the backtest account baseline:
 * capital, account type, base currency, risk budget, and cost model.
 *
 * This is an INPUT layer — it describes premises, not execution results.
 *
 * Usage:
 *   import { renderAccountPanel, collectAccountConfig } from './components/account-reality.js';
 *   // Render the form (once, on init)
 *   renderAccountPanel(containerEl);
 *   // Collect values for submission
 *   const acctConfig = collectAccountConfig();
 */

// ═══════════════════════════════════════════════════════════════
//  Render — builds the form HTML
// ═══════════════════════════════════════════════════════════════

/**
 * Render the Account Reality form panel into a container.
 * @param {HTMLElement} container
 * @param {Object} [defaults] - optional defaults to pre-fill
 */
function renderAccountPanel(container, defaults = {}) {
  if (!container) return;

  const d = {
    starting_capital: defaults.starting_capital ?? 100000,
    account_type: defaults.account_type ?? 'CFD',
    base_currency: defaults.base_currency ?? 'USD',
    risk_per_trade_pct: defaults.risk_per_trade_pct ?? 0.50,
    max_daily_loss_pct: defaults.max_daily_loss_pct ?? 1.5,
    spread: defaults.spread ?? 0.94,
    slippage: defaults.slippage ?? 0.3,
    swap_long: defaults.swap_long ?? -3.5,
    swap_short: defaults.swap_short ?? 1.2,
    commission_per_side: defaults.commission_per_side ?? 2.50,
    tick_size: defaults.tick_size ?? 0.01,
    tick_value: defaults.tick_value ?? 0.01,
    contract_size: defaults.contract_size ?? 100,
    roll_handling: defaults.roll_handling ?? 'none',
  };

  container.innerHTML = `
    <!-- Core Account -->
    <div class="acct-sub">
      <div class="acct-sub-title">Account</div>
      <div class="row3">
        <div>
          <label>Starting Capital ($)</label>
          <input id="acctStartingCapital" type="number" value="${d.starting_capital}" min="1000" max="10000000" />
        </div>
        <div>
          <label>Account Type</label>
          <select id="acctType">
            <option value="CFD" ${d.account_type === 'CFD' ? 'selected' : ''}>CFD</option>
            <option value="Futures" ${d.account_type === 'Futures' ? 'selected' : ''}>Futures</option>
          </select>
        </div>
        <div>
          <label>Base Currency</label>
          <select id="acctBaseCurrency">
            <option value="USD" ${d.base_currency === 'USD' ? 'selected' : ''}>USD</option>
            <option value="RMB" ${d.base_currency === 'RMB' ? 'selected' : ''}>RMB</option>
            <option value="MYR" ${d.base_currency === 'MYR' ? 'selected' : ''}>MYR</option>
            <option value="SGD" ${d.base_currency === 'SGD' ? 'selected' : ''}>SGD</option>
            <option value="AUD" ${d.base_currency === 'AUD' ? 'selected' : ''}>AUD</option>
            <option value="EUR" ${d.base_currency === 'EUR' ? 'selected' : ''}>EUR</option>
            <option value="GBP" ${d.base_currency === 'GBP' ? 'selected' : ''}>GBP</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Risk Budget -->
    <div class="acct-sub">
      <div class="acct-sub-title">Risk Budget</div>
      <div class="row">
        <div>
          <label>Risk per Trade (%)</label>
          <input id="acctRiskPerTrade" type="number" step="0.05" value="${d.risk_per_trade_pct}" min="0.05" max="5.0" />
        </div>
        <div>
          <label>Max Daily Loss (%)</label>
          <input id="acctMaxDailyLoss" type="number" step="0.1" value="${d.max_daily_loss_pct}" min="0.1" max="10.0" />
        </div>
      </div>
    </div>

    <!-- CFD Cost Model -->
    <div class="acct-sub acct-cfd-costs" id="acctCfdCosts">
      <div class="acct-sub-title">Cost Model — CFD</div>
      <div class="row4">
        <div>
          <label>Spread (USD/oz)</label>
          <input id="acctSpread" type="number" step="0.01" value="${d.spread}" min="0" max="10" />
        </div>
        <div>
          <label>Slippage (USD/oz)</label>
          <input id="acctSlippage" type="number" step="0.1" value="${d.slippage}" min="0" max="5" />
        </div>
        <div>
          <label>Swap Long ($/lot/day)</label>
          <input id="acctSwapLong" type="number" step="0.1" value="${d.swap_long}" />
        </div>
        <div>
          <label>Swap Short ($/lot/day)</label>
          <input id="acctSwapShort" type="number" step="0.1" value="${d.swap_short}" />
        </div>
      </div>
    </div>

    <!-- Futures Cost Model -->
    <div class="acct-sub acct-futures-costs" id="acctFuturesCosts" style="display:none;">
      <div class="acct-sub-title">Cost Model — Futures</div>
      <div class="row4">
        <div>
          <label>Commission/side ($)</label>
          <input id="acctCommission" type="number" step="0.5" value="${d.commission_per_side}" min="0" max="50" />
        </div>
        <div>
          <label>Tick Size</label>
          <input id="acctTickSize" type="number" step="0.001" value="${d.tick_size}" min="0.001" max="1" />
        </div>
        <div>
          <label>Tick Value ($)</label>
          <input id="acctTickValue" type="number" step="0.001" value="${d.tick_value}" min="0.001" max="100" />
        </div>
        <div>
          <label>Contract Size (oz)</label>
          <input id="acctContractSize" type="number" value="${d.contract_size}" min="1" max="10000" />
        </div>
      </div>
      <div class="row">
        <div>
          <label>Roll / Expiry Handling</label>
          <select id="acctRollHandling">
            <option value="none" ${d.roll_handling === 'none' ? 'selected' : ''}>None</option>
            <option value="manual" ${d.roll_handling === 'manual' ? 'selected' : ''}>Manual</option>
            <option value="auto" ${d.roll_handling === 'auto' ? 'selected' : ''}>Auto</option>
          </select>
        </div>
        <div></div>
      </div>
    </div>
  `;

  // Toggle CFD / Futures cost model visibility
  const typeEl = container.querySelector('#acctType');
  const cfdEl = container.querySelector('#acctCfdCosts');
  const futEl = container.querySelector('#acctFuturesCosts');
  function toggleCostModel() {
    const isFutures = typeEl.value === 'Futures';
    cfdEl.style.display = isFutures ? 'none' : 'block';
    futEl.style.display = isFutures ? 'block' : 'none';
  }
  typeEl.addEventListener('change', toggleCostModel);
  toggleCostModel();
}

// ═══════════════════════════════════════════════════════════════
//  Collect — reads form values into a config object
// ═══════════════════════════════════════════════════════════════

/**
 * Collect all Account Reality form values.
 * @returns {Object} account config suitable for sending to the backend
 */
function collectAccountConfig() {
  const num = (id) => Number(document.getElementById(id)?.value ?? 0);
  const str = (id) => (document.getElementById(id)?.value ?? '').trim();

  return {
    starting_capital: num('acctStartingCapital'),
    account_type: str('acctType'),
    base_currency: str('acctBaseCurrency'),
    risk_per_trade_pct: num('acctRiskPerTrade'),
    max_daily_loss_pct: num('acctMaxDailyLoss'),
    spread: num('acctSpread'),
    slippage: num('acctSlippage'),
    swap_long: num('acctSwapLong'),
    swap_short: num('acctSwapShort'),
    commission_per_side: num('acctCommission'),
    tick_size: num('acctTickSize'),
    tick_value: num('acctTickValue'),
    contract_size: num('acctContractSize'),
    roll_handling: str('acctRollHandling'),
  };
}

// ═══════════════════════════════════════════════════════════════
//  Display — read-only summary for result view
// ═══════════════════════════════════════════════════════════════

/**
 * Render a read-only summary of the account reality from backtest result.
 * @param {HTMLElement} container
 * @param {Object} accountReality - the account_reality object from backtest result
 */
function renderAccountSummary(container, accountReality) {
  if (!container || !accountReality) {
    if (container) container.innerHTML = '';
    return;
  }

  const a = accountReality;
  const isFutures = a.account_type === 'Futures';

  let html = '<div class="acct-summary">';
  html += `<div class="acct-summary-row">
    <span class="acct-summary-k">Capital</span>
    <span class="acct-summary-v">$${Number(a.starting_capital).toLocaleString()}</span>
  </div>`;
  html += `<div class="acct-summary-row">
    <span class="acct-summary-k">Type</span>
    <span class="acct-summary-v">${a.account_type}</span>
  </div>`;
  html += `<div class="acct-summary-row">
    <span class="acct-summary-k">Currency</span>
    <span class="acct-summary-v">${a.base_currency}</span>
  </div>`;
  html += `<div class="acct-summary-row">
    <span class="acct-summary-k">Risk/Trade</span>
    <span class="acct-summary-v">${a.risk_per_trade_pct}%</span>
  </div>`;
  html += `<div class="acct-summary-row">
    <span class="acct-summary-k">Max Daily Loss</span>
    <span class="acct-summary-v">${a.max_daily_loss_pct}%</span>
  </div>`;

  if (!isFutures) {
    html += `<div class="acct-summary-row">
      <span class="acct-summary-k">Spread</span>
      <span class="acct-summary-v">${a.spread} USD/oz</span>
    </div>`;
    html += `<div class="acct-summary-row">
      <span class="acct-summary-k">Slippage</span>
      <span class="acct-summary-v">${a.slippage} USD/oz</span>
    </div>`;
    html += `<div class="acct-summary-row">
      <span class="acct-summary-k">Swap L / S</span>
      <span class="acct-summary-v">${a.swap_long} / ${a.swap_short}</span>
    </div>`;
  } else {
    html += `<div class="acct-summary-row">
      <span class="acct-summary-k">Commission</span>
      <span class="acct-summary-v">$${a.commission_per_side}/side</span>
    </div>`;
    html += `<div class="acct-summary-row">
      <span class="acct-summary-k">Contract</span>
      <span class="acct-summary-v">${a.contract_size} oz</span>
    </div>`;
    html += `<div class="acct-summary-row">
      <span class="acct-summary-k">Roll</span>
      <span class="acct-summary-v">${a.roll_handling}</span>
    </div>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
//  CSS (injected once)
// ═══════════════════════════════════════════════════════════════

(function injectAccountStyles() {
  if (document.getElementById('account-reality-styles')) return;
  const style = document.createElement('style');
  style.id = 'account-reality-styles';
  style.textContent = `
    .acct-sub { margin-top: 6px; }
    .acct-sub-title {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--muted, rgba(0,0,0,0.55));
      margin-bottom: 4px;
    }
    .acct-summary {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 4px;
    }
    .acct-summary-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 3px 6px; background: #f9fafb; border-radius: 4px; font-size: 11px;
    }
    .acct-summary-k { color: var(--muted, rgba(0,0,0,0.55)); font-size: 10px; }
    .acct-summary-v { font-weight: 600; font-family: var(--mono, monospace); font-size: 11px; }
  `;
  document.head.appendChild(style);
})();

// Export
window.AccountReality = { renderAccountPanel, collectAccountConfig, renderAccountSummary };
