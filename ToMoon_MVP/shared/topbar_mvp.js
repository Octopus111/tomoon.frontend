/**
 * ToMoon MVP Topbar Module
 * MVP版本顶部栏模块 - Redesigned Live Hub
 */

// --- Topbar CSS Styles ---
const topbarStyles = `
    /* --- Topbar Layout --- */
    .topbar {
        position: fixed;
        top: 0;
        left: var(--sidebar-width, 60px);
        right: 0;
        height: var(--topbar-height, 60px);
        background: var(--bg-card, #161a22);
        border-bottom: 1px solid var(--border, #2a3142);
        z-index: 90;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;
    }

    .sidebar.expanded ~ .topbar {
        left: var(--sidebar-expanded-width, 250px);
    }
    
    .topbar-left, .topbar-right { 
        display: flex; 
        align-items: center; 
        gap: 15px; 
    }
    
    .topbar-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-main, #e2e8f0);
        margin: 0;
        letter-spacing: -0.01em;
    }

    /* --- Live Hub (Global Aggregator) --- */
    .live-hub-trigger {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: default;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid transparent;
        transition: all 0.2s;
        height: 40px;
        box-sizing: border-box;
    }
    .live-hub-trigger:hover, .live-hub-trigger.active {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--border);
    }

    .hub-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        cursor: pointer;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        color: var(--text-muted);
        transition: background 0.2s, border-color 0.2s;
    }
    .hub-toggle:hover {
        background: rgba(255,255,255,0.05);
        border-color: var(--border);
        color: var(--text-main);
    }

    .hub-content-box {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: var(--text-muted);
    }

    .hub-val {
        color: var(--text-main);
        font-weight: 600;
    }
    .hub-val.stable { color: var(--success); }
    .hub-val.caution { color: var(--warning); }
    .hub-val.pressure { color: var(--danger); }

    .hub-sep { opacity: 0.3; }

    .hub-badge {
        background: var(--primary);
        color: white;
        font-size: 10px;
        padding: 1px 6px;
        border-radius: 10px;
        font-weight: 700;
        min-width: 16px;
        text-align: center;
        display: none; /* Hidden by default */
    }
    .hub-badge.visible { display: inline-block; }

    .hub-arrow {
        color: var(--text-muted);
        transition: transform 0.2s;
    }
    .live-hub-trigger.active .hub-arrow {
        transform: rotate(180deg);
    }

    /* Dropdown UI */
    .live-hub-dropdown {
        position: fixed;
        top: 65px;
        right: 24px;
        width: 360px;
        background: var(--bg-card, #161a22);
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        z-index: 1000;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideInDown 0.2s ease-out;
    }
    .live-hub-dropdown.active { display: flex; }

    /* A. Overall Risk Section */
    .hub-section-overall {
        padding: 16px;
        border-bottom: 1px solid var(--border);
        background: rgba(255,255,255,0.02);
    }
    .hub-account-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .hub-risk-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    .hub-risk-tag {
        font-size: 12px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
    }
    .hub-risk-tag.stable { background: rgba(34, 197, 94, 0.15); color: var(--success); }
    .hub-risk-tag.caution { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
    .hub-risk-tag.pressure { background: rgba(239, 68, 68, 0.15); color: var(--danger); }

    .hub-limit-info {
        font-family: 'SF Mono', monospace;
        font-size: 13px;
        color: var(--text-muted);
    }
    .hub-limit-val { color: var(--text-main); font-weight: 600; }

    .hub-risk-bar-bg {
        height: 6px;
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
        margin-bottom: 8px;
        overflow: hidden;
        position: relative;
    }

    .hub-risk-bar-mark {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background: rgba(255,255,255,0.16);
        transform: translateX(-1px);
        pointer-events: none;
    }
    .hub-risk-bar-fill {
        height: 100%;
        width: 0%;
        border-radius: 3px;
        transition: width 0.4s ease;
    }
    .hub-risk-bar-fill.stable { background: var(--success); }
    .hub-risk-bar-fill.caution { background: var(--warning); }
    .hub-risk-bar-fill.pressure { background: var(--danger); }

    .hub-context-line {
        font-size: 11px;
        color: var(--text-muted);
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
    }
    .hub-context-strong { color: var(--text-main); font-weight: 600; }

    .hub-mini-kpis {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin-top: 10px;
    }
    .hub-mini-kpi {
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
    }
    .hub-mini-kpi .k {
        font-size: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--text-muted);
    }
    .hub-mini-kpi .v {
        margin-top: 2px;
        font-family: 'SF Mono', monospace;
        font-size: 12px;
        color: var(--text-main);
        font-weight: 700;
    }

    /* B. Sessions List Section */
    .hub-section-sessions {
        max-height: 400px;
        overflow-y: auto;
    }
    .hub-session-item {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        cursor: pointer;
        transition: background 0.2s;
        text-decoration: none;
        display: block;
    }
    .hub-session-item:last-child { border-bottom: none; }
    .hub-session-item:hover { background: rgba(255,255,255,0.04); }

    .hub-sess-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }
    .hub-sess-name { font-size: 13px; font-weight: 600; color: var(--text-main); }
    .hub-sess-pnl { font-family: 'SF Mono', monospace; font-size: 13px; font-weight: 600; }
    .hub-sess-pnl.positive { color: var(--success); }
    .hub-sess-pnl.negative { color: var(--danger); }

    .hub-sess-mid {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--text-muted);
    }

    .hub-view {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.02);
        padding: 3px 8px;
        border-radius: 999px;
        white-space: nowrap;
    }
    
    .hub-new-trade {
        color: var(--primary);
        font-weight: 600;
        font-size: 11px;
        margin-left: 6px;
        background: rgba(59, 130, 246, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
    }

    .empty-hub-state {
        padding: 30px;
        text-align: center;
        color: var(--text-muted);
        font-size: 13px;
    }

    @keyframes slideInDown {
        from { transform: translateY(-10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 768px) {
        .topbar { padding: 0 16px 0 60px; }
        .topbar-title { display: none; }
    }

    /* Standard Elements */
    .topbar-divider { width: 1px; height: 20px; background: var(--border); margin: 0 8px; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px; cursor: pointer; }
`;

