/**
 * ToMoon Topbar Filter Module
 * 共享顶部筛选栏模块
 * 
 * 使用方法：
 * 1. 在HTML中引入此脚本 <script src="../shared/topbar.js"></script>
 * 2. 确保在 sidebar.js 之后引入，或在 initSidebar 之后调用 initTopbar()
 * 
 * 功能：
 * - 账户多选筛选器
 * - 日期范围选择器（日历 + 快捷方式）
 * - 状态持久化（sessionStorage）
 * - 自定义事件触发 (accountChanged, dateRangeChanged)
 * - 全局 Quick Journal 队列管理
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
        background: var(--bg-card, #1a1d24);
        border-bottom: 1px solid var(--border, #334155);
        z-index: 90;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;
    }

    .sidebar.expanded ~ .topbar {
        left: var(--sidebar-expanded-width, 250px);
    }
    
    .topbar-left, .topbar-right { display: flex; align-items: center; gap: 15px; }
    
    .filter-group {
        display: flex; align-items: center; gap: 8px; padding: 6px 12px;
        background: var(--bg-panel, #232730); border: 1px solid var(--border, #334155);
        border-radius: 6px; color: var(--text-main, #e2e8f0); font-size: 13px;
        cursor: pointer; transition: all 0.2s;
        position: relative;
    }
    .filter-group:hover { background: rgba(255,255,255,0.05); border-color: var(--text-muted, #94a3b8); }
    .filter-icon { width: 16px; height: 16px; stroke: currentColor; }
    .filter-divider { width: 1px; height: 20px; background: var(--border, #334155); margin: 0 5px; }

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
    
    /* Date Picker Specific Styles */
    .date-picker-dropdown {
        width: auto;
        min-width: 480px;
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
        width: 140px;
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
    
    .calendar-grid {
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
        font-size: 13px;
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

    /* Advanced Filters Dropdown */
    .filters-dropdown {
        min-width: 320px;
        max-height: 480px;
        overflow-y: auto;
        padding: 10px;
        right: 0;
        left: auto;
    }
    
    .filter-section {
        margin-bottom: 12px;
    }
    
    .filter-section:last-child {
        margin-bottom: 0;
    }
    
    .filter-section-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted, #94a3b8);
        margin-bottom: 8px;
        padding: 0 8px;
        font-weight: 600;
    }
    
    .filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 4px;
    }
    
    .filter-chip {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;
        background: var(--bg-panel, #232730);
        border: 1px solid var(--border, #334155);
        border-radius: 16px;
        font-size: 12px;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        transition: all 0.2s;
        user-select: none;
    }
    
    .filter-chip:hover {
        border-color: var(--text-muted, #94a3b8);
        color: var(--text-main, #e2e8f0);
    }
    
    .filter-chip.active {
        background: rgba(59, 130, 246, 0.15);
        border-color: var(--primary, #3b82f6);
        color: var(--primary, #3b82f6);
    }
    
    .filter-chip.win { border-color: var(--success, #22c55e); color: var(--success, #22c55e); }
    .filter-chip.win.active { background: rgba(34, 197, 94, 0.15); }
    
    .filter-chip.loss { border-color: var(--danger, #ef4444); color: var(--danger, #ef4444); }
    .filter-chip.loss.active { background: rgba(239, 68, 68, 0.15); }
    
    .filter-chip.breakeven { border-color: var(--warning, #f59e0b); color: var(--warning, #f59e0b); }
    .filter-chip.breakeven.active { background: rgba(245, 158, 11, 0.15); }
    
    .filter-chip .chip-icon {
        width: 12px;
        height: 12px;
    }
    
    .filter-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 8px 5px;
        border-top: 1px solid var(--border, #334155);
        margin-top: 10px;
    }
    
    .filter-btn {
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }
    
    .filter-btn.clear {
        background: transparent;
        color: var(--text-muted, #94a3b8);
    }
    .filter-btn.clear:hover {
        color: var(--text-main, #e2e8f0);
        background: rgba(255,255,255,0.05);
    }
    
    .filter-btn.apply {
        background: var(--primary, #3b82f6);
        color: white;
    }
    .filter-btn.apply:hover {
        background: #2563eb;
    }
    
    .active-filters-badge {
        background: var(--primary, #3b82f6);
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        margin-left: 6px;
    }

    /* === Quick Journal Global Styles === */
    .qj-indicator {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 6px;
        color: var(--warning, #f59e0b);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        animation: qjPulse 2s infinite;
    }
    .qj-indicator:hover {
        background: rgba(245, 158, 11, 0.15);
        border-color: var(--warning, #f59e0b);
    }
    .qj-indicator.empty {
        display: none;
    }
    @keyframes qjPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
        50% { box-shadow: 0 0 0 4px rgba(245, 158, 11, 0); }
    }
    .qj-badge {
        background: var(--warning, #f59e0b);
        color: #000;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
    }

    /* Quick Journal Dropdown */
    .qj-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        background: var(--bg-card, #1a1d24);
        border: 1px solid var(--border, #334155);
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        width: 380px;
        z-index: 200;
        display: none;
        flex-direction: column;
        overflow: hidden;
    }
    .qj-dropdown.show { display: flex; }
    
    .qj-dropdown-header {
        padding: 15px;
        border-bottom: 1px solid var(--border, #334155);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .qj-dropdown-title {
        font-weight: 600;
        font-size: 14px;
        color: var(--text-main, #e2e8f0);
    }
    .qj-dropdown-action {
        font-size: 12px;
        color: var(--primary, #3b82f6);
        cursor: pointer;
    }
    .qj-dropdown-action:hover { text-decoration: underline; }
    
    .qj-list {
        max-height: 320px;
        overflow-y: auto;
        padding: 10px;
    }
    .qj-list::-webkit-scrollbar { width: 4px; }
    .qj-list::-webkit-scrollbar-thumb { background: var(--border, #334155); border-radius: 2px; }
    
    .qj-trade-item {
        background: var(--bg-panel, #232730);
        border: 1px solid var(--border, #334155);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
        transition: all 0.2s;
    }
    .qj-trade-item:last-child { margin-bottom: 0; }
    .qj-trade-item:hover { border-color: var(--primary, #3b82f6); }
    
    .qj-trade-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    .qj-trade-info { display: flex; align-items: center; gap: 10px; }
    .qj-trade-symbol { font-weight: 600; font-size: 14px; color: var(--text-main, #e2e8f0); }
    .qj-trade-side { font-size: 11px; padding: 2px 6px; border-radius: 4px; }
    .qj-trade-side.long { background: rgba(16, 185, 129, 0.1); color: var(--success, #22c55e); }
    .qj-trade-side.short { background: rgba(239, 68, 68, 0.1); color: var(--danger, #ef4444); }
    .qj-trade-pnl { font-weight: 700; font-size: 14px; }
    .qj-trade-pnl.win { color: var(--success, #22c55e); }
    .qj-trade-pnl.loss { color: var(--danger, #ef4444); }
    
    .qj-trade-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        color: var(--text-muted, #94a3b8);
        margin-bottom: 10px;
    }
    .qj-trade-blueprint {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--primary, #3b82f6);
    }
    
    .qj-quick-rate {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .qj-stars { display: flex; gap: 2px; }
    .qj-star {
        font-size: 18px;
        color: var(--border, #334155);
        cursor: pointer;
        transition: color 0.1s;
    }
    .qj-star:hover, .qj-star.active { color: #fbbf24; }
    
    .qj-rate-btn {
        padding: 4px 10px;
        font-size: 11px;
        background: var(--primary, #3b82f6);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        opacity: 0.5;
        pointer-events: none;
        transition: all 0.2s;
    }
    .qj-rate-btn.enabled {
        opacity: 1;
        pointer-events: auto;
    }
    .qj-rate-btn.enabled:hover { background: #2563eb; }
    
    .qj-dropdown-footer {
        padding: 12px 15px;
        border-top: 1px solid var(--border, #334155);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0,0,0,0.2);
    }
    .qj-footer-hint {
        font-size: 11px;
        color: var(--text-muted, #94a3b8);
    }
    .qj-footer-btn {
        padding: 6px 14px;
        font-size: 12px;
        background: transparent;
        border: 1px solid var(--border, #334155);
        color: var(--text-muted, #94a3b8);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }
    .qj-footer-btn:hover {
        border-color: var(--text-main, #e2e8f0);
        color: var(--text-main, #e2e8f0);
    }

    /* Quick Journal Toast (New Trade Notification) */
    .qj-toast {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--bg-card, #1a1d24);
        border: 1px solid var(--primary, #3b82f6);
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        padding: 15px 20px;
        z-index: 2000;
        transform: translateY(150%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        min-width: 320px;
        max-width: 400px;
    }
    .qj-toast.show {
        transform: translateY(0);
        opacity: 1;
    }
    .qj-toast-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    .qj-toast-title {
        font-weight: 600;
        font-size: 14px;
        color: var(--text-main, #e2e8f0);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .qj-toast-close {
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
    }
    .qj-toast-close:hover { color: var(--text-main, #e2e8f0); }
    .qj-toast-body {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding: 10px;
        background: var(--bg-panel, #232730);
        border-radius: 6px;
    }
    .qj-toast-actions {
        display: flex;
        gap: 10px;
    }
    .qj-toast-btn {
        flex: 1;
        padding: 10px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }
    .qj-toast-btn.primary {
        background: var(--primary, #3b82f6);
        color: white;
    }
    .qj-toast-btn.primary:hover { background: #2563eb; }
    .qj-toast-btn.secondary {
        background: transparent;
        border: 1px solid var(--border, #334155);
        color: var(--text-muted, #94a3b8);
    }
    .qj-toast-btn.secondary:hover {
        border-color: var(--text-main, #e2e8f0);
        color: var(--text-main, #e2e8f0);
    }

    /* Quick Journal Full Modal */
    .qj-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        z-index: 3000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    .qj-modal-overlay.show { display: flex; }
    
    .qj-modal-box {
        background: var(--bg-card, #1a1d24);
        border: 1px solid var(--border, #334155);
        border-radius: 12px;
        width: 420px;
        max-width: 100%;
        box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        animation: qjModalIn 0.3s ease-out;
    }
    @keyframes qjModalIn {
        from { opacity: 0; transform: scale(0.95) translateY(-10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }
    
    .qj-modal-header {
        padding: 15px 20px;
        border-bottom: 1px solid var(--border, #334155);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .qj-modal-title { font-size: 16px; font-weight: 600; color: var(--text-main, #e2e8f0); margin: 0; }
    .qj-modal-close { cursor: pointer; color: var(--text-muted, #94a3b8); font-size: 20px; line-height: 1; }
    .qj-modal-close:hover { color: var(--text-main, #e2e8f0); }
    
    .qj-modal-body { padding: 20px; }
    
    .qj-context-card {
        background: var(--bg-panel, #232730);
        padding: 12px 15px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    .qj-context-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }
    .qj-context-blueprint {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--text-muted, #94a3b8);
        border-top: 1px solid rgba(255,255,255,0.05);
        padding-top: 8px;
    }
    
    .qj-form-group { margin-bottom: 20px; }
    .qj-form-label {
        font-size: 12px;
        color: var(--text-muted, #94a3b8);
        display: block;
        margin-bottom: 10px;
    }
    
    .qj-modal-stars {
        display: flex;
        gap: 8px;
    }
    .qj-modal-star {
        font-size: 28px;
        color: var(--border, #334155);
        cursor: pointer;
        transition: all 0.15s;
    }
    .qj-modal-star:hover { transform: scale(1.15); }
    .qj-modal-star.active { color: #fbbf24; }
    
    .qj-options-grid {
        display: grid;
        gap: 8px;
    }
    .qj-options-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
    .qj-options-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
    
    .qj-option-btn {
        padding: 10px 12px;
        background: var(--bg-panel, #232730);
        border: 1px solid var(--border, #334155);
        border-radius: 6px;
        color: var(--text-muted, #94a3b8);
        font-size: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
    }
    .qj-option-btn:hover {
        border-color: var(--primary, #3b82f6);
        color: var(--text-main, #e2e8f0);
    }
    .qj-option-btn.selected {
        background: rgba(59, 130, 246, 0.15);
        border-color: var(--primary, #3b82f6);
        color: var(--primary, #3b82f6);
    }
    
    .qj-hint-text {
        font-size: 11px;
        color: var(--text-muted, #94a3b8);
        text-align: center;
        margin: 0;
    }
    
    .qj-modal-footer {
        padding: 15px 20px;
        border-top: 1px solid var(--border, #334155);
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    .qj-modal-btn {
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }
    .qj-modal-btn.outline {
        background: transparent;
        border: 1px solid var(--border, #334155);
        color: var(--text-muted, #94a3b8);
    }
    .qj-modal-btn.outline:hover {
        border-color: var(--text-main, #e2e8f0);
        color: var(--text-main, #e2e8f0);
    }
    .qj-modal-btn.primary {
        background: var(--primary, #3b82f6);
        color: white;
    }
    .qj-modal-btn.primary:hover { background: #2563eb; }
`;

// --- Date Picker State ---
let pickerState = {
    // Initialize with UTC date to match global standard
    currentDate: new Date(new Date().toUTCString().substr(0, 25)), 
    startDate: null,
    endDate: null,
    initialized: false
};

// --- Filters State ---
let filtersState = {
    symbols: [],        // 交易品种
    direction: [],      // 交易方向
    result: [],         // 交易结果
    assetClass: [],     // 资产类别
    session: [],        // 交易时段
    setup: [],          // 交易策略/Setup
    emotion: []         // 情绪标签
};

// --- Quick Journal Queue State ---
let quickJournalQueue = [];
let qjIdCounter = 1;

/**
 * 获取 Quick Journal 队列 (持久化)
 */
function getQuickJournalQueue() {
    const stored = localStorage.getItem('toMoon_qj_queue');
    if (stored) {
        try {
            const queue = JSON.parse(stored);
            // 恢复时间对象
            queue.forEach(item => {
                item.closeTime = new Date(item.closeTime);
            });
            return queue;
        } catch (e) { console.error('Failed to parse QJ queue', e); }
    }
    return [];
}

/**
 * 保存 Quick Journal 队列
 */
function saveQuickJournalQueue(queue) {
    localStorage.setItem('toMoon_qj_queue', JSON.stringify(queue));
    quickJournalQueue = queue;
}

/**
 * 添加交易到 Quick Journal 队列
 * @param {object} trade - 交易数据
 */
function addTradeToQuickJournal(trade) {
    const queue = getQuickJournalQueue();
    const newTrade = {
        id: `qj_${Date.now()}_${qjIdCounter++}`,
        symbol: trade.symbol || 'Unknown',
        side: trade.side || 'long',
        pnl: trade.pnl || 0,
        closeTime: new Date(),
        account: trade.account || 'Main Account',
        blueprint: trade.blueprint || null,
        rating: null
    };
    queue.push(newTrade);
    saveQuickJournalQueue(queue);
    
    // Update UI
    updateQuickJournalIndicator();
    
    // Show toast notification
    showQuickJournalToast(newTrade);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('quickJournalAdded', { detail: newTrade }));
    
    return newTrade;
}

/**
 * 从队列中移除交易
 */
function removeFromQuickJournal(tradeId) {
    let queue = getQuickJournalQueue();
    queue = queue.filter(t => t.id !== tradeId);
    saveQuickJournalQueue(queue);
    updateQuickJournalIndicator();
    renderQuickJournalList();
}

/**
 * 快速评分并移除
 */
function quickRateTrade(tradeId, rating) {
    let queue = getQuickJournalQueue();
    const trade = queue.find(t => t.id === tradeId);
    if (trade) {
        trade.rating = rating;
        // In real app, save to backend here
        console.log('Trade rated:', trade);
        
        // Remove from queue
        queue = queue.filter(t => t.id !== tradeId);
        saveQuickJournalQueue(queue);
        updateQuickJournalIndicator();
        renderQuickJournalList();
        
        // Show success feedback
        showTopbarToast(`Trade rated ${rating}★`);
    }
}

/**
 * 延迟所有待处理交易（移至 Trades）
 */
function deferAllQuickJournals() {
    const tradeQueue = getQuickJournalQueue();
    let sessionQueue = [];
    try {
        sessionQueue = JSON.parse(localStorage.getItem('toMoon_pending_sessions') || '[]');
    } catch(e) { sessionQueue = []; }
    
    const totalCount = tradeQueue.length + sessionQueue.length;
    
    if (totalCount > 0) {
        // Defer trades
        if (tradeQueue.length > 0) {
            console.log('Deferred trades:', tradeQueue);
            saveQuickJournalQueue([]);
        }
        
        // Defer sessions (remove from pending, mark as deferred)
        if (sessionQueue.length > 0) {
            console.log('Deferred sessions:', sessionQueue);
            localStorage.setItem('toMoon_pending_sessions', '[]');
            // Dispatch event for Moonlog to update
            window.dispatchEvent(new Event('pendingSessionsUpdated'));
        }
        
        updateQuickJournalIndicator();
        renderQuickJournalList();
        closeQuickJournalDropdown();
        showTopbarToast(`${totalCount} item(s) deferred`);
    }
}

/**
 * 更新 Quick Journal 指示器
 */
function updateQuickJournalIndicator() {
    const indicator = document.getElementById('qj-indicator');
    if (!indicator) return;
    
    const tradeQueue = getQuickJournalQueue();
    const sessionQueue = JSON.parse(localStorage.getItem('toMoon_pending_sessions') || '[]');
    const total = tradeQueue.length + sessionQueue.length;
    
    const badge = indicator.querySelector('.qj-badge');
    
    if (total > 0) {
        indicator.classList.remove('empty');
        if (badge) badge.textContent = total;
    } else {
        indicator.classList.add('empty');
    }
}

/**
 * 渲染 Quick Journal 列表
 */
function renderQuickJournalList() {
    const listEl = document.getElementById('qj-list');
    if (!listEl) return;
    
    const tradeQueue = getQuickJournalQueue();
    const sessionQueue = JSON.parse(localStorage.getItem('toMoon_pending_sessions') || '[]');
    
    // Update Header Title and Action depending on content
    const headerTitle = document.querySelector('.qj-dropdown-title');
    const deferBtn = document.querySelector('.qj-dropdown-action');
    
    if (headerTitle) {
        if (sessionQueue.length > 0 && tradeQueue.length > 0) headerTitle.textContent = '⚡ Pending Items';
        else if (sessionQueue.length > 0) headerTitle.textContent = '📋 Pending Sessions';
        else headerTitle.textContent = '📝 Unrated Trades';
    }
    
    if (deferBtn) {
        // Only show Defer All if there are trades to defer
        deferBtn.style.display = tradeQueue.length > 0 ? 'block' : 'none';
    }
    
    if (tradeQueue.length === 0 && sessionQueue.length === 0) {
        listEl.innerHTML = `
            <div style="text-align: center; padding: 30px 20px; color: var(--text-muted);">
                <div style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;">✓</div>
                <div style="font-size: 13px;">All items cleared!</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    const basePath = window.location.pathname.includes('/shared/') ? '..' : '..'; // Simple path resolution
    
    // 1. Pending Sessions Section
    if (sessionQueue.length > 0) {
        html += `<div style="padding: 8px 12px; font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border, #334155);">Sessions to Review</div>`;
        
        html += sessionQueue.map(session => {
            const timeAgo = getTimeAgo(new Date(session.endTime || Date.now()));
            const pnl = parseFloat(session.totalPnL || session.pnl || 0);
            const pnlClass = pnl >= 0 ? 'win' : 'loss';
            const pnlSign = pnl >= 0 ? '+' : '-';
            const sessionName = session.sessionName || session.name || 'Unnamed Session';
            
            return `
            <div class="qj-trade-item session-item" onclick="window.location.href='../Moonlog/Moonlog.html?view=sessionlog'" style="cursor: pointer; border-left: 3px solid var(--primary, #3b82f6);">
                <div class="qj-trade-header">
                    <div class="qj-trade-info">
                        <span class="qj-trade-symbol">${sessionName}</span>
                        <span class="qj-trade-side" style="background:rgba(255,255,255,0.1); font-size:10px; padding: 1px 5px; color:var(--text-muted);">${session.tradeCount || 0} Trades</span>
                    </div>
                    <span class="qj-trade-pnl ${pnlClass}">${pnlSign}$${Math.abs(pnl).toFixed(2)}</span>
                </div>
                <div class="qj-trade-meta">
                    <span>${timeAgo} · ${session.account}</span>
                </div>
                <div style="font-size: 11px; color: var(--primary, #3b82f6); text-align: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05);">
                    Review in Moonlog →
                </div>
            </div>
            `;
        }).join('');
    }

    // 2. Unrated Trades Section
    if (tradeQueue.length > 0) {
        if (sessionQueue.length > 0) {
             // Divider if needed, or just the header
        }
        html += `<div style="padding: 8px 12px; font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border, #334155); border-top: 1px solid var(--border, #334155);">Trades</div>`;
        
        html += tradeQueue.map(trade => {
            const pnlClass = trade.pnl >= 0 ? 'win' : 'loss';
            const pnlSign = trade.pnl >= 0 ? '+' : '-';
            const sideClass = trade.side === 'long' ? 'long' : 'short';
            const timeAgo = getTimeAgo(trade.closeTime);
            const blueprintHTML = trade.blueprint 
                ? `<div class="qj-trade-blueprint">📘 ${trade.blueprint}</div>` 
                : '';
            
            return `
                <div class="qj-trade-item" data-id="${trade.id}" onclick="openFullQuickJournalModal('${trade.id}')" style="cursor: pointer;">
                    <div class="qj-trade-header">
                        <div class="qj-trade-info">
                            <span class="qj-trade-symbol">${trade.symbol}</span>
                            <span class="qj-trade-side ${sideClass}">${trade.side.toUpperCase()}</span>
                        </div>
                        <span class="qj-trade-pnl ${pnlClass}">${pnlSign}$${Math.abs(trade.pnl).toFixed(2)}</span>
                    </div>
                    <div class="qj-trade-meta">
                        <span>${timeAgo} · ${trade.account}</span>
                        ${blueprintHTML}
                    </div>
                    <div style="font-size: 11px; color: var(--primary, #3b82f6); text-align: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05);">
                        Click to rate with full details →
                    </div>
                </div>
            `;
        }).join('');
    }
    
    listEl.innerHTML = html;
}

// Temporary rating storage
let tempQJRatings = {};

function setQJStarRating(tradeId, rating) {
    tempQJRatings[tradeId] = rating;
    
    // Update star UI
    const starsContainer = document.querySelector(`.qj-stars[data-trade-id="${tradeId}"]`);
    if (starsContainer) {
        starsContainer.querySelectorAll('.qj-star').forEach((star, idx) => {
            star.classList.toggle('active', idx < rating);
        });
    }
    
    // Enable Done button
    const btn = document.getElementById(`qj-rate-btn-${tradeId}`);
    if (btn) btn.classList.add('enabled');
}

function confirmQJRating(tradeId) {
    const rating = tempQJRatings[tradeId];
    if (rating) {
        quickRateTrade(tradeId, rating);
        delete tempQJRatings[tradeId];
    }
}

/**
 * 显示 Quick Journal Toast 通知
 */
function showQuickJournalToast(trade) {
    let toast = document.getElementById('qj-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'qj-toast';
        toast.className = 'qj-toast';
        document.body.appendChild(toast);
    }
    
    const pnlClass = trade.pnl >= 0 ? 'win' : 'loss';
    const pnlSign = trade.pnl >= 0 ? '+' : '-';
    const sideClass = trade.side === 'long' ? 'long' : 'short';
    const blueprintHTML = trade.blueprint 
        ? `<div style="font-size:11px; color:var(--primary); margin-top:5px;">📘 ${trade.blueprint}</div>` 
        : '';
    
    toast.innerHTML = `
        <div class="qj-toast-header">
            <div class="qj-toast-title">
                <span>⚡</span> Trade Closed
            </div>
            <span class="qj-toast-close" onclick="hideQuickJournalToast()">×</span>
        </div>
        <div class="qj-toast-body">
            <div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:600; font-size:15px;">${trade.symbol}</span>
                    <span class="qj-trade-side ${sideClass}">${trade.side.toUpperCase()}</span>
                </div>
                ${blueprintHTML}
            </div>
            <div class="qj-trade-pnl ${pnlClass}" style="font-size:18px;">${pnlSign}$${Math.abs(trade.pnl).toFixed(2)}</div>
        </div>
        <div class="qj-toast-actions">
            <button class="qj-toast-btn secondary" onclick="hideQuickJournalToast()">Later</button>
            <button class="qj-toast-btn primary" onclick="openQuickJournalFromToast('${trade.id}')">Rate Now</button>
        </div>
    `;
    
    // Show toast
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        hideQuickJournalToast();
    }, 8000);
}

function hideQuickJournalToast() {
    const toast = document.getElementById('qj-toast');
    if (toast) {
        toast.classList.remove('show');
    }
}

function openQuickJournalFromToast(tradeId) {
    hideQuickJournalToast();
    openFullQuickJournalModal(tradeId);
}

// === Full Quick Journal Modal ===
let currentQJModalTradeId = null;
let qjModalState = {
    stars: 0,
    deviation: null,
    factor: null
};

/**
 * 创建或获取 Quick Journal Modal DOM
 */
function ensureQJModalExists() {
    let modal = document.getElementById('qj-full-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'qj-full-modal';
        modal.className = 'qj-modal-overlay';
        modal.innerHTML = `
            <div class="qj-modal-box">
                <div class="qj-modal-header">
                    <h3 class="qj-modal-title">⚡ Quick Journal</h3>
                    <span class="qj-modal-close" onclick="closeQJModal()">✕</span>
                </div>
                <div class="qj-modal-body">
                    <!-- Trade Context -->
                    <div class="qj-context-card">
                        <div class="qj-context-top">
                            <div>
                                <span id="qj-modal-symbol" style="font-weight: 600;">NQ</span>
                                <span id="qj-modal-side" class="qj-trade-side long" style="margin-left: 8px;">LONG</span>
                            </div>
                            <div style="text-align: right;">
                                <div id="qj-modal-pnl" style="font-size: 16px; font-weight: 700; color: var(--success);">+$120.00</div>
                                <div id="qj-modal-time" style="font-size: 11px; color: var(--text-muted);">Just now</div>
                            </div>
                        </div>
                        <div id="qj-modal-blueprint" class="qj-context-blueprint" style="display: none;">
                            <span style="font-size: 14px;">📘</span>
                            <span>Linked: <strong id="qj-modal-bp-name" style="color: var(--primary);">Strategy Name</strong></span>
                        </div>
                    </div>

                    <!-- Q1: Execution Quality -->
                    <div class="qj-form-group">
                        <label class="qj-form-label">1. Execution Quality</label>
                        <div class="qj-modal-stars" id="qj-modal-stars">
                            <span class="qj-modal-star" data-rating="1" onclick="setQJModalStar(1)">★</span>
                            <span class="qj-modal-star" data-rating="2" onclick="setQJModalStar(2)">★</span>
                            <span class="qj-modal-star" data-rating="3" onclick="setQJModalStar(3)">★</span>
                            <span class="qj-modal-star" data-rating="4" onclick="setQJModalStar(4)">★</span>
                            <span class="qj-modal-star" data-rating="5" onclick="setQJModalStar(5)">★</span>
                        </div>
                    </div>

                    <!-- Q2: Deviation -->
                    <div class="qj-form-group">
                        <label class="qj-form-label">2. Deviation?</label>
                        <div class="qj-options-grid cols-4" id="qj-modal-deviation">
                            <div class="qj-option-btn" onclick="selectQJDeviation('no')">No</div>
                            <div class="qj-option-btn" onclick="selectQJDeviation('minor')">Minor</div>
                            <div class="qj-option-btn" onclick="selectQJDeviation('major')">Major</div>
                            <div class="qj-option-btn" onclick="selectQJDeviation('unsure')">Not Sure</div>
                        </div>
                    </div>

                    <!-- Q3: Factor -->
                    <div class="qj-form-group">
                        <label class="qj-form-label">3. Factor</label>
                        <div class="qj-options-grid cols-2" id="qj-modal-factor">
                            <div class="qj-option-btn" onclick="selectQJFactor('discipline')">Discipline</div>
                            <div class="qj-option-btn" onclick="selectQJFactor('emotion')">Emotion</div>
                            <div class="qj-option-btn" onclick="selectQJFactor('noise')">Market Noise</div>
                            <div class="qj-option-btn" onclick="selectQJFactor('execution')">Execution</div>
                        </div>
                    </div>

                    <p class="qj-hint-text">⏱️ Takes ~10 seconds • Can be edited later in Trades</p>
                </div>
                <div class="qj-modal-footer">
                    <button class="qj-modal-btn outline" onclick="saveQJLater()">Later</button>
                    <button class="qj-modal-btn primary" onclick="saveQJModal()">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeQJModal();
        });
    }
    return modal;
}

/**
 * 打开完整 Quick Journal Modal
 */
function openFullQuickJournalModal(tradeId) {
    const queue = getQuickJournalQueue();
    const trade = queue.find(t => t.id === tradeId);
    if (!trade) return;
    
    currentQJModalTradeId = tradeId;
    qjModalState = { stars: 0, deviation: null, factor: null };
    
    const modal = ensureQJModalExists();
    
    // Update trade context
    document.getElementById('qj-modal-symbol').textContent = trade.symbol;
    const sideEl = document.getElementById('qj-modal-side');
    sideEl.textContent = trade.side.toUpperCase();
    sideEl.className = `qj-trade-side ${trade.side}`;
    
    const pnlEl = document.getElementById('qj-modal-pnl');
    const pnlSign = trade.pnl >= 0 ? '+' : '-';
    pnlEl.textContent = `${pnlSign}$${Math.abs(trade.pnl).toFixed(2)}`;
    pnlEl.style.color = trade.pnl >= 0 ? 'var(--success)' : 'var(--danger)';
    
    document.getElementById('qj-modal-time').textContent = getTimeAgo(trade.closeTime);
    
    // Blueprint info
    const bpSection = document.getElementById('qj-modal-blueprint');
    if (trade.blueprint) {
        bpSection.style.display = 'flex';
        document.getElementById('qj-modal-bp-name').textContent = trade.blueprint;
    } else {
        bpSection.style.display = 'none';
    }
    
    // Reset UI
    document.querySelectorAll('#qj-modal-stars .qj-modal-star').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#qj-modal-deviation .qj-option-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('#qj-modal-factor .qj-option-btn').forEach(b => b.classList.remove('selected'));
    
    // Close dropdown
    closeQuickJournalDropdown();
    
    // Show modal
    modal.classList.add('show');
}

function closeQJModal() {
    const modal = document.getElementById('qj-full-modal');
    if (modal) modal.classList.remove('show');
    currentQJModalTradeId = null;
}

function setQJModalStar(rating) {
    qjModalState.stars = rating;
    document.querySelectorAll('#qj-modal-stars .qj-modal-star').forEach((star, idx) => {
        star.classList.toggle('active', idx < rating);
    });
}

function selectQJDeviation(value) {
    qjModalState.deviation = value;
    document.querySelectorAll('#qj-modal-deviation .qj-option-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent.toLowerCase().replace(' ', '') === value || 
            (value === 'no' && btn.textContent === 'No') ||
            (value === 'minor' && btn.textContent === 'Minor') ||
            (value === 'major' && btn.textContent === 'Major') ||
            (value === 'unsure' && btn.textContent === 'Not Sure'));
    });
}

function selectQJFactor(value) {
    qjModalState.factor = value;
    document.querySelectorAll('#qj-modal-factor .qj-option-btn').forEach(btn => {
        const btnText = btn.textContent.toLowerCase();
        btn.classList.toggle('selected', 
            (value === 'discipline' && btnText === 'discipline') ||
            (value === 'emotion' && btnText === 'emotion') ||
            (value === 'noise' && btnText === 'market noise') ||
            (value === 'execution' && btnText === 'execution'));
    });
}

function saveQJLater() {
    closeQJModal();
    showTopbarToast('Trade saved for later');
}

function saveQJModal() {
    if (qjModalState.stars === 0) {
        showTopbarToast('Please rate the execution quality');
        return;
    }
    
    // Save the rating
    let queue = getQuickJournalQueue();
    const trade = queue.find(t => t.id === currentQJModalTradeId);
    if (trade) {
        trade.rating = qjModalState.stars;
        trade.deviation = qjModalState.deviation;
        trade.factor = qjModalState.factor;
        
        // In real app, save to backend here
        console.log('Trade fully rated:', trade);
        
        // Remove from queue
        queue = queue.filter(t => t.id !== currentQJModalTradeId);
        saveQuickJournalQueue(queue);
        updateQuickJournalIndicator();
        renderQuickJournalList();
    }
    
    closeQJModal();
    showTopbarToast(`Trade rated ${qjModalState.stars}★`);
}

/**
 * 切换 Quick Journal 下拉菜单
 */
function toggleQuickJournalDropdown() {
    const dropdown = document.getElementById('qj-dropdown');
    if (!dropdown) return;
    
    const isShowing = dropdown.classList.contains('show');
    
    // Close other dropdowns
    document.querySelectorAll('.dropdown-menu, .qj-dropdown').forEach(menu => {
        menu.classList.remove('show');
    });
    
    if (!isShowing) {
        dropdown.classList.add('show');
        renderQuickJournalList();
    }
}

function closeQuickJournalDropdown() {
    const dropdown = document.getElementById('qj-dropdown');
    if (dropdown) dropdown.classList.remove('show');
}

/**
 * 显示简易 Toast
 */
function showTopbarToast(msg) {
    let toast = document.getElementById('topbar-simple-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'topbar-simple-toast';
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px);
            background: var(--bg-card, #1a1d24); border: 1px solid var(--primary, #3b82f6);
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

/**
 * 获取时间差描述
 */
function getTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// 筛选器配置
const filterConfig = {
    symbols: {
        title: 'Symbols',
        options: [
            { value: 'EURUSD', label: 'EUR/USD' },
            { value: 'GBPUSD', label: 'GBP/USD' },
            { value: 'USDJPY', label: 'USD/JPY' },
            { value: 'XAUUSD', label: 'XAU/USD' },
            { value: 'BTCUSD', label: 'BTC/USD' },
            { value: 'NAS100', label: 'NAS100' },
            { value: 'US30', label: 'US30' }
        ]
    },
    direction: {
        title: 'Direction',
        options: [
            { value: 'long', label: 'Long', icon: '↑' },
            { value: 'short', label: 'Short', icon: '↓' }
        ]
    },
    result: {
        title: 'Result',
        options: [
            { value: 'win', label: 'Win', class: 'win' },
            { value: 'loss', label: 'Loss', class: 'loss' },
            { value: 'breakeven', label: 'Breakeven', class: 'breakeven' }
        ]
    },
    assetClass: {
        title: 'Asset Class',
        options: [
            { value: 'forex', label: 'Forex' },
            { value: 'crypto', label: 'Crypto' },
            { value: 'indices', label: 'Indices' },
            { value: 'commodities', label: 'Commodities' },
            { value: 'stocks', label: 'Stocks' }
        ]
    },
    session: {
        title: 'Session',
        options: [
            { value: 'asian', label: 'Asian' },
            { value: 'london', label: 'London' },
            { value: 'newyork', label: 'New York' },
            { value: 'overlap', label: 'Overlap' }
        ]
    },
    setup: {
        title: 'Setup / Strategy',
        options: [
            { value: 'breakout', label: 'Breakout' },
            { value: 'pullback', label: 'Pullback' },
            { value: 'reversal', label: 'Reversal' },
            { value: 'trend', label: 'Trend Follow' },
            { value: 'range', label: 'Range' },
            { value: 'news', label: 'News Trade' }
        ]
    },
    emotion: {
        title: 'Emotion Tag',
        options: [
            { value: 'confident', label: '😊 Confident' },
            { value: 'fearful', label: '😰 Fearful' },
            { value: 'greedy', label: '🤑 Greedy' },
            { value: 'neutral', label: '😐 Neutral' },
            { value: 'revenge', label: '😤 Revenge' },
            { value: 'fomo', label: '😱 FOMO' }
        ]
    }
};

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
 * 获取顶部栏状态 (持久化)
 */
function getTopbarState() {
    const stored = sessionStorage.getItem('toMoon_topbar_state');
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
    // Force UTC midnight for consistency
    end.setUTCHours(23, 59, 59, 999);
    
    const start = new Date();
    start.setUTCDate(end.getUTCDate() - 29);
    start.setUTCHours(0, 0, 0, 0);
    
    return {
        accounts: ['Main Account', 'Trading Account A', 'Trading Account B'],
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
    sessionStorage.setItem('toMoon_topbar_state', JSON.stringify(state));
}

/**
 * 获取筛选器状态
 */
function getFiltersState() {
    const stored = sessionStorage.getItem('toMoon_filters_state');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) { console.error('Failed to parse filters state', e); }
    }
    return { ...filtersState };
}

/**
 * 保存筛选器状态
 */
function saveFiltersState(state) {
    sessionStorage.setItem('toMoon_filters_state', JSON.stringify(state));
    filtersState = state;
}

/**
 * 计算活跃筛选器数量
 */
function countActiveFilters() {
    const state = getFiltersState();
    let count = 0;
    Object.values(state).forEach(arr => {
        if (Array.isArray(arr)) count += arr.length;
    });
    return count;
}

/**
 * 生成筛选器下拉菜单HTML
 */
function generateFiltersHTML() {
    const state = getFiltersState();
    let html = '';
    
    Object.entries(filterConfig).forEach(([key, config]) => {
        html += `<div class="filter-section">
            <div class="filter-section-title">${config.title}</div>
            <div class="filter-chips">`;
        
        config.options.forEach(opt => {
            const isActive = state[key]?.includes(opt.value) ? 'active' : '';
            const extraClass = opt.class || '';
            const icon = opt.icon ? `<span class="chip-icon">${opt.icon}</span>` : '';
            html += `<div class="filter-chip ${extraClass} ${isActive}" data-category="${key}" data-value="${opt.value}" onclick="toggleFilterChip(this)">
                ${icon}${opt.label}
            </div>`;
        });
        
        html += `</div></div>`;
    });
    
    html += `<div class="filter-actions">
        <button class="filter-btn clear" onclick="clearAllFilters()">Clear All</button>
        <button class="filter-btn apply" onclick="applyFilters()">Apply Filters</button>
    </div>`;
    
    return html;
}

/**
 * 初始化/注入顶部筛选栏
 */
function initTopbar(options = {}) {
    if (document.getElementById('topbar')) return;
    
    // 注入样式
    injectTopbarStyles();

    const state = getTopbarState();
    const basePath = options.basePath || '..';
    
    // 初始化日期选择器状态
    pickerState.startDate = state.dateRange.start;
    pickerState.endDate = state.dateRange.end;
    pickerState.initialized = true;

    // 计算账户显示文本
    let accountText = 'All Accounts';
    if (!state.isAllAccounts) {
        if (state.accounts.length === 0) accountText = 'No Accounts';
        else if (state.accounts.length === 1) accountText = state.accounts[0];
        else accountText = `${state.accounts.length} Accounts`;
    }
    
    // 辅助函数：检查账户是否选中
    const isChecked = (val) => state.isAllAccounts || state.accounts.includes(val) ? 'checked' : '';
    const isAllChecked = state.isAllAccounts ? 'checked' : '';

    // Page Title Logic
    const pageTitle = options.title || '';

    const accountFilterHTML = `
            <div class="filter-group" id="account-filter" onclick="toggleDropdown('account-dropdown')">
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span id="selected-account">${accountText}</span>
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                
                <div class="dropdown-menu" id="account-dropdown" onclick="event.stopPropagation()">
                    <div class="dropdown-item" onclick="toggleAccount('all', this)">
                        <input type="checkbox" ${isAllChecked} id="acc-all">
                        <span>All Accounts</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" onclick="toggleAccount('Main Account', this)">
                        <input type="checkbox" ${isChecked('Main Account')} class="acc-checkbox" value="Main Account">
                        <span>Main Account</span>
                    </div>
                    <div class="dropdown-item" onclick="toggleAccount('Trading Account A', this)">
                        <input type="checkbox" ${isChecked('Trading Account A')} class="acc-checkbox" value="Trading Account A">
                        <span>Trading Account A</span>
                    </div>
                    <div class="dropdown-item" onclick="toggleAccount('Trading Account B', this)">
                        <input type="checkbox" ${isChecked('Trading Account B')} class="acc-checkbox" value="Trading Account B">
                        <span>Trading Account B</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item manage-accounts" href="${basePath}/Settings/Settings_demo_v1.2.html?section=accounts">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        <span>Manage Accounts</span>
                    </a>
                </div>
            </div>`;

    const dateFilterHTML = `
            <div class="filter-group" id="date-filter" onclick="toggleDropdown('date-dropdown'); initDatePickerIfNeeded();">
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span id="selected-date">${state.dateRange.label || 'Custom Range'}</span>
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                
                <div class="dropdown-menu date-picker-dropdown" id="date-dropdown" onclick="event.stopPropagation()">
                    <div class="calendar-section">
                        <div class="calendar-header">
                            <button class="calendar-nav-btn" onclick="changeMonth(-1)">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <span id="calendar-month-year">December 2025</span>
                            <button class="calendar-nav-btn" onclick="changeMonth(1)">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                        <div class="calendar-weekdays">
                            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                        </div>
                        <div class="calendar-grid" id="calendar-grid">
                            <!-- Days generated by JS -->
                        </div>
                    </div>
                    <div class="shortcuts-section">
                        <button class="shortcut-btn" onclick="selectShortcut('today')">Today</button>
                        <button class="shortcut-btn" onclick="selectShortcut('yesterday')">Yesterday</button>
                        <button class="shortcut-btn" onclick="selectShortcut('last7')">Last 7 Days</button>
                        <button class="shortcut-btn" onclick="selectShortcut('last30')">Last 30 Days</button>
                        <button class="shortcut-btn" onclick="selectShortcut('thisMonth')">This Month</button>
                        <button class="shortcut-btn" onclick="selectShortcut('lastMonth')">Last Month</button>
                        <button class="shortcut-btn" onclick="selectShortcut('thisYear')">This Year</button>
                    </div>
                </div>
            </div>`;

    const filtersTriggerHTML = `
            <div class="filter-group" id="filters-trigger" onclick="toggleDropdown('filters-dropdown'); initFiltersDropdown();">
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                <span>Filters</span>
                <span class="active-filters-badge" id="filters-badge" style="display: none;">0</span>
                <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                
                <div class="dropdown-menu filters-dropdown" id="filters-dropdown" onclick="event.stopPropagation()">
                    <!-- Content generated by JS -->
                </div>
            </div>`;

    // Quick Journal Indicator HTML
    const qjQueue = getQuickJournalQueue();
    const sessionQueue = JSON.parse(localStorage.getItem('toMoon_pending_sessions') || '[]');
    const totalPending = qjQueue.length + sessionQueue.length;
    
    const qjEmptyClass = totalPending === 0 ? 'empty' : '';
    const initialTitle = sessionQueue.length > 0 ? '⚡ Pending Items' : '📝 Unrated Trades';
    
    const quickJournalHTML = `
            <div class="qj-indicator ${qjEmptyClass}" id="qj-indicator" onclick="toggleQuickJournalDropdown(); event.stopPropagation();">
                <span>⚡</span>
                <span>Pending</span>
                <span class="qj-badge">${totalPending}</span>
                
                <div class="qj-dropdown" id="qj-dropdown" onclick="event.stopPropagation()">
                    <div class="qj-dropdown-header">
                        <span class="qj-dropdown-title">${initialTitle}</span>
                        <span class="qj-dropdown-action" onclick="deferAllQuickJournals()">Defer All</span>
                    </div>
                    <div class="qj-list" id="qj-list">
                        <!-- Trade items rendered by JS -->
                    </div>
                    <div class="qj-dropdown-footer">
                        <span class="qj-footer-hint">Rate quickly or defer to Trades</span>
                        <button class="qj-footer-btn" onclick="window.location.href='${basePath}/Moonlog/Moonlog.html?view=tradelog'">Open Trades</button>
                    </div>
                </div>
            </div>`;

    let topbarHTML = '';
    
    if (pageTitle) {
        // New Layout (Title Left, Filters Right)
        topbarHTML = `
            <div class="topbar-left">
                <h2 id="topbar-page-title" style="margin:0; font-size: 18px; font-weight: 600; color: var(--text-main);">${pageTitle}</h2>
            </div>
            <div class="topbar-right">
                ${quickJournalHTML}
                <div class="filter-divider"></div>
                ${accountFilterHTML}
                <div class="filter-divider"></div>
                ${dateFilterHTML}
                <div class="filter-divider"></div>
                ${filtersTriggerHTML}
            </div>
        `;
    } else {
        // Old Layout (Filters Left, Filters Right) - for Settings etc.
        topbarHTML = `
            <div class="topbar-left">
                ${accountFilterHTML}
                <div class="filter-divider"></div>
                ${dateFilterHTML}
            </div>
            <div class="topbar-right">
                ${quickJournalHTML}
                <div class="filter-divider"></div>
                ${filtersTriggerHTML}
            </div>
        `;
    }
    
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
    
    // 初始化点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-group') && !e.target.closest('.qj-indicator')) {
            document.querySelectorAll('.dropdown-menu, .qj-dropdown').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

/**
 * 切换下拉菜单显示
 * @param {string} id - 下拉菜单ID
 */
function toggleDropdown(id) {
    // 关闭其他所有下拉菜单
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
 * @param {string} accountName - 账户名称或 'all'
 * @param {HTMLElement} element - 点击的元素
 */
function toggleAccount(accountName, element) {
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
        display.textContent = 'All Accounts';
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
    
    // Check pending count
    updatePendingBadge();
}

function updatePendingBadge() {
    // 1. Pending Trades (Trades) - Use correct key 'toMoon_qj_queue'
    let pendingTradeQueue = [];
    try {
        pendingTradeQueue = getQuickJournalQueue(); // Reuse the robust getter
    } catch(e) {
        pendingTradeQueue = [];
    }
    
    // 2. Pending Sessions (Drafts)
    let pendingSessions = [];
    try {
        pendingSessions = JSON.parse(localStorage.getItem('toMoon_pending_sessions') || '[]');
    } catch(e) {
        pendingSessions = [];
    }
    
    const totalPending = pendingTradeQueue.length + pendingSessions.length;
    
    // Dispatch event for other listeners
    window.dispatchEvent(new CustomEvent('globalPendingUpdated', { 
        detail: { 
            trades: pendingTradeQueue.length, 
            sessions: pendingSessions.length,
            total: totalPending
        } 
    }));
}

// Global listener for session updates
window.addEventListener('pendingSessionsUpdated', function() {
    try {
        updateQuickJournalIndicator(); // Update UI first
        renderQuickJournalList();      // Re-render list
        updatePendingBadge();          // Then dispatch global event
    } catch (e) {
        console.error('Error updating Topbar from pendingSessionsUpdated:', e);
    }
});

// Also listen for storage events (cross-tab sync)
window.addEventListener('storage', function(e) {
    if (e.key === 'toMoon_pending_sessions' || e.key === 'toMoon_qj_queue') {
        updatePendingBadge();
        updateQuickJournalIndicator();
        renderQuickJournalList();
    }
});

// --- Date Picker Logic ---

function initDatePickerIfNeeded() {
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
    
    renderCalendar();
}

function renderCalendar() {
    const year = pickerState.currentDate.getUTCFullYear();
    const month = pickerState.currentDate.getUTCMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    document.getElementById('calendar-month-year').textContent = `${monthNames[month]} ${year} (UTC)`;
    
    const grid = document.getElementById('calendar-grid');
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
        cell.onclick = () => handleDateClick(date);
        
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

function changeMonth(delta) {
    pickerState.currentDate.setUTCMonth(pickerState.currentDate.getUTCMonth() + delta);
    renderCalendar();
}

function handleDateClick(date) {
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
        
        updateDateDisplay();
        setTimeout(() => {
            document.getElementById('date-dropdown').classList.remove('show');
        }, 300);
    }
    
    renderCalendar();
}

function selectShortcut(type) {
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
        case 'thisYear':
            start.setUTCMonth(0, 1);
            label = 'This Year';
            break;
    }
    
    pickerState.startDate = start;
    pickerState.endDate = end;
    pickerState.currentDate = new Date(start);
    
    renderCalendar();
    updateDateDisplay(label);
    
    document.querySelectorAll('.shortcut-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`.shortcut-btn[onclick*="'${type}'"]`);
    if (btn) btn.classList.add('active');
    
    setTimeout(() => {
        document.getElementById('date-dropdown').classList.remove('show');
    }, 200);
}

function updateDateDisplay(label = null) {
    const display = document.getElementById('selected-date');
    
    if (label) {
        display.textContent = label;
    } else {
        // Use UTC for display formatting to match the logic
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

// --- Advanced Filters Logic ---

/**
 * 初始化筛选器下拉菜单
 */
function initFiltersDropdown() {
    const dropdown = document.getElementById('filters-dropdown');
    if (dropdown) {
        dropdown.innerHTML = generateFiltersHTML();
    }
    updateFiltersBadge();
}

/**
 * 切换筛选器芯片选中状态
 */
function toggleFilterChip(element) {
    element.classList.toggle('active');
}

/**
 * 清除所有筛选器
 */
function clearAllFilters() {
    // 清除UI状态
    document.querySelectorAll('.filter-chip.active').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // 清除存储状态
    const emptyState = {
        symbols: [],
        direction: [],
        result: [],
        assetClass: [],
        session: [],
        setup: [],
        emotion: []
    };
    saveFiltersState(emptyState);
    updateFiltersBadge();
    
    // 触发事件
    const event = new CustomEvent('filtersChanged', { detail: emptyState });
    document.dispatchEvent(event);
}

/**
 * 应用筛选器
 */
function applyFilters() {
    const newState = {
        symbols: [],
        direction: [],
        result: [],
        assetClass: [],
        session: [],
        setup: [],
        emotion: []
    };
    
    document.querySelectorAll('.filter-chip.active').forEach(chip => {
        const category = chip.dataset.category;
        const value = chip.dataset.value;
        if (newState[category] && !newState[category].includes(value)) {
            newState[category].push(value);
        }
    });
    
    saveFiltersState(newState);
    updateFiltersBadge();
    
    // 触发事件
    const event = new CustomEvent('filtersChanged', { detail: newState });
    document.dispatchEvent(event);
    
    // 关闭下拉菜单
    document.getElementById('filters-dropdown').classList.remove('show');
    
    console.log('Filters applied:', newState);
}

/**
 * 更新筛选器角标
 */
function updateFiltersBadge() {
    const count = countActiveFilters();
    const badge = document.getElementById('filters-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * 获取当前筛选状态
 * @returns {object} 包含账户和日期范围
 */
function getFilterState() {
    return {
        ...getTopbarState(),
        filters: getFiltersState()
    };
}

// 导出函数供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        initTopbar, 
        toggleDropdown, 
        toggleAccount, 
        initDatePickerIfNeeded, 
        changeMonth, 
        selectShortcut,
        getFilterState,
        getTopbarState,
        saveTopbarState,
        // Filters exports
        initFiltersDropdown,
        toggleFilterChip,
        clearAllFilters,
        applyFilters,
        getFiltersState,
        saveFiltersState,
        // Quick Journal exports
        addTradeToQuickJournal,
        getQuickJournalQueue,
        quickRateTrade,
        deferAllQuickJournals
    };
} else {
    // 浏览器环境全局暴露
    window.initTopbar = initTopbar;
    window.toggleDropdown = toggleDropdown;
    window.toggleAccount = toggleAccount;
    window.initDatePickerIfNeeded = initDatePickerIfNeeded;
    window.changeMonth = changeMonth;
    window.selectShortcut = selectShortcut;
    window.getFilterState = getFilterState;
    // Filters exports
    window.initFiltersDropdown = initFiltersDropdown;
    window.toggleFilterChip = toggleFilterChip;
    window.clearAllFilters = clearAllFilters;
    window.applyFilters = applyFilters;
    window.getFiltersState = getFiltersState;
    // Quick Journal exports
    window.addTradeToQuickJournal = addTradeToQuickJournal;
    window.getQuickJournalQueue = getQuickJournalQueue;
    window.quickRateTrade = quickRateTrade;
    window.deferAllQuickJournals = deferAllQuickJournals;
    window.toggleQuickJournalDropdown = toggleQuickJournalDropdown;
    window.hideQuickJournalToast = hideQuickJournalToast;
    window.openQuickJournalFromToast = openQuickJournalFromToast;
    window.updateQuickJournalIndicator = updateQuickJournalIndicator;
    window.renderQuickJournalList = renderQuickJournalList;
    // Full QJ Modal exports
    window.openFullQuickJournalModal = openFullQuickJournalModal;
    window.closeQJModal = closeQJModal;
    window.setQJModalStar = setQJModalStar;
    window.selectQJDeviation = selectQJDeviation;
    window.selectQJFactor = selectQJFactor;
    window.saveQJLater = saveQJLater;
    window.saveQJModal = saveQJModal;
}
