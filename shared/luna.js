/**
 * ToMoon Luna AI Module
 * AI 对话助手 - ChatGPT/Claude 风格底部对话框
 * 
 * 特点：
 * - 底部对话输入框（非搜索栏）
 * - "+" 按钮添加上下文（Blueprint, Trades 等）
 * - 根据页面推荐 1-2 个 AI 功能
 * - 简洁的对话体验
 * 
 * 使用方法：
 * 1. 在HTML中引入 <script src="shared/luna.js"></script>
 * 2. 页面加载后自动初始化
 */

const LUNA_CSS = `
    /* ========================================
       Luna AI - Chat Style Design System
       ======================================== */
    
    :root {
        --luna-bg-primary: rgba(25, 25, 25, 0.98);
        --luna-bg-secondary: rgba(37, 37, 37, 0.95);
        --luna-bg-hover: rgba(55, 55, 55, 0.9);
        --luna-bg-active: rgba(45, 45, 48, 1);
        --luna-border: rgba(255, 255, 255, 0.08);
        --luna-border-focus: rgba(255, 255, 255, 0.15);
        --luna-text-primary: rgba(255, 255, 255, 0.95);
        --luna-text-secondary: rgba(255, 255, 255, 0.6);
        --luna-text-muted: rgba(255, 255, 255, 0.4);
        --luna-accent: #9d7cd8;
        --luna-accent-soft: rgba(157, 124, 216, 0.15);
        --luna-success: #73daca;
        --luna-warning: #e0af68;
        --luna-danger: #f7768e;
        --luna-info: #7dcfff;
        --luna-shadow: 0 16px 70px rgba(0, 0, 0, 0.5);
        --luna-radius: 12px;
        --luna-radius-sm: 8px;
        --luna-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ========================================
       Luna Floating Widget (Bottom Right)
       ======================================== */
    
    .luna-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--luna-bg-primary);
        border: 1px solid var(--luna-border);
        border-radius: 50%;
        cursor: pointer;
        z-index: 9999;
        transition: var(--luna-transition);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    
    .luna-widget:hover {
        transform: scale(1.08);
        border-color: var(--luna-accent);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(157, 124, 216, 0.2);
    }
    
    .luna-widget.active {
        border-color: var(--luna-accent);
        box-shadow: 0 0 0 3px var(--luna-accent-soft);
    }

    /* Luna Moon Avatar */
    .luna-avatar {
        width: 28px;
        height: 28px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: var(--luna-transition);
    }
    
    .moon-shape {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        box-shadow: inset -4px -1px 0 0 rgba(255, 255, 255, 0.9);
        transform: rotate(-45deg);
        transition: var(--luna-transition);
    }
    
    .luna-widget:hover .moon-shape {
        transform: rotate(0deg);
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
    }
    
    .luna-widget.processing .moon-shape {
        animation: luna-pulse 1.5s infinite;
        background: var(--luna-accent);
        box-shadow: 0 0 15px var(--luna-accent);
    }
    
    @keyframes luna-pulse {
        0%, 100% { opacity: 0.6; transform: scale(0.95); }
        50% { opacity: 1; transform: scale(1.05); }
    }

    /* ========================================
       Luna Chat Panel (Notion AI Style)
       ======================================== */
    
    .luna-chat-panel {
        position: fixed;
        bottom: 84px;
        right: 24px;
        width: 420px;
        max-height: 520px;
        background: var(--luna-bg-primary);
        border: 1px solid var(--luna-border);
        border-radius: 16px;
        box-shadow: var(--luna-shadow);
        backdrop-filter: blur(20px);
        z-index: 10000;
        opacity: 0;
        transform: translateY(8px);
        pointer-events: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .luna-chat-panel.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }

    /* Notion-style Minimal Header */
    .luna-chat-header {
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--luna-border);
    }
    
    .luna-chat-title {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .luna-chat-title-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    
    .luna-chat-title-avatar .moon-shape {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        box-shadow: inset -5px -2px 0 0 rgba(255, 255, 255, 0.9);
        transform: rotate(-40deg);
        transition: all 0.4s ease;
        filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.15));
    }
    
    /* Active state when typing/responding */
    .luna-chat-title-avatar.active .moon-shape {
        background: rgba(255, 255, 255, 0.95);
        box-shadow: none;
        transform: rotate(0deg);
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
    }
    
    .luna-chat-title h3 {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--luna-text-primary);
        letter-spacing: -0.01em;
    }
    
    .luna-chat-title p {
        display: none;
    }
    
    .luna-close-btn {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: var(--luna-text-muted);
        cursor: pointer;
        border-radius: 4px;
        transition: var(--luna-transition);
        font-size: 16px;
    }
    
    .luna-close-btn:hover {
        background: var(--luna-bg-hover);
        color: var(--luna-text-primary);
    }

    /* ========================================
       Chat Messages Area (Notion AI Style)
       ======================================== */
    
    .luna-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-height: 180px;
        max-height: 280px;
    }
    
    .luna-chat-messages::-webkit-scrollbar {
        width: 4px;
    }
    
    .luna-chat-messages::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .luna-chat-messages::-webkit-scrollbar-thumb {
        background: var(--luna-border);
        border-radius: 2px;
    }

    /* Notion-style Message (No bubbles, clean text) */
    .luna-message {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-width: 100%;
    }
    
    .luna-message.assistant {
        align-self: flex-start;
    }
    
    .luna-message.user {
        align-self: flex-end;
        align-items: flex-end;
    }
    
    .luna-message-avatar {
        display: none;
    }
    
    .luna-message-label {
        font-size: 11px;
        font-weight: 500;
        color: var(--luna-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    /* Mini Luna avatar for assistant messages */
    .luna-message-avatar-mini {
        width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .luna-message-avatar-mini .moon-shape {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        box-shadow: inset -3px -1px 0 0 rgba(255, 255, 255, 0.85);
        transform: rotate(-40deg);
        filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.2));
    }
    
    .luna-message-content {
        padding: 0;
        border-radius: 0;
        font-size: 14px;
        line-height: 1.6;
        color: var(--luna-text-primary);
        background: transparent;
    }
    
    .luna-message.assistant .luna-message-content {
        background: transparent;
        color: var(--luna-text-secondary);
    }
    
    .luna-message.user .luna-message-content {
        background: transparent;
        color: var(--luna-text-primary);
        text-align: right;
        font-weight: 500;
    }
    
    .luna-message-content p {
        margin: 0 0 8px 0;
    }
    
    .luna-message-content p:last-child {
        margin-bottom: 0;
    }
    
    .luna-message-content ul {
        margin: 8px 0;
        padding-left: 16px;
    }
    
    .luna-message-content li {
        margin-bottom: 4px;
        color: var(--luna-text-secondary);
    }
    
    .luna-message-content strong {
        color: var(--luna-text-primary);
        font-weight: 600;
    }

    /* Attachments shown in user messages */
    .luna-message-attachments {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 6px;
    }

    .luna-message-attachment {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        background: var(--luna-accent-soft);
        border: 1px solid rgba(157, 124, 216, 0.3);
        border-radius: 4px;
        font-size: 11px;
        color: var(--luna-accent);
    }

    .luna-message-attachment .icon {
        font-size: 10px;
    }

    /* Typing Indicator */
    .luna-typing {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 0;
    }
    
    .luna-typing-dot {
        width: 6px;
        height: 6px;
        background: var(--luna-accent);
        border-radius: 50%;
        animation: luna-typing-bounce 1.4s infinite ease-in-out both;
    }
    
    .luna-typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .luna-typing-dot:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes luna-typing-bounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
    }

    /* ========================================
       Contextual Suggestions (Notion AI Pills)
       ======================================== */
    
    .luna-suggestions {
        padding: 8px 16px 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        position: relative;
        overflow: visible;
    }

    .luna-suggestions.hidden {
        display: none;
    }

    .luna-section-title {
        font-size: 11px;
        font-weight: 500;
        color: var(--luna-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.4px;
        margin: 4px 0 6px;
    }
    
    .luna-suggestion-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 150px;
        overflow-y: auto;
        padding-right: 2px;
    }

    .luna-suggestion-list::-webkit-scrollbar {
        width: 4px;
    }

    .luna-suggestion-list::-webkit-scrollbar-track {
        background: transparent;
    }

    .luna-suggestion-list::-webkit-scrollbar-thumb {
        background: var(--luna-border);
        border-radius: 2px;
    }
    
    .luna-suggestion-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        background: transparent;
        border: 1px solid var(--luna-border);
        border-radius: 8px;
        cursor: pointer;
        transition: var(--luna-transition);
        text-align: left;
    }
    
    .luna-suggestion-item:hover {
        background: var(--luna-bg-hover);
        border-color: var(--luna-border-focus);
    }

    .luna-suggestion-icon {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        opacity: 0.8;
        flex-shrink: 0;
    }

    .luna-suggestion-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .luna-suggestion-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--luna-text-primary);
    }

    .luna-suggestion-desc {
        font-size: 11px;
        color: var(--luna-text-muted);
    }

    /* ========================================
       Attachments Area (Notion-style Tags)
       ======================================== */
    
    .luna-attachments {
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
        border-bottom: 1px solid var(--luna-border);
        padding-bottom: 8px;
    }
    
    .luna-attachments:empty {
        display: none;
        margin-bottom: 0;
        border-bottom: none;
        padding-bottom: 0;
    }
    
    .luna-attachment-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        background: var(--luna-bg-secondary);
        border: 1px solid var(--luna-border);
        border-radius: 4px;
        font-size: 11px;
        color: var(--luna-text-secondary);
    }
    
    .luna-attachment-tag .icon {
        font-size: 10px;
    }
    
    .luna-attachment-remove {
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: var(--luna-text-muted);
        cursor: pointer;
        border-radius: 2px;
        font-size: 12px;
        margin-left: 2px;
        transition: var(--luna-transition);
    }
    
    .luna-attachment-remove:hover {
        color: var(--luna-text-primary);
        background: rgba(255, 255, 255, 0.1);
    }

    /* Inline attachments bar (shown below mode bar when has items) */
    .luna-attachments-inline {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 0 8px;
    }

    .luna-attachments-inline:empty {
        display: none;
    }

    /* ========================================
       Input Area - Notion AI Style
       ======================================== */
    
    .luna-input-area {
        padding: 0 16px 16px;
        background: var(--luna-bg-primary);
    }

    /* Mode Bar - Notion AI style */
    .luna-mode-bar {
        display: inline-flex;
        gap: 6px;
        padding: 6px 0 10px;
        flex-wrap: wrap;
    }

    .luna-mode-btn {
        padding: 4px 10px;
        border-radius: 6px;
        background: transparent;
        border: 1px solid var(--luna-border);
        color: var(--luna-text-secondary);
        font-size: 12px;
        cursor: pointer;
        transition: var(--luna-transition);
    }

    .luna-mode-btn:hover {
        background: var(--luna-bg-hover);
        color: var(--luna-text-primary);
    }

    .luna-mode-btn.active {
        background: var(--luna-bg-active);
        border-color: var(--luna-border-focus);
        color: var(--luna-text-primary);
    }
    
    .luna-input-row {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        background: var(--luna-bg-secondary);
        border: 1px solid var(--luna-border);
        border-radius: 8px;
        padding: 10px 12px;
        transition: var(--luna-transition);
    }
    
    .luna-input-row:focus-within {
        border-color: var(--luna-border-focus);
        background: var(--luna-bg-active);
    }
    
    /* Plus Button - Notion style */
    .luna-add-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--luna-text-muted);
        cursor: pointer;
        transition: var(--luna-transition);
        font-size: 18px;
        flex-shrink: 0;
    }
    
    .luna-add-btn:hover {
        background: var(--luna-bg-hover);
        color: var(--luna-text-primary);
    }
    
    /* Text Input - Notion style */
    .luna-chat-input {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--luna-text-primary);
        font-size: 14px;
        line-height: 1.5;
        resize: none;
        outline: none;
        min-height: 24px;
        max-height: 100px;
        font-family: inherit;
    }
    
    .luna-chat-input::placeholder {
        color: var(--luna-text-muted);
    }
    
    /* Send Button - Notion style (subtle) */
    .luna-send-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--luna-text-muted);
        cursor: pointer;
        transition: var(--luna-transition);
        flex-shrink: 0;
    }
    
    .luna-send-btn:hover {
        background: var(--luna-bg-hover);
        color: var(--luna-accent);
    }
    
    .luna-send-btn:disabled {
        color: var(--luna-text-muted);
        opacity: 0.4;
        cursor: not-allowed;
    }
    
    .luna-send-btn:not(:disabled) {
        color: var(--luna-accent);
    }

    /* ========================================
       Context Menu - Notion AI Style
       ======================================== */
    
    .luna-context-menu {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 0;
        right: auto;
        margin: 0;
        background: var(--luna-bg-primary);
        border: 1px solid var(--luna-border);
        border-radius: 8px;
        box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
        padding: 8px;
        width: 280px;
        max-height: 220px;
        overflow-y: auto;
        opacity: 0;
        transform: translateY(8px);
        pointer-events: none;
        transition: all 0.15s ease;
        z-index: 10002;
    }

    .luna-context-menu::-webkit-scrollbar {
        width: 4px;
    }

    .luna-context-menu::-webkit-scrollbar-track {
        background: transparent;
    }

    .luna-context-menu::-webkit-scrollbar-thumb {
        background: var(--luna-border);
        border-radius: 2px;
    }
    
    .luna-context-menu.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }

    /* Input wrapper for context menu positioning */
    .luna-input-wrapper {
        position: relative;
    }
    
    .luna-context-menu-title {
        padding: 8px 10px 6px;
        font-size: 11px;
        font-weight: 500;
        color: var(--luna-text-muted);
    }
    
    .luna-context-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: var(--luna-transition);
        width: 100%;
        background: transparent;
        border: none;
        text-align: left;
    }
    
    .luna-context-item:hover {
        background: var(--luna-bg-hover);
    }
    
    .luna-context-item .icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        opacity: 0.8;
    }
    
    .luna-context-item-text {
        flex: 1;
    }
    
    .luna-context-item-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--luna-text-primary);
        margin: 0;
    }
    
    .luna-context-item-desc {
        font-size: 11px;
        color: var(--luna-text-muted);
        margin: 2px 0 0 0;
    }

    /* ========================================
       Toast Notifications
       ======================================== */
    
    .luna-toast {
        position: fixed;
        top: 24px;
        right: 24px;
        min-width: 280px;
        max-width: 400px;
        background: var(--luna-bg-primary);
        border: 1px solid var(--luna-border);
        border-radius: var(--luna-radius);
        box-shadow: var(--luna-shadow);
        padding: 14px 16px;
        z-index: 10001;
        opacity: 0;
        transform: translateX(20px);
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }
    
    .luna-toast.visible {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
    }
    
    .luna-toast-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
    }
    
    .luna-toast-content {
        flex: 1;
    }
    
    .luna-toast-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--luna-text-primary);
        margin: 0 0 4px 0;
    }
    
    .luna-toast-message {
        font-size: 12px;
        color: var(--luna-text-secondary);
        margin: 0;
        line-height: 1.5;
    }
    
    .luna-toast.success { border-left: 3px solid var(--luna-success); }
    .luna-toast.warning { border-left: 3px solid var(--luna-warning); }
    .luna-toast.error { border-left: 3px solid var(--luna-danger); }
    .luna-toast.info { border-left: 3px solid var(--luna-info); }

    /* ========================================
       Risk Guard Overlay
       ======================================== */
    
    .luna-guard-overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 10, 10, 0.9);
        backdrop-filter: blur(10px);
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }
    
    .luna-guard-overlay.visible {
        opacity: 1;
        pointer-events: auto;
    }
    
    .luna-guard-card {
        width: 420px;
        background: var(--luna-bg-primary);
        border: 1px solid var(--luna-danger);
        border-radius: 16px;
        padding: 40px;
        text-align: center;
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .luna-guard-overlay.visible .luna-guard-card {
        transform: scale(1);
    }
    
    .luna-guard-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 24px;
        border-radius: 50%;
        background: rgba(247, 118, 142, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
    }
    
    .luna-guard-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--luna-danger);
        margin: 0 0 12px 0;
    }
    
    .luna-guard-message {
        font-size: 14px;
        color: var(--luna-text-secondary);
        line-height: 1.6;
        margin: 0 0 24px 0;
    }
    
    .luna-guard-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
    }
    
    .luna-guard-btn {
        padding: 12px 24px;
        border-radius: var(--luna-radius-sm);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: var(--luna-transition);
    }
    
    .luna-guard-btn.primary {
        background: var(--luna-danger);
        border: none;
        color: white;
    }
    
    .luna-guard-btn.secondary {
        background: transparent;
        border: 1px solid var(--luna-border);
        color: var(--luna-text-muted);
    }
    
    .luna-guard-btn:hover {
        transform: translateY(-1px);
    }
`;

