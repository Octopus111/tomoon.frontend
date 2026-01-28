/**
 * ToMoon Sidebar Navigation Module
 * 共享导航栏模块 - 所有页面引入此文件即可
 * 
 * 使用方法：
 * 1. 在HTML中添加 <aside class="sidebar" id="sidebar"></aside>
 * 2. 引入此脚本 <script src="../shared/sidebar.js"></script>
 * 3. 引入顶部栏 <script src="../shared/topbar.js"></script> (可选)
 * 4. 调用 initSidebar('当前页面名称', '当前子页面', { internalSwitch: true/false })
 * 
 * 参数说明：
 * - currentPage: dashboard, strategy, journal, insight, settings
 * - currentSubItem: execute, blueprint, tradeview, dailyjournal 等
 * - options.internalSwitch: 是否为页面内切换（不跳转URL）
 * - options.switchFunction: 页面内切换时调用的函数名
 */

// 导航栏配置
const sidebarConfig = {
    brand: {
        name: 'ToMoon',
        // 收起时显示的小图标
        iconImage: '../Logo Files/Favicons/browser.png',
        // 展开时显示的完整 logo
        logoImage: '../Logo Files/232666450_padded_logo.png'
    },
    navigation: [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
            href: '../index.html',
            type: 'single'
        },
        {
            id: 'strategy',
            label: 'Strategy',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
            type: 'group',
            internalSwitchMap: {
                'execute': 'dashboard',
                'blueprint': 'library'
            },
            items: [
                { id: 'execute', label: 'Execute', href: '../Strategy/Strategy_demo_v1.5.html?view=dashboard' },
                { id: 'blueprint', label: 'Blueprint', href: '../Strategy/Strategy_demo_v1.5.html?view=library' }
            ]
        },
        {
            id: 'journal',
            label: 'Moonlog',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
            type: 'group',
            internalSwitchMap: {
                'missioncontrol': 'missioncontrol',
                'tradelog': 'tradelog',
                'sessionlog': 'sessionlog',
                'highlights': 'highlights'
            },
            items: [
                { id: 'missioncontrol', label: 'Mission Control', href: '../Moonlog/Moonlog.html?view=missioncontrol' },
                { id: 'tradelog', label: 'Trades', href: '../Moonlog/Moonlog.html?view=tradelog' },
                { id: 'sessionlog', label: 'Sessions', href: '../Moonlog/Moonlog.html?view=sessionlog' },
                { id: 'highlights', label: 'Highlights', href: '../Moonlog/Moonlog.html?view=highlights' }
            ]
        },
        {
            id: 'insight',
            label: 'Insight',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
            type: 'group',
            internalSwitchMap: {
                'dmi': 'dmi',
                'performance': 'performance',
                'behavior': 'behavior',
                'ai-report': 'ai-report'
            },
            items: [
                { id: 'dmi', label: 'DMI', href: '../Insight/Insight_demo_v1.4-fix.html?view=dmi' },
                { id: 'performance', label: 'Performance', href: '../Insight/Insight_demo_v1.4-fix.html?view=performance' },
                { id: 'behavior', label: 'Behavior', href: '../Insight/Insight_demo_v1.4-fix.html?view=behavior' },
                { id: 'ai-report', label: 'AI Report', href: '../Insight/Insight_demo_v1.4-fix.html?view=ai-report' }
            ]
        },
        {
            id: 'vault',
            label: 'Vault',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
            href: '../Vault/Vault_demo_v1.0.html',
            type: 'single'
        },
        {
            id: 'market',
            label: 'Market',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
            type: 'group',
            items: [
                { id: 'timeline', label: 'Timeline', href: '../Market/timeline_v1_demo.html' },
                { id: 'calendar', label: 'Calendar', href: '../Market/Economic_Calendar_demo.html' }
            ]
        }
    ],
    settings: {
        id: 'settings',
        label: 'Settings',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
        href: '../Settings/Settings_demo_v1.2.html',
        type: 'single'
    }
};

// 当前页面状态（用于页面内切换）
let currentSidebarState = {
    page: null,
    subItem: null,
    options: {}
};

/**
 * 初始化侧边栏行为（手动切换）
 */
