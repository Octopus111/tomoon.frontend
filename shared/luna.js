/**
 * ToMoon Luna AI Module
 * 全局 AI 助手模块 - 包含视觉形象、交互组件及演示逻辑
 * 
 * 使用方法：
 * 1. 在其他JS模块(sidebar/topbar)同级引用 <script src="../shared/luna.js"></script> (或相应路径)
 * 2. 在页面加载完成后调用 initLuna()
 */

const LUNA_CSS = `
    /* --- Luna AI Identity Styles --- */
    :root {
        /* Luna Identity Colors */
        --luna-base: #2D2F3F; 
        --luna-glow-calm: 139, 92, 246; 
        --luna-glow-active: 56, 189, 248;
        --luna-glow-alert: 239, 68, 68;
        --luna-text: #F8FAFC;
    }

    /* Luna Avatar Core */
    .luna-avatar {
        width: 40px;
        height: 40px;
        min-width: 40px;
        min-height: 40px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.5s ease;
        flex-shrink: 0;
    }

    .moon-shape {
        width: 20px;
        height: 20px;
        min-width: 20px;
        min-height: 20px;
        border-radius: 50%;
        box-shadow: inset -3px -1px 0 0 white;
        transform: rotate(-45deg);
        transition: all 0.5s ease;
    }

    /* States */
    .luna-state-calm .moon-shape {
        box-shadow: inset -4px -1px 0 0 rgba(255, 255, 255, 0.9);
    }
    .luna-state-calm {
        box-shadow: 0 0 15px rgba(var(--luna-glow-calm), 0.3);
        border: 1px solid rgba(var(--luna-glow-calm), 0.2);
        animation: breathe-calm 4s infinite ease-in-out;
    }

    .luna-state-active .moon-shape {
        background-color: rgba(255,255,255,0.95);
        box-shadow: none;
    }
    .luna-state-active {
        box-shadow: 0 0 25px rgba(var(--luna-glow-active), 0.5);
        border: 1px solid rgba(var(--luna-glow-active), 0.5);
        animation: pulse-active 2s infinite;
    }

    .luna-state-alert .moon-shape {
        box-shadow: inset -6px 0 0 0 #FCA5A5;
        transform: rotate(0deg);
    }
    .luna-state-alert {
        box-shadow: 0 0 0 2px rgba(var(--luna-glow-alert), 0.5), 0 0 30px rgba(var(--luna-glow-alert), 0.4);
        animation: flash-alert 1s infinite alternate;
    }

    /* Corner Widget */
    .luna-widget {
        position: fixed;
        bottom: 30px;
        right: 30px;
        display: flex;
        align-items: center;
        gap: 0;
        background: transparent; 
        padding: 0;
        border-radius: 50%;
        border: none;
        backdrop-filter: blur(10px);
        cursor: pointer;
        transition: 0.3s;
        z-index: 9999;
        box-shadow: none;
        max-width: 350px;
    }
    /* Hover Effect: Option A (Energy Surge - No Outer Shell) */
    .luna-widget:hover {
        background: transparent;
        border-color: transparent;
        transform: scale(1.1);
        box-shadow: none;
    }
    .luna-widget:hover .luna-avatar {
        box-shadow: 0 0 25px rgba(56, 189, 248, 0.6);
        border-color: rgba(56, 189, 248, 0.8);
    }
    .luna-widget:hover .moon-shape {
        transform: rotate(0deg) scale(1.1);
        background-color: rgba(255,255,255,0.95);
        box-shadow: none;
    }

    /* Demo Active State (Text Expansion re-enables shell) */
    .luna-widget.demo-active {
        padding: 10px 15px;
        padding-right: 25px;
        background: rgba(45, 47, 63, 0.95);
        border: 1px solid rgba(139, 92, 246, 0.6);
        border-radius: 50px;
        gap: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .luna-widget-text {
        font-size: 13px;
        color: #94a3b8; /* text-muted */
        white-space: nowrap;
        max-width: 0;
        overflow: hidden;
        opacity: 0;
        transition: 0.4s ease;
    }
    /* Only expand text when demo is active, NOT on simple hover */
    .luna-widget.demo-active .luna-widget-text {
        max-width: 250px;
        opacity: 1;
        margin-right: 5px;
    }
    
    /* Floating Mode (Detached from corner) */
    .luna-widget.floating {
        position: fixed; /* Keep fixed to overlay modals */
        bottom: auto;
        right: auto;
        transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); /* Eloquent glide */
        z-index: 10001; /* Above modals */
        box-shadow: 0 15px 40px rgba(0,0,0,0.6);
        pointer-events: auto; /* Enable interaction in drag mode */
    }
    
    /* Drag Mode Styles */
    .luna-widget.drag-mode {
        cursor: grab;
    }
    .luna-widget.drag-mode .luna-avatar {
        box-shadow: 0 0 25px rgba(56, 189, 248, 0.6);
        border-color: rgba(56, 189, 248, 0.8);
        animation: pulse-drag 1.5s infinite;
    }
    @keyframes pulse-drag {
        0%, 100% { box-shadow: 0 0 20px rgba(56, 189, 248, 0.4); }
        50% { box-shadow: 0 0 35px rgba(56, 189, 248, 0.7); }
    }
    
    .luna-widget.floating.shake {
        animation: shake-alert 0.4s ease-in-out;
    }
    @keyframes shake-alert {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    /* Animations */
    @keyframes breathe-calm {
        0%, 100% { box-shadow: 0 0 10px rgba(var(--luna-glow-calm), 0.2); transform: scale(1); }
        50% { box-shadow: 0 0 18px rgba(var(--luna-glow-calm), 0.4); transform: scale(1.02); }
    }
    @keyframes pulse-active {
        0% { box-shadow: 0 0 15px rgba(var(--luna-glow-active), 0.4); }
        50% { box-shadow: 0 0 30px rgba(var(--luna-glow-active), 0.7); }
        100% { box-shadow: 0 0 15px rgba(var(--luna-glow-active), 0.4); }
    }
    @keyframes flash-alert {
        0% { border-color: rgba(var(--luna-glow-alert), 0.3); }
        100% { border-color: rgba(var(--luna-glow-alert), 0.8); }
    }

    /* --- New Luna Components (Coach/Guard/Context) --- */
    
    /* 1. Top Coach Message (Toast) */
    .luna-top-message {
        position: fixed;
        top: -100px; /* Hidden initially */
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px 24px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-top: 2px solid rgb(139, 92, 246);
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        backdrop-filter: blur(10px);
        z-index: 10000;
        transition: top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        min-width: 400px;
    }
    .luna-top-message.visible {
        top: 30px;
    }
    
    /* 2. Global Guard Overlay (Blocker) */
    .luna-guard-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 17, 21, 0.8); 
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 20000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }
    .luna-guard-overlay.visible {
        opacity: 1;
        pointer-events: all;
    }
    .luna-guard-card {
        background: #111;
        border: 1px solid #ef4444;
        box-shadow: 0 0 50px rgba(239, 68, 68, 0.3);
        width: 450px;
        padding: 40px;
        border-radius: 16px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .luna-guard-overlay.visible .luna-guard-card {
        transform: scale(1);
    }

    /* 3. Contextual Bubble (In-Function) */
    .luna-bubble {
        position: absolute;
        background: linear-gradient(135deg, rgba(30, 27, 75, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
        border: 1px solid rgba(139, 92, 246, 0.4);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 15px;
        color: var(--luna-text);
        box-shadow: 0 10px 30px -5px rgba(0,0,0,0.6);
        z-index: 100;
        max-width: 280px;
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
        transition: all 0.3s ease;
    }
    .luna-bubble.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
    }
    /* Arrow for bubble */
    .luna-bubble::before {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        background: inherit;
        border-left: 1px solid rgba(139, 92, 246, 0.4);
        border-bottom: 1px solid rgba(139, 92, 246, 0.4);
        transform: rotate(-45deg); /* Default bottom arrow */
        z-index: -1;
    }
    
    .luna-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.1);
        color: white;
        font-size: 12px;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: 0.2s;
        margin-top: 10px;
    }
    .luna-btn:hover { background: rgba(255,255,255,0.2); }
    .luna-btn.primary { background: rgba(139, 92, 246, 0.3); border-color: rgba(139, 92, 246, 0.5); }
    .luna-btn.alert { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); color: #fecaca; }

    /* Animation Keyframes for Typing Effect */
    @keyframes typing-cursor {
        from, to { border-color: transparent }
        50% { border-color: rgba(139, 92, 246, 0.8); }
    }
    .ai-typing {
        border-right: 2px solid rgba(139, 92, 246, 0.8);
        animation: typing-cursor 0.75s step-end infinite;
        white-space: pre-wrap;
        display: inline;
    }

    /* Widget Focus Highlight */
    .ai-scanning {
        position: relative;
    }
    .ai-scanning::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 14px;
        border: 2px solid rgba(139, 92, 246, 0.6);
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
        z-index: 50;
        pointer-events: none;
        animation: scan-pulse 2s infinite;
    }
    @keyframes scan-pulse {
        0% { opacity: 0.5; box-shadow: 0 0 10px rgba(139, 92, 246, 0.1); }
        50% { opacity: 1; box-shadow: 0 0 25px rgba(139, 92, 246, 0.4); }
        100% { opacity: 0.5; box-shadow: 0 0 10px rgba(139, 92, 246, 0.1); }
    }

    /* Drop Analysis Pulse */
    @keyframes analyze-flash {
        0% { box-shadow: 0 0 0 rgba(56, 189, 248, 0); border-color: rgba(56, 189, 248, 0); }
        30% { box-shadow: 0 0 30px rgba(56, 189, 248, 0.5); border-color: rgba(56, 189, 248, 0.8); background: rgba(56, 189, 248, 0.05); }
        100% { box-shadow: 0 0 0 rgba(56, 189, 248, 0); border-color: transparent; }
    }
    .ai-analyzing-pulse {
        animation: analyze-flash 1s ease-out;
        position: relative;
        z-index: 55;
    }

    /* Simulation Controls */
    .ai-sim-controls {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(10px);
        padding: 15px;
        border-radius: 16px;
        border: 1px solid #334155;
        display: flex;
        flex-direction: column; 
        align-items: stretch;
        min-width: 260px;
        z-index: 9000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .ai-sim-btn {
        background: transparent;
        border: 1px solid transparent;
        color: #94a3b8;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 13px;
        transition: 0.2s;
    }
    .ai-sim-btn:hover { color: white; background: rgba(255,255,255,0.05); }
    .ai-sim-btn.active { background: #3b82f6; color: white; }

    /* 6. Context Analysis Options Menu */
    .luna-analysis-menu {
        position: fixed;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 12px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        z-index: 10001;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        min-width: 180px;
        transform: scale(0.9);
        opacity: 0;
        pointer-events: none;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .luna-analysis-menu.visible {
        transform: scale(1);
        opacity: 1;
        pointer-events: all;
    }
    .luna-analysis-header {
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        padding: 4px 8px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .luna-menu-btn {
        text-align: left;
        background: transparent;
        border: none;
        color: #e2e8f0;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }
    .luna-menu-btn:hover {
        background: rgba(139, 92, 246, 0.2);
        color: #fff;
    }
    .luna-menu-btn span { font-size: 16px; }

    /* --- Luna Chat Interface --- */
    .luna-chat-window {
        position: fixed;
        bottom: 80px; 
        right: 30px;
        width: 350px;
        height: 500px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        z-index: 9990;
        box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        transform: translateY(20px);
        opacity: 0;
        pointer-events: none;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .luna-chat-window.visible {
        transform: translateY(0);
        opacity: 1;
        pointer-events: all;
    }
    
    .luna-chat-header {
        padding: 15px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255,255,255,0.02);
        border-radius: 16px 16px 0 0;
    }
    .luna-chat-title {
        font-size: 14px;
        font-weight: 600;
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    /* Chat Header Identity */
    .luna-chat-avatar-container {
        position: relative;
    }
    .luna-chat-avatar-container::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 8px;
        height: 8px;
        background: #22c55e; /* Online green */
        border: 2px solid #1e293b;
        border-radius: 50%;
        transition: background 0.3s;
    }
    .luna-chat-avatar-container.thinking::after {
        background: #38bdf8; /* Blue thinking */
        box-shadow: 0 0 5px #38bdf8;
    }
    
    .luna-chat-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .chat-msg {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.5;
        position: relative;
        animation: msg-slide-up 0.3s ease;
    }
    @keyframes msg-slide-up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    
    .chat-msg.user {
        align-self: flex-end;
        background: rgba(59, 130, 246, 0.2);
        color: white;
        border-bottom-right-radius: 2px;
        border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .chat-msg.ai {
        align-self: flex-start;
        background: rgba(139, 92, 246, 0.1);
        color: #e2e8f0;
        border-bottom-left-radius: 2px;
        border: 1px solid rgba(139, 92, 246, 0.2);
    }
    
    .luna-chat-input-area {
        padding: 15px;
        border-top: 1px solid rgba(255,255,255,0.05);
        display: flex;
        gap: 10px;
    }
    .luna-chat-input {
        flex: 1;
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 8px 15px;
        color: white;
        font-size: 12px;
    }
    
    /* Docking State for Widget */
    .luna-widget.docked {
        bottom: 535px; /* Position above chat */
        right: 30px;
        padding: 8px;
        width: 40px; /* Collapse to icon only */
        border-radius: 50%;
        background: transparent;
        border: none;
        box-shadow: none;
        justify-content: center;
        pointer-events: none;
    }
    .luna-widget.docked .luna-widget-text {
        display: none;
    }

    /* Coach Shortcuts Menu */
    .luna-shortcuts-menu {
        position: fixed;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 12px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        z-index: 10001;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        min-width: 200px;
        transform: scale(0.9) translateY(10px);
        opacity: 0;
        pointer-events: none;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .luna-shortcuts-menu.visible {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: all;
    }
    .luna-shortcuts-header {
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        padding: 4px 8px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .luna-shortcuts-edit-btn {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        transition: 0.2s;
    }
    .luna-shortcuts-edit-btn:hover {
        color: #a78bfa;
        background: rgba(139, 92, 246, 0.1);
    }
    .luna-shortcut-btn {
        text-align: left;
        background: transparent;
        border: none;
        color: #e2e8f0;
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.2s;
    }
    .luna-shortcut-btn:hover {
        background: rgba(139, 92, 246, 0.2);
        color: #fff;
    }
    .luna-shortcut-btn span {
        font-size: 16px;
    }
    .luna-shortcuts-divider {
        height: 1px;
        background: rgba(255,255,255,0.1);
        margin: 5px 0;
    }

    /* Shortcuts Editor Modal */
    .luna-shortcuts-editor {
        position: fixed;
        inset: 0;
        background: rgba(15, 17, 21, 0.9);
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 20001;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }
    .luna-shortcuts-editor.visible {
        opacity: 1;
        pointer-events: all;
    }
    .luna-shortcuts-editor-card {
        background: #1a1d24;
        border: 1px solid #334155;
        border-radius: 16px;
        width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        /* Hide scrollbar */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
    }
    .luna-shortcuts-editor-card::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }
    .luna-shortcuts-editor-header {
        padding: 20px;
        border-bottom: 1px solid #334155;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .luna-shortcuts-editor-header h3 {
        margin: 0;
        font-size: 16px;
        color: #fff;
    }
    .luna-shortcuts-editor-body {
        padding: 20px;
    }
    .luna-shortcut-edit-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: rgba(255,255,255,0.02);
        border-radius: 8px;
        margin-bottom: 10px;
    }
    .luna-shortcut-edit-row input {
        flex: 1;
        background: rgba(0,0,0,0.3);
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 8px 12px;
        color: #fff;
        font-size: 13px;
    }
    .luna-shortcut-edit-row input:focus {
        outline: none;
        border-color: rgba(139, 92, 246, 0.5);
    }
    .luna-shortcut-edit-row select {
        background: rgba(0,0,0,0.3);
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 8px 12px;
        color: #fff;
        font-size: 13px;
    }
    .luna-shortcut-remove-btn {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        cursor: pointer;
        font-size: 14px;
        padding: 6px 10px;
        border-radius: 6px;
        transition: 0.2s;
        font-weight: 600;
        min-width: 32px;
    }
    .luna-shortcut-remove-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.5);
    }
`;

