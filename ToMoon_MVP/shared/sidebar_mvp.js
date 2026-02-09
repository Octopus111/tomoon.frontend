/**
 * ToMoon MVP Sidebar Navigation Module
 * MVP版本导航栏模块
 * 
 * 导航结构：
 * - Home (主入口)
 * - Blueprint (策略蓝图)
 * - Performance (绩效分析)
 * - Market (市场信息)
 *   - Timeline
 *   - Calendar
 * - Moonlog (交易日志)
 *   - Journal
 *   - Sessions
 *   - Trades
 * - Settings (底部)
 */

// MVP导航栏配置
const sidebarConfig = {
    brand: {
        name: 'ToMoon',
        iconImage: '../../Logo Files/Favicons/browser.png',
        logoImage: '../../Logo Files/232666450_padded_logo.png'
    },
    navigation: [
        {
            id: 'home',
            label: 'Home',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
            href: '../home/index.html',
            type: 'single'
        },
        {
            id: 'blueprint',
            label: 'Blueprint',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
            href: '../execute/index.html?view=blueprint',
            type: 'single'
        },
        {
            id: 'performance',
            label: 'Performance',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
            href: '../performance/index.html',
            type: 'single'
        },
        {
            id: 'market',
            label: 'Market',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
            type: 'group',
            items: [
                { id: 'timeline', label: 'Timeline', href: '../market/timeline_v1_demo.html' },
                { id: 'calendar', label: 'Calendar', href: '../market/Economic_Calendar_demo.html' }
            ]
        },
        {
            id: 'moonlog',
            label: 'Moonlog',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
            type: 'group',
            items: [
                { id: 'journal', label: 'Journal', href: '../journal/Vault_demo_v1.0.html' },
                { id: 'sessions', label: 'Sessions', href: '../moonlog/Moonlog.html?view=sessions' },
                { id: 'trades', label: 'Trades', href: '../moonlog/Moonlog.html?view=trades' }
            ]
        }
    ],
    settings: {
        id: 'settings',
        label: 'Settings',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
        href: '../settings/index.html',
        type: 'single'
    }
};

// 当前页面状态
let currentSidebarState = {
    page: null,
    subItem: null,
    options: {}
};

/**
 * 初始化侧边栏行为
 */
function initSidebarBehavior() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (!sidebar) return;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            sidebar.classList.add('enable-transition');
        });
    });

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('expanded');
            const isExpanded = sidebar.classList.contains('expanded');
            sessionStorage.setItem('sidebarExpanded', isExpanded);
        });
    }
    
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
    
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-open');
        document.body.classList.toggle('sidebar-mobile-open');
    });
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        document.body.classList.remove('sidebar-mobile-open');
    });
    
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
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
            document.body.classList.remove('sidebar-mobile-open');
        }
    });
}