function initSidebarBehavior() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (!sidebar) return;

    // 注意：展开状态已在 initSidebar 中预先设置，这里不再重复设置
    // 这样可以避免页面切换时的"闪烁"效果

    // Enable transitions after a short delay to prevent initial flash
    // 延迟启用过渡动画，防止页面加载时的闪烁
    // 使用 requestAnimationFrame 确保在下一帧才启用过渡
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            sidebar.classList.add('enable-transition');
        });
    });

    // 点击切换 (桌面端)
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止冒泡
            sidebar.classList.toggle('expanded');
            const isExpanded = sidebar.classList.contains('expanded');
            sessionStorage.setItem('sidebarExpanded', isExpanded);
        });
    }
    
    // 移动端支持
    initMobileSidebar(sidebar);
    
    // 保存滚动位置
    sidebar.addEventListener('scroll', () => {
        sessionStorage.setItem('sidebarScrollTop', sidebar.scrollTop);
    });
}

/**
 * 初始化移动端侧边栏
 */
function initMobileSidebar(sidebar) {
    // 创建移动端菜单按钮
    let mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (!mobileToggle) {
        mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
        mobileToggle.setAttribute('aria-label', 'Toggle menu');
        document.body.appendChild(mobileToggle);
    }
    
    // 创建遮罩层
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    
    // 移动端菜单切换
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-open');
        document.body.classList.toggle('sidebar-mobile-open');
    });
    
    // 点击遮罩层关闭菜单
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        document.body.classList.remove('sidebar-mobile-open');
    });
    
    // 点击导航项后关闭菜单 (移动端)
    sidebar.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const navItem = e.target.closest('.nav-item, .nav-sub-item');
            if (navItem && navItem.hasAttribute('href')) {
                setTimeout(() => {
                    sidebar.classList.remove('mobile-open');
                    document.body.classList.remove('sidebar-mobile-open');
                }, 150);
            }
        }
    });
    
    // 窗口大小变化时重置状态
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
            document.body.classList.remove('sidebar-mobile-open');
        }
    });
}