const LUNA_HTML = `
<!-- Chat Interface -->
<div id="luna-chat-window" class="luna-chat-window">
    <div class="luna-chat-header">
        <div class="luna-chat-title">
            <div id="luna-chat-avatar-wrapper" class="luna-chat-avatar-container">
                <div class="luna-avatar luna-state-calm" id="luna-chat-avatar" style="width: 32px; height: 32px; min-width: 32px; min-height: 32px;">
                    <div class="moon-shape" style="width: 16px; height: 16px; min-width: 16px; min-height: 16px;"></div>
                </div>
            </div>
            <div>
                <div style="line-height:1.1;">Luna AI</div>
                <div id="luna-chat-status" style="font-size: 10px; color: #94a3b8; font-weight: 400; transition: color 0.3s;"></div>
            </div>
        </div>
        <button onclick="Luna.closeChat()" style="background:none; border:none; color:#64748b; cursor:pointer;">&times;</button>
    </div>
    <div class="luna-chat-body" id="luna-chat-body">
        <!-- Messages go here -->
    </div>
    <div class="luna-chat-input-area">
        <input type="text" class="luna-chat-input" placeholder="Ask Luna..." disabled>
        <button style="background:rgba(139, 92, 246, 0.2); border:1px solid rgba(139, 92, 246, 0.4); color:#a78bfa; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">↑</button>
    </div>
</div>

<!-- 1. Top Coach Message (Toast) -->
<div id="luna-top-toast" class="luna-top-message">
    <div class="luna-avatar luna-state-active" style="width: 24px; height: 24px; min-width: 24px; min-height: 24px;">
        <div class="moon-shape" style="width: 12px; height: 12px; min-width: 12px; min-height: 12px;"></div>
    </div>
    <div style="font-size: 14px; color: #e2e8f0; margin-left:12px;">
        <strong>Coach Insight:</strong> <span id="luna-toast-text">Volatility increasing. Suggest widening stops by 2 ticks.</span>
    </div>
    <button onclick="Luna.hideAiElement('luna-top-toast')" style="margin-left:auto; background:none; border:none; color:#64748b; cursor:pointer; font-size: 16px;">&times;</button>
</div>

<!-- 2. Global Guard Overlay -->
<div id="luna-guard-modal" class="luna-guard-overlay">
    <div class="luna-guard-card">
        <div class="luna-avatar luna-state-alert" style="width: 60px; height: 60px; min-width: 60px; min-height: 60px; margin-bottom: 20px;">
            <div class="moon-shape" style="width: 30px; height: 30px; min-width: 30px; min-height: 30px;"></div>
        </div>
        <h3 style="color: #ef4444; font-size: 24px; margin: 0 0 10px 0;">Risk Guard Triggered</h3>
        <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 25px 0; line-height: 1.6;">
            <strong>Daily Loss Limit Reached (-$500).</strong><br>
            To protect your capital, the platform has been locked for 15 minutes. Take a walk.
        </p>
        <div style="display:flex; gap:15px;">
            <button class="luna-btn alert" style="padding: 10px 30px;" onclick="Luna.hideAiElement('luna-guard-modal')">Acknowledge</button>
            <button class="luna-btn" style="padding: 10px 20px; color: #64748b;" onclick="Luna.hideAiElement('luna-guard-modal')">Override</button>
        </div>
    </div>
</div>

<!-- 3. Context Bubble (Template) -->
<div id="luna-context-bubble" class="luna-bubble">
    <div class="luna-header" style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
        <div class="luna-avatar luna-state-calm" style="width: 20px; height: 20px; min-width: 20px; min-height: 20px;">
            <div class="moon-shape" style="width: 10px; height: 10px; min-width: 10px; min-height: 10px;"></div>
        </div>
        <span class="luna-name" style="color: #c4b5fd; font-size:13px; font-weight:700; text-transform:uppercase;">Performance Note</span>
    </div>
    <div class="luna-content" id="luna-bubble-text" style="font-size:13px; margin-bottom:10px; color: #F8FAFC;">
        Win rate dropped below 40% in the last hour. You might be forcing trades in chop.
    </div>
    <button class="luna-btn primary" onclick="Luna.hideAiElement('luna-context-bubble')">Check Stats</button>
</div>

<!-- 4. Corner Widget (Passive) -->
<div class="luna-widget" id="luna-widget" onclick="Luna.toggleSimMenu()">
    <div class="luna-avatar luna-state-calm" id="luna-avatar">
        <div class="moon-shape"></div>
    </div>
    <div class="luna-widget-text" id="luna-text">
        Luna is online. Click for demos...
    </div>
</div>

<!-- 5. Simulation Controls (Floating Menu) -->
<div class="ai-sim-controls" id="ai-sim-menu" style="display:none;">
    <div style="color: #64748b; font-size: 11px; margin-bottom: 12px; font-weight: 700; text-transform: uppercase; letter-spacing:1px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">AI Live Scenario Demos</div>
    
    <button class="ai-sim-btn" onclick="Luna.startFullScenario()" style="text-align: left; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); color: #fff;">
            <span style="font-size: 14px;">▶️</span> <strong>Start Full Session Demo</strong>
    </button>

    <div style="font-size: 10px; color: #64748b; margin-bottom: 5px;">Individual Triggers:</div>

    <button class="ai-sim-btn" onclick="Luna.triggerAiScenario('coach')" style="text-align: left; display: flex; align-items: center; gap: 8px;">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:rgb(56, 189, 248);"></span> Top Coach Nudge (Vol)
    </button>
    
    <button class="ai-sim-btn" onclick="Luna.triggerAiScenario('context')" style="text-align: left; display: flex; align-items: center; gap: 8px;">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:rgb(139, 92, 246);"></span> Context Bubble (Perf)
    </button>
    
    <button class="ai-sim-btn" onclick="Luna.triggerAiScenario('guard')" style="text-align: left; display: flex; align-items: center; gap: 8px;">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:rgb(239, 68, 68);"></span> Global Risk Guard
    </button>
    
    <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 10px 0;"></div>
    
    <button class="ai-sim-btn" id="btn-strategy-demo" onclick="Luna.startStrategyDemo()" style="display:none; text-align: left; align-items: center; gap: 8px; margin-bottom: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #fff;">
        <span style="font-size: 14px;">🛠️</span> <strong>Blueprint Creation Demo</strong>
    </button>
    
    <button class="ai-sim-btn" id="btn-execute-demo" onclick="Luna.startExecuteDemo()" style="display:none; text-align: left; align-items: center; gap: 8px; margin-bottom: 10px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); color: #fff;">
        <span style="font-size: 14px;">⚡</span> <strong>Execute Session Demo</strong>
    </button>
    
    <button class="ai-sim-btn" id="btn-why-bp-demo" onclick="Luna.startWhyBlueprintDemo()" style="display:none; text-align: left; align-items: center; gap: 8px; margin-bottom: 10px; background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4); color: #fff;">
        <span style="font-size: 14px;">❓</span> <strong>Ask: Why Blueprint?</strong>
    </button>

    <button class="ai-sim-btn" onclick="Luna.resetAiSim()" style="text-align: center; font-size: 11px; opacity: 0.7;">Stop / Reset State</button>
</div>

<!-- 6. Analysis Options Menu (Dynamic) -->
<div id="luna-analysis-menu" class="luna-analysis-menu">
    <div class="luna-analysis-header" id="luna-analysis-title">Analysis Options</div>
    <div id="luna-analysis-options">
        <!-- Buttons injected by JS -->
    </div>
</div>

<!-- 7. Coach Shortcuts Menu (Click to Open) -->
<div id="luna-shortcuts-menu" class="luna-shortcuts-menu">
    <div class="luna-shortcuts-header">
        <span>Coach Shortcuts</span>
        <button class="luna-shortcuts-edit-btn" onclick="Luna.openShortcutsEditor()" title="Customize shortcuts">⚙️</button>
    </div>
    <div id="luna-shortcuts-list">
        <!-- Shortcuts injected by JS -->
    </div>
</div>

<!-- 8. Shortcuts Editor Modal -->
<div id="luna-shortcuts-editor" class="luna-shortcuts-editor">
    <div class="luna-shortcuts-editor-card">
        <div class="luna-shortcuts-editor-header">
            <h3>⚙️ Customize Coach Shortcuts</h3>
            <button onclick="Luna.closeShortcutsEditor()" style="background:none; border:none; color:#64748b; cursor:pointer; font-size:20px;">&times;</button>
        </div>
        <div class="luna-shortcuts-editor-body">
            <p style="font-size: 12px; color: #94a3b8; margin-top: 0;">Customize your quick actions when clicking Luna. Changes are saved automatically.</p>
            <div id="luna-shortcuts-editor-list">
                <!-- Editable rows injected by JS -->
            </div>
            <button onclick="Luna.addNewShortcut()" style="width: 100%; margin-top: 15px; padding: 10px; background: rgba(139, 92, 246, 0.1); border: 1px dashed rgba(139, 92, 246, 0.4); border-radius: 8px; color: #a78bfa; cursor: pointer; font-size: 13px;">+ Add Shortcut</button>
        </div>
    </div>
</div>
`;