const LUNA_HTML = `
<!-- Luna Floating Widget -->
<div class="luna-widget" id="luna-widget">
    <div class="luna-avatar">
        <div class="moon-shape"></div>
    </div>
</div>

<!-- Luna Chat Panel (Notion AI Style) -->
<div class="luna-chat-panel" id="luna-chat-panel">
    <!-- Minimal Header -->
    <div class="luna-chat-header">
        <div class="luna-chat-title">
            <div class="luna-chat-title-avatar">
                <div class="moon-shape"></div>
            </div>
            <div>
                <h3>Luna</h3>
            </div>
        </div>
        <button class="luna-close-btn" onclick="Luna.close()">×</button>
    </div>
    
    <!-- Messages Area -->
    <div class="luna-chat-messages" id="luna-chat-messages">
        <!-- Messages will be inserted here -->
    </div>
    
    <!-- Contextual Suggestions (hidden after chat starts) -->
    <div class="luna-suggestions" id="luna-suggestions">
        <div class="luna-section-title">Recommended</div>
        <div class="luna-suggestion-list" id="luna-suggestion-list">
            <!-- Will be populated by JS based on context -->
        </div>
    </div>
    
    <!-- Input Area (Bottom) -->
    <div class="luna-input-area">
        <div class="luna-mode-bar" id="luna-mode-bar">
            <button class="luna-mode-btn active" data-mode="ask">Ask</button>
            <button class="luna-mode-btn" data-mode="analyze">Analyze</button>
            <button class="luna-mode-btn" data-mode="summarize">Summarize</button>
            <button class="luna-mode-btn" data-mode="draft">Draft</button>
        </div>
        <!-- Inline attachments (shown when items attached) -->
        <div class="luna-attachments-inline" id="luna-attachments">
            <!-- Added context items appear here -->
        </div>
        <div class="luna-input-wrapper">
            <!-- Context Menu for Adding Attachments (Floating above input) -->
            <div class="luna-context-menu" id="luna-context-menu">
                <!-- Attached items shown at top -->
                <div class="luna-attachments" id="luna-context-attachments">
                    <!-- Attached context items appear here -->
                </div>
                <div class="luna-context-menu-title">Add context</div>
                <button class="luna-context-item" onclick="Luna.addContext('blueprint')">
                    <span class="icon">📋</span>
                    <div class="luna-context-item-text">
                        <p class="luna-context-item-title">Blueprint</p>
                        <p class="luna-context-item-desc">Current strategy</p>
                    </div>
                </button>
                <button class="luna-context-item" onclick="Luna.addContext('trades')">
                    <span class="icon">📊</span>
                    <div class="luna-context-item-text">
                        <p class="luna-context-item-title">Recent Trades</p>
                        <p class="luna-context-item-desc">Last 10 trades</p>
                    </div>
                </button>
                <button class="luna-context-item" onclick="Luna.addContext('performance')">
                    <span class="icon">📈</span>
                    <div class="luna-context-item-text">
                        <p class="luna-context-item-title">Performance</p>
                        <p class="luna-context-item-desc">Metrics &amp; stats</p>
                    </div>
                </button>
                <button class="luna-context-item" onclick="Luna.addContext('journal')">
                    <span class="icon">📝</span>
                    <div class="luna-context-item-text">
                        <p class="luna-context-item-title">Journal</p>
                        <p class="luna-context-item-desc">Recent entries</p>
                    </div>
                </button>
            </div>
            <div class="luna-input-row">
                <button class="luna-add-btn" id="luna-add-btn" onclick="Luna.toggleContextMenu()" title="Add context">+</button>
                <textarea class="luna-chat-input" id="luna-chat-input" placeholder="Ask Luna..." rows="1"></textarea>
                <button class="luna-send-btn" id="luna-send-btn" onclick="Luna.sendMessage()" title="Send">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Toast Notification -->
<div class="luna-toast" id="luna-toast">
    <div class="luna-toast-icon" id="luna-toast-icon">💡</div>
    <div class="luna-toast-content">
        <p class="luna-toast-title" id="luna-toast-title">Insight</p>
        <p class="luna-toast-message" id="luna-toast-message"></p>
    </div>
</div>

<!-- Risk Guard Overlay -->
<div class="luna-guard-overlay" id="luna-guard-overlay">
    <div class="luna-guard-card">
        <div class="luna-guard-icon">🛡️</div>
        <h2 class="luna-guard-title">Risk Guard Triggered</h2>
        <p class="luna-guard-message" id="luna-guard-message">
            Daily loss limit reached. Trading paused to protect your capital.
        </p>
        <div class="luna-guard-actions">
            <button class="luna-guard-btn primary" onclick="Luna.acknowledgeGuard()">I Understand</button>
            <button class="luna-guard-btn secondary" onclick="Luna.closeGuard()">Override</button>
        </div>
    </div>
</div>
`;