// Session Management (Logic Preserved & Enhanced for Aggregation)
let liveSessionState = {
    active: false,
    sessionId: null
};

const LIVE_SESSION_KEY = 'toMoon_live_session';
const LIVE_SESSIONS_KEY = 'toMoon_live_sessions';
const LIVE_FOCUS_KEY = 'toMoon_live_focus_session_id';

// Risk Thresholds (Simulated "Per Account" configuration)
const RISK_CFG_DEFAULT = {
    cautionStart: 0.65, // 65%
    pressureStart: 0.85 // 85%
};

const RISK_CFG_STORAGE_KEY = 'toMoon_riskguard_cfg_by_account';
const RISK_USAGE_HISTORY_PREFIX = 'toMoon_riskguard_usage_hist_';

function normalizeSessionDates(session) {
    const s = { ...session };
    if (s.startTime) s.startTime = new Date(s.startTime);
    if (s.endTime) s.endTime = new Date(s.endTime);
    if (s.lastTradeTime) s.lastTradeTime = new Date(s.lastTradeTime);
    if (s.lastUpdateTime) s.lastUpdateTime = new Date(s.lastUpdateTime);
    return s;
}

function getLiveSessions() {
    const stored = localStorage.getItem(LIVE_SESSIONS_KEY);
    if (stored) {
        try {
            const arr = JSON.parse(stored);
            if (Array.isArray(arr)) return arr.map(normalizeSessionDates);
        } catch (e) { console.error('Failed to parse live sessions', e); }
    }
    // Backward compat fallback
    const legacy = localStorage.getItem(LIVE_SESSION_KEY);
    if (legacy) {
        try {
            const s = normalizeSessionDates(JSON.parse(legacy));
            if (s && s.active) return [s];
        } catch (e) {}
    }
    return [];
}

