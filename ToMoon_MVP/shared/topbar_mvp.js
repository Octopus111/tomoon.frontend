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

    :root {
        --hub-width: 380px;
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
    .live-hub-wrap {
        position: relative;
        width: auto;
        min-width: 240px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1001; /* create a local stacking context for trigger+dropdown */
    }

    .live-hub-trigger {
        display: flex;
        align-items: center;
        gap: 0; /* controlled by inner elements */
        padding: 0 4px 0 12px;
        border-radius: 10px;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        height: 40px;
        width: auto;
        min-width: 240px;
        box-sizing: border-box;
        overflow: hidden;
    }
    .live-hub-trigger:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
    }

    /* When hub is open, remove the trigger's bottom radius to visually join with dropdown */
    .live-hub-wrap.hub-open .live-hub-trigger {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom-color: transparent;
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
        gap: 12px;
        font-size: 13px;
        color: var(--text-muted);
        flex: 1;
    }
    .hub-pager-btn {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 4px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.2s;
        padding: 0;
    }
    .hub-pager-btn:hover:not(:disabled) { background: rgba(255,255,255,0.05); color: var(--text-main); border-color: var(--border); }
    .hub-pager-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .hub-expand-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px;
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s;
        border-top: 1px solid rgba(255,255,255,0.02);
    }
    .hub-expand-row:hover { opacity: 1; background: rgba(255,255,255,0.01); }

    .hub-live-dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.18);
        box-shadow: 0 0 0 rgba(255,255,255,0.0);
        display: inline-block;
        opacity: 0.75;
    }
    .hub-live-dot.live {
        opacity: 1;
        background: #ef4444; /* Discord-like live red */
        animation: hubPulse 1.35s infinite;
    }
    .hub-live-dot.pending {
        opacity: 1;
        background: var(--warning);
        box-shadow: 0 0 18px rgba(245, 158, 11, 0.22);
    }
    @keyframes hubPulse {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.55); }
        70% { box-shadow: 0 0 0 9px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }

    /* removed pseudo-element bridge; dropdown will overlap to create a seamless appearance */

    .hub-val {
        color: var(--text-main);
        font-weight: 600;
    }
    .hub-val.stable { color: var(--success); }
    .hub-val.caution { color: var(--warning); }
    .hub-val.pressure { color: var(--danger); }

    .hub-sep { opacity: 0.3; }

    .hub-badge { display: none !important; }

    /* Activity / pill group on the right of the trigger */
    .hub-activity-group {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255,255,255,0.05);
        padding: 4px 8px;
        border-radius: 8px;
        margin-right: 4px;
        transition: all 0.2s;
    }
    .live-hub-trigger:hover .hub-activity-group { background: rgba(255,255,255,0.1); }

    .hub-status-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 6px;
        transition: all 0.3s;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }
    .hub-status-pill.has-new {
        background: var(--primary);
        color: white;
        box-shadow: 0 0 12px rgba(59,130,246,0.3);
    }
    .hub-status-pill.idle {
        background: rgba(255,255,255,0.05);
        color: var(--text-muted);
    }
    .hub-status-pill.live {
        background: rgba(239, 68, 68, 0.16);
        color: #fecaca;
        border: 1px solid rgba(239, 68, 68, 0.25);
    }
    .hub-status-pill.pending {
        background: rgba(245, 158, 11, 0.16);
        color: #fde68a;
        border: 1px solid rgba(245, 158, 11, 0.25);
    }
    .hub-status-pill.cta {
        background: rgba(59, 130, 246, 0.16);
        color: #dbeafe;
        border: 1px solid rgba(59, 130, 246, 0.25);
    }

    /* Multi-Account Risk Indicators */
    .hub-multi-risk { display: flex; gap: 4px; align-items: center; margin-left: 4px; }
    .hub-risk-pip { 
        width: 8px; 
        height: 12px; 
        border-radius: 3px; 
        background: rgba(255,255,255,0.1); 
        cursor: help;
    }
    .hub-risk-pip.stable { background: var(--success); }
    .hub-risk-pip.caution { background: var(--warning); }
    .hub-risk-pip.pressure { background: var(--danger); }

    .hub-arrow {
        color: var(--text-muted);
        transition: transform 0.2s;
    }
    .live-hub-trigger.active .hub-arrow {
        transform: rotate(180deg);
    }

    /* Dropdown UI - Connected to topbar */
    .live-hub-dropdown {
        position: absolute;
        top: calc(100% - 1px);
        left: 0;
        right: auto;
        width: 100%;
        background: var(--bg-card, #161a22);
        border: 1px solid var(--border);
        border-top: none;
        border-radius: 0 0 12px 12px;
        box-shadow: 0 18px 60px rgba(0,0,0,0.65);
        z-index: 10003; /* ensure dropdown sits above topbar and trigger */
        display: none;
        flex-direction: column;
        overflow: hidden;
        transform-origin: top right;
        will-change: transform, opacity;
        animation: hubSlideIn 0.18s ease-out;
    }
    .live-hub-dropdown.active { display: flex; }

    /* Ensure dropdown top corners are flat when active so it pairs visually with trigger */
    .live-hub-dropdown.active {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        margin-top: -1px;
    }

    @keyframes hubSlideIn {
        from { opacity: 0; transform: translateY(-1px); }
        to { opacity: 1; transform: translateY(0); }
    }

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
        transition: background 0.2s, border-left 0.2s;
        text-decoration: none;
        display: block;
        border-left: 3px solid transparent;
    }
    .hub-session-item:last-child { border-bottom: none; }
    .hub-session-item:hover { background: rgba(255,255,255,0.04); }
    /* Session card risk-status soft accent */
    .hub-session-item.risk-stable { border-left-color: var(--rg-stable-soft, rgba(34, 197, 94, 0.5)); }
    .hub-session-item.risk-caution { border-left-color: var(--rg-caution-soft, rgba(245, 158, 11, 0.5)); background: rgba(245, 158, 11, 0.03); }
    .hub-session-item.risk-pressure { border-left-color: var(--rg-pressure-soft, rgba(239, 68, 68, 0.5)); background: rgba(239, 68, 68, 0.04); }

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

    /* === Filter Group Styles === */
    .unified-filter-group {
        display: flex;
        align-items: center;
        background: var(--bg-panel, #232730);
        border: 1px solid var(--border, #334155);
        border-radius: 6px;
        padding: 0;
        margin-left: 12px;
    }

    .filter-segment {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative; /* For dropdown positioning */
        height: 100%;
        color: var(--text-main, #e2e8f0);
        font-size: 13px;
        box-sizing: border-box;
    }
    .filter-segment:hover {
        background: rgba(255,255,255,0.05);
    }
    .filter-segment:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
    .filter-segment:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; }

    .unified-divider {
        width: 1px;
        height: 20px;
        background: var(--border, #334155);
        opacity: 0.5;
    }

    .filter-icon { width: 16px; height: 16px; stroke: currentColor; flex-shrink: 0; }

    /* Dropdown Menu */
    .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 5px;
        background: var(--bg-card, #1a1d24);
        border: 1px solid var(--border, #334155);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        min-width: 180px;
        z-index: 100;
        display: none;
        flex-direction: column;
        padding: 5px;
    }
    .dropdown-menu.show { display: flex; }

    /* Fix dropdown direction for the right-most element */
    .dropdown-menu.align-right {
        left: auto; 
        right: 0;
    }
    
    .dropdown-item {
        padding: 8px 12px;
        border-radius: 4px;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .dropdown-item:hover {
        background: rgba(255,255,255,0.05);
        color: var(--text-main, #e2e8f0);
    }
    .dropdown-item.active {
        color: var(--primary, #3b82f6);
        background: rgba(59, 130, 246, 0.1);
    }
    .dropdown-item input[type="checkbox"] {
        cursor: pointer;
        width: 14px;
        height: 14px;
        accent-color: var(--primary, #3b82f6);
    }
    .dropdown-item.manage-accounts {
        color: var(--primary, #3b82f6);
        font-weight: 500;
        justify-content: center;
    }
    .dropdown-item.manage-accounts:hover {
        background: rgba(59, 130, 246, 0.1);
    }
    .dropdown-divider {
        height: 1px;
        background: var(--border, #334155);
        margin: 5px 0;
    }
    .dropdown-section-label {
        padding: 6px 12px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
        opacity: 0.7;
    }

    /* Date Picker Specific Styles */
    .date-picker-dropdown {
        width: auto;
        min-width: 420px;
        padding: 0;
        flex-direction: row;
        overflow: hidden;
    }
    
    .calendar-section {
        flex: 1;
        padding: 15px;
        border-right: 1px solid var(--border, #334155);
    }
    
    .shortcuts-section {
        width: 120px;
        padding: 10px;
        background: rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        color: var(--text-main, #e2e8f0);
        font-weight: 600;
        font-size: 14px;
    }
    
    .calendar-nav-btn {
        background: transparent;
        border: 1px solid var(--border, #334155);
        color: var(--text-muted, #94a3b8);
        border-radius: 4px;
        cursor: pointer;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .calendar-nav-btn:hover {
        color: var(--text-main, #e2e8f0);
        border-color: var(--text-muted, #94a3b8);
        background: rgba(255,255,255,0.05);
    }
    
    .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-size: 12px;
        color: var(--text-muted, #94a3b8);
        margin-bottom: 5px;
    }
    
    .calendar-grid-picker {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        text-align: center;
    }
    
    .calendar-day {
        font-size: 13px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 4px;
        color: var(--text-main, #e2e8f0);
        transition: all 0.1s;
    }
    .calendar-day:hover {
        background: rgba(255,255,255,0.1);
    }
    .calendar-day.empty {
        pointer-events: none;
    }
    .calendar-day.selected {
        background: var(--primary, #3b82f6);
        color: white;
    }
    .calendar-day.in-range {
        background: rgba(59, 130, 246, 0.15);
        color: var(--primary, #3b82f6);
        border-radius: 0;
    }
    .calendar-day.range-start {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
    .calendar-day.range-end {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
    
    .shortcut-btn {
        text-align: left;
        background: transparent;
        border: none;
        color: var(--text-muted, #94a3b8);
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
    }
    .shortcut-btn:hover {
        background: rgba(255,255,255,0.05);
        color: var(--text-main, #e2e8f0);
    }
    .shortcut-btn.active {
        color: var(--primary, #3b82f6);
        background: rgba(59, 130, 246, 0.1);
        font-weight: 500;
    }

    /* === Pending Indicator Styles (Redesigned) === */
    .pending-indicator {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 10px;
        height: 32px;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.2);
        border-radius: 6px;
        color: var(--warning, #f59e0b);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .pending-indicator:hover {
        background: rgba(245, 158, 11, 0.15);
        border-color: rgba(245, 158, 11, 0.4);
        transform: translateY(-1px);
    }
    .pending-indicator.empty { display: none; }
    
    .pending-dot {
        width: 6px; height: 6px;
        background: currentColor;
        border-radius: 50%;
        box-shadow: 0 0 8px currentColor;
        animation: pendingGlow 2s infinite;
    }
    @keyframes pendingGlow {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }

    .pending-badge {
        background: var(--warning, #f59e0b);
        color: #000;
        font-size: 10px;
        font-weight: 800;
        padding: 0 5px;
        height: 16px;
        line-height: 16px;
        border-radius: 4px;
        min-width: 14px;
        text-align: center;
    }

    /* Pending Dropdown (Redesigned) */
    .pending-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: -8px;
        width: 360px;
        background: var(--bg-card, #161a22);
        border: 1px solid var(--border, #2a3142);
        border-radius: 12px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.3);
        z-index: 200;
        display: none;
        flex-direction: column;
        overflow: hidden;
        transform-origin: top right;
        animation: dropdownSlideIn 0.15s ease-out;
    }
    .pending-dropdown.show { display: flex; }
    
    @keyframes dropdownSlideIn {
        from { opacity: 0; transform: translateY(-4px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    .pending-dropdown-header {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border, #2a3142);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(to right, rgba(255,255,255,0.02), transparent);
    }
    .pending-dropdown-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main, #e2e8f0);
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .pending-dropdown-action {
        font-size: 11px;
        color: var(--text-muted);
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        transition: all 0.2s;
    }
    .pending-dropdown-action:hover { color: var(--primary); background: rgba(59, 130, 246, 0.1); }
    
    .pending-list {
        max-height: 360px;
        overflow-y: auto;
        padding: 4px;
    }
    .pending-list::-webkit-scrollbar { width: 4px; }
    .pending-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
    
    .pending-section-label {
        padding: 8px 12px 4px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-muted);
        letter-spacing: 0.05em;
        opacity: 0.7;
    }

    .pending-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px 12px;
        margin: 2px 4px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        transition: all 0.15s;
        cursor: pointer;
        position: relative;
    }
    .pending-item:hover {
        background: rgba(255,255,255,0.03);
        border-color: rgba(255,255,255,0.06);
    }
    .pending-item::before {
        content: '';
        position: absolute;
        left: 0; top: 10px; bottom: 10px;
        width: 3px;
        border-radius: 0 3px 3px 0;
        background: currentColor;
        opacity: 0;
        transition: opacity 0.2s;
    }
    .pending-item:hover::before { opacity: 1; }
    
    .pending-item.session-item { color: var(--primary, #3b82f6); }
    .pending-item.trade-item { color: var(--warning, #f59e0b); }
    
    .pending-item-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .pending-item-main {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .pending-icon {
        width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,0.05);
        border-radius: 6px;
        color: inherit;
        flex-shrink: 0;
    }
    .pending-item-info { display: flex; flex-direction: column; }
    
    .pending-item-name { 
        font-weight: 600; font-size: 13px; color: var(--text-main, #e2e8f0); 
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;
    }
    
    .pending-item-pnl { font-weight: 700; font-size: 13px; font-family: 'SF Mono', monospace; }
    .pending-item-pnl.positive { color: var(--success, #22c55e); }
    .pending-item-pnl.negative { color: var(--danger, #ef4444); }
    
    .pending-item-details {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: 38px;
        font-size: 11px;
        color: var(--text-muted, #94a3b8);
    }
    .pending-detail-badge {
        background: rgba(255,255,255,0.06);
        padding: 1px 6px;
        border-radius: 4px;
        color: var(--text-muted);
        font-size: 10px;
    }
    
    .pending-dropdown-footer {
        padding: 10px 16px;
        border-top: 1px solid var(--border, #2a3142);
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(0,0,0,0.1);
    }
    .pending-footer-hint {
        font-size: 11px;
        color: var(--text-muted, #94a3b8);
        opacity: 0.7; font-style: italic;
    }

    .pending-empty-state {
        text-align: center;
        padding: 30px 20px;
        color: var(--text-muted);
    }
    .pending-empty-state .icon { font-size: 32px; margin-bottom: 10px; opacity: 0.5; }
    .pending-empty-state .text { font-size: 13px; }
`;

// Base path for routing (set by initTopbar)
let TOPBAR_BASE_PATH = '..';

// Session Management (Logic Preserved & Enhanced for Aggregation)
let liveSessionState = {
    active: false,
    sessionId: null
};

// UI State for Pagination & Expansion
let currentAccountIndex = 0;
let expandedSessionAccounts = {}; // map of accountId -> boolean

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
// Marker used to ignore document-level clicks that began inside the Live Hub
let _liveHubMouseDownInside = false;

function toggleLiveHub() {
    isHubOpen = !isHubOpen;
    if (isHubOpen) {
        // Opening implies the user has "seen" the new-trade indicators.
        clearNewTradesForCurrentAccount();
    }
    updateLiveHub();
    if (isHubOpen) requestAnimationFrame(positionLiveHubDropdown);
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
    // If no config or pct passed, treat as 0
    // But config is retrieved inside here usually? No, passed in.
    // The previous implementation fetched config inside. Let's keep it robust.
    return 'stable'; // Placeholder, logic moved to new helpers
}
// Redefining helper to take explicit config
function getStatusFromPct(pct, cfg) {
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
    // First try new per-account storage, then fallback to Settings page localStorage keys
    try {
        const raw = localStorage.getItem(RISK_CFG_STORAGE_KEY);
        if (raw) {
            const obj = JSON.parse(raw);
            const cfg = obj && obj[id] ? obj[id] : null;
            const cautionStart = Number(cfg && cfg.cautionStart);
            const pressureStart = Number(cfg && cfg.pressureStart);
            if (Number.isFinite(cautionStart) && Number.isFinite(pressureStart) && cautionStart >= 0 && pressureStart >= 0) {
                return { cautionStart, pressureStart };
            }
        }
    } catch (_) { /* ignore */ }
    // Fallback: read from Settings page's rg_threshold_* keys
    try {
        const cautionPct = Number(localStorage.getItem('rg_threshold_caution'));
        const pressurePct = Number(localStorage.getItem('rg_threshold_pressure'));
        if (Number.isFinite(cautionPct) && Number.isFinite(pressurePct) && cautionPct > 0 && pressurePct > 0) {
            return { cautionStart: cautionPct / 100, pressureStart: pressurePct / 100 };
        }
    } catch (_) { /* ignore */ }
    return { ...RISK_CFG_DEFAULT };
}

// Read RiskGuard colors from Settings localStorage (softer versions for session cards)
function getRiskGuardColors() {
    const stable = localStorage.getItem('rg_color_stable') || '#10b981';
    const caution = localStorage.getItem('rg_color_caution') || '#f59e0b';
    const pressure = localStorage.getItem('rg_color_pressure') || '#ef4444';
    // Soften by using alpha
    const toSoft = hex => {
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.55)`;
    };
    return {
        stable, caution, pressure,
        stableSoft: toSoft(stable),
        cautionSoft: toSoft(caution),
        pressureSoft: toSoft(pressure)
    };
}

function applyRiskGuardCSSVars() {
    const colors = getRiskGuardColors();
    document.documentElement.style.setProperty('--rg-stable-soft', colors.stableSoft);
    document.documentElement.style.setProperty('--rg-caution-soft', colors.cautionSoft);
    document.documentElement.style.setProperty('--rg-pressure-soft', colors.pressureSoft);
    document.documentElement.style.setProperty('--success', colors.stable);
    document.documentElement.style.setProperty('--warning', colors.caution);
    document.documentElement.style.setProperty('--danger', colors.pressure);
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
    function positionLiveHubDropdown() {
        const drop = document.getElementById('live-hub-dropdown');
        if (!drop) return;
        if (!isHubOpen) return;

        // Dropdown is now absolutely positioned under the trigger; only clamp horizontally.
        const pad = 8;
        drop.style.left = '0px';
        drop.style.right = 'auto';

        const rect = drop.getBoundingClientRect();
        let offset = 0;
        const maxRight = window.innerWidth - pad;
        const minLeft = pad;

        if (rect.right > maxRight) offset -= (rect.right - maxRight);
        if (rect.left < minLeft) offset += (minLeft - rect.left);

        if (offset !== 0) drop.style.left = `${offset}px`;
        drop.style.borderTop = 'none';
        drop.style.boxShadow = '0 18px 60px rgba(0,0,0,0.65)';
        drop.style.zIndex = '10003';
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

// --- Data Grouping ---
function groupSessionsByAccount(sessions) {
    const map = {};
    sessions.forEach(s => {
        const accId = s.accountId || 'main';
        if (!map[accId]) {
            map[accId] = {
                id: accId,
                name: s.account || 'Main Account',
                sessions: [],
                riskLimit: Number(s.riskLimit) || 2000,
                riskUsed: 0
            };
        }
        map[accId].sessions.push(s);
        map[accId].riskUsed += Number(s.riskUsed || 0);
    });
    return Object.values(map);
}

// Ensure we have demo data for visualization
function ensureDemoLiveHubData() {
    const rawInfo = localStorage.getItem('toMoon_demo_hub_seeded_v2');
    if (rawInfo) return; // Already seeded

    const now = Date.now();
    const demoSessions = [
        // Account 1: MT5 (Pressure)
        {
            active: true,
            sessionId: 'demo_s1',
            sessionName: 'Morning Scalp',
            startTime: new Date(now - 3600000).toISOString(),
            pnl: -450,
            tradeCount: 12,
            account: 'MetaTrader 5 - Demo',
            accountId: 'mt5_demo',
            blueprint: 'Gap Fill Strategy',
            riskLimit: 500, // Limit 500, Used 450 -> 90% -> Pressure
            riskUsed: 450,
            newTrades: 2,
            lastTradeTime: new Date(now - 60000).toISOString()
        },
        {
            active: true,
            sessionId: 'demo_s2',
            sessionName: 'News Event Fade',
            startTime: new Date(now - 1200000).toISOString(),
            pnl: -50, // total risk used for account = 450+50 = 500 (100%!)
            tradeCount: 3,
            account: 'MetaTrader 5 - Demo',
            accountId: 'mt5_demo',
            blueprint: 'News Reversal',
            riskLimit: 500,
            riskUsed: 50,
            lastTradeTime: new Date(now - 300000).toISOString()
        },
        {
            active: true,
            sessionId: 'demo_s3',
            sessionName: 'Afternoon Drift',
            startTime: new Date(now - 7200000).toISOString(),
            pnl: 120,
            tradeCount: 5,
            account: 'MetaTrader 5 - Demo',
            accountId: 'mt5_demo',
            blueprint: 'Trend Following',
            riskLimit: 500,
            riskUsed: 0,
            lastTradeTime: new Date(now - 600000).toISOString()
        },

        // Account 2: ATAS (Stable, many sessions)
        {
            active: true,
            sessionId: 'demo_s4',
            sessionName: 'ES Futures Grid',
            startTime: new Date(now - 18000000).toISOString(),
            pnl: 1250,
            tradeCount: 45,
            account: 'ATAS - Live Data',
            accountId: 'atas_live_882910',
            blueprint: 'Grid Auto',
            riskLimit: 3000,
            riskUsed: 0,
            lastTradeTime: new Date(now - 5000).toISOString()
        },
        {
            active: true,
            sessionId: 'demo_s5',
            sessionName: 'NQ Scalp',
            startTime: new Date(now - 900000).toISOString(),
            pnl: 220,
            tradeCount: 8,
            account: 'ATAS - Live Data',
            accountId: 'atas_live_882910',
            blueprint: 'Breakout',
            riskLimit: 3000,
            riskUsed: 0,
            newTrades: 5,
            lastTradeTime: new Date(now - 1000).toISOString()
        },
        {
            active: true,
            sessionId: 'demo_s6',
            sessionName: 'Lunch Reversion',
            startTime: new Date(now - 5400000).toISOString(),
            pnl: -120,
            tradeCount: 4,
            account: 'ATAS - Live Data',
            accountId: 'atas_live_882910',
            blueprint: 'Mean Reversion',
            riskLimit: 3000,
            riskUsed: 120, // 120/3000 = 4% -> Stable
            lastTradeTime: new Date(now - 1200000).toISOString()
        }
    ];

    saveLiveSessions(demoSessions, 'demo_s1');
    localStorage.setItem('toMoon_demo_hub_seeded_v2', 'true');
    console.log("Seeded multi-account demo data for Live Hub");
}

/**
 * 确保有demo pending数据用于展示
 */
function ensureDemoPendingData() {
    const rawInfo = localStorage.getItem('toMoon_demo_pending_seeded_v1');
    if (rawInfo) return; // Already seeded

    const now = Date.now();
    
    // Demo pending sessions
    const demoPendingSessions = [
        {
            id: 'pending_session_1',
            sessionName: 'Asian Session Scalp',
            endTime: new Date(now - 1800000).toISOString(), // 30 mins ago
            totalPnL: 185.50,
            tradeCount: 6,
            account: 'MetaTrader 5 - Demo',
            blueprint: 'Breakout Strategy'
        },
        {
            id: 'pending_session_2',
            sessionName: 'London Open',
            endTime: new Date(now - 7200000).toISOString(), // 2 hours ago
            totalPnL: -75.20,
            tradeCount: 4,
            account: 'ATAS - Live Data',
            blueprint: 'News Fade'
        }
    ];
    
    // Demo pending trades
    const demoPendingTrades = [
        {
            id: 'pending_trade_1',
            symbol: 'EUR/USD',
            side: 'long',
            pnl: 125.50,
            closeTime: new Date(now - 900000).toISOString(), // 15 mins ago
            account: 'MetaTrader 5 - Demo',
            blueprint: 'Trend Following',
            rating: null
        },
        {
            id: 'pending_trade_2',
            symbol: 'XAU/USD',
            side: 'short',
            pnl: -45.00,
            closeTime: new Date(now - 3600000).toISOString(), // 1 hour ago
            account: 'MetaTrader 5 - Demo',
            blueprint: 'Reversal',
            rating: null
        }
    ];
    
    localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(demoPendingSessions));
    localStorage.setItem(PENDING_TRADES_KEY, JSON.stringify(demoPendingTrades));
    localStorage.setItem('toMoon_demo_pending_seeded_v1', 'true');
    console.log("Seeded demo pending data for Topbar");
}

function updateLiveHub() {
    const trigger = document.getElementById('live-hub-trigger');
    const drop = document.getElementById('live-hub-dropdown');
    const wrap = document.getElementById('live-hub-wrap');
    
    // Safety check
    if (!trigger || !drop) return;
    if (wrap) wrap.classList.toggle('hub-open', isHubOpen);

    const allSessions = getLiveSessions();
    const accountGroups = groupSessionsByAccount(allSessions);
    const hasSessions = allSessions.length > 0;

    // --- 1. Global / Collapsed State Logic ---
    // Logic: Calculate status for each account for display.
    let riskDisplayHtml = '';
    let globalBadgeCount = 0;
    
    // Sum up badges across all accounts/sessions
    accountGroups.forEach(g => {
        g.sessions.forEach(sess => {
             globalBadgeCount += Number(sess.newTrades || 0);
        });
    });
    
    if (accountGroups.length > 1) {
        // Multi-Account: Show visual pips
        const pips = accountGroups.map(g => {
            const cfg = getRiskGuardConfig(g.id);
            const limit = g.riskLimit || 1;
            const pct = g.riskUsed / limit;
            const s = getStatusFromPct(pct, cfg);
            return `<span class="hub-risk-pip ${s}" title="${g.name}"></span>`;
        }).join('');
        riskDisplayHtml = `<div class="hub-multi-risk">${pips}</div>`;
    } else if (hasSessions) {
        // Single Account
        const g = accountGroups[0];
        const cfg = getRiskGuardConfig(g.id);
        const limit = g.riskLimit || 1;
        const pct = g.riskUsed / limit;
        const s = getStatusFromPct(pct, cfg);
        const label = s.charAt(0).toUpperCase() + s.slice(1);
        riskDisplayHtml = `<span class="hub-val ${s}">${label}</span>`;
    } else {
        // Fallback
        riskDisplayHtml = `<span class="hub-val stable">Stable</span>`;
    }

    // Pending summary (unified with Live Hub; does not show alongside Live)
    const pendingTradesCount = (typeof getPendingTrades === 'function') ? (getPendingTrades() || []).length : 0;
    const pendingSessionsCount = (typeof getPendingSessions === 'function') ? (getPendingSessions() || []).length : 0;
    const pendingTotal = Math.max(0, pendingTradesCount + pendingSessionsCount);

    // Pill content: NEW (when live has new trades), otherwise LIVE; if no live, show PENDING or START
    let pillContent = '';
    if (hasSessions) {
        pillContent = globalBadgeCount > 0
            ? `<div class="hub-status-pill has-new"><span>${globalBadgeCount} NEW</span></div>`
            : `<div class="hub-status-pill live"><span>LIVE</span></div>`;
    } else if (pendingTotal > 0) {
        pillContent = `<div class="hub-status-pill pending"><span>${pendingTotal} PENDING</span></div>`;
    } else {
        pillContent = `<div class="hub-status-pill cta"><span>START</span></div>`;
    }

    const dotClass = hasSessions ? 'live' : (pendingTotal > 0 ? 'pending' : '');

    // Compact main line (avoid heavy separators / too much text)
    const mainLineHtml = hasSessions
        ? `
            <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="opacity:0.65; font-size:11px; letter-spacing:0.06em;">RG</span>
                    ${riskDisplayHtml}
                </div>
                <span class="hub-sep" style="margin:0 2px">•</span>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-weight:700; color:var(--text-main)">${allSessions.length}</span>
                    <span style="font-size:11px; opacity:0.6">sessions</span>
                </div>
            </div>
        `
        : `
            <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                <span style="opacity:0.7">No session</span>
                ${pendingTotal > 0 ? `<span class="hub-sep" style="margin:0 2px">•</span><span style="font-size:11px; opacity:0.6">${pendingTotal} pending</span>` : ''}
            </div>
        `;

    trigger.innerHTML = `
        <div class="hub-content-box">
            <span class="hub-live-dot ${dotClass}" title="${hasSessions ? 'LIVE' : (pendingTotal > 0 ? 'PENDING' : 'IDLE')}"></span>
            ${mainLineHtml}
        </div>

        <div class="hub-activity-group">
            ${pillContent}
            <svg class="hub-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </div>
    `;
    
    trigger.classList.toggle('active', isHubOpen);
    drop.classList.toggle('active', isHubOpen);

    if (!isHubOpen) return;

    // --- 2. Expanded View: Pagination Logic ---
    if (accountGroups.length === 0) {
        if (pendingTotal > 0) {
            drop.innerHTML = `
                <div class="hub-section-overall" style="padding: 14px 16px;">
                    <div class="hub-account-row" style="margin-bottom: 8px;">
                        <span>Pending Items</span>
                        <span class="hub-limit-info"><span class="hub-limit-val">${pendingTotal}</span> total</span>
                    </div>
                    <div class="hub-context-line">
                        <span>Pending Sessions</span>
                        <span class="hub-context-strong">${pendingSessionsCount}</span>
                    </div>
                    <div class="hub-context-line">
                        <span>Unrated Trades</span>
                        <span class="hub-context-strong">${pendingTradesCount}</span>
                    </div>
                    <div style="margin-top:10px; font-size:11px; color: var(--text-muted); opacity:0.85;">
                        Review and clear pending items before starting the next session.
                    </div>
                </div>
                <div class="hub-section-sessions" style="max-height: 360px;">
                    <div class="pending-dropdown-header" style="border: none; padding: 10px 14px;">
                        <span class="pending-dropdown-title">⚡ Pending</span>
                        <span class="pending-dropdown-action" onclick="event.stopPropagation(); window.deferAllPendingItems()">Defer All</span>
                    </div>
                    <div id="pending-list" class="pending-list" style="max-height: 320px;">
                        <!-- Populated by JS -->
                    </div>
                </div>
            `;
            try { renderPendingList(); } catch (_) {}
        } else {
            drop.innerHTML = `
                <div class="empty-hub-state">
                    No active sessions<br/>
                    <a href="${TOPBAR_BASE_PATH}/home/index.html" style="color: var(--primary); text-decoration: none; font-weight: 700;">Start a session →</a>
                </div>
            `;
        }
        requestAnimationFrame(positionLiveHubDropdown);
        return;
    }

    // Ensure index valid
    if (currentAccountIndex >= accountGroups.length) currentAccountIndex = 0;
    if (currentAccountIndex < 0) currentAccountIndex = 0;

    const currentGroup = accountGroups[currentAccountIndex];
    const accountId = currentGroup.id;
    const accountName = currentGroup.name;
    const limit = currentGroup.riskLimit;
    const used = currentGroup.riskUsed;
    const remaining = Math.max(0, limit - used);
    const pct = limit > 0 ? (used / limit) : 0;

    const cfg = getRiskGuardConfig(accountId);
    const status = getStatusFromPct(pct, cfg);
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

    // Render Pager Header (if >1 account)
    let pagerHtml = '';
    if (accountGroups.length > 1) {
        pagerHtml = `
            <div style="display:flex; align-items:center; gap:8px; margin-left:auto;">
                <button class="hub-pager-btn" ${currentAccountIndex === 0 ? 'disabled' : ''} onclick="window.switchHubAccount(-1)">
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 1 5 5 1"></polyline></svg>
                </button>
                <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${currentAccountIndex + 1} / ${accountGroups.length}</span>
                <button class="hub-pager-btn" ${currentAccountIndex === accountGroups.length - 1 ? 'disabled' : ''} onclick="window.switchHubAccount(1)">
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 9 5 5 1 1"></polyline></svg>
                </button>
            </div>
        `;
    }

    // Mini KPI / Context line
    const lastActivityTs = currentGroup.sessions.reduce((mx, s) => Math.max(mx, getSessionActivityTs(s)), 0);
    const lastUpdateLabel = formatLastUpdate(lastActivityTs);
    
    pushRiskUsageHistory(accountId, used);
    const trend30m = getRiskUsageTrend30m(accountId, used);
    const trendLabel = (trend30m == null) ? '' : `${fmtSignedMoney(trend30m)} in last 30m`;

    const overallHtml = `
        <div class="hub-section-overall">
            <div class="hub-account-row" style="align-items:center;">
                <span>${accountName}</span>
                ${pagerHtml}
            </div>
            <div class="hub-risk-row">
                <div class="hub-risk-tag ${status}">${statusLabel}</div>
                <div class="hub-limit-info">
                    <span class="hub-limit-val">${fmtMoney(used)}</span> / ${fmtMoney(limit)}
                </div>
            </div>
            <div class="hub-risk-bar-bg">
                <div class="hub-risk-bar-mark" style="left:${Math.max(0, Math.min(100, cfg.cautionStart * 100))}%"></div>
                <div class="hub-risk-bar-mark" style="left:${Math.max(0, Math.min(100, cfg.pressureStart * 100))}%"></div>
                <div class="hub-risk-bar-fill ${status}" style="width: ${Math.max(0, Math.min(100, pct * 100))}%"></div>
            </div>
            <div class="hub-mini-kpis">
                <div class="hub-mini-kpi"><div class="k">Limit</div><div class="v">${fmtMoney(limit)}</div></div>
                <div class="hub-mini-kpi"><div class="k">Used</div><div class="v">${fmtMoney(used)}</div></div>
                <div class="hub-mini-kpi"><div class="k">Remaining</div><div class="v">${fmtMoney(remaining)}</div></div>
            </div>
            <div class="hub-context-line">
                <span>Ref: ${accountId}</span>
                <span>${trendLabel ? `Trend: <span class="hub-context-strong">${trendLabel}</span>` : `Last update: <span class="hub-context-strong">${lastUpdateLabel}</span>`}</span>
            </div>
        </div>
    `;

    // --- Session List with "Show More" ---
    const sessions = [...currentGroup.sessions].sort((a, b) => {
        const at = a.startTime ? +new Date(a.startTime) : 0;
        const bt = b.startTime ? +new Date(b.startTime) : 0;
        return bt - at;
    });

    const isExpanded = !!expandedSessionAccounts[accountId];
    const visibleSessions = isExpanded ? sessions : sessions.slice(0, 2);
    const remainingCount = sessions.length - visibleSessions.length;

    const listHtml = visibleSessions.map(s => {
        const pnl = Number(s.pnl || 0);
        const pnlClass = pnl >= 0 ? 'positive' : 'negative';
        const pnlTxt = fmtSignedMoney(pnl);
        const dur = getSessionDuration(s.startTime);
        
        const sessPct = limit > 0 ? (Number(s.riskUsed||0) / limit) : 0; 
        const sessStatus = getStatusFromPct(sessPct, cfg);
        
        const href = `../execute/index.html?view=sessions&session=${s.sessionId}`;
        
        return `
        <a class="hub-session-item risk-${sessStatus}" href="${href}">
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
    }).join('');

    let footerHtml = '';
    if (remainingCount > 0) {
        footerHtml = `
            <div class="hub-expand-row" onclick="window.toggleHubSessions('${accountId}')">
                <span style="font-size:11px; font-weight:600; color:var(--primary);">Show ${remainingCount} more sessions</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary); transform:rotate(0deg);"><polyline points="1 1 5 5 9 1"></polyline></svg>
            </div>
        `;
    } else if (isExpanded && sessions.length > 2) {
         footerHtml = `
            <div class="hub-expand-row" onclick="window.toggleHubSessions('${accountId}')">
                <span style="font-size:11px; font-weight:600; color:var(--text-muted);">Show less</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted); transform:rotate(180deg);"><polyline points="1 1 5 5 9 1"></polyline></svg>
            </div>
        `;
    }

    drop.innerHTML = overallHtml + `<div class="hub-section-sessions">${listHtml}</div>` + footerHtml;

    requestAnimationFrame(positionLiveHubDropdown);
}

// Global functions for Pager / Expansion
window.switchHubAccount = function(dir) {
    // We need to re-calc group length or just let updateLiveHub handle it?
    // currentAccountIndex is global relative to the last group calculation.
    // Ideally we should store accountGroups in a closure or object, but for MVP global var is easiest.
    currentAccountIndex += dir;
    updateLiveHub(); 
};

window.toggleHubSessions = function(accId) {
    if (expandedSessionAccounts[accId]) {
        delete expandedSessionAccounts[accId];
    } else {
        expandedSessionAccounts[accId] = true;
    }
    updateLiveHub();
};

function injectTopbarStyles() {
    if (document.getElementById('topbar-styles')) return;
    const styleElement = document.createElement('style');
    styleElement.id = 'topbar-styles';
    styleElement.textContent = topbarStyles;
    document.head.appendChild(styleElement);
}

// ========================================
// === Topbar State Management ===
// ========================================

// --- Date Picker State ---
let pickerState = {
    currentDate: new Date(),
    startDate: null,
    endDate: null,
    initialized: false
};

/**
 * 获取顶部栏状态 (持久化)
 */
function getTopbarState() {
    const stored = sessionStorage.getItem('toMoon_mvp_topbar_state');
    if (stored) {
        try {
            const state = JSON.parse(stored);
            // 恢复日期对象
            if (state.dateRange) {
                state.dateRange.start = new Date(state.dateRange.start);
                state.dateRange.end = new Date(state.dateRange.end);
            }
            return state;
        } catch (e) { console.error('Failed to parse topbar state', e); }
    }
    
    // 默认状态 (UTC)
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    
    const start = new Date();
    start.setUTCDate(end.getUTCDate() - 29);
    start.setUTCHours(0, 0, 0, 0);
    
    return {
        accounts: ['MT5 8506'],
        isAllAccounts: true,
        dateRange: {
            start: start,
            end: end,
            label: 'Last 30 Days'
        }
    };
}

/**
 * 保存顶部栏状态
 */
function saveTopbarState(state) {
    sessionStorage.setItem('toMoon_mvp_topbar_state', JSON.stringify(state));
}

/**
 * 切换下拉菜单显示
 */
function toggleMvpDropdown(id) {
    // 关闭其他下拉菜单
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== id) menu.classList.remove('show');
    });
    
    const dropdown = document.getElementById(id);
    if (dropdown) {
        setTimeout(() => {
            dropdown.classList.toggle('show');
        }, 0);
    }
}

/**
 * 切换账户选择 (多选逻辑)
 */
function toggleMvpAccount(accountName, element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    if (event.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
    }
    
    const isChecked = checkbox.checked;
    const allCheckbox = document.getElementById('acc-all');
    const accountCheckboxes = document.querySelectorAll('.acc-checkbox');
    
    if (accountName === 'all') {
        accountCheckboxes.forEach(cb => cb.checked = isChecked);
    } else {
        if (!isChecked) {
            allCheckbox.checked = false;
        } else {
            const allChecked = Array.from(accountCheckboxes).every(cb => cb.checked);
            allCheckbox.checked = allChecked;
        }
    }
    
    updateAccountDisplay();

    // 保存状态
    const checkedAccounts = Array.from(accountCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const currentState = getTopbarState();
    currentState.accounts = checkedAccounts;
    currentState.isAllAccounts = allCheckbox.checked;
    saveTopbarState(currentState);
}

/**
 * 更新账户显示文本
 */
function updateAccountDisplay() {
    const accountCheckboxes = document.querySelectorAll('.acc-checkbox');
    const checkedAccounts = Array.from(accountCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const display = document.getElementById('selected-account');
    
    if (checkedAccounts.length === accountCheckboxes.length) {
        display.textContent = 'All accounts';
    } else if (checkedAccounts.length === 0) {
        display.textContent = 'No Accounts';
    } else if (checkedAccounts.length === 1) {
        display.textContent = checkedAccounts[0];
    } else {
        display.textContent = `${checkedAccounts.length} Accounts`;
    }
    
    // 触发自定义事件
    const event = new CustomEvent('accountChanged', { detail: { accounts: checkedAccounts } });
    document.dispatchEvent(event);
}

// --- Date Picker Logic ---

function initMvpDatePicker() {
    if (!pickerState.initialized) {
        const end = new Date();
        end.setUTCHours(23, 59, 59, 999);
        
        const start = new Date();
        start.setUTCDate(end.getUTCDate() - 29);
        start.setUTCHours(0, 0, 0, 0);
        
        pickerState.startDate = start;
        pickerState.endDate = end;
        pickerState.initialized = true;
    }
    
    if (pickerState.startDate) {
        pickerState.currentDate = new Date(pickerState.startDate);
    }
    
    renderMvpCalendar();
}

function renderMvpCalendar() {
    const year = pickerState.currentDate.getUTCFullYear();
    const month = pickerState.currentDate.getUTCMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthLabel = document.getElementById('mvp-calendar-month-year');
    if (monthLabel) {
        monthLabel.textContent = `${monthNames[month]} ${year}`;
    }
    
    const grid = document.getElementById('mvp-calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day empty';
        grid.appendChild(cell);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(year, month, day));
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.textContent = day;
        cell.onclick = () => handleMvpDateClick(date);
        
        if (pickerState.startDate && pickerState.endDate) {
            const dTime = date.getTime();
            const sTime = new Date(pickerState.startDate).setUTCHours(0,0,0,0);
            const eTime = new Date(pickerState.endDate).setUTCHours(0,0,0,0);
            
            if (dTime === sTime || dTime === eTime) {
                cell.classList.add('selected');
                if (dTime === sTime) cell.classList.add('range-start');
                if (dTime === eTime) cell.classList.add('range-end');
            } else if (dTime > sTime && dTime < eTime) {
                cell.classList.add('in-range');
            }
        } else if (pickerState.startDate) {
            const dTime = date.getTime();
            const sTime = new Date(pickerState.startDate).setUTCHours(0,0,0,0);
            if (dTime === sTime) cell.classList.add('selected');
        }
        
        grid.appendChild(cell);
    }
}

function changeMvpCalendarMonth(delta) {
    pickerState.currentDate.setUTCMonth(pickerState.currentDate.getUTCMonth() + delta);
    renderMvpCalendar();
}

function handleMvpDateClick(date) {
    date.setUTCHours(0,0,0,0);
    
    if (!pickerState.startDate || (pickerState.startDate && pickerState.endDate)) {
        pickerState.startDate = date;
        pickerState.endDate = null;
    } else {
        if (date < pickerState.startDate) {
            pickerState.endDate = pickerState.startDate;
            pickerState.startDate = date;
        } else {
            pickerState.endDate = date;
        }
        
        updateMvpDateDisplay();
        setTimeout(() => {
            document.getElementById('date-dropdown').classList.remove('show');
        }, 300);
    }
    
    renderMvpCalendar();
}

function selectMvpDateShortcut(type) {
    const end = new Date();
    const start = new Date();
    let label = '';
    
    // Force UTC Midnight
    end.setUTCHours(0,0,0,0);
    start.setUTCHours(0,0,0,0);
    
    switch(type) {
        case 'today':
            label = 'Today';
            break;
        case 'yesterday':
            start.setUTCDate(end.getUTCDate() - 1);
            end.setUTCDate(end.getUTCDate() - 1);
            label = 'Yesterday';
            break;
        case 'last7':
            start.setUTCDate(end.getUTCDate() - 6);
            label = 'Last 7 Days';
            break;
        case 'last30':
            start.setUTCDate(end.getUTCDate() - 29);
            label = 'Last 30 Days';
            break;
        case 'thisMonth':
            start.setUTCDate(1);
            label = 'This Month';
            break;
        case 'lastMonth':
            start.setUTCMonth(start.getUTCMonth() - 1);
            start.setUTCDate(1);
            end.setUTCDate(0);
            label = 'Last Month';
            break;
    }
    
    pickerState.startDate = start;
    pickerState.endDate = end;
    pickerState.currentDate = new Date(start);
    
    renderMvpCalendar();
    updateMvpDateDisplay(label);
    
    // Update active shortcut button
    document.querySelectorAll('.shortcut-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`.shortcut-btn[onclick*="'${type}'"]`);
    if (btn) btn.classList.add('active');
    
    setTimeout(() => {
        document.getElementById('date-dropdown').classList.remove('show');
    }, 200);
}

function updateMvpDateDisplay(label = null) {
    const display = document.getElementById('selected-date');
    if (!display) return;
    
    if (label) {
        display.textContent = label;
    } else {
        // Use UTC for display formatting
        const options = { month: 'short', day: 'numeric', timeZone: 'UTC' };
        const sStr = pickerState.startDate.toLocaleDateString('en-US', options);
        const eStr = pickerState.endDate.toLocaleDateString('en-US', options);
        display.textContent = `${sStr} - ${eStr}`;
        
        document.querySelectorAll('.shortcut-btn').forEach(btn => btn.classList.remove('active'));
    }
    
    // 触发事件
    const event = new CustomEvent('dateRangeChanged', { 
        detail: { 
            start: pickerState.startDate, 
            end: pickerState.endDate,
            label: label || 'Custom'
        } 
    });
    document.dispatchEvent(event);

    // 保存状态
    const currentState = getTopbarState();
    currentState.dateRange = {
        start: pickerState.startDate,
        end: pickerState.endDate,
        label: label || display.textContent
    };
    saveTopbarState(currentState);
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
    TOPBAR_BASE_PATH = basePath;
    
    // Get saved topbar state
    const state = getTopbarState();
    
    // Initialize date picker state
    pickerState.startDate = state.dateRange.start;
    pickerState.endDate = state.dateRange.end;
    pickerState.initialized = true;
    
    // Calculate account display text
    let accountText = 'All accounts';
    if (!state.isAllAccounts) {
        if (state.accounts.length === 0) accountText = 'No Accounts';
        else if (state.accounts.length === 1) accountText = state.accounts[0];
        else accountText = `${state.accounts.length} Accounts`;
    }
    
    // Helper: check if account is selected
    const isChecked = (val) => state.isAllAccounts || state.accounts.includes(val) ? 'checked' : '';
    const isAllChecked = state.isAllAccounts ? 'checked' : '';
    
    // Account Filter HTML
    const accountFilterHTML = `
        <div class="filter-segment" id="account-filter" onclick="window.toggleMvpDropdown('account-dropdown')">
            <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span id="selected-account">${accountText}</span>
            <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            
            <div class="dropdown-menu" id="account-dropdown" onclick="event.stopPropagation()">
                <div class="dropdown-item" onclick="window.toggleMvpAccount('all', this)">
                    <input type="checkbox" ${isAllChecked} id="acc-all">
                    <span>All accounts</span>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-section-label">My accounts</div>
                <div class="dropdown-item" onclick="window.toggleMvpAccount('MT5 8506', this)">
                    <input type="checkbox" ${isChecked('MT5 8506')} class="acc-checkbox" value="MT5 8506">
                    <span>MT5 8506</span>
                </div>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item manage-accounts" href="${basePath}/settings/index.html?section=accounts" onclick="event.stopPropagation()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span>Manage accounts</span>
                </a>
            </div>
        </div>
    `;
    
    // Date Filter HTML
    const dateFilterHTML = `
        <div class="filter-segment" id="date-filter" onclick="window.toggleMvpDropdown('date-dropdown'); window.initMvpDatePicker();">
            <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span id="selected-date">${state.dateRange.label || 'Last 30 Days'}</span>
            <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            
            <div class="dropdown-menu date-picker-dropdown align-right" id="date-dropdown" onclick="event.stopPropagation()">
                <div class="calendar-section">
                    <div class="calendar-header">
                        <button class="calendar-nav-btn" onclick="window.changeMvpCalendarMonth(-1)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <span id="mvp-calendar-month-year">December 2025</span>
                        <button class="calendar-nav-btn" onclick="window.changeMvpCalendarMonth(1)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                    <div class="calendar-weekdays">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                    </div>
                    <div class="calendar-grid-picker" id="mvp-calendar-grid">
                        <!-- Days generated by JS -->
                    </div>
                </div>
                <div class="shortcuts-section">
                    <button class="shortcut-btn" onclick="window.selectMvpDateShortcut('today')">Today</button>
                    <button class="shortcut-btn" onclick="window.selectMvpDateShortcut('yesterday')">Yesterday</button>
                    <button class="shortcut-btn" onclick="window.selectMvpDateShortcut('last7')">Last 7 Days</button>
                    <button class="shortcut-btn active" onclick="window.selectMvpDateShortcut('last30')">Last 30 Days</button>
                    <button class="shortcut-btn" onclick="window.selectMvpDateShortcut('thisMonth')">This Month</button>
                    <button class="shortcut-btn" onclick="window.selectMvpDateShortcut('lastMonth')">Last Month</button>
                </div>
            </div>
        </div>
    `;
    
    // New HTML Structure with Account + Date + Pending + Live Hub
    const topbarHTML = `
        <div class="topbar-left">
            <h2 id="topbar-page-title" class="topbar-title">${pageTitle}</h2>
        </div>
        
        <div class="topbar-right">
            <!-- Global Live Hub -->
            <div id="live-hub-wrap" class="live-hub-wrap">
                <div id="live-hub-trigger" class="live-hub-trigger">
                    <!-- Populated by JS -->
                </div>
                <div id="live-hub-dropdown" class="live-hub-dropdown">
                    <!-- Dropdown Content -->
                </div>
            </div>

            <!-- Filters Group -->
            <div class="unified-filter-group">
                ${accountFilterHTML}
                <div class="unified-divider"></div>
                ${dateFilterHTML}
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

    // Keep dropdown aligned across viewport changes and sidebar/topbar transitions.
    window.addEventListener('resize', () => {
        if (!isHubOpen) return;
        positionLiveHubDropdown();
    });
    topbar.addEventListener('transitionend', (e) => {
        if (!isHubOpen) return;
        if (!e || !e.propertyName) {
            positionLiveHubDropdown();
            return;
        }
        if (e.propertyName === 'left' || e.propertyName === 'right' || e.propertyName === 'transform') {
            positionLiveHubDropdown();
        }
    });
    
    // Global click listener for dropdown close, but ignore clicks that began inside the hub
    // This prevents internal onclick handlers (which may re-render the hub) from closing it.
    document.addEventListener('mousedown', function(e) {
        const wrapEl = document.getElementById('live-hub-wrap');
        _liveHubMouseDownInside = !!(wrapEl && wrapEl.contains(e.target));
    });
    document.addEventListener('click', function(e) {
        if (_liveHubMouseDownInside) {
            // reset marker and do not close
            _liveHubMouseDownInside = false;
            return;
        }
        closeLiveHub(e);
        
        // Close account and date dropdowns if clicked outside
        if (!e.target.closest('.filter-group')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Click handler for opening/closing the hub. Support hub-toggle (legacy),
    // the new hub-activity-group, or clicks anywhere inside #live-hub-trigger.
    document.addEventListener('click', function(e) {
        const tgt = e && e.target;
        if (!tgt) return;
        const toggle = tgt.closest('.hub-toggle, .hub-activity-group, #live-hub-trigger');
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
    
    // Apply RiskGuard colors from Settings
    applyRiskGuardCSSVars();
    
    // Ensure demo data
    ensureDemoLiveHubData();
    ensureDemoPendingData();

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

// ========================================
// === Pending Items (Trades & Sessions) ===
// ========================================

const PENDING_TRADES_KEY = 'toMoon_qj_queue';
const PENDING_SESSIONS_KEY = 'toMoon_pending_sessions';
let isPendingDropdownOpen = false;

/**
 * 获取待处理的交易队列
 */
function getPendingTrades() {
    const stored = localStorage.getItem(PENDING_TRADES_KEY);
    if (stored) {
        try {
            const queue = JSON.parse(stored);
            queue.forEach(item => {
                if (item.closeTime) item.closeTime = new Date(item.closeTime);
            });
            return queue;
        } catch (e) { console.error('Failed to parse pending trades', e); }
    }
    return [];
}

/**
 * 获取待处理的Session队列
 */
function getPendingSessions() {
    const stored = localStorage.getItem(PENDING_SESSIONS_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) { console.error('Failed to parse pending sessions', e); }
    }
    return [];
}

/**
 * 保存待处理的Session队列
 */
function savePendingSessions(sessions) {
    localStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(sessions));
    updatePendingIndicator();
    window.dispatchEvent(new Event('pendingSessionsUpdated'));
}

/**
 * 添加Session到待处理队列
 */
function addSessionToPending(session) {
    const queue = getPendingSessions();
    const newSession = {
        id: session.sessionId || `session_${Date.now()}`,
        sessionName: session.sessionName || session.name || 'Unnamed Session',
        endTime: session.endTime || new Date(),
        totalPnL: session.pnl || 0,
        tradeCount: session.tradeCount || 0,
        account: session.account || 'Main Account',
        blueprint: session.blueprint || null
    };
    queue.push(newSession);
    savePendingSessions(queue);
    return newSession;
}

/**
 * 从待处理队列移除Session
 */
function removeSessionFromPending(sessionId) {
    let queue = getPendingSessions();
    queue = queue.filter(s => s.id !== sessionId);
    savePendingSessions(queue);
    renderPendingList();
}

/**
 * 获取时间差描述
 */
function getTimeAgo(date) {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

/**
 * 更新Pending指示器
 */
function updatePendingIndicator() {
    const indicator = document.getElementById('pending-indicator');
    if (!indicator) return;
    
    const trades = getPendingTrades();
    const sessions = getPendingSessions();
    const total = trades.length + sessions.length;
    
    const badge = indicator.querySelector('.pending-badge');
    
    if (total > 0) {
        indicator.classList.remove('empty');
        if (badge) badge.textContent = total;
    } else {
        indicator.classList.add('empty');
    }
}

/**
 * 渲染Pending列表
 */
function renderPendingList() {
    const listEl = document.getElementById('pending-list');
    if (!listEl) return;
    
    const trades = getPendingTrades();
    const sessions = getPendingSessions();
    
    // 更新标题
    const headerTitle = document.querySelector('.pending-dropdown-title');
    if (headerTitle) {
        if (sessions.length > 0 && trades.length > 0) {
            headerTitle.textContent = '⚡ Pending Items';
        } else if (sessions.length > 0) {
            headerTitle.textContent = '📋 Pending Sessions';
        } else if (trades.length > 0) {
            headerTitle.textContent = '📝 Unrated Trades';
        } else {
            headerTitle.textContent = '✓ All Clear';
        }
    }
    
    if (trades.length === 0 && sessions.length === 0) {
        listEl.innerHTML = `
            <div class="pending-empty-state">
                <div class="icon" style="font-size: 32px; opacity: 0.3; margin-bottom:10px;">🎉</div>
                <div class="text" style="color:var(--text-muted); opacity:0.6;">All clear! No pending items.</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // 1. Pending Sessions
    if (sessions.length > 0) {
        html += `<div class="pending-section-label">Sessions</div>`;
        
        sessions.forEach(session => {
            const timeAgo = getTimeAgo(session.endTime);
            const pnl = parseFloat(session.totalPnL || session.pnl || 0);
            const pnlClass = pnl >= 0 ? 'positive' : 'negative';
            const pnlSign = pnl >= 0 ? '+' : '-';
            const sessionName = session.sessionName || session.name || 'Unnamed Session';
            
            html += `
            <div class="pending-item session-item" onclick="window.location.href='../moonlog/Moonlog.html?view=sessionlog'">
                <div class="pending-item-top">
                    <div class="pending-item-main">
                        <div class="pending-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                        <div class="pending-item-info">
                            <span class="pending-item-name">${sessionName}</span>
                        </div>
                    </div>
                    <span class="pending-item-pnl ${pnlClass}">${pnlSign}$${Math.abs(pnl).toFixed(2)}</span>
                </div>
                <div class="pending-item-details">
                    <span>${session.tradeCount || 0} Trades</span>
                    <span class="pending-detail-badge">${timeAgo}</span>
                </div>
            </div>
            `;
        });
    }
    
    // 2. Pending Trades
    if (trades.length > 0) {
        html += `<div class="pending-section-label">Trades</div>`;
        
        trades.forEach(trade => {
            const timeAgo = getTimeAgo(trade.closeTime);
            const pnl = parseFloat(trade.pnl || 0);
            const pnlClass = pnl >= 0 ? 'positive' : 'negative';
            const pnlSign = pnl >= 0 ? '+' : '-';
            const sideClass = trade.side === 'long' ? 'positive' : 'negative';
            const isLong = (trade.side || 'long').toLowerCase() === 'long';
            
            html += `
            <div class="pending-item trade-item" onclick="window.location.href='../journal/Vault_demo_v1.0.html'">
                <div class="pending-item-top">
                    <div class="pending-item-main">
                        <div class="pending-icon" style="color: ${isLong ? 'var(--success)' : 'var(--danger)'}">
                           ${isLong ? 
                            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>' : 
                            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>'
                           }
                        </div>
                        <div class="pending-item-info">
                            <span class="pending-item-name">${trade.symbol || 'Unknown'}</span>
                        </div>
                    </div>
                    <span class="pending-item-pnl ${pnlClass}">${pnlSign}$${Math.abs(pnl).toFixed(2)}</span>
                </div>
                <div class="pending-item-details">
                    <span>${(trade.blueprint || 'Setup').substring(0, 12)}</span>
                    <span class="pending-detail-badge">${timeAgo}</span>
                </div>
            </div>
            `;
        });
    }
    
    listEl.innerHTML = html;
}

/**
 * 切换Pending下拉菜单
 */
function togglePendingDropdown() {
    isPendingDropdownOpen = !isPendingDropdownOpen;
    const dropdown = document.getElementById('pending-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show', isPendingDropdownOpen);
        if (isPendingDropdownOpen) {
            renderPendingList();
        }
    }
}

/**
 * 关闭Pending下拉菜单
 */
function closePendingDropdown() {
    isPendingDropdownOpen = false;
    const dropdown = document.getElementById('pending-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

/**
 * 延迟所有待处理项
 */
function deferAllPendingItems() {
    const trades = getPendingTrades();
    const sessions = getPendingSessions();
    const totalCount = trades.length + sessions.length;
    
    if (totalCount > 0) {
        // 清空队列 (在实际应用中，这些应该被移到 deferred 列表)
        if (trades.length > 0) {
            localStorage.setItem(PENDING_TRADES_KEY, '[]');
        }
        if (sessions.length > 0) {
            localStorage.setItem(PENDING_SESSIONS_KEY, '[]');
            window.dispatchEvent(new Event('pendingSessionsUpdated'));
        }
        
        updatePendingIndicator();
        renderPendingList();
        closePendingDropdown();
        showTopbarToast(`${totalCount} item(s) deferred to later`);
    }
}

// 监听Session结束事件，自动添加到pending队列
window.addEventListener('liveSessionEnded', function(e) {
    if (e.detail) {
        addSessionToPending(e.detail);
        updatePendingIndicator();
        showTopbarToast(`Session "${e.detail.sessionName || 'Session'}" ended. Tap to review.`);
    }
});

// 监听storage事件（跨标签页同步）
window.addEventListener('storage', function(e) {
    if (e.key === PENDING_TRADES_KEY || e.key === PENDING_SESSIONS_KEY) {
        updatePendingIndicator();
        if (isPendingDropdownOpen) {
            renderPendingList();
        }
    }
});

// 监听pendingSessionsUpdated事件
window.addEventListener('pendingSessionsUpdated', function() {
    updatePendingIndicator();
    if (isPendingDropdownOpen) {
        renderPendingList();
    }
});

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
        showTopbarToast,
        // Pending Items exports
        getPendingTrades,
        getPendingSessions,
        addSessionToPending,
        removeSessionFromPending,
        updatePendingIndicator,
        togglePendingDropdown,
        deferAllPendingItems,
        // Account & Date Filter exports
        getTopbarState,
        saveTopbarState,
        toggleMvpDropdown,
        toggleMvpAccount,
        initMvpDatePicker,
        changeMvpCalendarMonth,
        selectMvpDateShortcut
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
    // Pending Items exports
    window.getPendingTrades = getPendingTrades;
    window.getPendingSessions = getPendingSessions;
    window.addSessionToPending = addSessionToPending;
    window.removeSessionFromPending = removeSessionFromPending;
    window.updatePendingIndicator = updatePendingIndicator;
    window.togglePendingDropdown = togglePendingDropdown;
    window.closePendingDropdown = closePendingDropdown;
    window.deferAllPendingItems = deferAllPendingItems;
    // Account & Date Filter exports
    window.getTopbarState = getTopbarState;
    window.saveTopbarState = saveTopbarState;
    window.toggleMvpDropdown = toggleMvpDropdown;
    window.toggleMvpAccount = toggleMvpAccount;
    window.initMvpDatePicker = initMvpDatePicker;
    window.changeMvpCalendarMonth = changeMvpCalendarMonth;
    window.selectMvpDateShortcut = selectMvpDateShortcut;
}