// 侧边栏CSS样式 (仅包含侧边栏和基础布局变量)
const sidebarStyles = `
    :root {
        --sidebar-width: 60px !important;
        --sidebar-expanded-width: 250px;
        --topbar-height: 60px;
    }

    /* --- Sidebar --- */
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: var(--sidebar-width);
        background: var(--bg-card, #1a1d24);
        border-right: 1px solid var(--border, #334155);
        padding: 20px 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex-shrink: 0;
        z-index: 1000;
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE/Edge Legacy */
        box-sizing: border-box;
    }
    
    .sidebar.enable-transition {
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Hide scrollbar (WebKit) but keep scroll */
    .sidebar::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    .sidebar.expanded {
        width: var(--sidebar-expanded-width);
        box-shadow: 5px 0 15px rgba(0,0,0,0.3);
        padding: 20px;
    }
    
    .main-content {
        margin-left: var(--sidebar-width) !important;
        margin-top: var(--topbar-height) !important;
        width: calc(100% - var(--sidebar-width)) !important;
    }
    
    .sidebar.enable-transition ~ .main-content {
        transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .sidebar.expanded ~ .main-content {
        margin-left: var(--sidebar-expanded-width) !important;
        width: calc(100% - var(--sidebar-expanded-width)) !important;
    }
    
    .edit-mode-banner {
        left: var(--sidebar-width) !important;
    }
    .sidebar.enable-transition ~ .edit-mode-banner {
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.expanded ~ .edit-mode-banner {
        left: var(--sidebar-expanded-width) !important;
    }
    
    .brand { 
        font-size: 20px; 
        font-weight: 700; 
        margin-bottom: 15px; 
        color: white; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        gap: 10px; 
        white-space: nowrap;
        height: 40px;
        flex-shrink: 0;
        overflow: visible;
        position: relative;
    }
    
    .brand-icon-img {
        width: 28px;
        height: 28px;
        object-fit: contain;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        opacity: 1;
    }
    
    .sidebar.enable-transition .brand-icon-img {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .brand-logo {
        height: 160px;
        width: auto;
        max-width: 220px;
        object-fit: contain;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        pointer-events: none;
    }
    
    .sidebar.enable-transition .brand-logo {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .sidebar.expanded .brand-icon-img {
        opacity: 0;
        pointer-events: none;
        transform: translate(-50%, -50%) scale(0.8);
    }
    
    .sidebar.expanded .brand-logo {
        opacity: 1;
        pointer-events: auto;
    }
    
    .sidebar.enable-transition.expanded .brand-logo {
        transition-delay: 0.1s;
    }
    
    .brand-icon {
        min-width: 24px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    
    .brand-icon svg {
        width: 24px;
        height: 24px;
    }
    
    .brand-name {
        opacity: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .sidebar.enable-transition .brand-name {
        transition: opacity 0.2s;
    }
    
    .sidebar.expanded .brand-name {
        opacity: 1;
    }
    
    .sidebar.enable-transition.expanded .brand-name {
        transition-delay: 0.1s;
    }
    
    .nav-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .nav-item {
        padding: 12px 10px;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-muted, #94a3b8);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: 500;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
    }
    .nav-item:hover { 
        background: rgba(255,255,255,0.05); 
        color: var(--text-main, #e2e8f0); 
    }
    .nav-item.active { 
        background: rgba(59, 130, 246, 0.1); 
        color: var(--primary, #3b82f6); 
        font-weight: 600; 
    }
    
    .nav-icon {
        min-width: 20px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    
    .nav-icon svg {
        width: 20px;
        height: 20px;
    }
    
    .nav-label {
        opacity: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .sidebar.enable-transition .nav-label {
        transition: opacity 0.2s;
    }
    
    .sidebar.expanded .nav-label {
        opacity: 1;
    }
    
    .sidebar.enable-transition.expanded .nav-label {
        transition-delay: 0.1s;
    }
    
    .nav-item.group-label {
        background: transparent;
        color: var(--text-main, #e2e8f0);
        /* cursor: default;  Removed to allow pointer cursor */
        padding-left: 10px;
    }
    .nav-item.group-label:hover {
        background: rgba(255,255,255,0.05); /* Added hover effect */
    }
    .nav-item.group-label.active {
        color: var(--primary, #3b82f6);
    }
    
    .nav-sub-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-left: 12px;
        margin-bottom: 5px;
        position: relative;
        height: 0;
        opacity: 0;
        visibility: hidden;
    }
    
    .sidebar.enable-transition .nav-sub-group {
        transition: all 0.3s;
    }
    
    .sidebar.expanded .nav-sub-group {
        height: auto;
        opacity: 1;
        visibility: visible;
    }
    
    .nav-sub-group::before {
        content: '';
        position: absolute;
        left: 20px;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--border, #334155);
        opacity: 0.5;
    }

    .nav-sub-item {
        padding: 8px 15px 8px 25px;
        border-radius: 6px;
        cursor: pointer;
        color: var(--text-muted, #94a3b8);
        font-size: 13px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
        text-decoration: none;
        white-space: nowrap;
    }
    .nav-sub-item:hover {
        color: var(--text-main, #e2e8f0);
        background: rgba(255,255,255,0.03);
    }
    .nav-sub-item.active {
        color: var(--primary, #3b82f6);
        background: rgba(59, 130, 246, 0.05);
        font-weight: 500;
    }
    .nav-sub-item.active::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 4px;
        background: var(--primary, #3b82f6);
        border-radius: 50%;
    }
    
    .nav-settings {
        margin-top: auto;
    }

    /* Toggle Button */
    .sidebar-toggle {
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-muted, #94a3b8);
        transition: all 0.3s ease;
        margin-bottom: 5px;
    }
    .sidebar-toggle:hover {
        color: var(--text-main, #e2e8f0);
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
    }
    .sidebar-toggle svg {
        width: 20px;
        height: 20px;
        transition: transform 0.3s ease;
    }
    /* Collapsed: Rotate 180 (>>) */
    .sidebar-toggle svg {
        transform: rotate(180deg);
    }
    /* Expanded: Rotate 0 (<<) */
    .sidebar.expanded .sidebar-toggle svg {
        transform: rotate(0deg);
    }

    /* ========== Mobile Responsive ========== */
    @media (max-width: 768px) {
        :root {
            --sidebar-width: 0px !important;
        }
        
        .sidebar {
            position: fixed;
            left: -280px;
            top: 0;
            width: 280px !important;
            height: 100vh;
            height: 100dvh; /* 使用动态视口高度，解决移动端地址栏问题 */
            z-index: 1001;
            transition: left 0.3s ease, transform 0.3s ease;
            padding: 20px;
            padding-bottom: 30px; /* 底部额外空间 */
            overflow-y: auto !important; /* 强制启用垂直滚动 */
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
            overscroll-behavior: contain; /* 防止滚动穿透 */
        }
        
        .sidebar.mobile-open {
            left: 0;
            box-shadow: 5px 0 25px rgba(0,0,0,0.5);
        }
        
        .sidebar.expanded {
            width: 280px !important;
        }
        
        .sidebar .nav-label,
        .sidebar .brand-name {
            opacity: 1 !important;
        }
        
        .sidebar .nav-sub-group {
            height: auto !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        .sidebar .brand-icon-img {
            opacity: 0 !important;
        }
        
        .sidebar .brand-logo {
            opacity: 1 !important;
            pointer-events: auto !important;
        }
        
        /* 确保 Settings 按钮在底部可见 */
        .sidebar .nav-settings {
            margin-top: auto;
            flex-shrink: 0;
            margin-bottom: 10px;
        }
        
        .main-content {
            margin-left: 0 !important;
            width: 100% !important;
        }
        
        .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        }
        
        .sidebar.mobile-open ~ .sidebar-overlay,
        body.sidebar-mobile-open .sidebar-overlay {
            display: block;
        }
        
        .mobile-menu-toggle {
            display: flex !important;
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 1002;
            width: 40px;
            height: 40px;
            background: var(--bg-card, #1a1d24);
            border: 1px solid var(--border, #334155);
            border-radius: 8px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-main, #e2e8f0);
        }
        
        .mobile-menu-toggle svg {
            width: 24px;
            height: 24px;
        }
        
        .sidebar-toggle {
            display: none !important;
        }
    }
    
    @media (min-width: 769px) {
        .mobile-menu-toggle {
            display: none !important;
        }
        
        .sidebar-overlay {
            display: none !important;
        }
    }
`;