// ========================================
// Luna AI Controller - Chat Style
// ========================================

const Luna = {
    isOpen: false,
    contextMenuOpen: false,
    currentContext: null,
    attachedContexts: [],
    messageHistory: [],
    mode: 'ask',
    
    // Page-specific suggestions (1-2 per page type)
    pageSuggestions: {
        dashboard: [
            { icon: '📊', label: 'Review today\'s performance', desc: 'Wins, losses, expectancy', action: 'performance-review' },
            { icon: '🛡️', label: 'Risk status check', desc: 'Limits, exposure, guardrails', action: 'risk-check' }
        ],
        strategy: [
            { icon: '🔍', label: 'Analyze this blueprint', desc: 'Entry/exit rules & edge', action: 'analyze-blueprint' },
            { icon: '💡', label: 'Suggest improvements', desc: 'Tighten rules, reduce noise', action: 'suggest-improvements' }
        ],
        insight: [
            { icon: '📈', label: 'Explain these patterns', desc: 'Why this behavior repeats', action: 'explain-patterns' },
            { icon: '🎯', label: 'Find opportunities', desc: 'Surface high-probability setups', action: 'find-opportunities' }
        ],
        journal: [
            { icon: '✍️', label: 'Reflect on today', desc: 'Summarize decisions & emotions', action: 'journal-reflect' },
            { icon: '📋', label: 'Summarize the week', desc: 'Key lessons and mistakes', action: 'journal-summary' }
        ],
        moonlog: [
            { icon: '🔍', label: 'Analyze selected trades', desc: 'Patterns across entries', action: 'analyze-trades' },
            { icon: '📝', label: 'Draft trade notes', desc: 'Concise post-trade summary', action: 'add-notes' }
        ],
        vault: [
            { icon: '📚', label: 'Search my playbook', desc: 'Find relevant setups fast', action: 'search-playbook' }
        ],
        settings: [
            { icon: '⚙️', label: 'Help me configure', desc: 'Risk, alerts, preferences', action: 'help-config' }
        ],
        general: [
            { icon: '💬', label: 'Ask a question', desc: 'Anything about your trading', action: 'general-ask' }
        ]
    },
    
    // Context type info for attachments
    contextTypes: {
        blueprint: { icon: '📋', label: 'Blueprint' },
        trades: { icon: '📊', label: 'Recent Trades' },
        performance: { icon: '📈', label: 'Performance' },
        journal: { icon: '📝', label: 'Journal' }
    },

    /**
     * Initialize Luna
     */
    init: function() {
        console.log('Luna: Initializing chat assistant...');
        
        // Cleanup existing instances to prevent duplicates
        const existingLayer = document.getElementById('luna-ai-layer');
        if (existingLayer) existingLayer.remove();
        
        const existingWidget = document.getElementById('luna-widget');
        if (existingWidget) existingWidget.remove();

        this.injectStyles();
        this.injectHTML();
        this.bindEvents();
        this.setMode(this.mode);
        this.detectContext();
        this.renderSuggestions();
        this.addWelcomeMessage();
        console.log('Luna: Ready.');
    },

    injectStyles: function() {
        if (document.getElementById('luna-styles')) return;
        const style = document.createElement('style');
        style.id = 'luna-styles';
        style.textContent = LUNA_CSS;
        document.head.appendChild(style);
    },

    injectHTML: function() {
        const container = document.createElement('div');
        container.id = 'luna-ai-layer';
        container.innerHTML = LUNA_HTML;
        document.body.appendChild(container);
    },

    /**
     * Bind all event listeners
     */
    bindEvents: function() {
        const widget = document.getElementById('luna-widget');
        const panel = document.getElementById('luna-chat-panel');
        const chatInput = document.getElementById('luna-chat-input');
        const contextMenu = document.getElementById('luna-context-menu');
        const modeBar = document.getElementById('luna-mode-bar');

        // Widget click to toggle panel
        if (widget) {
            widget.addEventListener('click', (e) => {
                console.log('Luna: Widget clicked');
                e.stopPropagation();
                this.toggle();
            });
        } else {
            console.error('Luna: Widget element not found during binding');
        }

        // Prevent clicks inside panel from closing it
        if (panel) {
            panel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Auto-resize textarea
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
                this.updateSendButton();
            });

            // Send on Enter (without Shift)
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Click outside to close
        document.addEventListener('click', (e) => {
            // Close context menu
            if (this.contextMenuOpen && contextMenu && !contextMenu.contains(e.target) && !e.target.closest('.luna-add-btn')) {
                this.closeContextMenu();
            }
            // Close panel
            if (this.isOpen && panel && widget && !panel.contains(e.target) && !widget.contains(e.target)) {
                this.close();
            }
        });

        // Global keyboard shortcut (Cmd/Ctrl + J)
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
                e.preventDefault();
                this.toggle();
            }
            if (e.key === 'Escape') {
                if (this.contextMenuOpen) {
                    this.closeContextMenu();
                } else if (this.isOpen) {
                    this.close();
                }
            }
        });

        // Mode buttons
        if (modeBar) {
            modeBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.luna-mode-btn');
                if (!btn) return;
                const mode = btn.getAttribute('data-mode');
                this.setMode(mode);
            });
        }
    },

    /**
     * Detect current page context
     */
    detectContext: function() {
        const url = window.location.href.toLowerCase();
        
        if (url.includes('dashboard') || url.endsWith('index.html') || url.endsWith('/')) {
            this.currentContext = 'dashboard';
        } else if (url.includes('strategy')) {
            this.currentContext = 'strategy';
        } else if (url.includes('insight')) {
            this.currentContext = 'insight';
        } else if (url.includes('moonlog')) {
            this.currentContext = 'moonlog';
        } else if (url.includes('journal')) {
            this.currentContext = 'journal';
        } else if (url.includes('vault')) {
            this.currentContext = 'vault';
        } else if (url.includes('settings')) {
            this.currentContext = 'settings';
        } else {
            this.currentContext = 'general';
        }
    },

    /**
     * Render contextual suggestions (1-2 based on page)
     */
    renderSuggestions: function() {
        const list = document.getElementById('luna-suggestion-list');
        if (!list) return;

        const suggestions = this.pageSuggestions[this.currentContext] || this.pageSuggestions.general;

        list.innerHTML = suggestions.map(s => `
            <button class="luna-suggestion-item" onclick="Luna.handleSuggestion('${s.action}')">
                <span class="luna-suggestion-icon">${s.icon}</span>
                <div class="luna-suggestion-text">
                    <div class="luna-suggestion-title">${s.label}</div>
                    <div class="luna-suggestion-desc">${s.desc || ''}</div>
                </div>
            </button>
        `).join('');
    },

    /**
     * Add welcome message
     */
    addWelcomeMessage: function() {
        const messages = document.getElementById('luna-chat-messages');
        if (!messages) return;
        
        const welcomeMessages = {
            dashboard: "Hi! I can help you understand your performance, check risk levels, or answer any trading questions.",
            strategy: "I can help analyze your blueprint, suggest improvements, or explain strategy concepts.",
            insight: "I can explain the patterns you're seeing and help identify opportunities.",
            journal: "I can help you reflect on your trades or summarize your trading week.",
            moonlog: "I can analyze your trades and help you spot patterns in your data.",
            vault: "I can search your playbook or help organize your strategies.",
            settings: "I can help you configure Luna or explain any settings.",
            general: "Hi! How can I help you today?"
        };
        
        const welcomeText = welcomeMessages[this.currentContext] || welcomeMessages.general;
        
        this.addMessage('assistant', welcomeText);
    },

    /**
     * Toggle chat panel
     */
    toggle: function() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Open chat panel
     */
    open: function() {
        const widget = document.getElementById('luna-widget');
        const panel = document.getElementById('luna-chat-panel');
        const chatInput = document.getElementById('luna-chat-input');

        this.isOpen = true;
        widget.classList.add('active');
        panel.classList.add('visible');
        
        // Focus input
        setTimeout(() => chatInput.focus(), 100);
    },

    /**
     * Close chat panel
     */
    close: function() {
        const widget = document.getElementById('luna-widget');
        const panel = document.getElementById('luna-chat-panel');

        this.isOpen = false;
        widget.classList.remove('active');
        panel.classList.remove('visible');
        this.closeContextMenu();
    },

    /**
     * Toggle context menu (for + button)
     */
    toggleContextMenu: function() {
        if (this.contextMenuOpen) {
            this.closeContextMenu();
        } else {
            this.openContextMenu();
        }
    },

    openContextMenu: function() {
        const menu = document.getElementById('luna-context-menu');
        menu.classList.add('visible');
        this.contextMenuOpen = true;
    },

    closeContextMenu: function() {
        const menu = document.getElementById('luna-context-menu');
        menu.classList.remove('visible');
        this.contextMenuOpen = false;
    },

    /**
     * Add context attachment
     */
    addContext: function(type) {
        this.closeContextMenu();
        
        // Check if already attached
        if (this.attachedContexts.includes(type)) {
            this.showToast('info', 'Already Added', `${this.contextTypes[type].label} is already attached.`);
            return;
        }
        
        this.attachedContexts.push(type);
        this.renderAttachments();
        this.showToast('success', 'Context Added', `${this.contextTypes[type].label} attached to your message.`);
    },

    /**
     * Remove context attachment
     */
    removeContext: function(type) {
        this.attachedContexts = this.attachedContexts.filter(c => c !== type);
        this.renderAttachments();
    },

    /**
     * Render attachment tags (in both inline bar and context menu)
     */
    renderAttachments: function() {
        const inlineContainer = document.getElementById('luna-attachments');
        const menuContainer = document.getElementById('luna-context-attachments');
        
        const tagsHtml = this.attachedContexts.map(type => {
            const ctx = this.contextTypes[type];
            return `
                <div class="luna-attachment-tag">
                    <span class="icon">${ctx.icon}</span>
                    ${ctx.label}
                    <button class="luna-attachment-remove" onclick="Luna.removeContext('${type}')">×</button>
                </div>
            `;
        }).join('');
        
        if (inlineContainer) inlineContainer.innerHTML = tagsHtml;
        if (menuContainer) menuContainer.innerHTML = tagsHtml;
    },

    /**
     * Update send button state
     */
    updateSendButton: function() {
        const input = document.getElementById('luna-chat-input');
        const btn = document.getElementById('luna-send-btn');
        btn.disabled = !input.value.trim();
    },

    /**
     * Set AI mode (Ask/Analyze/Summarize/Draft)
     */
    setMode: function(mode) {
        const allowed = ['ask', 'analyze', 'summarize', 'draft'];
        if (!allowed.includes(mode)) return;

        this.mode = mode;

        const modeBar = document.getElementById('luna-mode-bar');
        if (modeBar) {
            modeBar.querySelectorAll('.luna-mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
            });
        }

        const input = document.getElementById('luna-chat-input');
        if (input) {
            const placeholders = {
                ask: 'Ask Luna…',
                analyze: 'Analyze performance, risk, or strategy…',
                summarize: 'Summarize trades, journal, or sessions…',
                draft: 'Draft notes, plans, or summaries…'
            };
            input.placeholder = placeholders[mode] || 'Ask Luna…';
        }
    },

    /**
     * Send a message
     */
    sendMessage: function() {
        const input = document.getElementById('luna-chat-input');
        const text = input.value.trim();
        
        if (!text) return;
        
        // Hide suggestions after chat starts
        const suggestions = document.getElementById('luna-suggestions');
        if (suggestions) suggestions.classList.add('hidden');
        
        // Save attachments before clearing
        const attachments = [...this.attachedContexts];
        
        // Add user message with attachments
        this.addMessage('user', text, attachments);
        
        // Clear input and attachments
        input.value = '';
        input.style.height = 'auto';
        this.attachedContexts = [];
        this.renderAttachments();
        this.updateSendButton();
        
        // Show typing indicator
        this.showTyping();
        
        // Simulate AI response
        setTimeout(() => {
            this.hideTyping();
            this.generateResponse(text);
        }, 1500);
    },

    /**
     * Add a message to the chat (Notion AI style - no avatars)
     * @param {string} role - 'user' or 'assistant'
     * @param {string} content - Message text
     * @param {Array} attachments - Optional array of attachment type keys
     */
    addMessage: function(role, content, attachments = []) {
        const messages = document.getElementById('luna-chat-messages');
        if (!messages) return;
        
        const label = role === 'assistant' ? 'Luna' : 'You';
        
        // Build attachments HTML if any
        let attachmentsHtml = '';
        if (attachments && attachments.length > 0) {
            const tags = attachments.map(type => {
                const ctx = this.contextTypes[type];
                if (!ctx) return '';
                return `<span class="luna-message-attachment"><span class="icon">${ctx.icon}</span>${ctx.label}</span>`;
            }).join('');
            attachmentsHtml = `<div class="luna-message-attachments">${tags}</div>`;
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = `luna-message ${role}`;
        
        // Add mini avatar for assistant messages
        const avatarHtml = role === 'assistant' 
            ? '<span class="luna-message-avatar-mini"><span class="moon-shape"></span></span>' 
            : '';
        
        messageEl.innerHTML = `
            <div class="luna-message-label">${avatarHtml}${label}</div>
            <div class="luna-message-content">
                ${attachmentsHtml}
                <p>${content}</p>
            </div>
        `;
        
        messages.appendChild(messageEl);
        messages.scrollTop = messages.scrollHeight;
        
        this.messageHistory.push({ role, content, attachments });
    },

    /**
     * Show typing indicator (Notion AI style)
     */
    showTyping: function() {
        const messages = document.getElementById('luna-chat-messages');
        if (!messages) return;
        
        // Activate header avatar during typing
        const headerAvatar = document.querySelector('.luna-chat-title-avatar');
        if (headerAvatar) headerAvatar.classList.add('active');
        
        const typingEl = document.createElement('div');
        typingEl.className = 'luna-message assistant';
        typingEl.id = 'luna-typing-indicator';
        typingEl.innerHTML = `
            <div class="luna-message-label"><span class="luna-message-avatar-mini"><span class="moon-shape"></span></span>Luna</div>
            <div class="luna-message-content">
                <div class="luna-typing">
                    <div class="luna-typing-dot"></div>
                    <div class="luna-typing-dot"></div>
                    <div class="luna-typing-dot"></div>
                </div>
            </div>
        `;
        
        messages.appendChild(typingEl);
        messages.scrollTop = messages.scrollHeight;
    },

    /**
     * Hide typing indicator
     */
    hideTyping: function() {
        const typing = document.getElementById('luna-typing-indicator');
        if (typing) typing.remove();
        
        // Deactivate header avatar
        const headerAvatar = document.querySelector('.luna-chat-title-avatar');
        if (headerAvatar) headerAvatar.classList.remove('active');
    },

    /**
     * Generate AI response (simulated)
     */
    generateResponse: function(userMessage) {
        // Simple keyword-based responses for demo
        const lower = userMessage.toLowerCase();
        let response = '';

        if (this.mode === 'summarize') {
            response = "Summary: Results were mixed. Your best trades followed the primary setup, while losses came from late entries. Want a breakdown by day or by setup?";
        } else if (this.mode === 'analyze') {
            response = "Analysis: Edge is strongest when you follow the opening-range rules. Variance spikes after 11:00 AM. Consider a hard stop for overtrading and a tighter entry filter.";
        } else if (this.mode === 'draft') {
            response = "Draft: Today I stayed disciplined on A-setups, avoided revenge trades, and sized correctly. One mistake: chased a late breakout. Improvement: wait for confirmation and keep stops consistent.";
        } else if (lower.includes('performance') || lower.includes('how am i doing')) {
            response = "Based on your recent data, you're showing a 65% win rate with +$1,234 net P&L today. Your best performance window seems to be 9:30-11:00 AM. Would you like me to break this down further?";
        } else if (lower.includes('risk') || lower.includes('limit')) {
            response = "Your current risk status is healthy. You've used 40% of your daily loss limit ($200 / $500). All position sizing is within parameters. Keep up the disciplined approach!";
        } else if (lower.includes('pattern') || lower.includes('analyze')) {
            response = "I notice a pattern in your recent trades: you tend to perform better with momentum setups vs. reversal plays. Your average winner on momentum trades is 2.3R compared to 1.1R on reversals. Consider focusing on what works!";
        } else if (lower.includes('help') || lower.includes('what can you do')) {
            response = "I can help you with:\n• Analyzing your trading performance\n• Checking risk and position sizing\n• Reviewing journal entries\n• Finding patterns in your data\n• Answering questions about your strategies\n\nJust ask or use the + button to attach relevant context!";
        } else {
            response = "That's a great question. Let me think about that... For more specific insights, try attaching context using the + button - you can include your blueprint, recent trades, or performance data to help me give better answers.";
        }
        
        this.addMessage('assistant', response);
    },

    /**
     * Handle suggestion chip click
     */
    handleSuggestion: function(action) {
        const actionModes = {
            'performance-review': 'analyze',
            'risk-check': 'analyze',
            'analyze-blueprint': 'analyze',
            'suggest-improvements': 'analyze',
            'explain-patterns': 'analyze',
            'find-opportunities': 'analyze',
            'journal-reflect': 'summarize',
            'journal-summary': 'summarize',
            'analyze-trades': 'analyze',
            'add-notes': 'draft',
            'search-playbook': 'ask',
            'help-config': 'ask',
            'general-ask': 'ask'
        };

        if (actionModes[action]) {
            this.setMode(actionModes[action]);
        }

        const actionMessages = {
            'performance-review': "How's my performance looking today?",
            'risk-check': "What's my current risk status?",
            'analyze-blueprint': "Can you analyze my current blueprint?",
            'suggest-improvements': "What improvements would you suggest for my strategy?",
            'explain-patterns': "Can you explain the patterns I'm seeing?",
            'find-opportunities': "What opportunities do you see in the data?",
            'journal-reflect': "Help me reflect on today's trading",
            'journal-summary': "Can you summarize my trading this week?",
            'analyze-trades': "Analyze my recent trades",
            'add-notes': "Help me write notes for these trades",
            'search-playbook': "Search my playbook for momentum setups",
            'help-config': "Help me configure my settings",
            'general-ask': "What can you help me with?"
        };
        
        const message = actionMessages[action] || "Tell me more about this.";
        
        const input = document.getElementById('luna-chat-input');
        input.value = message;
        input.dispatchEvent(new Event('input'));
        input.focus();
    },

    // ========================================
    // Toast Notifications
    // ========================================

    showToast: function(type, title, message) {
        const toast = document.getElementById('luna-toast');
        const iconEl = document.getElementById('luna-toast-icon');
        const titleEl = document.getElementById('luna-toast-title');
        const messageEl = document.getElementById('luna-toast-message');

        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: '💡'
        };

        toast.className = `luna-toast ${type}`;
        iconEl.textContent = icons[type] || icons.info;
        titleEl.textContent = title;
        messageEl.textContent = message;

        toast.classList.add('visible');

        setTimeout(() => {
            toast.classList.remove('visible');
        }, 4000);
    },

    // ========================================
    // Risk Guard
    // ========================================

    showGuard: function(message) {
        const overlay = document.getElementById('luna-guard-overlay');
        const messageEl = document.getElementById('luna-guard-message');
        
        messageEl.textContent = message || 'Daily loss limit reached. Trading paused to protect your capital.';
        overlay.classList.add('visible');
    },

    closeGuard: function() {
        const overlay = document.getElementById('luna-guard-overlay');
        overlay.classList.remove('visible');
    },

    acknowledgeGuard: function() {
        this.showToast('info', 'Acknowledged', 'Take a 15-minute break to reset.');
        this.closeGuard();
    },

    // ========================================
    // Legacy compatibility
    // ========================================

    triggerAiScenario: function(type) {
        switch (type) {
            case 'guard':
                this.showGuard();
                break;
            case 'coach':
                this.showToast('info', 'Coach Insight', 'Volatility increasing. Consider widening stops by 2 ticks.');
                break;
            default:
                this.open();
        }
    },

    resetAiSim: function() {
        this.close();
        this.closeGuard();
    }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Luna.init());
} else {
    Luna.init();
}

// Expose to global scope
window.Luna = Luna;