function saveLiveSessions(sessions, focusSessionId = null) {
    const arr = Array.isArray(sessions) ? sessions : [];
    localStorage.setItem(LIVE_SESSIONS_KEY, JSON.stringify(arr));

    if (focusSessionId !== null) {
        localStorage.setItem(LIVE_FOCUS_KEY, focusSessionId || '');
    }
    updateLiveHub();
}

function getLiveSessionState() {
    const sessions = getLiveSessions();
    if (sessions.length === 0) return { active: false };
    const focusId = localStorage.getItem(LIVE_FOCUS_KEY) || '';
    const focus = sessions.find(s => String(s.sessionId) === String(focusId)) || sessions[0];
    return focus ? normalizeSessionDates(focus) : { active: false };
}

function saveLiveSessionState(state) {
    const sessions = getLiveSessions();
    if (sessions.length === 0) {
        saveLiveSessions([state], state.sessionId || null);
        return;
    }
    const idx = sessions.findIndex(s => String(s.sessionId) === String(state.sessionId));
    if (idx >= 0) {
        sessions[idx] = state;
    } else {
        sessions.push(state);
    }
    saveLiveSessions(sessions, state.sessionId);
}

function startLiveSession(sessionData) {
    const riskLimit = Number(sessionData.riskLimit);
    const state = {
        active: true,
        sessionId: sessionData.id || `session_${Date.now()}`,
        sessionName: sessionData.name || 'Trading Session',
        startTime: new Date(),
        pnl: 0,
        tradeCount: 0,
        account: sessionData.account || 'Main Account',
        accountId: sessionData.accountId || 'main',
        blueprint: sessionData.blueprint || 'No Blueprint',
        blueprintId: sessionData.blueprintId || null,
        riskLimit: Number.isFinite(riskLimit) ? riskLimit : 2000, 
        riskUsed: 0
    };

    const sessions = getLiveSessions();
    sessions.push(state);
    saveLiveSessions(sessions, state.sessionId);
    window.dispatchEvent(new CustomEvent('liveSessionStarted', { detail: state }));
    return state;
}

function endLiveSession(sessionId = null) {
    const sessions = getLiveSessions();
    if (sessions.length === 0) return null;
    const targetId = sessionId || (localStorage.getItem(LIVE_FOCUS_KEY) || '') || (sessions[0]?.sessionId);
    const idx = sessions.findIndex(s => String(s.sessionId) === String(targetId));
    if (idx < 0) return null;

    const endedSession = { ...sessions[idx], endTime: new Date(), status: 'pending_review' };
    sessions.splice(idx, 1);
    saveLiveSessions(sessions, sessions.length ? sessions[0].sessionId : '');

    window.dispatchEvent(new CustomEvent('liveSessionEnded', { detail: endedSession }));
    return endedSession;
}

function updateLiveSessionPnL(pnl, tradeCount, sessionId = null) {
    const sessions = getLiveSessions();
    if (sessions.length === 0) return;
    const targetId = sessionId || sessions[0].sessionId;
    const s = sessions.find(s => String(s.sessionId) === String(targetId));
    if (s) {
        const prevTrades = Number(s.tradeCount || 0);
        const nextTrades = tradeCount !== undefined ? Number(tradeCount) : prevTrades;

        s.pnl = pnl;
        if (tradeCount !== undefined) s.tradeCount = nextTrades;

        const now = new Date();
        s.lastUpdateTime = now;

        if (Number.isFinite(nextTrades) && nextTrades > prevTrades) {
            const delta = Math.max(1, nextTrades - prevTrades);
            s.newTrades = Number(s.newTrades || 0) + delta;
            s.lastTradeTime = now;
        }

        // Mock simple risk calculation
        if (pnl < 0) s.riskUsed = Math.abs(pnl);
        saveLiveSessions(sessions, targetId);
    }
}