// --- Luna Logic Controller ---
const Luna = {
    scenarioTimer: null,
    isDragMode: false,
    
    // Default shortcuts configuration
    defaultShortcuts: [
        { id: 'chat', icon: '💬', label: 'Open Chat', action: 'openChat' },
        { id: 'dragAnalyze', icon: '🎯', label: 'Drag to Analyze', action: 'startDragMode' },
        { id: 'blueprint', icon: '🛠️', label: 'Create Blueprint', action: 'createBlueprint' },
        { id: 'journal', icon: '📝', label: 'New Journal Entry', action: 'newJournal' },
        { id: 'demos', icon: '🧪', label: 'Demo Scenarios', action: 'showDemos' },
        { id: 'insight', icon: '📊', label: 'View Insight', action: 'viewInsight' }
    ],
    
    // User shortcuts (loaded from localStorage)
    userShortcuts: [],
    
    /**
     * Init Luna styles and components
     */
    init: function() {
        console.log("Luna: Initializing AI Layer...");
        this.injectStyles();
        this.injectHTML();
        
        // Load user shortcuts from localStorage
        this.loadShortcuts();
        
        // Detect Context - Enable specific demos based on page content
        const strategyBtn = document.getElementById('btn-strategy-demo');
        const executeBtn = document.getElementById('btn-execute-demo');
        const whyBpBtn = document.getElementById('btn-why-bp-demo');
        
        if (window.location.href.includes('Strategy') || document.querySelector('#blueprint-grid')) {
             if(strategyBtn) strategyBtn.style.display = 'flex';
             if(whyBpBtn) whyBpBtn.style.display = 'flex';
        }
        
        if (window.location.href.includes('Strategy') || document.querySelector('#quick-content')) {
             if(executeBtn) executeBtn.style.display = 'flex';
        }

        console.log("Luna: Online.");
        
        // Enable Click for Shortcuts Menu (replacing drag)
        setTimeout(() => this.enableWidgetClick(), 100);
    },

    injectStyles: function() {
        const style = document.createElement('style');
        style.textContent = LUNA_CSS;
        document.head.appendChild(style);
    },

    injectHTML: function() {
        // Create a wrapper for AI elements if needed, or just append to body
        const container = document.createElement('div');
        container.id = 'luna-ai-layer';
        container.innerHTML = LUNA_HTML;
        document.body.appendChild(container);
    },

    // --- Interaction Logic ---

    toggleSimMenu: function() {
        const menu = document.getElementById('ai-sim-menu');
        if (menu.style.display === 'none') {
            menu.style.display = 'flex';
            menu.style.opacity = '0';
            setTimeout(() => menu.style.opacity = '1', 50);
        } else {
            menu.style.display = 'none';
        }
    },

    hideAiElement: function(id) {
        const el = document.getElementById(id);
        if(el) el.classList.remove('visible');
        
        // If hiding guard, reset status
        if(id === 'luna-guard-modal') {
            this.updateAvatarState('calm', 'Monitoring session...');
        }
        
        // Remove highlight if any
        document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
    },

    updateAvatarState: function(state, message, typing = false) {
        const avatar = document.getElementById('luna-avatar');
        const text = document.getElementById('luna-text');
        
        if(!avatar || !text) return;

        // Reset classes
        avatar.className = 'luna-avatar'; // base
        void avatar.offsetWidth; // trigger reflow
        avatar.classList.add(`luna-state-${state}`);
        
        if(typing) {
            this.typeText(text, message);
        } else {
            text.textContent = message;
        }
    },

    typeText: function(element, text, speed = 30) {
        element.innerHTML = '<span class="ai-typing"></span>';
        const cursorSpan = element.querySelector('.ai-typing');
        let i = 0;
        element.dataset.typing = 'true';
        
        const type = () => {
            if (element.dataset.typing !== 'true') return;
            
            if (i < text.length) {
                cursorSpan.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // Remove cursor after delay
                setTimeout(() => {
                    cursorSpan.style.borderRight = 'none';
                    cursorSpan.style.animation = 'none';
                    element.dataset.typing = 'false';
                }, 1000);
            }
        };
        type();
    },

    focusWidget: function(selector) {
        const target = document.querySelector(selector);
        if(target) {
            target.scrollIntoView({behavior: 'smooth', block: 'center'});
            target.classList.add('ai-scanning');
        }
    },

    startFullScenario: function() {
        // Close menu
        document.getElementById('ai-sim-menu').style.display = 'none';
        this.resetAiSim(); // clear previous
        
        const widget = document.getElementById('luna-widget');
        
        // Step 1: Analyze
        widget.classList.add('demo-active'); // Force widget open
        this.updateAvatarState('calm', 'Initializing session analysis...', true);
        
        // Step 2: Focus on Performance (2s)
        this.scenarioTimer = setTimeout(() => {
            this.focusWidget('#card-performance');
            this.updateAvatarState('calm', 'Scanning: Performance metrics...', true);
        }, 2500);

        // Step 3: Show Context Bubble (4.5s)
        this.scenarioTimer = setTimeout(() => {
            this.triggerAiScenario('context', false); // Trigger without reset
            this.updateAvatarState('calm', 'Insight: Win rate divergence found.', true);
        }, 5000);

        // Step 4: Move to Market/DMI (9s)
        this.scenarioTimer = setTimeout(() => {
            this.hideAiElement('luna-context-bubble');
            document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
            
            this.focusWidget('#card-dmi');
            this.updateAvatarState('active', 'Evaluating market volatility structure...', true);
        }, 9000);
        
        // Step 5: Coach Nudge (13s)
        this.scenarioTimer = setTimeout(() => {
            this.triggerAiScenario('coach', false);
            document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
            widget.classList.remove('demo-active'); // Let text hide now that toast is up
        }, 13000);
        
        // Step 6: Risk Escalation (18s)
        this.scenarioTimer = setTimeout(() => {
            this.hideAiElement('luna-top-toast');
            widget.classList.add('demo-active'); // Show widget again
            this.updateAvatarState('alert', 'Warning: Daily limit approaching...', true);
        }, 18000);

            // Step 7: Global Guard (22s)
            this.scenarioTimer = setTimeout(() => {
                this.triggerAiScenario('guard', false);
                widget.classList.remove('demo-active');
            }, 22000);
    },

    triggerAiScenario: function(type, doReset = true) {
        const toast = document.getElementById('luna-top-toast');
        const guard = document.getElementById('luna-guard-modal');
        const bubble = document.getElementById('luna-context-bubble');
        const widget = document.getElementById('luna-widget');
        
        // 1. Reset visual components
        if(doReset) {
            toast.classList.remove('visible');
            guard.classList.remove('visible');
            bubble.classList.remove('visible');
            widget.classList.remove('demo-active'); // Reset hover effect
            document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
        }
        
        if (type === 'coach') {
            // Scenario: Top Nudge
            const msg = "Volatility increasing. Suggest widening stops by 2 ticks.";
            document.getElementById('luna-toast-text').innerHTML = ""; // Clear for typing
            
            toast.classList.add('visible');
            // Use a slight delay for typing in toast to make it feel fresh
            setTimeout(() => this.typeText(document.getElementById('luna-toast-text'), msg, 15), 300);
            
            this.updateAvatarState('active', 'Coach Recommendation Active');
            
            // Auto hide logic handled in full scenario or manually
            if(doReset) {
                setTimeout(() => {
                    toast.classList.remove('visible');
                    if(document.getElementById('luna-avatar').classList.contains('luna-state-active')) {
                        this.updateAvatarState('calm', 'Monitoring session...');
                    }
                }, 6000);
            }
        } 
        else if (type === 'guard') {
            // Scenario: Full Screen Block
            guard.classList.add('visible');
            this.updateAvatarState('alert', 'RISK GUARD ACTIVE');
        }
        else if (type === 'context') {
            // Scenario: Bubble floating near a widget
            const target = document.querySelector('#card-performance');
            if(target) {
                const rect = target.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                
                // Position: Top Right of the card
                bubble.style.top = (rect.top + scrollTop - 15) + 'px';
                bubble.style.left = (rect.right + scrollLeft - 300) + 'px'; 
                
                bubble.classList.add('visible');
                
                // Typing effect in bubble
                const bubbleMsg = "Win rate dropped below 40% in the last hour. You might be forcing trades in chop.";
                document.getElementById('luna-bubble-text').innerHTML = "";
                setTimeout(() => this.typeText(document.getElementById('luna-bubble-text'), bubbleMsg, 15), 100);
                
                if(doReset) {
                        target.scrollIntoView({behavior: 'smooth', block: 'center'});
                        target.classList.add('ai-scanning');
                        this.updateAvatarState('calm', 'Insight: Performance Dip');
                        widget.classList.add('demo-active'); // Show widget text too
                }
            } else {
                console.warn("Luna: #card-performance not found.");
            }
        }
    },

    resetAiSim: function() {
        clearTimeout(this.scenarioTimer);
        this.hideAiElement('luna-top-toast');
        this.hideAiElement('luna-guard-modal');
        this.hideAiElement('luna-context-bubble');
        const widget = document.getElementById('luna-widget');
        if(widget) {
            widget.classList.remove('demo-active', 'floating', 'shake');
            // Reset position styles for return to CSS corner defaults
            widget.style.top = '';
            widget.style.left = '';
            widget.style.bottom = '30px'; 
            widget.style.right = '30px';
        }
        
        this.updateAvatarState('calm', 'Luna is online. Monitoring session...');
        document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
        
        // Hide menu too
        const menu = document.getElementById('ai-sim-menu');
        if(menu) menu.style.display = 'none';
        
        // Remove temp text if any
        const input = document.getElementById('blueprint-name-input');
        if(input && input.value === 'Trend Master Alpha_') input.value = '';
        
        // Clean wizard mess if needed
        const mInput = document.getElementById('market-search');
        if(mInput && mInput.value === 'GC_') mInput.value = '';
    },

    // --- Strategy Specific Scenarios ---
    startStrategyDemo: function() {
        // ... existing startStrategyDemo code ...
        // Close menu
        document.getElementById('ai-sim-menu').style.display = 'none';
        this.resetAiSim();

        // --- PHASE 0: Context Analysis (Dashboard View) ---
        // Switch to Dashboard to check risk
        if(typeof switchView === 'function') switchView('dashboard');
        
        const widget = document.getElementById('luna-widget');
        widget.classList.add('demo-active', 'floating'); 
        
        // Start from corner
        const startRect = widget.getBoundingClientRect();
        widget.style.top = startRect.top + 'px';
        widget.style.left = startRect.left + 'px';

        // 1. Move to Risk Overview (Top Left)
        setTimeout(() => {
            const riskCard = document.querySelector('.risk-overview-card');
            if(riskCard) {
                this.moveWidgetTo(riskCard, { top: 20, left: -50 }); // Float near risk card
                riskCard.classList.add('ai-scanning');
                this.updateAvatarState('active', '🔍 Reviewing trading habits & risk tolerance...', true);
            }
        }, 1000);

        // 2. Gentle Observation (Total 4s)
        this.scenarioTimer = setTimeout(() => {
            // Text length ~50 chars -> ~1.5s typing. Giving 5s reading time.
            this.updateAvatarState('calm', 'ℹ️ Observation: Win-rate on Gold is often lower than your average.', true);
        }, 4000);

        // --- PHASE 1: Transition to Library (Total 9s) ---
        this.scenarioTimer = setTimeout(() => {
            document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
             
            // Switch view
            if(typeof switchView === 'function') switchView('library');
            
            // Re-targeting in new view
            setTimeout(() => {
                const createBtn = document.getElementById('btn-create-bp');
                if(createBtn) {
                    // Fly to the button
                    this.moveWidgetTo(createBtn, { top: -20, left: 50 });
                    createBtn.classList.add('ai-scanning');
                    this.updateAvatarState('calm', '💡 Standardize your approach? Let\'s build a blueprint.', true);
                }
            }, 800);
        }, 9000);

        // --- PHASE 2: Open Wizard & Consultation (Total 14s) ---
        this.scenarioTimer = setTimeout(() => {
            if(typeof openWizard === 'function') openWizard();
            document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
            
            // Wait for modal to render, then fly to Market Input
            setTimeout(() => {
                const input = document.getElementById('market-search');
                if(input) {
                    this.moveWidgetTo(input, { top: -60, left: 200 }); // Float above/right of input
                    
                    // Simulate Typing "GC" (Gold)
                    this.simulateTypingInInput(input, 'GC');
                    
                    // Consult User (Not Force)
                    setTimeout(() => {
                        // Longer text, more time to read
                        this.updateAvatarState('calm', '🤔 Gold (GC) volatility is high today. Would you prefer a stable alternative like NQ?', true);
                        
                        // Simulate User Acceptance Period
                        setTimeout(() => {
                             this.updateAvatarState('active', '👍 Recommendation accepted. Switching to NQ...', true);
                             
                             setTimeout(() => {
                                 // Auto-fill suggestion
                                 this.simulateTypingInInput(input, 'NQ');
                             }, 1500);
                             
                        }, 5500); // 5.5s to read the question
                    }, 1500);
                }
            }, 800);
        }, 14000);

        // --- PHASE 3: Parameter Consultation (Total 25s) ---
        this.scenarioTimer = setTimeout(() => {
             // Simulate jump to Step 3 (Risk)
             if(typeof changeStep === 'function') {
                 // Force UI to step 3 directly for demo speed
                 currentStep = 3; 
                 updateWizardUI(); 
             }
             
             setTimeout(() => {
                 const slGroup = document.querySelector('#step-3 .toggle-group'); // Stop Loss Toggles
                 if(slGroup) {
                     this.moveWidgetTo(slGroup, { top: -10, left: 150 });
                     
                     // Simulate "Wide" selection 
                     const wideOpt = slGroup.children[2]; 
                     if(wideOpt) wideOpt.classList.add('selected');

                     // Informative Warning (Not Blocking)
                     this.updateAvatarState('calm', '📉 Note: "Wide" stops might hit your Daily Limit faster. Suggest "Tight"?', true);
                     
                     // Simulate User Acceptance
                     setTimeout(() => {
                         this.updateAvatarState('active', '✨ Optimizing for consistency. Applying "Tight" stops.', true);
                         
                         setTimeout(() => {
                             if(wideOpt) wideOpt.classList.remove('selected');
                             const tightOpt = slGroup.children[0];
                             if(tightOpt) tightOpt.classList.add('selected');
                         }, 1500);
                     }, 5500); // 5.5s to read
                 }
             }, 800);

        }, 25000);

        // --- PHASE 4: Return Home (Total 36s) ---
        this.scenarioTimer = setTimeout(() => {
             if(typeof closeWizard === 'function') closeWizard(); // Close modal nicely
             
             this.resetAiSim(); // Will strip 'floating' class and return to CSS corner
             
             // Final Summary
             setTimeout(() => {
                 this.updateAvatarState('calm', 'Example complete. Luna acts as an advisor, letting you decide.');
             }, 1000);
             
        }, 36000);
    },

    startExecuteDemo: function() {
        // ... (Execute Demo Logic) ...
        // ... copy paste previous Execute logic here if overwriting entire block, 
        // OR just append new function below 
        // NOTE: Since I cannot see the full file content easily to find the exact insertion point for a new function without context of previous closing brace, 
        // I will target the end of startExecuteDemo key to insert startWhyBlueprintDemo.
        
        // Actually, let's redefine startExecuteDemo to ensure we don't break it, and add startWhyBlueprintDemo after it.
        // Close menu
        document.getElementById('ai-sim-menu').style.display = 'none';
        this.resetAiSim();

        // Ensure we are on Dashboard view
        if(typeof switchView === 'function') switchView('dashboard');
        
        const widget = document.getElementById('luna-widget');
        widget.classList.add('demo-active', 'floating'); 
        
        // Start from corner
        const startRect = widget.getBoundingClientRect();
        widget.style.top = startRect.top + 'px';
        widget.style.left = startRect.left + 'px';

        // --- PHASE 1: Account Health Check (1s) ---
        setTimeout(() => {
            const riskSection = document.querySelector('.risk-overview');
            if(riskSection) {
                this.moveWidgetTo(riskSection, { top: 20, left: -50 });
                riskSection.classList.add('ai-scanning');
                this.updateAvatarState('active', '🔍 Analysing cross-account drawdown status...', true);
            }
        }, 1000);

        // --- PHASE 2: Move to Session Setup (5s) ---
        this.scenarioTimer = setTimeout(() => {
            document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
            
            const sessionPanel = document.querySelector('.session-panel');
            this.moveWidgetTo(sessionPanel, { top: 60, left: 180 }); // Position right of panel
            
            this.updateAvatarState('calm', 'ℹ️ Trading Account A selected. Available Drawdown Room: $800.', true);
            
            // Highlight account select
            const accSelect = document.getElementById('account-select');
            if(accSelect) accSelect.classList.add('ai-scanning');
            
        }, 5000);

        // --- PHASE 3: Input Risk & Detect Issue (10s) ---
        this.scenarioTimer = setTimeout(() => {
             document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
             
             const riskInput = document.getElementById('quick-risk-daily');
             if(riskInput) {
                 this.moveWidgetTo(riskInput, { top: -40, left: 80 }); 
                 riskInput.classList.add('ai-scanning');
                 
                 // Simulate user typing risky value ($1000 > $800 available)
                 this.simulateTypingInInput(riskInput, '1000');
                 
                 // Wait for type to finish then consult
                 setTimeout(() => {
                      this.updateAvatarState('calm', '🤔 Wait. $1000 session limit exceeds your actual drawdown room ($800).', true);
                 }, 1500);
             }
        }, 10000);

        // --- PHASE 4: Consult & Adjust (16s) ---
        this.scenarioTimer = setTimeout(() => {
             // Gentle suggestion
             this.updateAvatarState('calm', '🛡️ SafeBuffer Rule: Shall I align the limit to a safe $700 margin?', true);
             
             // Simulate "Reading & Thinking" time (5s)
             setTimeout(() => {
                 this.updateAvatarState('active', '👍 Agreed. Aligning parameters for safety...', true);
                 
                 const riskInput = document.getElementById('quick-risk-daily');
                 if(riskInput) {
                     setTimeout(() => {
                        this.simulateTypingInInput(riskInput, '700');
                        riskInput.classList.remove('ai-scanning');
                     }, 1500);
                 }
                 
             }, 5500);
             
        }, 16000);

        // --- PHASE 5: Ready to Start (24s) ---
        this.scenarioTimer = setTimeout(() => {
            const startBtn = document.getElementById('btn-start-session');
            if(startBtn) {
                this.moveWidgetTo(startBtn, { top: -20, left: 50 });
                startBtn.classList.add('ai-scanning');
                this.updateAvatarState('calm', '✨ Session configured. Risk parameters synchronized. Ready.', true);
            }
        }, 24000);

        // --- PHASE 6: End (29s) ---
        this.scenarioTimer = setTimeout(() => {
             this.resetAiSim();
             document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
        }, 29000);
    },

    startWhyBlueprintDemo: function() {
        // Close menu
        document.getElementById('ai-sim-menu').style.display = 'none';
        this.resetAiSim();

        // 1. Ensure Library
        if(typeof switchView === 'function') switchView('library');
        
        // 2. Open Chat Mode
        this.openChatMode();
        
        // 3. User asks question (Simulated)
        setTimeout(() => {
             this.addChatMessage('user', "Why exactly do I need a blueprint? Can't I just trade?");
             this.setChatStatus('Analyzing...', true);
        }, 1000);
        
        // 4. Luna Thinks (Typing indicator)
        // Wait...
        
        // 5. Luna Flies to point at the Banner (Context Visual)
        this.scenarioTimer = setTimeout(() => {
             this.setChatStatus('explaining context', false);

             // Undock widget for a moment
             const widget = document.getElementById('luna-widget');
             widget.classList.remove('docked');
             widget.classList.add('floating');
             
             const banner = document.getElementById('strategy-banner');
             if(banner) {
                 this.moveWidgetTo(banner, { top: 20, left: 100 });
                 banner.classList.add('ai-scanning'); // Highlight the context
             }
             
             // Answer part 1 while pointing
             this.addChatMessage('ai', "Without a Blueprint, you are essentially gambling with randomness.");
             
        }, 2500);
        
        // 6. Return and elaborate
        this.scenarioTimer = setTimeout(() => {
             document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
             const widget = document.getElementById('luna-widget');
             
             // Fly back to dock position
             widget.style.top = '';
             widget.style.left = '';
             widget.classList.remove('floating');
             widget.classList.add('docked');
             
             this.setChatStatus('Typing...', true);
             
             setTimeout(() => {
                this.setChatStatus('', false);
                this.addChatMessage('ai', "A Blueprint defines your <b>edge</b>. It turns your intuition into a repeatable system.");
             }, 1500);

             
             setTimeout(() => {
                 this.setChatStatus('Listing benefits...', true);
                 setTimeout(() => {
                     this.setChatStatus('', false);
                     this.addChatMessage('ai', "It answers 3 questions before you click buy:<br>1. When do I enter?<br>2. When do I exit?<br>3. What is my risk?");
                 }, 800);
             }, 4000);
             
        }, 6500);
        
        // 7. Call to Action
        this.scenarioTimer = setTimeout(() => {
             this.addChatMessage('ai', "Shall we create a simple one now to start tracking your data?");
        }, 13000);
    },

    setChatStatus: function(text, isThinking = false) {
        const statusEl = document.getElementById('luna-chat-status');
        const container = document.getElementById('luna-chat-avatar-wrapper');
        
        if(statusEl) statusEl.innerText = text;
        
        if(container) {
            if(isThinking) {
                container.classList.add('thinking');
                if(statusEl) statusEl.style.color = '#38bdf8'; // Blue text
            } else {
                container.classList.remove('thinking');
                if(statusEl) statusEl.style.color = '#94a3b8'; // Slate Text
            }
        }
    },

    openChatMode: function() {
        const widget = document.getElementById('luna-widget');
        const chat = document.getElementById('luna-chat-window');
        const body = document.getElementById('luna-chat-body');
        
        // Clear chat
        body.innerHTML = '';
        this.addChatMessage('ai', "Hello! I'm Luna. How can I assist your trading today?");
        
        // Animate Widget to Dock
        widget.classList.add('docked');
        
        // Show Chat
        chat.classList.add('visible');
    },

    closeChat: function() {
        const widget = document.getElementById('luna-widget');
        const chat = document.getElementById('luna-chat-window');
        
        chat.classList.remove('visible');
        widget.classList.remove('docked');
        
        this.resetAiSim();
    },

    addChatMessage: function(sender, html) {
        const body = document.getElementById('luna-chat-body');
        const div = document.createElement('div');
        div.className = `chat-msg ${sender}`;
        div.innerHTML = html;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    },

    /**
     * Move floating widget to target element with offset
     */
    moveWidgetTo: function(targetElement, offset = { top: 0, left: 0 }) {
        const widget = document.getElementById('luna-widget');
        if(!targetElement || !widget) return;
        
        const rect = targetElement.getBoundingClientRect();
        
        // Calculate position (fixed coordinates)
        let top = rect.top + offset.top;
        let left = rect.left + rect.width + offset.left;
        
        // Bounds checking (keep on screen)
        if(left > window.innerWidth - 320) left = window.innerWidth - 320;
        if(top < 20) top = 20;
        if(top > window.innerHeight - 80) top = window.innerHeight - 80;

        widget.style.top = top + 'px';
        widget.style.left = left + 'px';
        
        // Ensure detached from bottom/right
        widget.style.bottom = 'auto';
        widget.style.right = 'auto';
    },

    simulateTypingInInput: function(input, text) {
        let i = 0;
        input.value = "";
        const type = () => {
            if (i < text.length) {
                input.value += text.charAt(i);
                i++;
                setTimeout(type, 50); // Faster for input
            } else {
                input.value += "_"; // Cursor blink
            }
        };
        type();
    },

    // --- Click to Show Shortcuts Menu ---
    enableWidgetClick: function() {
        const widget = document.getElementById('luna-widget');
        if (!widget) return;

        widget.addEventListener('click', (e) => {
            // Prevent shortcuts menu if in drag mode
            if (this.isDragMode) return;
            
            e.stopPropagation();
            this.toggleShortcutsMenu();
        });
        
        // Remove the default onclick attribute to avoid double firing
        widget.removeAttribute('onclick');
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('luna-shortcuts-menu');
            const widget = document.getElementById('luna-widget');
            if (menu && !menu.contains(e.target) && !widget.contains(e.target)) {
                menu.classList.remove('visible');
            }
        });
    },
    
    // --- Shortcuts Management ---
    loadShortcuts: function() {
        const saved = localStorage.getItem('luna-shortcuts');
        if (saved) {
            try {
                this.userShortcuts = JSON.parse(saved);
            } catch (e) {
                this.userShortcuts = [...this.defaultShortcuts];
            }
        } else {
            this.userShortcuts = [...this.defaultShortcuts];
        }
        this.renderShortcutsMenu();
    },
    
    saveShortcuts: function() {
        localStorage.setItem('luna-shortcuts', JSON.stringify(this.userShortcuts));
        this.renderShortcutsMenu();
    },
    
    renderShortcutsMenu: function() {
        const list = document.getElementById('luna-shortcuts-list');
        if (!list) return;
        
        let html = '';
        this.userShortcuts.forEach((shortcut, index) => {
            html += `<button class="luna-shortcut-btn" onclick="Luna.executeShortcut('${shortcut.action}')">
                <span>${shortcut.icon}</span>
                ${shortcut.label}
            </button>`;
            
            // Add divider after first 2 items
            if (index === 1) {
                html += '<div class="luna-shortcuts-divider"></div>';
            }
        });
        
        list.innerHTML = html;
    },
    
    toggleShortcutsMenu: function() {
        const menu = document.getElementById('luna-shortcuts-menu');
        const widget = document.getElementById('luna-widget');
        
        if (!menu || !widget) return;
        
        if (menu.classList.contains('visible')) {
            menu.classList.remove('visible');
        } else {
            // Position menu above the widget
            const rect = widget.getBoundingClientRect();
            menu.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
            menu.style.right = (window.innerWidth - rect.right) + 'px';
            menu.classList.add('visible');
        }
    },
    
    executeShortcut: function(action) {
        // Close menu first
        const menu = document.getElementById('luna-shortcuts-menu');
        if (menu) menu.classList.remove('visible');
        
        switch(action) {
            case 'openChat':
                this.openChatMode();
                break;
            case 'startDragMode':
                this.startDragMode();
                break;
            case 'createBlueprint':
                if(typeof openWizard === 'function') {
                    openWizard();
                } else {
                    window.location.href = 'Strategy/Strategy_demo_v1.5.html?mode=new';
                }
                break;
            case 'newJournal':
                window.location.href = 'Moonlog/Moonlog.html?view=tradelog&mode=new';
                break;
            case 'showDemos':
                this.toggleSimMenu();
                break;
            case 'viewInsight':
                window.location.href = 'Insight/Insight_demo_v1.4-fix.html';
                break;
            case 'viewMoonlog':
                window.location.href = 'Moonlog/Moonlog.html';
                break;
            case 'viewSettings':
                window.location.href = 'Settings/Settings_demo_v1.2.html';
                break;
            case 'viewStrategy':
                window.location.href = 'Strategy/Strategy_demo_v1.5.html';
                break;
            default:
                console.log('Luna: Unknown action:', action);
        }
    },
    
    // --- Drag Mode for Context Analysis ---
    startDragMode: function() {
        const widget = document.getElementById('luna-widget');
        if (!widget) return;
        
        this.isDragMode = true;
        widget.classList.add('drag-mode');
        widget.style.cursor = 'grab';
        
        // Show hint
        this.updateAvatarState('active', 'Drag me to a module for analysis...');
        
        // Enable drag
        this.enableDragBehavior();
    },
    
    stopDragMode: function() {
        const widget = document.getElementById('luna-widget');
        if (!widget) return;
        
        this.isDragMode = false;
        widget.classList.remove('drag-mode', 'floating');
        widget.style.cursor = 'pointer';
        widget.style.top = '';
        widget.style.left = '';
        widget.style.bottom = '30px';
        widget.style.right = '30px';
        
        document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));
        this.updateAvatarState('calm', 'Luna is online. Monitoring session...');
    },
    
    enableDragBehavior: function() {
        const widget = document.getElementById('luna-widget');
        if (!widget) return;
        
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        
        const onMouseDown = (e) => {
            if (!this.isDragMode) return;
            if (e.target.closest('button')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = widget.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            
            widget.style.transition = 'none';
            widget.style.bottom = 'auto';
            widget.style.right = 'auto';
            widget.style.left = initialLeft + 'px';
            widget.style.top = initialTop + 'px';
            widget.classList.add('floating');
            widget.style.cursor = 'grabbing';
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        };
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            widget.style.left = (initialLeft + dx) + 'px';
            widget.style.top = (initialTop + dy) + 'px';
            
            this.checkDropTarget(e.clientX, e.clientY, true);
        };
        
        const onMouseUp = (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            widget.style.transition = '';
            widget.style.cursor = 'grab';
            
            this.handleDrop(e.clientX, e.clientY);
        };
        
        // Remove old listeners if any
        widget.onmousedown = onMouseDown;
    },
    
    // --- Shortcuts Editor ---
    openShortcutsEditor: function() {
        const editor = document.getElementById('luna-shortcuts-editor');
        const menu = document.getElementById('luna-shortcuts-menu');
        
        if (menu) menu.classList.remove('visible');
        if (editor) {
            this.renderShortcutsEditorList();
            editor.classList.add('visible');
        }
    },
    
    closeShortcutsEditor: function() {
        const editor = document.getElementById('luna-shortcuts-editor');
        if (editor) editor.classList.remove('visible');
        this.saveShortcuts();
    },
    
    renderShortcutsEditorList: function() {
        const list = document.getElementById('luna-shortcuts-editor-list');
        if (!list) return;
        
        const actionOptions = [
            { value: 'openChat', label: 'Open Chat' },
            { value: 'startDragMode', label: 'Drag to Analyze' },
            { value: 'createBlueprint', label: 'Create Blueprint' },
            { value: 'newJournal', label: 'New Journal Entry' },
            { value: 'showDemos', label: 'Demo Scenarios' },
            { value: 'viewInsight', label: 'View Insight' },
            { value: 'viewMoonlog', label: 'View Moonlog' },
            { value: 'viewSettings', label: 'View Settings' },
            { value: 'viewStrategy', label: 'View Strategy' }
        ];
        
        const icons = ['💬', '🎯', '🛠️', '📝', '🧪', '📊', '📅', '⚙️', '📈', '🔍', '💡', '🚀'];
        
        let html = '';
        this.userShortcuts.forEach((shortcut, index) => {
            html += `<div class="luna-shortcut-edit-row">
                <select onchange="Luna.updateShortcutIcon(${index}, this.value)" style="width: 60px;">
                    ${icons.map(icon => `<option value="${icon}" ${shortcut.icon === icon ? 'selected' : ''}>${icon}</option>`).join('')}
                </select>
                <input type="text" value="${shortcut.label}" onchange="Luna.updateShortcutLabel(${index}, this.value)" placeholder="Label">
                <select onchange="Luna.updateShortcutAction(${index}, this.value)">
                    ${actionOptions.map(opt => `<option value="${opt.value}" ${shortcut.action === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                </select>
                <button class="luna-shortcut-remove-btn" onclick="Luna.removeShortcut(${index})" title="Remove">🗑️</button>
            </div>`;
        });
        
        list.innerHTML = html;
    },
    
    updateShortcutIcon: function(index, value) {
        if (this.userShortcuts[index]) {
            this.userShortcuts[index].icon = value;
            this.saveShortcuts();
        }
    },
    
    updateShortcutLabel: function(index, value) {
        if (this.userShortcuts[index]) {
            this.userShortcuts[index].label = value;
            this.saveShortcuts();
        }
    },
    
    updateShortcutAction: function(index, value) {
        if (this.userShortcuts[index]) {
            this.userShortcuts[index].action = value;
            this.saveShortcuts();
        }
    },
    
    removeShortcut: function(index) {
        this.userShortcuts.splice(index, 1);
        this.saveShortcuts();
        this.renderShortcutsEditorList();
    },
    
    addNewShortcut: function() {
        this.userShortcuts.push({
            id: 'custom_' + Date.now(),
            icon: '⭐',
            label: 'New Shortcut',
            action: 'openChat'
        });
        this.saveShortcuts();
        this.renderShortcutsEditorList();
    },
    
    resetShortcutsToDefault: function() {
        this.userShortcuts = [...this.defaultShortcuts];
        this.saveShortcuts();
        this.renderShortcutsEditorList();
    },


    checkDropTarget: function(x, y, preview = false) {
        // Hide previous highlights
        if (preview) {
             document.querySelectorAll('.prospect-scanning').forEach(el => el.classList.remove('prospect-scanning'));
             // We reuse ai-scanning style but maybe use a different class if we want distinct style
             // For now re-use existing logic, or use a new class
             // Let's use 'ai-scanning' but we need to manage it so it doesn't conflict with demos
             document.querySelectorAll('.ai-scanning').forEach(el => {
                 if(!el.dataset.demoActive) el.classList.remove('ai-scanning');
             });
        }

        // Technically we can't see through the widget if it's under the mouse.
        // We can temporarily hide it.
        const widget = document.getElementById('luna-widget');
        const prevDisplay = widget.style.display;
        widget.style.display = 'none';
        
        const elemBelow = document.elementFromPoint(x, y);
        
        widget.style.display = prevDisplay; // Restore
        
        if (!elemBelow) return null;
        
        const card = elemBelow.closest('.card');
        
        if (card && preview) {
            card.classList.add('ai-scanning');
        }
        return card ? card.id : null;
    },

    handleDrop: function(x, y) {
        let targetId = this.checkDropTarget(x, y, false);
        
        // Cleanup highlights
        document.querySelectorAll('.ai-scanning').forEach(el => el.classList.remove('ai-scanning'));

        // If no target, assume General/Background drop (Coach Mode Access)
        if (!targetId) targetId = 'general-background';

        console.log("Luna Dropped on:", targetId);
        
        // --- Trigger Effect Optimization ---
        const target = document.getElementById(targetId);
        if(target) {
            target.classList.add('ai-analyzing-pulse');
            setTimeout(() => target.classList.remove('ai-analyzing-pulse'), 1200);
            // Move Widget to Target
            this.moveWidgetTo(target, { top: -20, left: 10 });
        } else {
             // Move to drop location for general drop
             const widget = document.getElementById('luna-widget');
             widget.style.top = y + 'px';
             widget.style.left = x + 'px';
        }

        // Show Analysis Menu based on Context
        this.showAnalysisMenu(targetId, x, y);
    },

    showAnalysisMenu: function(targetId, x, y) {
        const menu = document.getElementById('luna-analysis-menu');
        const title = document.getElementById('luna-analysis-title');
        const options = document.getElementById('luna-analysis-options');
        
        if(!menu || !options) return;

        // Position Menu
        if (targetId === 'general-background') {
             menu.style.top = y + 'px';
             menu.style.left = (x + 20) + 'px';
        } else {
            const rect = document.getElementById(targetId).getBoundingClientRect();
            menu.style.top = (rect.top + 20) + 'px';
            menu.style.left = (rect.right - 50) + 'px'; 
        }
        
        // Ensure on screen
        if (parseInt(menu.style.left) + 200 > window.innerWidth) {
            menu.style.left = (window.innerWidth - 220) + 'px';
        }
        if (parseInt(menu.style.top) + 200 > window.innerHeight) {
            menu.style.top = (window.innerHeight - 220) + 'px';
        }

        // Generate Options
        let html = '';
        let header = 'Context Actions';
        const tId = targetId;

        switch(targetId) {
            case 'card-performance':
                header = 'Performance Analysis';
                html += `<button class="luna-menu-btn" onclick="Luna.triggerCoachAction('analyze_pnl', '${tId}')"><span>📊</span> P&L Deep Dive</button>`;
                html += `<button class="luna-menu-btn" onclick="Luna.triggerCoachAction('analyze_winrate', '${tId}')"><span>🎯</span> Win Rate Leaks</button>`;
                html += `<button class="luna-menu-btn" onclick="Luna.displayAnalysisResult('${tId}', 'AI Forecast', 'Based on current trends, you are on track to hit your weekly goal by Thursday.')"><span>🔮</span> AI Forecast</button>`;
                break;
            case 'card-dmi':
                header = 'DMI & Market State';
                html += `<button class="luna-menu-btn" onclick="Luna.displayAnalysisResult('${tId}', 'Mental State Check', 'DMI Score is 85. Volatility is optimal. You are in the zone.')"><span>🧠</span> Mental State Check</button>`;
                html += `<button class="luna-menu-btn" onclick="Luna.triggerCoachAction('market_scan', '${tId}')"><span>📡</span> Market Volatility Scan</button>`;
                break;
            case 'card-risk':
                header = 'Risk Guard';
                html += `<button class="luna-menu-btn" onclick="Luna.triggerCoachAction('audit_risk', '${tId}')"><span>🛡️</span> Risk Parameter Audit</button>`;
                html += `<button class="luna-menu-btn" onclick="Luna.triggerAiScenario('guard')"><span>🔒</span> Test Lockout</button>`;
                break;
            case 'card-journal':
                header = 'Trading Journal';
                html += `<button class="luna-menu-btn" onclick="Luna.triggerCoachAction('create_entry')"><span>📝</span> New Entry</button>`;
                html += `<button class="luna-menu-btn" onclick="Luna.triggerCoachAction('review_session')"><span>🧐</span> Session Review</button>`;
                break;
            case 'card-calendar':
                header = 'Calendar & History';
                html += `<button class="luna-menu-btn" onclick="Luna.displayAnalysisResult('${tId}', 'Time Analysis', 'Best trading hours: 09:30 - 11:00 EST. Avoid the lunch hour chop.')"><span>⏳</span> Time Analysis</button>`;
                html += `<button class="luna-menu-btn" onclick="Luna.displayAnalysisResult('${tId}', 'Streak Check', 'You have a 3-day consistency streak! Maintain risk discipline to reach 5 days.')"><span>🔥</span> Streak Check</button>`;
                break;
            default:
                // General / Background Drop
                header = 'Coach Shortcuts';
                html += `<button class="luna-menu-btn" onclick="Luna.openChatMode()"><span>💬</span> Open Chat</button>`;
                html += `<button class="luna-menu-btn" onclick="Luna.triggerCoachAction('create_blueprint')"><span>🛠️</span> Create Blueprint</button>`;
                html += `<button class="luna-menu-btn" onclick="Luna.triggerCoachAction('create_entry')"><span>📝</span> New Journal</button>`;
                html += `<button class="luna-menu-btn" onclick="Luna.toggleSimMenu()"><span>🧪</span> Demos</button>`;
        }

        title.textContent = header;
        options.innerHTML = html;
        menu.classList.add('visible');

        // Auto hide on click outside
        setTimeout(() => {
            const closeMenu = (e) => {
                if(!menu.contains(e.target)) {
                    menu.classList.remove('visible');
                    document.removeEventListener('click', closeMenu);
                    
                    // Exit drag mode and return widget
                    this.stopDragMode();
                }
            };
            document.addEventListener('click', closeMenu);
        }, 100);
    },

    triggerCoachAction: function(action, targetId) {
        // Close menu
        document.getElementById('luna-analysis-menu').classList.remove('visible');
        
        switch(action) {
            case 'create_entry':
                window.location.href = 'Moonlog/Moonlog.html?view=tradelog&mode=new';
                break;
            case 'review_session':
                window.location.href = 'Moonlog/Moonlog.html?view=sessionlog&mode=new';
                break;
            case 'create_blueprint':
                if(typeof openWizard === 'function') {
                    openWizard(); 
                } else {
                     this.displayAnalysisResult('general-background', 'Navigating...', 'Opening Blueprint Wizard...');
                     setTimeout(() => window.location.href = 'Strategy/Strategy_demo_v1.5.html?mode=new', 1000);
                }
                break;
            case 'analyze_pnl':
                this.displayAnalysisResult(targetId, 'P&L Deep Dive', 'Your P&L is driven by 3 large wins. 60% of small trades are break-even. Suggest focusing on letting winners run.');
                break;
            case 'analyze_winrate':
                this.displayAnalysisResult(targetId, 'Win Rate Analysis', 'Win rate dropped below 40% in the last hour. You might be forcing trades in chop.');
                break;
            case 'audit_risk':
                this.triggerAiScenario('coach'); 
                break;
            case 'market_scan':
                this.displayAnalysisResult(targetId, 'Market Scan', 'Volatility is increasing in NQ (25.4). Current range is 2x normal. Widen stops.');
                break;
        }
    },
    
    displayAnalysisResult: function(targetId, title, content) {
        const bubble = document.getElementById('luna-context-bubble');
        const bubbleTitle = bubble.querySelector('.luna-name');
        const bubbleContent = document.getElementById('luna-bubble-text');
        
        // Update Content
        bubbleTitle.textContent = title;
        bubbleContent.innerHTML = ''; 
        // Using typing effect for dynamic feel
        this.typeText(bubbleContent, content, 10);
        
        // Position Bubble
        if(targetId && targetId !== 'general-background') {
            const target = document.getElementById(targetId);
            if(target) {
                const rect = target.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                
                // Position top-right corner of card essentially, similar to context scenario
                bubble.style.top = (rect.top + scrollTop - 20) + 'px';
                // Ensure it doesn't go off screen right
                let leftPos = rect.right + scrollLeft - 50; 
                if (leftPos + 300 > window.innerWidth) leftPos = window.innerWidth - 320;
                
                bubble.style.left = leftPos + 'px';
            }
        } else {
            // Default center or near mouse if possible, but let's stick to center-ish top
             bubble.style.top = '100px';
             bubble.style.left = '50%';
             bubble.style.transform = 'translateX(-50%)';
        }
        
        bubble.classList.add('visible');
        
        // Ensure widget is near if possible to look like expansion
        const widget = document.getElementById('luna-widget');
        if(targetId && targetId !== 'general-background' && widget) {
             widget.classList.add('floating');
             // Move widget slightly to the side of the bubble
             widget.style.top = (parseInt(bubble.style.top) + 10) + 'px';
             widget.style.left = (parseInt(bubble.style.left) - 50) + 'px';
        }

        // Add Click Listener to Restore State (Click anywhere to close)
        setTimeout(() => {
            const restoreHandler = (e) => {
                // If clicking inside the bubble or analysis menu, do NOT close yet
                if (bubble.contains(e.target) || e.target.closest('#luna-analysis-menu')) return;
                
                // Close and Reset
                this.resetAiSim();
                document.removeEventListener('click', restoreHandler);
            };
            document.addEventListener('click', restoreHandler);
        }, 100);
    },
    
    startHighlightGeneration: function(onComplete) {
        // Ensure menu is closed
        const menu = document.getElementById('ai-sim-menu');
        if(menu) menu.style.display = 'none';
        this.resetAiSim();

        // 1. Activate Widget & State
        const widget = document.getElementById('luna-widget');
        if(widget) widget.classList.add('demo-active'); 
        this.updateAvatarState('active', '🧠 Analyzing session data...', true);

        // 2. Create Overlay
        const overlay = document.createElement('div');
        overlay.id = 'luna-processing-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px);
            z-index: 9995; display: flex; flex-direction: column; 
            align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        overlay.innerHTML = `
            <div class="luna-avatar luna-state-active" style="width: 80px; height: 80px; margin-bottom: 30px; box-shadow: 0 0 60px rgba(56, 189, 248, 0.5);">
                <div class="moon-shape" style="width: 40px; height: 40px; background-color: rgba(255,255,255,0.95);"></div>
            </div>
            <div style="font-size: 24px; color: #fff; font-weight: 300; letter-spacing: 2px; margin-bottom: 10px;">GENERATING HIGHLIGHTS</div>
            <div id="luna-proc-step" style="font-size: 14px; color: #94a3b8; font-family: 'Courier New', monospace; opacity: 0.8;">Initializing pattern recognition...</div>
            
            <div style="width: 200px; height: 2px; background: rgba(255,255,255,0.1); margin-top: 30px; border-radius: 2px; overflow: hidden;">
                <div id="luna-proc-bar" style="width: 0%; height: 100%; background: #38bdf8; transition: width 0.3s linear;"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Fade in
        requestAnimationFrame(() => overlay.style.opacity = '1');

        // Sequence
        const updateStep = (text, progress) => {
            const txtEl = document.getElementById('luna-proc-step');
            const barEl = document.getElementById('luna-proc-bar');
            if(txtEl) txtEl.innerText = text;
            if(barEl) barEl.style.width = progress + '%';
        };

        // Timeline
        setTimeout(() => updateStep("Scanning execution deviations...", 25), 1000);
        setTimeout(() => updateStep("Correlating emotional triggers...", 60), 2500);
        setTimeout(() => updateStep("Synthesizing key takeaways...", 85), 4000);
        setTimeout(() => updateStep("Finalizing session report...", 100), 5000);
        
        setTimeout(() => {
            // Fade out
            overlay.style.opacity = '0';
            this.updateAvatarState('calm', 'Session highlights generated.');
            
            setTimeout(() => {
                if(document.body.contains(overlay)) document.body.removeChild(overlay);
                if(widget) widget.classList.remove('demo-active');
                if(onComplete) onComplete();
            }, 500);
        }, 5500);
    },

    openChatWithContext: function(thinkingMsg, finalMsg) {
        this.openChatMode();
        this.setChatStatus(thinkingMsg, true);
        setTimeout(() => {
            this.setChatStatus('', false);
            this.addChatMessage('ai', finalMsg);
        }, 1500);
    }
};

// Auto-expose to global scope for onclick handlers to work
window.Luna = Luna;