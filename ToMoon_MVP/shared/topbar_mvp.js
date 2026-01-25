/**
 * ToMoon MVP Topbar Module
 * MVP版本顶部栏模块 - 精简版
 * 
 * 功能：
 * - 页面标题显示
 * - Live Session 指示器
 * - 快捷操作按钮
 */

// --- Topbar CSS Styles ---
const topbarStyles = `
    /* --- Topbar --- */
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
    }

    /* Live Session Bar */
    .live-session-bar {
        display: none;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .live-session-bar:hover {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
        border-color: rgba(34, 197, 94, 0.5);
    }
    
    .live-session-bar.active {
        display: flex;
    }
    
    .live-indicator {
        width: 8px;
        height: 8px;
        background: var(--success, #22c55e);
        border-radius: 50%;
        animation: livePulse 2s infinite;
    }
    
    @keyframes livePulse {
        0%, 100% { 
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); 
            opacity: 1;
        }
        50% { 
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); 
            opacity: 0.8;
        }
    }
    
    .live-session-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    
    .live-session-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--success, #22c55e);
    }
    
    .live-session-duration {
        font-size: 11px;
        color: var(--text-muted, #94a3b8);
        font-family: 'SF Mono', 'Roboto Mono', monospace;
    }
    
    .live-session-pnl {
        font-size: 14px;
        font-weight: 700;
        padding-left: 12px;
        border-left: 1px solid rgba(255,255,255,0.1);
        margin-left: 4px;
    }
    
    .live-session-pnl.positive { color: var(--success, #22c55e); }
    .live-session-pnl.negative { color: var(--danger, #ef4444); }

    /* Quick Actions */
    .topbar-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .topbar-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        background: var(--bg-panel, #1c212b);
        border: 1px solid var(--border, #2a3142);
        border-radius: 6px;
        color: var(--text-muted, #94a3b8);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
    }
    
    .topbar-btn:hover {
        background: rgba(255,255,255,0.05);
        border-color: var(--text-muted, #94a3b8);
        color: var(--text-main, #e2e8f0);
    }
    
    .topbar-btn.primary {
        background: var(--primary, #3b82f6);
        border-color: var(--primary, #3b82f6);
        color: white;
    }
    
    .topbar-btn.primary:hover {
        background: #2563eb;
        border-color: #2563eb;
    }
    
    .topbar-btn svg {
        width: 16px;
        height: 16px;
    }
    
    .topbar-divider {
        width: 1px;
        height: 24px;
        background: var(--border, #2a3142);
        margin: 0 5px;
    }

    /* User Avatar */
    .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    
    .user-avatar:hover {
        transform: scale(1.05);
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
        .topbar {
            left: 0 !important;
            padding: 0 60px 0 16px;
        }
        
        .topbar-title {
            font-size: 16px;
        }
        
        .live-session-bar {
            padding: 6px 10px;
        }
        
        .live-session-info {
            display: none;
        }
        
        .topbar-btn span {
            display: none;
        }
        
        .topbar-btn {
            padding: 8px;
        }
    }
`;

// Live Session State
let liveSessionState = {
    active: false,
    sessionId: null,
    sessionName: '',
    startTime: null,
    pnl: 0,
    tradeCount: 0
};

/**
 * 获取 Live Session 状态
 */
function getLiveSessionState() {
    const stored = localStorage.getItem('toMoon_live_session');
    if (stored) {
        try {
            const state = JSON.parse(stored);
            state.startTime = new Date(state.startTime);
            return state;
        } catch (e) { 
            console.error('Failed to parse live session state', e); 
        }
    }
    return { ...liveSessionState };
}

/**
 * 保存 Live Session 状态
 */
function saveLiveSessionState(state) {
    localStorage.setItem('toMoon_live_session', JSON.stringify(state));
    liveSessionState = state;
    updateLiveSessionBar();
}

/**
 * 启动 Live Session
 */
function startLiveSession(sessionData) {
    const state = {
        active: true,
        sessionId: sessionData.id || `session_${Date.now()}`,
        sessionName: sessionData.name || 'Trading Session',
        startTime: new Date(),
        pnl: 0,
        tradeCount: 0,
        account: sessionData.account || 'Main Account',
        blueprint: sessionData.blueprint || null
    };
    saveLiveSessionState(state);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('liveSessionStarted', { detail: state }));
    
    return state;
}

/**
 * 结束 Live Session
 */