// 侧边栏CSS样式
const sidebarStyles = `
    :root {
        --sidebar-width: 60px !important;
        --sidebar-expanded-width: 250px;
        --topbar-height: 60px;
        --bg-primary: #0d0f14;
        --bg-card: #161a22;
        --bg-panel: #1c212b;
        --border: #2a3142;
        --text-main: #e2e8f0;
        --text-muted: #94a3b8;
        --primary: #3b82f6;
        --success: #22c55e;
        --danger: #ef4444;
        --warning: #f59e0b;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        background: var(--bg-primary);
        color: var(--text-main);
        min-height: 100vh;
    }

    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: var(--sidebar-width);
        background: var(--bg-card);
        border-right: 1px solid var(--border);
        padding: 20px 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex-shrink: 0;
        z-index: 1000;
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        box-sizing: border-box;
    }
    
    .sidebar.enable-transition {
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

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
        min-height: calc(100vh - var(--topbar-height));
    }
    
    .sidebar.enable-transition ~ .main-content {
        transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .sidebar.expanded ~ .main-content {
        margin-left: var(--sidebar-expanded-width) !important;
        width: calc(100% - var(--sidebar-expanded-width)) !important;
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
    
    .nav-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .nav-item {
        padding: 12px 10px;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-muted);
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
        color: var(--text-main); 
    }
    .nav-item.active { 
        background: rgba(59, 130, 246, 0.1); 
        color: var(--primary); 
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
        color: var(--text-main);
        padding-left: 10px;
    }
    .nav-item.group-label:hover {
        background: rgba(255,255,255,0.05);
    }
    .nav-item.group-label.active {
        color: var(--primary);
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
        background: var(--border);
        opacity: 0.5;
    }

    .nav-sub-item {
        padding: 8px 15px 8px 25px;
        border-radius: 6px;
        cursor: pointer;
        color: var(--text-muted);
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
        color: var(--text-main);
        background: rgba(255,255,255,0.03);
    }
    .nav-sub-item.active {
        color: var(--primary);
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
        background: var(--primary);
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
        color: var(--text-muted);
        transition: all 0.3s ease;
        margin-bottom: 5px;
    }
    .sidebar-toggle:hover {
        color: var(--text-main);
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
    }
    .sidebar-toggle svg {
        width: 20px;
        height: 20px;
        transition: transform 0.3s ease;
        transform: rotate(180deg);
    }
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
            height: 100dvh;
            z-index: 1001;
            transition: left 0.3s ease, transform 0.3s ease;
            padding: 20px;
            padding-bottom: 30px;
            overflow-y: auto !important;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
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
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-main);
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
    
    const isDesktop = window.innerWidth > 768;
    const forceExpanded = options && options.forceExpanded === true;
    const shouldExpand = isDesktop && (forceExpanded || sessionStorage.getItem('sidebarExpanded') === 'true');
    
    injectSidebarStyles();
    setFavicon(options);
    
    const sidebarHTML = generateSidebarHTML(currentPage, currentSubItem, options);
    
    const sidebarContainer = document.getElementById('sidebar');
    if (sidebarContainer) {
        if (isDesktop) {
            sidebarContainer.style.width = shouldExpand ? '250px' : '60px';
            sidebarContainer.style.overflow = 'hidden';
        }

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
        
        loadTopbarModule(options);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                sidebarContainer.style.width = '';
                sidebarContainer.style.overflow = '';
            });
        });
    } else {
        console.warn('Sidebar container not found.');
    }
}

/**
 * 动态加载 Topbar 模块
 */
function loadTopbarModule(options = {}) {
    if (typeof initTopbar === 'function') {
        initTopbar(options);
        return;
    }
    
    const script = document.createElement('script');
    const scripts = document.getElementsByTagName('script');
    let basePath = '';
    
    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && src.includes('sidebar_mvp.js')) {
            basePath = src.substring(0, src.lastIndexOf('/'));
            break;
        }
    }
    
    if (basePath) {
        script.src = basePath + '/topbar_mvp.js';
    } else {
        script.src = '../shared/topbar_mvp.js';
    }
    
    script.onload = function() {
        if (typeof initTopbar === 'function') {
            initTopbar(options);
        }
    };
    
    script.onerror = function() {
        console.warn('Failed to load topbar_mvp.js module from:', script.src);
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
    
    const adjustPath = (path) => {
        if (options.isRoot && path.startsWith('../')) {
            return path.substring(3);
        }
        return path;
    };

    let html = `<div class="brand">
        <img src="${adjustPath(brand.iconImage)}" alt="${brand.name}" class="brand-icon-img">
        <img src="${adjustPath(brand.logoImage)}" alt="${brand.name}" class="brand-logo">
    </div>`;
    
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
            const href = isActive ? 'javascript:void(0)' : adjustPath(navItem.href);
            const clickAttr = isActive ? 'onclick="return false;"' : '';
            html += `<a href="${href}" ${clickAttr} class="nav-item ${isActive ? 'active' : ''}">${iconHtml}${labelHtml}</a>`;
        } else if (navItem.type === 'group') {
            const isCurrentGroup = currentPage === navItem.id;
            let groupHref = navItem.items && navItem.items.length > 0 ? navItem.items[0].href : '#';
            groupHref = adjustPath(groupHref);
            
            html += `<div class="nav-group">`;
            
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
 * 更新侧边栏当前选中项
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
    
    if (view === 'sessions') return 'sessions';
    if (view === 'blueprint') return 'blueprint';

    if (view === 'timeline') return 'timeline';
    if (view === 'calendar') return 'calendar';

    if (view === 'journal') return 'journal';
    if (view === 'trades') return 'trades';
    
    return null;
}

/**
 * 自动初始化侧边栏
 */
function autoInitSidebar(options = {}) {
    const path = window.location.pathname.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    let currentPage = 'home';
    let currentSubItem = detectCurrentSubItem();
    
    if (path.includes('/home/')) {
        currentPage = 'home';
    } else if (path.includes('/market/')) {
        currentPage = 'market';
        if (!currentSubItem) {
            if (path.includes('economic_calendar') || path.includes('calendar')) {
                currentSubItem = 'calendar';
            } else {
                currentSubItem = 'timeline';
            }
        }
    } else if (path.includes('/execute/')) {
        // Blueprint页面单独处理
        if (view === 'blueprint') {
            currentPage = 'blueprint';
        } else if (view === 'sessions') {
            currentPage = 'moonlog';
            currentSubItem = 'sessions';
        } else {
            currentPage = 'moonlog';
            currentSubItem = 'sessions';
        }
    } else if (path.includes('/journal/')) {
        currentPage = 'moonlog';
        currentSubItem = 'journal';
    } else if (path.includes('/moonlog/')) {
        currentPage = 'moonlog';
        // 根据URL参数决定是sessions还是trades
        if (view === 'sessions') {
            currentSubItem = 'sessions';
        } else {
            currentSubItem = 'trades';
        }
    } else if (path.includes('/performance/')) {
        currentPage = 'performance';
    } else if (path.includes('/settings/')) {
        currentPage = 'settings';
    }
    
    initSidebar(currentPage, currentSubItem, options);
    
    return { currentPage, currentSubItem };
}

/**
 * 设置页面 Favicon
 */
function setFavicon(options = {}) {
    const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    existingFavicons.forEach(el => el.remove());
    
    let iconPath = '../../Logo Files/Favicons/browser.png';
    if (options.isRoot) {
        iconPath = '../Logo Files/Favicons/browser.png';
    }

    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = iconPath;
    document.head.appendChild(link);
    
    const shortcutLink = document.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.type = 'image/png';
    shortcutLink.href = iconPath;
    document.head.appendChild(shortcutLink);
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initSidebar, autoInitSidebar, updateSidebarActive, sidebarConfig, setFavicon };
} else {
    window.initSidebar = initSidebar;
    window.autoInitSidebar = autoInitSidebar;
    window.updateSidebarActive = updateSidebarActive;
    window.sidebarInternalSwitch = sidebarInternalSwitch;
    window.setFavicon = setFavicon;
}
