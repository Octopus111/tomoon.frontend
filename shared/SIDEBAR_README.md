# ToMoon 侧边栏导航模块使用说明

## 文件位置
`shared/sidebar.js`

## 使用方法

### 1. 简单页面 (无页面内切换)
如 Dashboard、Settings 页面：

```html
<!-- 在body开始处添加 -->
<aside class="sidebar" id="sidebar"></aside>
<script src="../shared/sidebar.js"></script>
<script>
    initSidebar('dashboard');  // 或 'settings'
</script>
```

### 2. 带页面内切换的页面
如 Strategy、Journal、Insight 页面：

```html
<aside class="sidebar" id="sidebar"></aside>
<script src="../shared/sidebar.js"></script>
<script>
    // 自动初始化，启用页面内切换
    autoInitSidebar({ 
        internalSwitch: true, 
        switchFunction: '你的切换函数名'  // 如 switchView, switchPage
    });
    
    // URL参数处理
    document.addEventListener('DOMContentLoaded', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        if (view === 'xxx') {
            yourSwitchFunction('xxx');
            updateSidebarActive('xxx');  // 更新侧边栏高亮
        }
    });
</script>
```

## API 参考

### `initSidebar(currentPage, currentSubItem, options)`
- `currentPage`: 'dashboard' | 'strategy' | 'journal' | 'insight' | 'settings'
- `currentSubItem`: 子页面ID (可选)
- `options.internalSwitch`: 是否启用页面内切换
- `options.switchFunction`: 切换函数名

### `autoInitSidebar(options)`
自动根据URL检测当前页面并初始化侧边栏。

### `updateSidebarActive(subItemId)`
更新侧边栏当前选中的子项（用于页面内切换后同步高亮状态）。

## 修改导航结构
编辑 `sidebar.js` 中的 `sidebarConfig` 对象：

```javascript
const sidebarConfig = {
    brand: { name: 'ToMoon', icon: '☾' },
    navigation: [
        { id: 'dashboard', label: 'Dashboard', href: '...', type: 'single' },
        { 
            id: 'strategy', 
            label: 'Strategy', 
            type: 'group',
            items: [
                { id: 'execute', label: 'Execute', href: '...' },
                { id: 'blueprint', label: 'Blueprint', href: '...' }
            ]
        },
        // ...
    ],
    settings: { id: 'settings', label: 'Settings', href: '...' }
};
```

## 当前页面配置

| 页面 | currentPage | 子页面 | 切换函数 |
|------|-------------|--------|----------|
| Dashboard | dashboard | - | - |
| Strategy | strategy | execute, blueprint | switchView |
| Journal | journal | tradeview, dailyjournal, journalhistory | switchPage |
| Insight | insight | dmi, performance, behavior, ai-report | switchView |
| Settings | settings | - | - |
