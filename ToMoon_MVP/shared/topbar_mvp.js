/**
 * ToMoon MVP Topbar Module
 * MVP版本顶部栏模块 - 精简版
 * * Update: Premium "Command Pill" Design for Live Sessions
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
        background: var(--bg-card, #161a22); /* Deep dark background */
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

    /* --- 水平手风琴式 Session 布局 --- */
    .session-stack {
        display: none; 
        align-items: center;
        gap: 8px;
        margin-right: 12px;
        height: 40px;
    }

    .session-stack.active {
        display: flex;
    }

    .session-pill {
        display: flex;
        align-items: center;
        height: 36px;
        padding: 0 12px;
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid var(--border);
        border-radius: 18px;
        cursor: pointer;
        overflow: hidden; /* 必须，确保收缩时隐藏文字 */
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        white-space: nowrap;
        min-width: 36px; /* 收缩时的圆形宽度 */
    }

    /* 展开状态的 Pill */
    .session-pill.expanded {
        flex: 0 0 auto;
        background: rgba(59, 130, 246, 0.1);
        border-color: var(--primary);
        padding: 0 16px;
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
    }

    /* 收缩状态的 Pill (非活跃) */
    .session-pill.collapsed {
        width: 36px; /* 挤压后的宽度 */
        padding: 0;
        justify-content: center;
        opacity: 0.6;
    }

    .session-pill.collapsed:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.05);
    }

    /* 内部元素的显示/隐藏切换 */
    .pill-content {
        display: flex;
        align-items: center;
        gap: 12px;
        transition: opacity 0.3s;
    }

    .session-pill.collapsed .pill-content {
        display: none; /* 完全隐藏展开内容 */
    }

    .session-pill.collapsed .mini-label {
        display: block; /* 只显示首字母 */
        font-weight: 700;
        color: var(--text-muted);
    }

    .mini-label {
        display: none;
    }

    .live-dot {
        width: 6px;
        height: 6px;
        background: var(--danger);
        border-radius: 50%;
        box-shadow: 0 0 8px var(--danger);
        animation: pulse 2s infinite;
    }

    .data-group {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
    }

    .session-name {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-main);
    }

    .session-time {
        font-size: 10px;
        color: var(--text-muted);
    }

    .risk-micro-bar {
        width: 40px;
        height: 3px;
        background: #333;
        border-radius: 2px;
        overflow: hidden;
    }

    .risk-micro-fill {
        height: 100%;
        background: var(--success);
        width: 100%;
        transition: width 0.3s, background 0.3s;
    }

    .risk-micro-fill.warning { background: #f59e0b; }
    .risk-micro-fill.danger { background: #ef4444; }

    .btn-go {
        background: var(--primary);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 50px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
    }

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.4; }
        100% { opacity: 1; }
    }

    @keyframes slideInDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    /* Mobile Handling */
    @media (max-width: 900px) {
        .cmd-section-info, .cmd-section-risk { display: none; }
        .live-command-bar { gap: 8px; padding-right: 4px; }
    }

    @media (max-width: 768px) {
        .topbar { padding: 0 16px 0 60px; }
        .topbar-title { display: none; } /* Hide title on mobile to fit bar */
    }

    /* Standard Elements */
    .topbar-divider { width: 1px; height: 20px; background: var(--border); margin: 0 8px; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px; cursor: pointer; }