// --- Live Hub UI Logic ---

let isHubOpen = false;

function toggleLiveHub() {
    isHubOpen = !isHubOpen;
    if (isHubOpen) {
        // Opening implies the user has "seen" the new-trade indicators.
        clearNewTradesForCurrentAccount();
    }
    updateLiveHub();
}

function closeLiveHub(e) {
    const hub = document.getElementById('live-hub-dropdown');
    const trigger = document.getElementById('live-hub-trigger');
    if (isHubOpen && hub && trigger && !hub.contains(e.target) && !trigger.contains(e.target)) {
        isHubOpen = false;
        updateLiveHub();
    }
}

function getDifficultyColor(pct) {
    const cfg = getRiskGuardConfig(getCurrentAccountId());
    if (pct >= cfg.pressureStart) return 'pressure';
    if (pct >= cfg.cautionStart) return 'caution';
    return 'stable';
}

function fmtMoney(n) {
    return '$' + Math.abs(Number(n) || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
}

function fmtSignedMoney(n) {
    const num = Number(n) || 0;
    const sign = num >= 0 ? '+' : '-';
    return sign + fmtMoney(Math.abs(num));
}

function getRiskGuardConfig(accountId) {
    const id = String(accountId || 'main');
    try {
        const raw = localStorage.getItem(RISK_CFG_STORAGE_KEY);
        if (!raw) return { ...RISK_CFG_DEFAULT };
        const obj = JSON.parse(raw);
        const cfg = obj && obj[id] ? obj[id] : null;
        const cautionStart = Number(cfg && cfg.cautionStart);
        const pressureStart = Number(cfg && cfg.pressureStart);
        if (Number.isFinite(cautionStart) && Number.isFinite(pressureStart) && cautionStart >= 0 && pressureStart >= 0) {
            return { cautionStart, pressureStart };
        }
    } catch (_) {
        // ignore
    }
    return { ...RISK_CFG_DEFAULT };
}

function getCurrentAccountId() {
    const focus = getLiveSessionState();
    return (focus && focus.accountId) ? String(focus.accountId) : 'main';
}

function getCurrentAccountName() {
    const focus = getLiveSessionState();
    return (focus && focus.account) ? String(focus.account) : 'Main Account';
}

function getSessionsForCurrentAccount() {
    const accountId = getCurrentAccountId();
    return getLiveSessions().filter(s => String(s.accountId || 'main') === String(accountId));
}

function getSessionActivityTs(s) {
    const t = (s && (s.lastTradeTime || s.lastUpdateTime || s.startTime)) ? new Date(s.lastTradeTime || s.lastUpdateTime || s.startTime).getTime() : 0;
    return Number.isFinite(t) ? t : 0;
}

function formatLastUpdate(ts) {
    const now = Date.now();
    const diff = Math.max(0, now - (Number(ts) || now));
    const secs = Math.floor(diff / 1000);
    return secs <= 1 ? 'Just now' : `${secs}s ago`;
}

function pushRiskUsageHistory(accountId, used) {
    const id = String(accountId || 'main');
    const key = RISK_USAGE_HISTORY_PREFIX + id;
    const now = Date.now();
    try {
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        const next = Array.isArray(arr) ? arr : [];
        const last = next.length ? next[next.length - 1] : null;
        if (!last || (now - Number(last.t || 0)) >= 30000) {
            next.push({ t: now, u: Number(used) || 0 });
        }
        const cutoff = now - (30 * 60 * 1000);
        const trimmed = next.filter(p => p && Number(p.t) >= cutoff);
        localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (_) {
        // ignore
    }
}

function getRiskUsageTrend30m(accountId, usedNow) {
    const id = String(accountId || 'main');
    const key = RISK_USAGE_HISTORY_PREFIX + id;
    try {
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr) || arr.length < 2) return null;
        const oldest = arr[0];
        const delta = (Number(usedNow) || 0) - (Number(oldest.u) || 0);
        if (!Number.isFinite(delta)) return null;
        return delta;
    } catch (_) {
        return null;
    }
}