/**
 * 初始化侧边栏
 */
function initSidebar(currentPage, currentSubItem = null, options = {}) {
    currentSidebarState = {
        page: currentPage,
        subItem: currentSubItem,
        options: options
    };
    
    // 预先检查展开状态（在注入样式之前）
    const shouldExpand = window.innerWidth > 768 && sessionStorage.getItem('sidebarExpanded') === 'true';
    
    injectSidebarStyles();
    
    // 设置 favicon
    setFavicon(options);
    
    const sidebarHTML = generateSidebarHTML(currentPage, currentSubItem, options);
    
    const sidebarContainer = document.getElementById('sidebar');
    if (sidebarContainer) {
        // 防止 FOUC (无样式内容闪烁)
        // 显式设置内联宽度，确保在 CSS 加载前尺寸正确
        // 配合 overflow: hidden 确保文字不会溢出
        if (window.innerWidth > 768) {
            sidebarContainer.style.width = shouldExpand ? '250px' : '60px';
            sidebarContainer.style.overflow = 'hidden';
        }

        // 在设置内容之前，先应用展开状态（无过渡动画）
        // 这样可以避免页面切换时的"闪烁"效果
        if (shouldExpand) {
            sidebarContainer.classList.add('expanded');
        } else {
            sidebarContainer.classList.remove('expanded');
        }
        
        sidebarContainer.innerHTML = sidebarHTML;
        
        // 恢复滚动位置
        const savedScrollTop = sessionStorage.getItem('sidebarScrollTop');
        if (savedScrollTop) {
            sidebarContainer.scrollTop = parseInt(savedScrollTop, 10);
        }
        
        initSidebarBehavior();
        
        // 自动加载并初始化 Topbar 模块
        loadTopbarModule(options);

        // 清理内联样式，交还给 CSS 类管理（为了响应式和过渡动画）
        // 使用两层 requestAnimationFrame 确保渲染后再清理
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                sidebarContainer.style.width = '';
                sidebarContainer.style.overflow = '';
            });
        });
    } else {
        console.warn('Sidebar container not found. Please add <aside class="sidebar" id="sidebar"></aside>');
    }
}

/**
 * 动态加载 Topbar 模块
 */
function loadTopbarModule(options = {}) {
    // 如果已经加载，直接初始化
    if (typeof initTopbar === 'function') {
        initTopbar(options);
        return;
    }
    
    // 动态加载 topbar.js
    const script = document.createElement('script');
    
    // 方法1: 从当前脚本路径推断
    const scripts = document.getElementsByTagName('script');
    let basePath = '';
    
    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && src.includes('sidebar.js')) {
            basePath = src.substring(0, src.lastIndexOf('/'));
            break;
        }
    }
    
    if (basePath) {
        script.src = basePath + '/topbar.js';
    } else {
        // 回退：尝试相对路径
        script.src = '../shared/topbar.js';
    }
    
    script.onload = function() {
        if (typeof initTopbar === 'function') {
            initTopbar(options);
        }
    };
    
    script.onerror = function() {
        console.warn('Failed to load topbar.js module from:', script.src);
    };
    
    document.head.appendChild(script);
}