`;

// Live Session State (Logic Unchanged)
let liveSessionState = {
    active: false,
    sessionId: null,
    sessionName: '',
    startTime: null,
    pnl: 0,
    tradeCount: 0,
    account: null,
    blueprint: null,
    riskLimit: null,
    riskUsed: 0
};

const LIVE_SESSION_KEY = 'toMoon_live_session';
const LIVE_SESSIONS_KEY = 'toMoon_live_sessions';
const LIVE_FOCUS_KEY = 'toMoon_live_focus_session_id';

function normalizeSessionDates(session) {
    const s = { ...session };
    if (s.startTime) s.startTime = new Date(s.startTime);
    if (s.endTime) s.endTime = new Date(s.endTime);
    return s;
}

// --- Data Logic (Preserved) ---

function getLiveSessions() {
    const stored = localStorage.getItem(LIVE_SESSIONS_KEY);
    if (stored) {
        try {
            const arr = JSON.parse(stored);
            if (Array.isArray(arr)) return arr.map(normalizeSessionDates);
        } catch (e) { console.error('Failed to parse live sessions', e); }
    }
    // Backward compat
    const legacy = localStorage.getItem(LIVE_SESSION_KEY);
    if (legacy) {
        try {
            const s = normalizeSessionDates(JSON.parse(legacy));
            if (s && s.active) {
                localStorage.setItem(LIVE_SESSIONS_KEY, JSON.stringify([s]));
                localStorage.setItem(LIVE_FOCUS_KEY, s.sessionId || '');
                return [s];
            }
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

    const focusId = focusSessionId !== null ? focusSessionId : (localStorage.getItem(LIVE_FOCUS_KEY) || '');
    const focused = arr.find(s => String(s.sessionId) === String(focusId)) || arr[0] || null;
    if (focused && focused.active) {
        localStorage.setItem(LIVE_SESSION_KEY, JSON.stringify(focused));
        liveSessionState = focused;
    } else {
        localStorage.removeItem(LIVE_SESSION_KEY);
        liveSessionState = { ...liveSessionState, active: false };
    }
    updateLiveSessionBar();
}

function getLiveSessionState() {
    const sessions = getLiveSessions();
    if (sessions.length === 0) return { ...liveSessionState };

    const focusId = localStorage.getItem(LIVE_FOCUS_KEY) || '';
    let focus = null;

    // First try to find the focused session
    if (focusId) {
        focus = sessions.find(s => String(s.sessionId) === String(focusId));
    }

    // If focused session not found or no focus set, use the first session but don't change localStorage
    if (!focus) {
        focus = sessions[0];
        // Don't automatically set focus to first session - let it be explicitly set
    }

    return focus ? normalizeSessionDates(focus) : { ...liveSessionState };
}

function saveLiveSessionState(state) {
    const sessions = getLiveSessions();
    if (sessions.length === 0) {
        saveLiveSessions([state], state.sessionId || null);
        return;
    }
    const focusId = localStorage.getItem(LIVE_FOCUS_KEY) || '';
    const idx = sessions.findIndex(s => String(s.sessionId) === String(focusId));
    if (idx >= 0) {
        sessions[idx] = state;
        saveLiveSessions(sessions, focusId);
    } else {
        sessions.push(state);
        saveLiveSessions(sessions, state.sessionId || null);
    }
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
        account: sessionData.account || 'Main',
        blueprint: sessionData.blueprint || 'No Blueprint',
        riskLimit: Number.isFinite(riskLimit) ? riskLimit : null,
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

    const currentState = sessions[idx];
    if (!currentState || !currentState.active) return null;

    const endedSession = {
        ...currentState,
        endTime: new Date(),
        status: 'pending_review'
    };

    let pendingSessions = [];
    try {
        pendingSessions = JSON.parse(localStorage.getItem('toMoon_pending_sessions') || '[]');
    } catch(e) { pendingSessions = []; }

    pendingSessions.push(endedSession);
    localStorage.setItem('toMoon_pending_sessions', JSON.stringify(pendingSessions));

    sessions.splice(idx, 1);
    const newFocus = sessions.length ? sessions[sessions.length - 1].sessionId : '';
    saveLiveSessions(sessions, newFocus);

    window.dispatchEvent(new CustomEvent('liveSessionEnded', { detail: endedSession }));
    window.dispatchEvent(new Event('pendingSessionsUpdated'));

    return endedSession;
}

function updateLiveSessionPnL(pnl, tradeCount, sessionId = null) {
    const sessions = getLiveSessions();
    if (sessions.length === 0) return;

    const targetId = sessionId || (localStorage.getItem(LIVE_FOCUS_KEY) || '') || sessions[0].sessionId;
    const idx = sessions.findIndex(s => String(s.sessionId) === String(targetId));
    if (idx < 0) return;

    sessions[idx].pnl = pnl;
    sessions[idx].tradeCount = tradeCount ?? sessions[idx].tradeCount;
    // Note: Risk Used should also be updated here ideally, but for MVP we assume pnl reflects risk roughly or separate call
    saveLiveSessions(sessions, targetId);
}

// --- UI Logic (REDESIGNED) ---

/**
 * Updates the new "Command Pill" style bar
 */
function updateLiveSessionBar() {
    const stack = document.getElementById('session-stack');
    if (!stack) return;
    
    const sessions = getLiveSessions();
    const state = getLiveSessionState(); // 当前选中的 Session

    if (sessions.length > 0) {
        stack.classList.add('active');
        
        // 获取现有的 pill map
        const existingPills = {};
        stack.querySelectorAll('.session-pill').forEach(pill => {
            const sessionId = pill.dataset.sessionId;
            if (sessionId) existingPills[sessionId] = pill;
        });
        
        // 当前 session IDs
        const currentSessionIds = new Set(sessions.map(sess => String(sess.sessionId)));
        
        // 移除不再存在的 pill
        Object.keys(existingPills).forEach(sessionId => {
            if (!currentSessionIds.has(sessionId)) {
                existingPills[sessionId].remove();
            }
        });
        
        // 更新或创建 pill
        sessions.forEach(sess => {
            const sessionIdStr = String(sess.sessionId);
            const isFocused = (sessionIdStr === String(state.sessionId));
            const pillId = `pill-${sessionIdStr}`;
            
            let pill = existingPills[sessionIdStr];
            if (!pill) {
                // 创建新 pill
                pill = document.createElement('div');
                pill.id = pillId;
                pill.dataset.sessionId = sessionIdStr;
                pill.className = `session-pill ${isFocused ? 'expanded' : 'collapsed'}`;
                
                // 获取首字母作为收缩时的标签
                const initial = sess.sessionName ? sess.sessionName.charAt(0).toUpperCase() : 'S';
                
                pill.innerHTML = `
                    <div class="mini-label">${initial}</div>
                    
                    <div class="pill-content">
                        <div class="live-dot"></div>
                        <div class="data-group">
                            <span class="session-name">${sess.sessionName}</span>
                            <span class="session-time" id="time-${sess.sessionId}">${getSessionDuration(sess.startTime)}</span>
                        </div>
                        <div class="risk-micro-bar">
                            <div class="risk-micro-fill" id="risk-${sess.sessionId}"></div>
                        </div>
                        <div class="btn-go" onclick="window.location.href='../execute/index.html?session=${sess.sessionId}'">Go</div>
                    </div>
                `;
                
                // 点击切换手风琴状态 (避免与Go按钮冲突)
                pill.onclick = (e) => {
                    // 如果点击的是Go按钮或其子元素，不切换focus
                    if (e.target.closest('.btn-go')) {
                        return;
                    }
                    if (!isFocused) {
                        saveLiveSessions(sessions, sess.sessionId); // 切换 Focus 并触发重绘
                    }
                };
                
                stack.appendChild(pill);
            } else {
                // 更新现有 pill 的类
                pill.className = `session-pill ${isFocused ? 'expanded' : 'collapsed'}`;
                
                // 更新内容
                const initial = sess.sessionName ? sess.sessionName.charAt(0).toUpperCase() : 'S';
                const miniLabel = pill.querySelector('.mini-label');
                if (miniLabel) miniLabel.textContent = initial;
                
                const sessionNameEl = pill.querySelector('.session-name');
                if (sessionNameEl) sessionNameEl.textContent = sess.sessionName;
                
                const timeEl = pill.querySelector('.session-time');
                if (timeEl) timeEl.textContent = getSessionDuration(sess.startTime);
                
                const riskFill = pill.querySelector('.risk-micro-fill');
                if (riskFill) {
                    const riskPercentage = calculateRisk(sess);
                    let riskClass = 'risk-micro-fill';
                    if (riskPercentage < 30) riskClass += ' danger';
                    else if (riskPercentage < 60) riskClass += ' warning';
                    riskFill.className = riskClass;
                    riskFill.style.width = `${riskPercentage}%`;
                }
            }
        });
        
    } else {
        stack.classList.remove('active');
        // 清空所有 pill
        stack.innerHTML = '';
    }
}

function getSessionDuration(startTime) {
    if (!startTime) return '00:00:00';
    const now = new Date();
    const diff = Math.floor((now - new Date(startTime)) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function calculateRisk(sess) {
    if (!sess.riskLimit || sess.riskLimit <= 0) return 100;
    const remaining = Math.max(0, sess.riskLimit - Math.abs(sess.riskUsed || 0));
    return (remaining / sess.riskLimit) * 100;
}

function injectTopbarStyles() {
    if (document.getElementById('topbar-styles')) return;
    const styleElement = document.createElement('style');
    styleElement.id = 'topbar-styles';
    styleElement.textContent = topbarStyles;
    document.head.appendChild(styleElement);
}

/**
 * Init Topbar with New Structure
 */
function initTopbar(options = {}) {
    const existingTopbar = document.getElementById('topbar');
    if (existingTopbar) {
        if (options.title) {
            const titleEl = document.getElementById('topbar-page-title');
            if (titleEl) titleEl.textContent = options.title;
        }
        updateLiveSessionBar();
        return;
    }
    
    injectTopbarStyles();

    const pageTitle = options.title || 'ToMoon';
    const basePath = options.basePath || '..';
    
    // HTML Structure for the "Command Pill"
    const topbarHTML = `
        <div class="topbar-left">
            <h2 id="topbar-page-title" class="topbar-title">${pageTitle}</h2>
        </div>
        
        <div class="topbar-right">
            <div id="session-stack" class="session-stack">
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
    
    updateLiveSessionBar();
    
    // Timer Loop
    setInterval(() => {
        const sessions = getLiveSessions();
        sessions.forEach(sess => {
            if (sess.active) {
                const timerEl = document.getElementById(`time-${sess.sessionId}`);
                if (timerEl) {
                    timerEl.textContent = getSessionDuration(sess.startTime);
                }
            }
        });
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
        updateLiveSessionBar,
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
    window.updateLiveSessionBar = updateLiveSessionBar;
    window.showTopbarToast = showTopbarToast;
}