function clearNewTradesForCurrentAccount() {
    const accountId = getCurrentAccountId();
    const sessions = getLiveSessions();
    let changed = false;
    sessions.forEach(s => {
        if (String(s.accountId || 'main') !== String(accountId)) return;
        if (s.newTrades && Number(s.newTrades) > 0) {
            s.newTrades = 0;
            changed = true;
        }
    });
    if (changed) saveLiveSessions(sessions, localStorage.getItem(LIVE_FOCUS_KEY) || '');
}

function getSessionDuration(startTime) {
    if (!startTime) return '0m';
    const mins = Math.floor((new Date() - new Date(startTime)) / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins%60}m`;
}

function updateLiveHub() {
    const trigger = document.getElementById('live-hub-trigger');
    const drop = document.getElementById('live-hub-dropdown');
    const sessions = getSessionsForCurrentAccount();
    const count = sessions.length;
    
    // Safety check
    if (!trigger || !drop) return;

    // 1) Account-level Overall (RiskGuard belongs to Account, not Session)
    const accountId = getCurrentAccountId();
    const accountName = getCurrentAccountName();
    const limit = count > 0 ? Number(sessions[0].riskLimit || 2000) : 0;
    const used = sessions.reduce((sum, s) => sum + Number(s.riskUsed || 0), 0);
    const remaining = Math.max(0, (Number(limit) || 0) - used);

    const pct = (Number(limit) || 0) > 0 ? (used / limit) : 0;
    const status = getDifficultyColor(pct);
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
    
    // 2. Render Collapsed State
    const hasSessions = count > 0;
    const badgeCount = sessions.reduce((sum, s) => sum + Number(s.newTrades || 0), 0);

    // 2) Collapsed: only 2 messages (RiskGuard status + Live Sessions count)
    trigger.innerHTML = `
        <div class="hub-content-box">
            <span>RiskGuard: <span class="hub-val ${hasSessions ? status : 'stable'}">${hasSessions ? statusLabel : 'Stable'}</span></span>
            <span class="hub-sep">·</span>
            <span>Live Sessions</span>
            <span class="hub-sep">·</span>
            <span class="hub-val">${count}</span>
        </div>
        ${badgeCount > 0 ? `<div class="hub-badge visible">+${badgeCount}</div>` : ''}
        <div class="hub-toggle" title="Toggle Live Hub" aria-label="Toggle Live Hub" role="button" tabindex="0">
            <svg class="hub-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 1 5 5 9 1"></polyline>
            </svg>
        </div>
    `;
    
    trigger.classList.toggle('active', isHubOpen);
    drop.classList.toggle('active', isHubOpen);

    if (!isHubOpen) return; // Stop rendering inner content if closed

    // 3) Expanded View: single container, divider sections (Overall -> Sessions)
    const cfg = getRiskGuardConfig(accountId);
    const lastActivityTs = sessions.reduce((mx, s) => Math.max(mx, getSessionActivityTs(s)), 0);
    const lastUpdateLabel = hasSessions ? formatLastUpdate(lastActivityTs) : '—';

    pushRiskUsageHistory(accountId, used);
    const trend30m = getRiskUsageTrend30m(accountId, used);
    const trendLabel = (trend30m == null) ? '' : `${fmtSignedMoney(trend30m)} in last 30m`;

    const riskySess = sessions.length ? [...sessions].sort((a,b) => Number(b.riskUsed||0) - Number(a.riskUsed||0))[0] : null;
    const shouldShowMainExposure = sessions.length >= 2 && (status !== 'stable' || badgeCount > 0);

    const ctxLeft = shouldShowMainExposure && riskySess
        ? `Main Exposure: <span class="hub-context-strong">${riskySess.sessionName || 'Session'}</span>`
        : `Remaining: <span class="hub-context-strong">${fmtMoney(remaining)}</span>`;
    const ctxRight = (!shouldShowMainExposure && trendLabel)
        ? `Trend: <span class="hub-context-strong">${trendLabel}</span>`
        : `Last update: <span class="hub-context-strong">${lastUpdateLabel}</span>`;

    const overallHtml = `
        <div class="hub-section-overall">
            <div class="hub-account-row">
                <span>${accountName} · ${accountId}</span>
                <span>${hasSessions ? `Last update: ${lastUpdateLabel}` : 'No Live Sessions'}</span>
            </div>
            <div class="hub-risk-row">
                <div class="hub-risk-tag ${hasSessions ? status : 'stable'}">${hasSessions ? statusLabel : 'Stable'}</div>
                <div class="hub-limit-info">
                    <span class="hub-limit-val">${fmtMoney(used)}</span> / ${fmtMoney(limit || 0)}
                </div>
            </div>
            <div class="hub-risk-bar-bg">
                <div class="hub-risk-bar-mark" style="left:${Math.max(0, Math.min(100, cfg.cautionStart * 100))}%"></div>
                <div class="hub-risk-bar-mark" style="left:${Math.max(0, Math.min(100, cfg.pressureStart * 100))}%"></div>
                <div class="hub-risk-bar-fill ${hasSessions ? status : 'stable'}" style="width: ${Math.max(0, Math.min(100, pct * 100))}%"></div>
            </div>
            <div class="hub-mini-kpis">
                <div class="hub-mini-kpi"><div class="k">Limit</div><div class="v">${fmtMoney(limit || 0)}</div></div>
                <div class="hub-mini-kpi"><div class="k">Used</div><div class="v">${fmtMoney(used)}</div></div>
                <div class="hub-mini-kpi"><div class="k">Remaining</div><div class="v">${fmtMoney(remaining)}</div></div>
            </div>
            <div class="hub-context-line">
                <span>${ctxLeft}</span>
                <span>${ctxRight}</span>
            </div>
        </div>
    `;

    // Section B: Sessions list (execution only; no risk status)
    // Sort: new trades -> recent activity -> start time
    const sorted = [...sessions].sort((a, b) => {
        const an = Number(a.newTrades || 0);
        const bn = Number(b.newTrades || 0);
        if (an !== bn) return bn - an;
        const aa = getSessionActivityTs(a);
        const ba = getSessionActivityTs(b);
        if (aa !== ba) return ba - aa;
        const at = a && a.startTime ? +new Date(a.startTime) : 0;
        const bt = b && b.startTime ? +new Date(b.startTime) : 0;
        return bt - at;
    });
    
    const listHtml = sorted.length > 0 ? sorted.map(s => {
        const pnl = Number(s.pnl || 0);
        const pnlClass = pnl >= 0 ? 'positive' : 'negative';
        const pnlTxt = fmtSignedMoney(pnl);
        const dur = getSessionDuration(s.startTime);
        
        // Click to view session
        const href = `../execute/index.html?view=sessions&session=${s.sessionId}`;
        
        return `
        <a class="hub-session-item" href="${href}">
            <div class="hub-sess-top">
                <div class="hub-sess-name">${s.sessionName || 'Live Session'}</div>
                <div style="display:flex; align-items:center; gap:10px;">
                    ${Number(s.newTrades || 0) > 0 ? `<div class="hub-new-trade">+${Number(s.newTrades || 0)} new</div>` : ''}
                    <div class="hub-sess-pnl ${pnlClass}">${pnlTxt}</div>
                    <span class="hub-view">View</span>
                </div>
            </div>
            <div class="hub-sess-mid">
                <div>
                    <span>${dur}</span> · <span>${s.blueprint || 'No Blueprint'}</span>
                </div>
                <div style="opacity:0.7;">${formatLastUpdate(getSessionActivityTs(s))}</div>
            </div>
        </a>
        `;
    }).join('') : `<div class="empty-hub-state">No Active Sessions</div>`;

    drop.innerHTML = overallHtml + `<div class="hub-section-sessions">${listHtml}</div>`;
}

function injectTopbarStyles() {
    if (document.getElementById('topbar-styles')) return;
    const styleElement = document.createElement('style');
    styleElement.id = 'topbar-styles';
    styleElement.textContent = topbarStyles;
    document.head.appendChild(styleElement);
}

/**
 * Init Topbar
 */
function initTopbar(options = {}) {
    const existingTopbar = document.getElementById('topbar');
    if (existingTopbar) {
        if (options.title) {
            const titleEl = document.getElementById('topbar-page-title');
            if (titleEl) titleEl.textContent = options.title;
        }
        updateLiveHub();
        return;
    }
    
    injectTopbarStyles();

    const pageTitle = options.title || 'ToMoon';
    const basePath = options.basePath || '..';
    
    // New HTML Structure
    const topbarHTML = `
        <div class="topbar-left">
            <h2 id="topbar-page-title" class="topbar-title">${pageTitle}</h2>
        </div>
        
        <div class="topbar-right">
            <!-- Global Live Hub -->
            <div id="live-hub-trigger" class="live-hub-trigger">
                <!-- Populated by JS -->
            </div>
            <div id="live-hub-dropdown" class="live-hub-dropdown">
                <!-- Dropdown Content -->
            </div>

            <div class="topbar-divider"></div>
            
            <div class="user-avatar" onclick="window.location.href='${basePath}/settings/index.html'">
                JD
            </div>
        </div>
    `;
    
    const topbar = document.createElement('div');
    topbar.id = 'topbar';
    topbar.className = 'topbar';
    topbar.innerHTML = topbarHTML;
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.insertAdjacentElement('afterend', topbar);
    } else {
        document.body.insertAdjacentElement('afterbegin', topbar);
    }
    
    // Global click listener for dropdown close
    document.addEventListener('click', closeLiveHub);

    // Arrow is the primary affordance/interaction
    document.addEventListener('click', function(e) {
        const toggle = e && e.target ? e.target.closest('.hub-toggle') : null;
        if (!toggle) return;
        const trigger = document.getElementById('live-hub-trigger');
        if (!trigger || !trigger.contains(toggle)) return;
        toggleLiveHub();
    });
    document.addEventListener('keydown', function(e) {
        if (!isHubOpen) return;
        if (e.key === 'Escape') {
            isHubOpen = false;
            updateLiveHub();
        }
    });
    
    updateLiveHub();
    
    // Timer Loop
    setInterval(() => {
        updateLiveHub();
    }, 1000);
}

function showTopbarToast(msg) {
    let toast = document.getElementById('topbar-simple-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'topbar-simple-toast';
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px);
            background: var(--bg-card, #161a22); border: 1px solid var(--primary, #3b82f6);
            padding: 12px 24px; border-radius: 8px; color: var(--text-main, #e2e8f0);
            font-size: 13px; z-index: 2000; transition: transform 0.3s, opacity 0.3s; opacity: 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity = '1';
    });
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

// Exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        initTopbar,
        getLiveSessionState,
        getLiveSessions,
        saveLiveSessionState,
        saveLiveSessions,
        startLiveSession,
        endLiveSession,
        updateLiveSessionPnL,
        updateLiveSessionBar: updateLiveHub, // Alias for compat
        showTopbarToast
    };
} else {
    window.initTopbar = initTopbar;
    window.getLiveSessionState = getLiveSessionState;
    window.getLiveSessions = getLiveSessions;
    window.saveLiveSessionState = saveLiveSessionState;
    window.saveLiveSessions = saveLiveSessions;
    window.startLiveSession = startLiveSession;
    window.endLiveSession = endLiveSession;
    window.updateLiveSessionPnL = updateLiveSessionPnL;
    window.updateLiveSessionBar = updateLiveHub;
    window.showTopbarToast = showTopbarToast;
}