/**
 * 注入CSS样式
 */
function injectSidebarStyles() {
    if (document.getElementById('sidebar-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'sidebar-styles';
    styleElement.textContent = sidebarStyles;
    document.head.appendChild(styleElement);
}

/**
 * 生成侧边栏HTML
 */
function generateSidebarHTML(currentPage, currentSubItem, options = {}) {
    const { brand, navigation, settings } = sidebarConfig;
    
    // Helper to adjust paths if at root
    const adjustPath = (path) => {
        if (options.isRoot && path.startsWith('../')) {
            return path.substring(3);
        }
        return path;
    };

    // 收起时显示小图标，展开时显示完整 logo
    let html = `<div class="brand">
        <img src="${adjustPath(brand.iconImage)}" alt="${brand.name}" class="brand-icon-img">
        <img src="${adjustPath(brand.logoImage)}" alt="${brand.name}" class="brand-logo">
    </div>`;
    
    // Add Toggle Button
    html += `
        <div class="sidebar-toggle" id="sidebar-toggle" title="Toggle Sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
        </div>
    `;
    
    navigation.forEach(navItem => {
        const iconHtml = `<span class="nav-icon">${navItem.icon}</span>`;
        const labelHtml = `<span class="nav-label">${navItem.label}</span>`;
        
        if (navItem.type === 'single') {
            const isActive = currentPage === navItem.id;
            // 如果是当前页面，禁止点击刷新
            const href = isActive ? 'javascript:void(0)' : adjustPath(navItem.href);
            const clickAttr = isActive ? 'onclick="return false;"' : '';
            html += `<a href="${href}" ${clickAttr} class="nav-item ${isActive ? 'active' : ''}">${iconHtml}${labelHtml}</a>`;
        } else if (navItem.type === 'group') {
            const isCurrentGroup = currentPage === navItem.id;
            // Determine the href for the group title (default to the first item's href)
            let groupHref = navItem.items && navItem.items.length > 0 ? navItem.items[0].href : '#';
            groupHref = adjustPath(groupHref);
            
            html += `<div class="nav-group">`;
            
            // 如果启用内部切换且当前在组内，点击组标题触发第一个子项的内部切换
            // 避免刷新页面导致的闪烁
            const firstSubItem = navItem.items && navItem.items.length > 0 ? navItem.items[0] : null;
            if (isCurrentGroup && options.internalSwitch && options.switchFunction && firstSubItem) {
                const switchParam = navItem.internalSwitchMap ? navItem.internalSwitchMap[firstSubItem.id] : firstSubItem.id;
                html += `<a href="javascript:void(0)" onclick="sidebarInternalSwitch('${firstSubItem.id}', '${switchParam}')" class="nav-item group-label ${isCurrentGroup ? 'active' : ''}">${iconHtml}${labelHtml}</a>`;
            } else {
                html += `<a href="${groupHref}" class="nav-item group-label ${isCurrentGroup ? 'active' : ''}">${iconHtml}${labelHtml}</a>`;
            }
            
            html += `<div class="nav-sub-group">`;
            
            navItem.items.forEach(subItem => {
                const isActive = isCurrentGroup && currentSubItem === subItem.id;
                
                if (isCurrentGroup && options.internalSwitch && options.switchFunction) {
                    const switchParam = navItem.internalSwitchMap ? navItem.internalSwitchMap[subItem.id] : subItem.id;
                    html += `<div class="nav-sub-item ${isActive ? 'active' : ''}" id="nav-${subItem.id}" onclick="sidebarInternalSwitch('${subItem.id}', '${switchParam}')">${subItem.label}</div>`;
                } else {
                    html += `<a href="${adjustPath(subItem.href)}" class="nav-sub-item ${isActive ? 'active' : ''}" id="nav-${subItem.id}">${subItem.label}</a>`;
                }
            });
            
            html += `</div></div>`;
        }
    });
    
    const isSettingsActive = currentPage === settings.id;
    const settingsIcon = `<span class="nav-icon">${settings.icon}</span>`;
    const settingsLabel = `<span class="nav-label">${settings.label}</span>`;
    
    // 如果是 Settings 页面且激活，同样禁止刷新
    const settingsHref = isSettingsActive ? 'javascript:void(0)' : adjustPath(settings.href);
    const settingsClick = isSettingsActive ? 'onclick="return false;"' : '';
    html += `<a href="${settingsHref}" ${settingsClick} class="nav-item nav-settings ${isSettingsActive ? 'active' : ''}">${settingsIcon}${settingsLabel}</a>`;
    
    return html;
}

/**
 * 页面内切换处理函数
 */
function sidebarInternalSwitch(subItemId, switchParam) {
    const { options } = currentSidebarState;
    
    document.querySelectorAll('.nav-sub-item').forEach(el => {
        el.classList.remove('active');
    });
    const activeNav = document.getElementById('nav-' + subItemId);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    currentSidebarState.subItem = subItemId;
    
    if (options.switchFunction && typeof window[options.switchFunction] === 'function') {
        window[options.switchFunction](switchParam);
    }
}

/**
 * 更新侧边栏当前选中项 (供页面内部调用)
 */
function updateSidebarActive(subItemId) {
    document.querySelectorAll('.nav-sub-item').forEach(el => {
        el.classList.remove('active');
    });
    const activeNav = document.getElementById('nav-' + subItemId);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    currentSidebarState.subItem = subItemId;
}

/**
 * 根据URL参数自动检测当前子页面
 */
function detectCurrentSubItem() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const view = urlParams.get('view');
    // Strategy pages
    if (view === 'dashboard') return 'execute';
    if (view === 'library') return 'blueprint';
    // Insight pages
    if (view === 'dmi') return 'dmi';
    if (view === 'performance') return 'performance';
    if (view === 'behavior') return 'behavior';
    if (view === 'ai-report') return 'ai-report';
    // Moonlog pages
    if (view === 'missioncontrol') return 'missioncontrol';
    if (view === 'tradelog') return 'tradelog';
    if (view === 'sessionlog') return 'sessionlog';
    if (view === 'highlights') return 'highlights';
    
    const page = urlParams.get('page');
    if (page === 'tradeview') return 'tradeview';
    if (page === 'sessionjournal') return 'sessionjournal';
    
    return null;
}

/**
 * 自动初始化侧边栏 (根据当前URL检测页面)
 */
function autoInitSidebar(options = {}) {
    const path = window.location.pathname.toLowerCase();
    let currentPage = 'dashboard';
    let currentSubItem = detectCurrentSubItem();
    
    if (path.includes('index') || path.endsWith('/')) {
        currentPage = 'dashboard';
    } else if (path.includes('strategy')) {
        currentPage = 'strategy';
        if (!currentSubItem) currentSubItem = 'execute';
    } else if (path.includes('moonlog') || path.includes('journal')) {
        currentPage = 'journal';
        if (!currentSubItem) currentSubItem = 'missioncontrol';
    } else if (path.includes('insight')) {
        currentPage = 'insight';
        if (!currentSubItem) currentSubItem = 'dmi';
    } else if (path.includes('settings')) {
        currentPage = 'settings';
    } else if (path.includes('dashboard')) {
        currentPage = 'dashboard';
    }
    
    initSidebar(currentPage, currentSubItem, options);
    
    return { currentPage, currentSubItem };
}

/**
 * 设置页面 Favicon
 * 自动添加 favicon 链接到页面 head
 */
function setFavicon(options = {}) {
    // 移除已存在的 favicon
    const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    existingFavicons.forEach(el => el.remove());
    
    let iconPath = '../Logo Files/Favicons/browser.png';
    if (options.isRoot) {
        iconPath = 'Logo Files/Favicons/browser.png';
    }

    // 添加新的 favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = iconPath;
    document.head.appendChild(link);
    
    // 同时添加 shortcut icon 以兼容旧浏览器
    const shortcutLink = document.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.type = 'image/png';
    shortcutLink.href = iconPath;
    document.head.appendChild(shortcutLink);
}

// 导出函数供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initSidebar, autoInitSidebar, updateSidebarActive, sidebarConfig, setFavicon };
} else {
    window.initSidebar = initSidebar;
    window.autoInitSidebar = autoInitSidebar;
    window.updateSidebarActive = updateSidebarActive;
    window.sidebarInternalSwitch = sidebarInternalSwitch;
    window.setFavicon = setFavicon;
}