function endLiveSession() {
    const currentState = getLiveSessionState();
    if (currentState.active) {
        // 保存到待处理队列
        const endedSession = {
            ...currentState,
            endTime: new Date(),
            status: 'pending_review'
        };
        
        // 添加到待处理 Sessions
        let pendingSessions = [];
        try {
            pendingSessions = JSON.parse(localStorage.getItem('toMoon_pending_sessions') || '[]');
        } catch(e) { pendingSessions = []; }
        
        pendingSessions.push(endedSession);
        localStorage.setItem('toMoon_pending_sessions', JSON.stringify(pendingSessions));
        
        // 清除 Live Session
        const emptyState = {
            active: false,
            sessionId: null,
            sessionName: '',
            startTime: null,
            pnl: 0,
            tradeCount: 0
        };
        saveLiveSessionState(emptyState);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('liveSessionEnded', { detail: endedSession }));
        window.dispatchEvent(new Event('pendingSessionsUpdated'));
        
        return endedSession;
    }
    return null;
}

/**
 * 更新 Live Session P&L
 */
function updateLiveSessionPnL(pnl, tradeCount) {
    const state = getLiveSessionState();
    if (state.active) {
        state.pnl = pnl;
        state.tradeCount = tradeCount || state.tradeCount;
        saveLiveSessionState(state);
    }
}

/**
 * 更新 Live Session Bar UI
 */
function updateLiveSessionBar() {
    const bar = document.getElementById('live-session-bar');
    if (!bar) return;
    
    const state = getLiveSessionState();
    
    if (state.active) {
        bar.classList.add('active');
        
        const nameEl = bar.querySelector('.live-session-name');
        const durationEl = bar.querySelector('.live-session-duration');
        const pnlEl = bar.querySelector('.live-session-pnl');
        
        if (nameEl) nameEl.textContent = state.sessionName;
        if (durationEl) durationEl.textContent = getSessionDuration(state.startTime);
        if (pnlEl) {
            const sign = state.pnl >= 0 ? '+' : '-';
            pnlEl.textContent = `${sign}$${Math.abs(state.pnl).toFixed(2)}`;
            pnlEl.className = `live-session-pnl ${state.pnl >= 0 ? 'positive' : 'negative'}`;
        }
    } else {
        bar.classList.remove('active');
    }
}

/**
 * 获取 Session 持续时间
 */
function getSessionDuration(startTime) {
    if (!startTime) return '00:00:00';
    
    const now = new Date();
    const diff = Math.floor((now - new Date(startTime)) / 1000);
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * 注入 Topbar CSS 样式
 */
function injectTopbarStyles() {
    if (document.getElementById('topbar-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'topbar-styles';
    styleElement.textContent = topbarStyles;
    document.head.appendChild(styleElement);
}

/**
 * 初始化顶部栏
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
    
    const liveSessionState = getLiveSessionState();
    const liveBarClass = liveSessionState.active ? 'active' : '';

    const topbarHTML = `
        <div class="topbar-left">
            <h2 id="topbar-page-title" class="topbar-title">${pageTitle}</h2>
        </div>
        <div class="topbar-right">
            <!-- Live Session Bar -->
            <div class="live-session-bar ${liveBarClass}" id="live-session-bar" onclick="goToLiveSession()">
                <div class="live-indicator"></div>
                <div class="live-session-info">
                    <span class="live-session-name">${liveSessionState.sessionName || 'Live Session'}</span>
                    <span class="live-session-duration">00:00:00</span>
                </div>
                <span class="live-session-pnl positive">+$0.00</span>
            </div>
            
            <div class="topbar-divider"></div>
            
            <div class="topbar-actions">
                <a href="${basePath}/execute/index.html?view=sessions" class="topbar-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    <span>Sessions</span>
                </a>
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
    
    // 初始化 Live Session Bar
    updateLiveSessionBar();
    
    // 启动定时器更新 Session 时长
    setInterval(() => {
        const state = getLiveSessionState();
        if (state.active) {
            const durationEl = document.querySelector('.live-session-duration');
            if (durationEl) {
                durationEl.textContent = getSessionDuration(state.startTime);
            }
        }
    }, 1000);
}

/**
 * 跳转到 Live Session
 */
function goToLiveSession() {
    const state = getLiveSessionState();
    if (state.active) {
        window.location.href = `../execute/index.html?view=sessions&session=${state.sessionId}`;
    }
}

/**
 * 显示 Toast 消息
 */
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

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        initTopbar,
        getLiveSessionState,
        saveLiveSessionState,
        startLiveSession,
        endLiveSession,
        updateLiveSessionPnL,
        updateLiveSessionBar,
        showTopbarToast,
        goToLiveSession
    };
} else {
    window.initTopbar = initTopbar;
    window.getLiveSessionState = getLiveSessionState;
    window.saveLiveSessionState = saveLiveSessionState;
    window.startLiveSession = startLiveSession;
    window.endLiveSession = endLiveSession;
    window.updateLiveSessionPnL = updateLiveSessionPnL;
    window.updateLiveSessionBar = updateLiveSessionBar;
    window.showTopbarToast = showTopbarToast;
    window.goToLiveSession = goToLiveSession;
}
