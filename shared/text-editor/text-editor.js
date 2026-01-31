/**
 * ToMoon Text Editor Toolbar
 * Notion-style floating text formatting toolbar
 * Version: 2.1.0
 * 
 * Usage:
 * 1. Include text-editor.css and text-editor.js
 * 2. Call TMTextEditor.init({ targets: ['.your-editable-selector'] })
 * 3. The toolbar will appear when text is selected in the target elements
 * 
 * Callbacks:
 * - onHighlight(text, color, source): Called when text is highlighted
 * - onAskLuna(text, action): Called when Ask Luna is clicked
 */

const TMTextEditor = (function() {
    'use strict';

    // Configuration
    let config = {
        targets: [],
        toolbar: null,
        currentRange: null,
        selectedText: '',
        activeDropdown: null,
        linkPopup: null,
        lunaDialog: null,
        lunaDialogOpen: false,
        toolbarPosition: null,
        onHighlight: null,
        onAskLuna: null,
        onSaveToVault: null,

        // Image resizing (selection + drag handles)
        imageResizer: null,
        selectedImage: null,
        _imageResizerListenersBound: false,
        _imageResizeState: null
    };

    // Highlight color map
    const highlightColors = {
        yellow: 'rgba(250, 204, 21, 0.4)',
        green: 'rgba(34, 197, 94, 0.4)',
        blue: 'rgba(59, 130, 246, 0.4)',
        purple: 'rgba(139, 92, 246, 0.4)',
        pink: 'rgba(236, 72, 153, 0.4)',
        red: 'rgba(239, 68, 68, 0.4)',
        orange: 'rgba(249, 115, 22, 0.4)',
        cyan: 'rgba(6, 182, 212, 0.4)',
        gray: 'rgba(107, 114, 128, 0.4)',
        lime: 'rgba(132, 204, 22, 0.4)',
        indigo: 'rgba(99, 102, 241, 0.4)',
        rose: 'rgba(244, 63, 94, 0.4)'
    };

    // Luna AI Actions (Notion AI Style) - Grouped
    const lunaActionGroups = [
        {
            title: '智能分析',
            actions: [
                { id: 'summarize', icon: '📝', label: '生成摘要' },
                { id: 'make-todo', icon: '☐', label: '生成复盘任务' },
                { id: 'format-data', icon: '📐', label: '格式化信息' }
            ]
        },
        {
            title: '翻译工具',
            actions: [
                { id: 'translate-en', icon: 'A文', label: '翻译成英文' },
                { id: 'translate-zh', icon: 'A文', label: '翻译成中文' }
            ]
        }
    ];

    // Toolbar HTML Template
    const toolbarHTML = `
        <div class="tm-text-toolbar" id="tm-text-toolbar">
            <!-- Text Style Dropdown -->
            <div class="tm-toolbar-dropdown">
                <button class="tm-toolbar-dropdown-btn" data-action="style-dropdown">
                    <span>Text</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div class="tm-dropdown-menu" id="tm-style-menu">
                    <div class="tm-dropdown-item" data-action="heading1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 12h8M4 6v12M12 6v12M20 6v12M16 6v3h4"></path>
                        </svg>
                        <span class="tm-item-label">Heading 1</span>
                    </div>
                    <div class="tm-dropdown-item" data-action="heading2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 12h8M4 6v12M12 6v12M20 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"></path>
                        </svg>
                        <span class="tm-item-label">Heading 2</span>
                    </div>
                    <div class="tm-dropdown-item" data-action="heading3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 12h8M4 6v12M12 6v12M20 8h-4l2 4c-2.5 0-4 1-4 2.5 0 2 2 2.5 4 1.5"></path>
                        </svg>
                        <span class="tm-item-label">Heading 3</span>
                    </div>
                    <div class="tm-dropdown-item" data-action="paragraph">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="17" y1="10" x2="3" y2="10"></line>
                            <line x1="21" y1="6" x2="3" y2="6"></line>
                            <line x1="21" y1="14" x2="3" y2="14"></line>
                            <line x1="17" y1="18" x2="3" y2="18"></line>
                        </svg>
                        <span class="tm-item-label">Normal Text</span>
                    </div>
                </div>
            </div>

            <div class="tm-toolbar-divider"></div>

            <!-- Basic Formatting -->
            <button class="tm-toolbar-btn" data-action="bold" data-tooltip="Bold (Ctrl+B)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                </svg>
            </button>
            <button class="tm-toolbar-btn" data-action="italic" data-tooltip="Italic (Ctrl+I)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="19" y1="4" x2="10" y2="4"></line>
                    <line x1="14" y1="20" x2="5" y2="20"></line>
                    <line x1="15" y1="4" x2="9" y2="20"></line>
                </svg>
            </button>
            <button class="tm-toolbar-btn" data-action="underline" data-tooltip="Underline (Ctrl+U)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                    <line x1="4" y1="21" x2="20" y2="21"></line>
                </svg>
            </button>
            <button class="tm-toolbar-btn" data-action="strikethrough" data-tooltip="Strikethrough">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <path d="M17.5 7.5c-.5-2.5-3.5-3-6-2.5s-4.5 2-4.5 4c0 2 1.5 3 4 3h5c2.5 0 4 1 4 3s-2 3.5-4.5 4-5.5-.5-6-3"></path>
                </svg>
            </button>

            <div class="tm-toolbar-divider"></div>

            <!-- Code -->
            <button class="tm-toolbar-btn" data-action="code" data-tooltip="Inline Code">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
            </button>

            <div class="tm-toolbar-divider"></div>

            <!-- Lists & Blocks Dropdown -->
            <div class="tm-toolbar-dropdown">
                <button class="tm-toolbar-btn" data-action="blocks-dropdown" data-tooltip="Lists & Blocks">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>
                <div class="tm-dropdown-menu" id="tm-blocks-menu">
                    <div class="tm-dropdown-item" data-action="checkbox">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <polyline points="9 11 12 14 22 4"></polyline>
                        </svg>
                        <span class="tm-item-label">Checkbox / Todo</span>
                    </div>
                    <div class="tm-dropdown-item" data-action="bullet-list">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <circle cx="4" cy="6" r="1" fill="currentColor"></circle>
                            <circle cx="4" cy="12" r="1" fill="currentColor"></circle>
                            <circle cx="4" cy="18" r="1" fill="currentColor"></circle>
                        </svg>
                        <span class="tm-item-label">Bullet List</span>
                    </div>
                    <div class="tm-dropdown-item" data-action="ordered-list">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="10" y1="6" x2="21" y2="6"></line>
                            <line x1="10" y1="12" x2="21" y2="12"></line>
                            <line x1="10" y1="18" x2="21" y2="18"></line>
                            <text x="3" y="7" font-size="6" fill="currentColor">1.</text>
                            <text x="3" y="13" font-size="6" fill="currentColor">2.</text>
                            <text x="3" y="19" font-size="6" fill="currentColor">3.</text>
                        </svg>
                        <span class="tm-item-label">Numbered List</span>
                    </div>
                    <div class="tm-dropdown-item" data-action="toggle-list">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6"></path>
                            <line x1="15" y1="6" x2="21" y2="6"></line>
                            <line x1="15" y1="12" x2="21" y2="12"></line>
                            <line x1="15" y1="18" x2="21" y2="18"></line>
                        </svg>
                        <span class="tm-item-label">Toggle List</span>
                    </div>
                    <div class="tm-dropdown-item" data-action="quote">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"></path>
                            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3"></path>
                        </svg>
                        <span class="tm-item-label">Quote Block</span>
                    </div>
                    <div class="tm-dropdown-item" data-action="callout">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <span class="tm-item-label">Callout</span>
                    </div>
                </div>
            </div>

            <!-- Link -->
            <button class="tm-toolbar-btn" data-action="link" data-tooltip="Add Link (Ctrl+K)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
            </button>

            <!-- Save selection as Note -->
            <button class="tm-toolbar-btn" data-action="save-to-vault" data-tooltip="Save as Note" aria-label="Save as Note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="11" x2="12" y2="17"></line>
                    <line x1="9" y1="14" x2="15" y2="14"></line>
                </svg>
            </button>

            <div class="tm-toolbar-divider"></div>

            <!-- Text Color -->
            <div class="tm-toolbar-dropdown">
                <button class="tm-toolbar-btn tm-textcolor-btn" data-action="color-dropdown" data-tooltip="Text Color">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 20h16"></path>
                        <path d="M9.5 4h5l5 16h-2l-1.25-4h-8.5L6.5 20h-2l5-16z"></path>
                    </svg>
                    <span class="tm-color-indicator"></span>
                </button>
                <div class="tm-dropdown-menu tm-color-menu" id="tm-color-menu">
                    <div class="tm-color-grid">
                        <div class="tm-color-swatch" style="background: #ef4444;" data-text-color="#ef4444" title="Red"></div>
                        <div class="tm-color-swatch" style="background: #f97316;" data-text-color="#f97316" title="Orange"></div>
                        <div class="tm-color-swatch" style="background: #eab308;" data-text-color="#eab308" title="Yellow"></div>
                        <div class="tm-color-swatch" style="background: #22c55e;" data-text-color="#22c55e" title="Green"></div>
                        <div class="tm-color-swatch" style="background: #3b82f6;" data-text-color="#3b82f6" title="Blue"></div>
                        <div class="tm-color-swatch" style="background: #8b5cf6;" data-text-color="#8b5cf6" title="Purple"></div>
                        <div class="tm-color-swatch" style="background: #ec4899;" data-text-color="#ec4899" title="Pink"></div>
                        <div class="tm-color-swatch" style="background: #6b7280;" data-text-color="#6b7280" title="Gray"></div>
                        <div class="tm-color-swatch" style="background: #e6edf3;" data-text-color="#e6edf3" title="White"></div>
                        <div class="tm-color-swatch" style="background: #06b6d4;" data-text-color="#06b6d4" title="Cyan"></div>
                        <div class="tm-color-swatch" style="background: #84cc16;" data-text-color="#84cc16" title="Lime"></div>
                        <div class="tm-color-swatch" style="background: #6366f1;" data-text-color="#6366f1" title="Indigo"></div>
                        <div class="tm-color-swatch" style="background: #f43f5e;" data-text-color="#f43f5e" title="Rose"></div>
                        <div class="tm-color-swatch" style="background: #64748b;" data-text-color="#64748b" title="Slate"></div>
                        <div class="tm-color-swatch" style="background: #a855f7;" data-text-color="#a855f7" title="Violet"></div>
                        <div class="tm-color-swatch" style="background: #14b8a6;" data-text-color="#14b8a6" title="Teal"></div>
                    </div>
                    <div class="tm-color-picker-section">
                        <label class="tm-color-picker-label" for="tm-text-color-picker">更多颜色</label>
                        <input type="color" id="tm-text-color-picker" class="tm-color-picker-input" value="#000000">
                    </div>
                </div>
            </div>

            <!-- Highlight -->
            <div class="tm-toolbar-dropdown">
                <button class="tm-toolbar-btn tm-highlight-btn" data-action="highlight-dropdown" data-tooltip="Highlight">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                </button>
                <div class="tm-dropdown-menu tm-highlight-menu" id="tm-highlight-menu">
                    <div class="tm-color-grid">
                        <div class="tm-color-swatch" style="background: #fef08a;" data-color="yellow" title="Yellow"></div>
                        <div class="tm-color-swatch" style="background: #86efac;" data-color="green" title="Green"></div>
                        <div class="tm-color-swatch" style="background: #93c5fd;" data-color="blue" title="Blue"></div>
                        <div class="tm-color-swatch" style="background: #c4b5fd;" data-color="purple" title="Purple"></div>
                        <div class="tm-color-swatch" style="background: #f9a8d4;" data-color="pink" title="Pink"></div>
                        <div class="tm-color-swatch" style="background: #fca5a5;" data-color="red" title="Red"></div>
                        <div class="tm-color-swatch" style="background: #fdba74;" data-color="orange" title="Orange"></div>
                        <div class="tm-color-swatch" style="background: #67e8f9;" data-color="cyan" title="Cyan"></div>
                        <div class="tm-color-swatch" style="background: #d1d5db;" data-color="gray" title="Gray"></div>
                        <div class="tm-color-swatch" style="background: #bef264;" data-color="lime" title="Lime"></div>
                        <div class="tm-color-swatch" style="background: #a5b4fc;" data-color="indigo" title="Indigo"></div>
                        <div class="tm-color-swatch" style="background: #fb7185;" data-color="rose" title="Rose"></div>
                    </div>
                    <div class="tm-color-picker-section">
                        <label class="tm-color-picker-label" for="tm-highlight-color-picker">更多颜色</label>
                        <input type="color" id="tm-highlight-color-picker" class="tm-color-picker-input" value="#000000">
                    </div>
                </div>
            </div>

            <div class="tm-toolbar-divider"></div>

            <!-- Ask Luna Button (with moon icon) -->
            <button class="tm-toolbar-btn tm-luna-btn" data-action="show-luna-dialog" data-tooltip="Ask Luna AI">
                <div class="tm-luna-moon">
                    <div class="tm-moon-shape"></div>
                </div>
                <span class="tm-luna-label">Luna</span>
            </button>
        </div>

        <!-- Link Popup (separate from toolbar) -->
        <div class="tm-link-popup" id="tm-link-popup">
            <input type="text" class="tm-link-input" id="tm-link-input" placeholder="Paste or type a link...">
            <div class="tm-link-actions">
                <button class="tm-link-btn cancel" data-action="link-cancel">Cancel</button>
                <button class="tm-link-btn confirm" data-action="link-confirm">Apply</button>
            </div>
        </div>

        <!-- Luna AI Dialog (Notion-style popup) -->
        <div class="tm-luna-dialog" id="tm-luna-dialog">
            <div class="tm-luna-dialog-header">
                <div class="tm-luna-avatar">
                    <div class="tm-luna-moon-icon">
                        <div class="tm-moon-shape"></div>
                    </div>
                </div>
                <input type="text" class="tm-luna-input" id="tm-luna-input" placeholder="向 Luna 提问...">
                <div class="tm-luna-dialog-actions">
                    <span class="tm-luna-scope">当前页面</span>
                    <button class="tm-luna-submit" id="tm-luna-submit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 8v8M8 12l4 4 4-4"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="tm-luna-dialog-body" id="tm-luna-dialog-body">
                <!-- Actions will be populated dynamically -->
            </div>
        </div>

        <!-- Image Resizer (click image to show, drag handles to resize) -->
        <div class="tm-image-resizer" id="tm-image-resizer" aria-hidden="true">
            <div class="tm-image-handle tl" data-handle="nw" title="Resize"></div>
            <div class="tm-image-handle tr" data-handle="ne" title="Resize"></div>
            <div class="tm-image-handle bl" data-handle="sw" title="Resize"></div>
            <div class="tm-image-handle br" data-handle="se" title="Resize"></div>
        </div>
    `;

    /**
     * Initialize the text editor toolbar
     */
    function init(options = {}) {
        config.targets = options.targets || [];
        config.onHighlight = options.onHighlight || null;
        config.onAskLuna = options.onAskLuna || null;
        config.onSaveToVault = options.onSaveToVault || null;
        
        createToolbar();
        bindEvents();
        
        console.log('[TMTextEditor] Initialized with targets:', config.targets);
    }

    /**
     * Create and append the toolbar to the DOM
     */
    function createToolbar() {
        // Remove existing
        const existing = document.getElementById('tm-text-toolbar');
        if (existing) existing.remove();
        const existingPopup = document.getElementById('tm-link-popup');
        if (existingPopup) existingPopup.remove();
        const existingDialog = document.getElementById('tm-luna-dialog');
        if (existingDialog) existingDialog.remove();
        const existingResizer = document.getElementById('tm-image-resizer');
        if (existingResizer) existingResizer.remove();

        // Create toolbar container
        const container = document.createElement('div');
        container.innerHTML = toolbarHTML;
        
        // Append toolbar, link popup, and luna dialog separately
        document.body.appendChild(container.querySelector('#tm-text-toolbar'));
        document.body.appendChild(container.querySelector('#tm-link-popup'));
        document.body.appendChild(container.querySelector('#tm-luna-dialog'));
        document.body.appendChild(container.querySelector('#tm-image-resizer'));

        config.toolbar = document.getElementById('tm-text-toolbar');
        config.linkPopup = document.getElementById('tm-link-popup');
        config.lunaDialog = document.getElementById('tm-luna-dialog');
        config.imageResizer = document.getElementById('tm-image-resizer');
        
        // Populate Luna actions
        populateLunaActions();
    }

    /**
     * Populate Luna AI action menu (grouped style)
     */
    function populateLunaActions() {
        const container = document.getElementById('tm-luna-dialog-body');
        if (!container) return;

        let html = '';
        lunaActionGroups.forEach(group => {
            html += `<div class="tm-luna-group">`;
            html += `<div class="tm-luna-group-title">${group.title}</div>`;
            group.actions.forEach(action => {
                html += `
                    <div class="tm-luna-action-item" data-luna-action="${action.id}">
                        <span class="tm-luna-action-icon">${action.icon}</span>
                        <span class="tm-luna-action-label">${action.label}</span>
                        ${action.hasSubmenu ? '<span class="tm-luna-arrow">›</span>' : ''}
                    </div>
                `;
            });
            html += `</div>`;
        });
        container.innerHTML = html;
    }

    /**
     * Bind all event listeners
     */
    function bindEvents() {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('dragstart', handleDragStart);
        config.toolbar.addEventListener('click', handleToolbarClick);
        config.linkPopup.addEventListener('click', handleLinkPopupClick);

        // Image resizer: handle drag
        if (config.imageResizer) {
            config.imageResizer.addEventListener('pointerdown', handleImageResizerPointerDown);
        }
        
        // Luna dialog events
        if (config.lunaDialog) {
            config.lunaDialog.addEventListener('click', handleLunaDialogClick);
            // Don't prevent default on mousedown - it blocks input focus
        }

        // Global click handler for interactive elements (checkbox, toggle)
        document.addEventListener('click', handleInteractiveElements);
        
        // Global keydown handler for interactive elements (Enter for new checkbox, etc.)
        document.addEventListener('keydown', handleInteractiveKeydown);

        const linkInput = document.getElementById('tm-link-input');
        if (linkInput) {
            linkInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    applyLink();
                }
                if (e.key === 'Escape') {
                    hideLinkPopup();
                }
            });
        }

        // Luna input events
        const lunaInput = document.getElementById('tm-luna-input');
        if (lunaInput) {
            lunaInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    submitLunaQuestion();
                }
                if (e.key === 'Escape') {
                    // Close Luna dialog and restore toolbar
                    hideLunaDialog(true); // restoreToolbarAfter = true
                }
            });
            
            // When input is focused, apply temp highlight to preserve visual selection
            lunaInput.addEventListener('focus', () => {
                applyTempHighlight();
            });
        }

        const lunaSubmit = document.getElementById('tm-luna-submit');
        if (lunaSubmit) {
            lunaSubmit.addEventListener('click', submitLunaQuestion);
        }

        // Color picker events
        const highlightColorPicker = document.getElementById('tm-highlight-color-picker');
        if (highlightColorPicker) {
            highlightColorPicker.addEventListener('change', (e) => {
                restoreSelection();
                applyHighlight(e.target.value);
                hideAllDropdowns();
                hideToolbar();
            });
        }

        const textColorPicker = document.getElementById('tm-text-color-picker');
        if (textColorPicker) {
            textColorPicker.addEventListener('change', (e) => {
                restoreSelection();
                applyTextColor(e.target.value);
                hideAllDropdowns();
            });
        }

        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    /**
     * Prevent native drag of images inside editor targets (we use resize handles instead)
     */
    function handleDragStart(e) {
        const img = e.target && e.target.closest && e.target.closest('img');
        if (!img) return;
        if (!isElementInTargets(img)) return;
        e.preventDefault();
    }

    /**
     * Handle mouse up event
     */
    function handleMouseUp(e) {
        setTimeout(() => {
            // Prevent toolbar from appearing if Luna dialog is open
            if (config.lunaDialogOpen) return;

            const selection = window.getSelection();
            
            if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
                return;
            }

            const anchorNode = selection.anchorNode;
            if (!anchorNode) return;

            const targetElement = anchorNode.nodeType === Node.TEXT_NODE 
                ? anchorNode.parentElement 
                : anchorNode;

            const isInTarget = config.targets.some(selector => {
                return targetElement.closest(selector);
            });

            if (isInTarget) {
                config.currentRange = selection.getRangeAt(0).cloneRange();
                config.selectedText = selection.toString().trim();
                showToolbar();
            }
        }, 10);
    }

    /**
     * Handle mouse down event
     */
    function handleMouseDown(e) {
        // If user is interacting with image resizer handles, don't hide anything here.
        if (config.imageResizer && config.imageResizer.contains(e.target)) {
            return;
        }

        // Don't hide if clicking on toolbar, link popup, or luna dialog
        if (config.toolbar.contains(e.target) || config.linkPopup.contains(e.target) || 
            (config.lunaDialog && config.lunaDialog.contains(e.target))) {
            // Only prevent default for non-input elements (to allow input focus)
            const isInputElement = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
            if (!isInputElement) {
                e.preventDefault();
            }
            return;
        }

        hideAllDropdowns();

        const isInTarget = config.targets.some(selector => {
            return e.target.closest(selector);
        });

        // Image selection (click an <img> inside target => show resizer)
        if (isInTarget) {
            const img = e.target.closest && e.target.closest('img');
            if (img) {
                // Avoid hijacking images that are inside toolbar/dialog etc (already excluded above)
                selectImageNode(img);
                showImageResizer(img);
                // Hide toolbar/popups; image resize is separate UX
                hideToolbar();
                hideLinkPopup();
                // Don't let browser start native drag of the image
                e.preventDefault();
                return;
            } else {
                // Clicked inside editor but not on image => hide resizer
                hideImageResizer();
            }
        } else {
            hideImageResizer();
        }

        // If Luna dialog is open and user clicks outside it (but in target area)
        if (config.lunaDialogOpen && isInTarget) {
            // Close Luna dialog and restore toolbar
            hideLunaDialog(true); // restoreToolbarAfter = true
            e.preventDefault();
            return;
        }

        // Always hide toolbar on mouse down (new selection will show it again on mouse up)
        hideToolbar();
        hideLinkPopup();
        
        if (!isInTarget) {
            hideLunaDialog();
        }
    }

    /**
     * Select an image node in the current selection
     */
    function selectImageNode(img) {
        try {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNode(img);
            selection.removeAllRanges();
            selection.addRange(range);
            config.currentRange = range.cloneRange();
            config.selectedText = '';
        } catch (e) {
            // Ignore selection failures
        }
    }

    /**
     * Determine if an element is inside any configured target
     */
    function isElementInTargets(el) {
        if (!el) return false;
        return config.targets.some(selector => el.closest && el.closest(selector));
    }

    /**
     * Show image resizer overlay for a given image
     */
    function showImageResizer(img) {
        if (!config.imageResizer || !img) return;
        if (!isElementInTargets(img)) return;

        config.selectedImage = img;
        config.imageResizer.classList.add('active');

        // Move resizer into the correct scroll container so it scrolls together
        const scrollContainer = findScrollContainer(img);
        if (scrollContainer && scrollContainer !== document.body) {
            const containerStyle = window.getComputedStyle(scrollContainer);
            if (containerStyle.position === 'static') {
                scrollContainer.style.position = 'relative';
            }
            if (config.imageResizer.parentElement !== scrollContainer) {
                scrollContainer.appendChild(config.imageResizer);
            }
        } else {
            if (config.imageResizer.parentElement !== document.body) {
                document.body.appendChild(config.imageResizer);
            }
        }

        updateImageResizerPosition();
        bindImageResizerViewportListeners();
    }

    function hideImageResizer() {
        if (!config.imageResizer) return;
        config.imageResizer.classList.remove('active');
        config.selectedImage = null;
        unbindImageResizerViewportListeners();
    }

    function updateImageResizerPosition() {
        const img = config.selectedImage;
        const resizer = config.imageResizer;
        if (!img || !resizer || !resizer.classList.contains('active')) return;

        const rect = img.getBoundingClientRect();
        const scrollContainer = findScrollContainer(img);

        let left, top;
        if (scrollContainer && scrollContainer !== document.body) {
            const containerRect = scrollContainer.getBoundingClientRect();
            left = rect.left - containerRect.left + scrollContainer.scrollLeft;
            top = rect.top - containerRect.top + scrollContainer.scrollTop;
        } else {
            left = rect.left + window.scrollX;
            top = rect.top + window.scrollY;
        }

        resizer.style.left = `${left}px`;
        resizer.style.top = `${top}px`;
        resizer.style.width = `${rect.width}px`;
        resizer.style.height = `${rect.height}px`;
    }

    function bindImageResizerViewportListeners() {
        if (config._imageResizerListenersBound) return;
        config._imageResizerListenersBound = true;
        // Capture scroll from any scroll container
        document.addEventListener('scroll', updateImageResizerPosition, true);
        window.addEventListener('resize', updateImageResizerPosition);
    }

    function unbindImageResizerViewportListeners() {
        if (!config._imageResizerListenersBound) return;
        config._imageResizerListenersBound = false;
        document.removeEventListener('scroll', updateImageResizerPosition, true);
        window.removeEventListener('resize', updateImageResizerPosition);
    }

    /**
     * Pointer-down on image resize handles
     */
    function handleImageResizerPointerDown(e) {
        const handle = e.target.closest && e.target.closest('.tm-image-handle[data-handle]');
        if (!handle) return;

        const img = config.selectedImage;
        if (!img) return;

        e.preventDefault();
        e.stopPropagation();

        const handleType = handle.dataset.handle; // nw, ne, sw, se
        const rect = img.getBoundingClientRect();

        const naturalW = Number(img.naturalWidth) || 0;
        const naturalH = Number(img.naturalHeight) || 0;
        const aspect = (naturalW > 0 && naturalH > 0) ? (naturalW / naturalH) : (rect.width / Math.max(1, rect.height));

        config._imageResizeState = {
            handle: handleType,
            startX: e.clientX,
            startY: e.clientY,
            startW: rect.width,
            startH: rect.height,
            aspect
        };

        // Use pointer capture so dragging stays smooth
        try { handle.setPointerCapture(e.pointerId); } catch (_) {}

        document.addEventListener('pointermove', handleImageResizerPointerMove, true);
        document.addEventListener('pointerup', handleImageResizerPointerUp, true);
        document.addEventListener('pointercancel', handleImageResizerPointerUp, true);
    }

    function handleImageResizerPointerMove(e) {
        const st = config._imageResizeState;
        const img = config.selectedImage;
        if (!st || !img) return;

        e.preventDefault();

        const dx = e.clientX - st.startX;
        const dy = e.clientY - st.startY;

        // Determine direction multipliers per handle
        const xMul = (st.handle === 'nw' || st.handle === 'sw') ? -1 : 1;
        const yMul = (st.handle === 'nw' || st.handle === 'ne') ? -1 : 1;

        const proposedW = st.startW + dx * xMul;
        const proposedH = st.startH + dy * yMul;

        const minW = 40;
        const minH = 40;

        // Maintain aspect ratio: scale by the dominant change
        const scaleW = proposedW / Math.max(1, st.startW);
        const scaleH = proposedH / Math.max(1, st.startH);
        let scale = Math.max(scaleW, scaleH);
        if (!Number.isFinite(scale) || scale <= 0) scale = 1;

        let newW = st.startW * scale;
        let newH = newW / Math.max(0.0001, st.aspect);

        // Clamp minimums
        if (newW < minW) {
            newW = minW;
            newH = newW / Math.max(0.0001, st.aspect);
        }
        if (newH < minH) {
            newH = minH;
            newW = newH * st.aspect;
        }

        // Apply: width in px; keep height auto to avoid distortion in responsive layouts
        img.style.width = `${Math.round(newW)}px`;
        img.style.height = 'auto';
        if (!img.style.maxWidth) {
            img.style.maxWidth = '100%';
        }

        updateImageResizerPosition();
    }

    function handleImageResizerPointerUp(e) {
        if (!config._imageResizeState) return;
        e.preventDefault();

        config._imageResizeState = null;
        document.removeEventListener('pointermove', handleImageResizerPointerMove, true);
        document.removeEventListener('pointerup', handleImageResizerPointerUp, true);
        document.removeEventListener('pointercancel', handleImageResizerPointerUp, true);

        // After resizing, keep resizer aligned (images may reflow)
        setTimeout(updateImageResizerPosition, 0);
    }

    /**
     * Apply a temporary visual highlight
     */
    function applyTempHighlight() {
        if (!config.currentRange) return;
        removeTempHighlight();
        
        let scrollContainer = null;
        if (config.currentRange.commonAncestorContainer) {
            scrollContainer = findScrollContainer(config.currentRange.commonAncestorContainer);
        }
        const rects = config.currentRange.getClientRects();
        
        const overlayContainer = document.createElement('div');
        overlayContainer.id = 'tm-selection-overlay';
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.top = '0';
        overlayContainer.style.left = '0';
        overlayContainer.style.pointerEvents = 'none';
        overlayContainer.style.zIndex = '999'; 
        
        let targetContainer = document.body;
        let offsetX = window.scrollX;
        let offsetY = window.scrollY;

        if (scrollContainer && scrollContainer !== document.body) {
            targetContainer = scrollContainer;
            const containerRect = scrollContainer.getBoundingClientRect();
             
             // Ensure we are relative to the container's content
             const style = window.getComputedStyle(scrollContainer);
             if (style.position === 'static') {
                 scrollContainer.style.position = 'relative';
             }
             offsetX = scrollContainer.scrollLeft - containerRect.left;
             offsetY = scrollContainer.scrollTop - containerRect.top;
        }

        targetContainer.appendChild(overlayContainer);

        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            const highlight = document.createElement('div');
            highlight.style.position = 'absolute';
            highlight.style.left = (rect.left + offsetX) + 'px';
            highlight.style.top = (rect.top + offsetY) + 'px';
            highlight.style.width = rect.width + 'px';
            highlight.style.height = rect.height + 'px';
            highlight.style.backgroundColor = 'rgba(0, 120, 215, 0.4)'; 
            overlayContainer.appendChild(highlight);
        }
        
        config.overlayElement = overlayContainer;
    }

    function removeTempHighlight() {
        if (config.overlayElement) {
            config.overlayElement.remove();
            config.overlayElement = null;
        }
    }

    /**
     * Show the toolbar near the selection
     */
    function showToolbar() {
        if (config.lunaDialogOpen) return;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Find scroll container and move toolbar there
        const scrollContainer = findScrollContainer(range.commonAncestorContainer);
        if (scrollContainer && config.toolbar.parentElement !== scrollContainer) {
            const containerStyle = window.getComputedStyle(scrollContainer);
            if (containerStyle.position === 'static') {
                scrollContainer.style.position = 'relative';
            }
            scrollContainer.appendChild(config.toolbar);
        }

        config.toolbar.style.display = ''; // Reset forced hide
        config.toolbar.classList.add('active');
        
        // Calculate position after toolbar is visible
        requestAnimationFrame(() => {
            const toolbarRect = config.toolbar.getBoundingClientRect();
            
            let left, top;
            const padding = 10;

            if (scrollContainer && scrollContainer !== document.body) {
                const containerRect = scrollContainer.getBoundingClientRect();
                
                // Position relative to container (accounting for scroll)
                left = rect.left - containerRect.left + scrollContainer.scrollLeft + (rect.width / 2) - (toolbarRect.width / 2);
                top = rect.top - containerRect.top + scrollContainer.scrollTop - toolbarRect.height - 10;
                
                // Horizontal bounds check
                if (left < padding) left = padding;
                const maxLeft = scrollContainer.scrollWidth - toolbarRect.width - padding;
                if (left > maxLeft) left = Math.max(padding, maxLeft);
                
                // If not enough space above, position below
                if (top < scrollContainer.scrollTop + padding) {
                    top = rect.bottom - containerRect.top + scrollContainer.scrollTop + 10;
                }
            } else {
                // Fallback: use document coordinates
                left = rect.left + window.scrollX + (rect.width / 2) - (toolbarRect.width / 2);
                top = rect.top + window.scrollY - toolbarRect.height - 10;
                
                if (left < padding) left = padding;
                if (left + toolbarRect.width > document.documentElement.scrollWidth - padding) {
                    left = document.documentElement.scrollWidth - toolbarRect.width - padding;
                }
                if (top < window.scrollY + padding) {
                    top = rect.bottom + window.scrollY + 10;
                }
            }

            config.toolbar.style.left = `${left}px`;
            config.toolbar.style.top = `${top}px`;
            
            // Store toolbar position for later restoration
            config.toolbarPosition = { left, top };
            
            updateActiveStates();
        });
    }

    /**
     * Hide the toolbar
     * @param {boolean} preserveSelection - If true, keeps the selection state for restoration
     */
    function hideToolbar(preserveSelection = false) {
        if (config.toolbar) {
            config.toolbar.classList.remove('active');
            config.toolbar.style.display = 'none'; // Force hide
        }
        hideAllDropdowns();
        if (!preserveSelection) {
            config.currentRange = null;
            config.selectedText = '';
            config.toolbarPosition = null;
        }
    }

    /**
     * Restore the toolbar at its previous position
     */
    function restoreToolbar() {
        if (config.currentRange && config.toolbarPosition) {
            // Restore selection
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(config.currentRange);
            
            // Show toolbar at stored position
            config.toolbar.style.display = ''; // Reset forced hide
            config.toolbar.classList.add('active');
            config.toolbar.style.left = `${config.toolbarPosition.left}px`;
            config.toolbar.style.top = `${config.toolbarPosition.top}px`;
            
            updateActiveStates();
        }
    }

    /**
     * Handle toolbar button clicks
     */
    function handleToolbarClick(e) {
        e.preventDefault();
        e.stopPropagation();

        // Handle Luna actions
        const lunaAction = e.target.closest('[data-luna-action]');
        if (lunaAction) {
            const actionId = lunaAction.dataset.lunaAction;
            handleLunaAction(actionId);
            hideAllDropdowns();
            return;
        }

        // Handle color swatches
        const colorSwatch = e.target.closest('[data-color]');
        if (colorSwatch) {
            restoreSelection();
            applyHighlight(colorSwatch.dataset.color);
            hideAllDropdowns();
            hideToolbar();
            return;
        }

        const textColorSwatch = e.target.closest('[data-text-color]');
        if (textColorSwatch) {
            restoreSelection();
            applyTextColor(textColorSwatch.dataset.textColor);
            hideAllDropdowns();
            return;
        }

        // Handle button actions
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;

        switch (action) {
            case 'style-dropdown':
                toggleDropdown('tm-style-menu');
                break;
            case 'highlight-dropdown':
                toggleDropdown('tm-highlight-menu');
                break;
            case 'color-dropdown':
                toggleDropdown('tm-color-menu');
                break;
            case 'blocks-dropdown':
                toggleDropdown('tm-blocks-menu');
                break;
            case 'show-luna-dialog':
                showLunaDialog();
                break;

            case 'heading1':
                restoreSelection();
                formatBlock('h1');
                hideAllDropdowns();
                break;
            case 'heading2':
                restoreSelection();
                formatBlock('h2');
                hideAllDropdowns();
                break;
            case 'heading3':
                restoreSelection();
                formatBlock('h3');
                hideAllDropdowns();
                break;
            case 'paragraph':
                restoreSelection();
                formatBlock('p');
                hideAllDropdowns();
                break;

            case 'bold':
                restoreSelection();
                execCommand('bold');
                updateActiveStates();
                break;
            case 'italic':
                restoreSelection();
                execCommand('italic');
                updateActiveStates();
                break;
            case 'underline':
                restoreSelection();
                execCommand('underline');
                updateActiveStates();
                break;
            case 'strikethrough':
                restoreSelection();
                execCommand('strikeThrough');
                updateActiveStates();
                break;
            case 'code':
                restoreSelection();
                wrapWithTag('code');
                break;

            case 'link':
                showLinkPopup();
                break;
            
            case 'save-to-vault':
                handleSaveToVault();
                break;

            // Block actions
            case 'checkbox':
                restoreSelection();
                insertCheckbox();
                hideAllDropdowns();
                hideToolbar();
                break;
            case 'bullet-list':
                restoreSelection();
                execCommand('insertUnorderedList');
                hideAllDropdowns();
                break;
            case 'ordered-list':
                restoreSelection();
                execCommand('insertOrderedList');
                hideAllDropdowns();
                break;
            case 'toggle-list':
                restoreSelection();
                insertToggle();
                hideAllDropdowns();
                hideToolbar();
                break;
            case 'quote':
                restoreSelection();
                insertQuote();
                hideAllDropdowns();
                hideToolbar();
                break;
            case 'callout':
                restoreSelection();
                insertCallout();
                hideAllDropdowns();
                hideToolbar();
                break;
        }
    }

    /**
     * Get selected HTML content preserving formatting
     */
    function getSelectedHTML() {
        if (!config.currentRange) return '';
        
        const range = config.currentRange;
        const cloned = range.cloneContents();
        const div = document.createElement('div');
        div.appendChild(cloned);
        return div.innerHTML;
    }

    /**
     * Handle Save to Vault
     */
    function handleSaveToVault() {
        // Use saved selection
        const text = config.selectedText;
        if (!text) return;
        
        // Get selected HTML content to preserve formatting
        const selectedHTML = getSelectedHTML();
        
        // Restore selection first so we can modify it
        restoreSelection();
        
        if (config.onSaveToVault && typeof config.onSaveToVault === 'function') {
            // Callback returns note info for creating bidirectional link
            const noteInfo = config.onSaveToVault(text, selectedHTML);
            
            // If noteInfo is returned, create a link to the new note
            if (noteInfo && noteInfo.id) {
                createInternalLink(noteInfo.id, noteInfo.title);
            }
        } else {
            console.log('Save to vault clicked:', text);
            // Fallback visualization if no handler
            const btn = config.toolbar.querySelector('[data-action="save-to-vault"]');
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '✓';
                setTimeout(() => {
                    if (btn) btn.innerHTML = originalHTML;
                    hideToolbar();
                }, 1000);
                return;
            }
        }
        
        hideToolbar();
    }

    /**
     * Create internal link to a note (bidirectional linking)
     */
    function createInternalLink(noteId, noteTitle) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        if (!selectedText) return;
        
        // Create link element
        const link = document.createElement('a');
        link.href = `#note-${noteId}`;
        link.className = 'tm-internal-link';
        link.setAttribute('data-note-id', noteId);
        link.setAttribute('data-link-type', 'internal');
        link.title = `Link to: ${noteTitle}`;
        
        // Use safe wrapping
        safeWrapSelection(range, link);
        
        // Clear selection
        selection.removeAllRanges();
    }

    /**
     * Handle link popup clicks
     */
    function handleLinkPopupClick(e) {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        if (btn.dataset.action === 'link-cancel') {
            hideLinkPopup();
        } else if (btn.dataset.action === 'link-confirm') {
            applyLink();
        }
    }

    /**
     * Handle Luna dialog clicks
     */
    function handleLunaDialogClick(e) {
        const actionItem = e.target.closest('[data-luna-action]');
        if (actionItem) {
            const actionId = actionItem.dataset.lunaAction;
            handleLunaAction(actionId);
        }
    }

    /**
     * Show Luna dialog below selected text
     */
    function showLunaDialog() {
        // Use stored range if native selection is empty/collapsed
        const selection = window.getSelection();
        let range;

        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            range = selection.getRangeAt(0);
        } else if (config.currentRange) {
            range = config.currentRange;
        } else {
            return;
        }

        const rect = range.getBoundingClientRect();

        // Find the scroll container (the element with overflow-y: auto/scroll)
        const scrollContainer = findScrollContainer(range.commonAncestorContainer);
        
        // Move dialog to the scroll container for proper scroll behavior
        if (scrollContainer && config.lunaDialog.parentElement !== scrollContainer) {
            // Ensure scroll container has position relative for absolute positioning
            const containerStyle = window.getComputedStyle(scrollContainer);
            if (containerStyle.position === 'static') {
                scrollContainer.style.position = 'relative';
            }
            scrollContainer.appendChild(config.lunaDialog);
        }

        // Hide text toolbar FIRST (before showing dialog)
        // Use true to preserve selection data
        hideToolbar(true);
        hideAllDropdowns();
        
        // Then show dialog
        config.lunaDialog.classList.add('active');
        
        // Set flag to indicate Luna dialog is open
        config.lunaDialogOpen = true;

        // Hide global Luna widget
        const globalLuna = document.getElementById('luna-widget');
        if (globalLuna) {
            globalLuna.style.display = 'none';
        }

        // Use setTimeout to ensure dialog is rendered and we can get accurate dimensions
        setTimeout(() => {
            const dialogRect = config.lunaDialog.getBoundingClientRect();
            const dialogHeight = dialogRect.height || 400; // fallback height
            const dialogWidth = dialogRect.width || 340;
            
            // Calculate position relative to scroll container
            let left, top;
            const padding = 10;
            
            if (scrollContainer) {
                // Get container rect for offset calculation
                const containerRect = scrollContainer.getBoundingClientRect();
                
                // Position relative to container (accounting for scroll)
                left = rect.left - containerRect.left + scrollContainer.scrollLeft;
                top = rect.bottom - containerRect.top + scrollContainer.scrollTop + 8; // 8px gap below selection
                
                // Horizontal bounds check within container
                if (left < padding) {
                    left = padding;
                }
                const maxLeft = scrollContainer.scrollWidth - dialogWidth - padding;
                if (left > maxLeft) {
                    left = Math.max(padding, maxLeft);
                }
                
                // ALWAYS position below the selected text
                // If not enough space, expand the container/page instead of moving above
                const dialogBottom = top + dialogHeight;
                const currentScrollHeight = scrollContainer.scrollHeight;
                
                // Check if we need more space
                if (dialogBottom > currentScrollHeight) {
                    // Add padding element to expand scroll area
                    let spacer = scrollContainer.querySelector('.tm-luna-spacer');
                    if (!spacer) {
                        spacer = document.createElement('div');
                        spacer.className = 'tm-luna-spacer';
                        spacer.style.cssText = 'width: 1px; pointer-events: none;';
                        scrollContainer.appendChild(spacer);
                    }
                    spacer.style.height = (dialogBottom - currentScrollHeight + 50) + 'px';
                }
            } else {
                // Fallback: use document body coordinates
                left = rect.left + window.scrollX;
                top = rect.bottom + window.scrollY + 8;
                
                // Horizontal bounds check
                if (left < padding) {
                    left = padding;
                }
                if (left + dialogWidth > document.documentElement.scrollWidth - padding) {
                    left = document.documentElement.scrollWidth - dialogWidth - padding;
                }
                
                // Expand document if needed
                const dialogBottom = top + dialogHeight;
                if (dialogBottom > document.documentElement.scrollHeight) {
                    document.body.style.minHeight = dialogBottom + 50 + 'px';
                }
            }

            // Apply position (absolute positioning relative to container)
            config.lunaDialog.style.left = `${left}px`;
            config.lunaDialog.style.top = `${top}px`;

            // Keep native selection visible by NOT focusing the input automatically
            // User can click the input when they want to type
            const lunaInput = document.getElementById('tm-luna-input');
            if (lunaInput) {
                lunaInput.value = '';
                // Don't auto-focus - this preserves the native selection highlight
                // lunaInput.focus();
            }
        }, 10);
    }

    /**
     * Find the scroll container for an element
     */
    function findScrollContainer(element) {
        let current = element;
        while (current && current !== document.body) {
            if (current.nodeType === Node.ELEMENT_NODE) {
                const style = window.getComputedStyle(current);
                const overflowY = style.overflowY;
                if (overflowY === 'auto' || overflowY === 'scroll') {
                    return current;
                }
            }
            current = current.parentNode;
        }
        return document.body;
    }

    /**
     * Hide Luna dialog
     * @param {boolean} restoreToolbarAfter - If true, restore the text toolbar
     */
    function hideLunaDialog(restoreToolbarAfter = false) {
        // Remove temporary selection highlight if any
        removeTempHighlight();
        
        if (config.lunaDialog) {
            config.lunaDialog.classList.remove('active');
            config.lunaDialogOpen = false;
            
            // Remove spacer elements that were added for expanding scroll area
            document.querySelectorAll('.tm-luna-spacer').forEach(spacer => {
                spacer.remove();
            });
            
            // Reset body min-height if it was set
            if (document.body.style.minHeight) {
                document.body.style.minHeight = '';
            }

            // Restore global Luna widget
            const globalLuna = document.getElementById('luna-widget');
            if (globalLuna) {
                globalLuna.style.display = '';
            }

            // Restore text toolbar if requested and we have a saved selection
            if (restoreToolbarAfter && config.currentRange) {
                restoreToolbar();
            }
        }
    }

    /**
     * Submit custom Luna question
     */
    function submitLunaQuestion() {
        const lunaInput = document.getElementById('tm-luna-input');
        const question = lunaInput ? lunaInput.value.trim() : '';
        
        if (question) {
            handleLunaAction('custom-question', question);
        }
    }

    /**
     * Handle Luna AI action
     */
    function handleLunaAction(actionId, customQuestion = null) {
        // Use saved selected text if current one is empty (since dialog focus might clear it)
        const text = config.selectedText;
        if (!text) return;

        if (config.onAskLuna && typeof config.onAskLuna === 'function') {
            config.onAskLuna(text, actionId, customQuestion);
        }
        
        // Hide dialog (and global widget will restore)
        hideLunaDialog(); 
        // Do NOT restore toolbar after action is taken (as per requirement "close editor")
        hideToolbar(false);
    }

    /**
     * Apply highlight color
     */
    function applyHighlight(color) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        if (!selectedText) return;

        if (color === 'none') {
            // Remove highlight
            const container = range.commonAncestorContainer;
            const parent = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
            const highlightMark = parent.closest('mark[data-highlight]');
            if (highlightMark) {
                unwrapElement(highlightMark);
            }
        } else {
            // Apply highlight using <mark> tag
            const bgColor = highlightColors[color] || color;
            const mark = document.createElement('mark');
            mark.style.backgroundColor = bgColor;
            mark.style.color = 'inherit';
            mark.style.borderRadius = '2px';
            mark.style.padding = '1px 2px';
            mark.setAttribute('data-highlight', color);
            
            // Use safe wrapping to preserve structure
            safeWrapSelection(range, mark);

            // Callback
            if (config.onHighlight && typeof config.onHighlight === 'function') {
                config.onHighlight(selectedText, color, 'Note');
            }
        }

        window.getSelection().removeAllRanges();
    }

    /**
     * Apply text color
     */
    function applyTextColor(color) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        if (!selectedText) return;

        if (color === 'none') {
            // Remove color
            const container = range.commonAncestorContainer;
            const parent = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
            const colorSpan = parent.closest('span[data-textcolor]');
            if (colorSpan) {
                unwrapElement(colorSpan);
            }
        } else {
            // Apply color
            const span = document.createElement('span');
            span.style.color = color;
            span.setAttribute('data-textcolor', color);
            
            // Use safe wrapping to preserve structure
            safeWrapSelection(range, span);
        }

        updateActiveStates();
    }

    /**
     * Execute document command
     */
    function execCommand(command, value = null) {
        document.execCommand(command, false, value);
    }

    /**
     * Format block with tag
     */
    function formatBlock(tag) {
        document.execCommand('formatBlock', false, `<${tag}>`);
    }

    /**
     * Insert interactive checkbox/todo item
     */
    function insertCheckbox() {
        const selection = window.getSelection();
        const text = selection.toString().trim() || 'Todo item';
        
        const checkboxHTML = `<div class="tm-checkbox-item" data-checked="false"><span class="tm-checkbox"></span><span class="tm-checkbox-text">${text}</span></div><p><br></p>`;
        
        document.execCommand('insertHTML', false, checkboxHTML);
        
        // Focus on the checkbox text
        setTimeout(() => {
            const items = document.querySelectorAll('.tm-checkbox-text');
            if (items.length > 0) {
                const lastItem = items[items.length - 1];
                lastItem.focus();
                // Move cursor to end
                const range = document.createRange();
                range.selectNodeContents(lastItem);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }, 10);
    }

    /**
     * Insert collapsible toggle block
     */
    function insertToggle() {
        const selection = window.getSelection();
        const text = selection.toString().trim() || 'Toggle heading';
        
        const toggleHTML = `<div class="tm-toggle" data-open="true"><div class="tm-toggle-header"><span class="tm-toggle-icon">▶</span><span class="tm-toggle-title">${text}</span></div><div class="tm-toggle-content">Click here to add content...</div></div><p><br></p>`;
        
        document.execCommand('insertHTML', false, toggleHTML);
        
        // Focus on the toggle content
        setTimeout(() => {
            const contents = document.querySelectorAll('.tm-toggle-content');
            if (contents.length > 0) {
                const lastContent = contents[contents.length - 1];
                lastContent.focus();
                // Move cursor to start
                const range = document.createRange();
                range.selectNodeContents(lastContent);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }, 10);
    }

    /**
     * Insert quote block
     */
    function insertQuote() {
        const selection = window.getSelection();
        const text = selection.toString().trim() || 'Quote text...';
        
        const quoteHTML = `<blockquote class="tm-quote">${text}</blockquote>`;
        document.execCommand('insertHTML', false, quoteHTML);
    }

    /**
     * Insert callout block
     */
    function insertCallout() {
        const selection = window.getSelection();
        const text = selection.toString().trim() || 'Callout content...';
        
        const calloutHTML = `<div class="tm-callout" data-type="info">
            <span class="tm-callout-icon">💡</span>
            <div class="tm-callout-content" contenteditable="true">${text}</div>
        </div>`;
        
        document.execCommand('insertHTML', false, calloutHTML);
    }

    /**
     * Handle clicks on interactive elements (checkbox, toggle)
     */
    function handleInteractiveElements(e) {
        // Handle checkbox click
        const checkbox = e.target.closest('.tm-checkbox');
        if (checkbox) {
            e.preventDefault();
            e.stopPropagation();
            const item = checkbox.closest('.tm-checkbox-item');
            if (item) {
                const isChecked = item.dataset.checked === 'true';
                item.dataset.checked = isChecked ? 'false' : 'true';
            }
            return;
        }

        // Handle toggle icon click
        const toggleIcon = e.target.closest('.tm-toggle-icon');
        if (toggleIcon) {
            e.preventDefault();
            e.stopPropagation();
            const toggle = toggleIcon.closest('.tm-toggle');
            if (toggle) {
                const isOpen = toggle.dataset.open === 'true';
                toggle.dataset.open = isOpen ? 'false' : 'true';
            }
            return;
        }

        // Handle toggle header click (but not on title or content)
        const toggleHeader = e.target.closest('.tm-toggle-header');
        if (toggleHeader && !e.target.closest('.tm-toggle-title')) {
            e.preventDefault();
            e.stopPropagation();
            const toggle = toggleHeader.closest('.tm-toggle');
            if (toggle) {
                const isOpen = toggle.dataset.open === 'true';
                toggle.dataset.open = isOpen ? 'false' : 'true';
            }
            return;
        }
    }

    /**
     * Handle keydown events for interactive elements (Enter key for new checkbox)
     */
    function handleInteractiveKeydown(e) {
        // Get the current selection and find parent element
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        let container = range.startContainer;
        // If it's a text node, get the parent element
        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement;
        }
        
        // Handle Enter key
        if (e.key === 'Enter' && !e.shiftKey) {
            // 1. Checkbox: Create new checkbox item
            const checkboxText = container.closest('.tm-checkbox-text');
            if (checkboxText) {
                e.preventDefault();
                e.stopPropagation();

                const content = checkboxText.textContent;
                // Check if empty
                const isEmpty = content === '' || content === '\u200B' || checkboxText.innerHTML === '<br>' || checkboxText.innerHTML === '';
                
                const currentItem = checkboxText.closest('.tm-checkbox-item');

                if (isEmpty && currentItem) {
                    // Empty: Exits list logic (convert to paragraph)
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    currentItem.parentNode.replaceChild(p, currentItem);
                    
                    // Focus p
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else if (currentItem) {
                    // Not empty: Create new item
                    const newItem = document.createElement('div');
                    newItem.className = 'tm-checkbox-item';
                    newItem.dataset.checked = 'false';
                    newItem.innerHTML = '<span class="tm-checkbox"></span><span class="tm-checkbox-text"><br></span>';
                    
                    if (currentItem.nextSibling) {
                        currentItem.parentNode.insertBefore(newItem, currentItem.nextSibling);
                    } else {
                        currentItem.parentNode.appendChild(newItem);
                    }
                    
                    // Focus on new checkbox text
                    const newText = newItem.querySelector('.tm-checkbox-text');
                    if (newText) {
                        const newRange = document.createRange();
                        newRange.setStart(newText, 0);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    }
                }
                return;
            }

            // 2. Toggle Title: Create new toggle item
            const toggleTitle = container.closest('.tm-toggle-title');
            if (toggleTitle) {
                e.preventDefault();
                e.stopPropagation();

                const content = toggleTitle.textContent;
                const isEmpty = content === '' || content === '\u200B' || toggleTitle.innerHTML === '<br>' || toggleTitle.innerHTML === '';

                const currentToggle = toggleTitle.closest('.tm-toggle');
                
                if (isEmpty && currentToggle) {
                    // Empty: Exits list logic (convert to paragraph)
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    currentToggle.parentNode.replaceChild(p, currentToggle);
                    
                    // Focus p
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else if (currentToggle) {
                    // Not empty: Create new item
                    const newToggle = document.createElement('div');
                    newToggle.className = 'tm-toggle';
                    newToggle.dataset.open = 'true';
                    newToggle.innerHTML = `<div class="tm-toggle-header"><span class="tm-toggle-icon">▶</span><span class="tm-toggle-title"><br></span></div><div class="tm-toggle-content"></div>`;
                    
                    if (currentToggle.nextSibling) {
                        currentToggle.parentNode.insertBefore(newToggle, currentToggle.nextSibling);
                    } else {
                        currentToggle.parentNode.appendChild(newToggle);
                    }

                    // Focus on new toggle title
                    const newTitle = newToggle.querySelector('.tm-toggle-title');
                    if (newTitle) {
                        const newRange = document.createRange();
                        newRange.setStart(newTitle, 0);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    }
                }
                return;
            }
        }

        // Handle Backspace
        if (e.key === 'Backspace') {
            // 1. Empty Checkbox: Remove item
            const checkboxText = container.closest('.tm-checkbox-text');
            if (checkboxText) {
                const content = checkboxText.textContent;
                // Check if empty (sometimes has <br> or hidden char)
                if (content === '' || content === '\u200B' || checkboxText.innerHTML === '<br>' || checkboxText.innerHTML === '') {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentItem = checkboxText.closest('.tm-checkbox-item');
                    const prevItem = currentItem?.previousElementSibling;
                    const prevCheckbox = prevItem?.querySelector('.tm-checkbox-text');
                    
                    if (currentItem) {
                        currentItem.remove();
                        if (prevCheckbox) {
                            // Focus and move cursor to end
                            const newRange = document.createRange();
                            newRange.selectNodeContents(prevCheckbox);
                            newRange.collapse(false);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                        }
                    }
                }
                return;
            }

            // 2. Empty Toggle Title: Remove toggle
            const toggleTitle = container.closest('.tm-toggle-title');
            if (toggleTitle) {
                const content = toggleTitle.textContent;
                if (content === '' || content === '\u200B' || toggleTitle.innerHTML === '<br>' || toggleTitle.innerHTML === '') {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentToggle = toggleTitle.closest('.tm-toggle');
                    const prevItem = currentToggle?.previousElementSibling;
                    const prevToggle = prevItem?.querySelector('.tm-toggle-title');

                    if (currentToggle) {
                        currentToggle.remove();
                        if (prevToggle) {
                            const newRange = document.createRange();
                            newRange.selectNodeContents(prevToggle);
                            newRange.collapse(false);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                        }
                    }
                }
                return;
            }
        }
    }

    /**
     * Wrap selection with tag (structure-preserving)
     */
    function wrapWithTag(tagName) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.parentElement;
        
        // Toggle: if already wrapped with this tag, unwrap
        if (parentElement && parentElement.tagName.toLowerCase() === tagName) {
            unwrapElement(parentElement);
        } else {
            const wrapper = document.createElement(tagName);
            safeWrapSelection(range, wrapper);
        }
    }

    /**
     * Safely wrap a selection without breaking DOM structure
     * Wraps per text node to avoid nesting block elements inside inline tags
     */
    function safeWrapSelection(range, wrapper) {
        if (!range || range.collapsed) return;

        try {
            // Simple case: same text node
            if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
                range.surroundContents(wrapper);
                return;
            }
        } catch (e) {
            // Continue to text-node wrapping below
        }

        // Complex selections: wrap each intersecting text node
        const textNodes = getTextNodesInRange(range);
        if (!textNodes.length) return;

        textNodes.forEach(node => {
            const nodeRange = document.createRange();
            nodeRange.selectNodeContents(node);

            if (node === range.startContainer) {
                nodeRange.setStart(node, range.startOffset);
            }
            if (node === range.endContainer) {
                nodeRange.setEnd(node, range.endOffset);
            }

            if (nodeRange.collapsed) return;

            const nodeWrapper = wrapper.cloneNode(false);
            try {
                nodeRange.surroundContents(nodeWrapper);
            } catch (e) {
                // Last-resort fallback: insert wrapper around text only
                const text = nodeRange.toString();
                if (!text) return;
                nodeRange.deleteContents();
                nodeWrapper.textContent = text;
                nodeRange.insertNode(nodeWrapper);
            }
        });
    }

    /**
     * Get all text nodes that intersect with a range
     */
    function getTextNodesInRange(range) {
        if (!range) return [];

        const root = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentNode
            : range.commonAncestorContainer;

        if (!root) return [];

        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                    return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            }
        );

        const nodes = [];
        let current = walker.nextNode();
        while (current) {
            nodes.push(current);
            current = walker.nextNode();
        }

        // Fallback for single text node ranges
        if (!nodes.length && range.startContainer.nodeType === Node.TEXT_NODE) {
            nodes.push(range.startContainer);
        }

        return nodes;
    }

    /**
     * Unwrap an element, preserving its contents
     */
    function unwrapElement(element) {
        const parent = element.parentNode;
        if (!parent) return;
        
        // Move all children out of the element
        while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        // Remove the now-empty element
        parent.removeChild(element);
        // Normalize to merge adjacent text nodes
        parent.normalize();
    }

    /**
     * Show link popup
     */
    function showLinkPopup() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        config.linkPopup.classList.add('active');
        
        let left = rect.left + (rect.width / 2) - 150;
        let top = rect.bottom + 10;

        if (left < 10) left = 10;
        if (left + 300 > window.innerWidth - 10) {
            left = window.innerWidth - 310;
        }

        config.linkPopup.style.left = `${left + window.scrollX}px`;
        config.linkPopup.style.top = `${top + window.scrollY}px`;

        const input = document.getElementById('tm-link-input');
        input.value = '';
        input.focus();
    }

    /**
     * Hide link popup
     */
    function hideLinkPopup() {
        config.linkPopup.classList.remove('active');
    }

    /**
     * Apply link
     */
    function applyLink() {
        const url = document.getElementById('tm-link-input').value.trim();
        if (url) {
            let finalUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
                finalUrl = 'https://' + url;
            }
            
            restoreSelection();
            execCommand('createLink', finalUrl);
        }
        hideLinkPopup();
    }

    /**
     * Restore saved selection
     */
    function restoreSelection() {
        if (config.currentRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(config.currentRange);
        }
    }

    /**
     * Toggle dropdown menu
     */
    function toggleDropdown(menuId) {
        const menu = document.getElementById(menuId);
        const isActive = menu.classList.contains('active');
        
        hideAllDropdowns();
        
        if (!isActive) {
            menu.classList.add('active');
            config.activeDropdown = menu;
        }
    }

    /**
     * Hide all dropdown menus
     */
    function hideAllDropdowns() {
        document.querySelectorAll('.tm-dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
        config.activeDropdown = null;
    }

    /**
     * Update active states
     */
    function updateActiveStates() {
        const boldBtn = config.toolbar.querySelector('[data-action="bold"]');
        if (boldBtn) boldBtn.classList.toggle('active', document.queryCommandState('bold'));

        const italicBtn = config.toolbar.querySelector('[data-action="italic"]');
        if (italicBtn) italicBtn.classList.toggle('active', document.queryCommandState('italic'));

        const underlineBtn = config.toolbar.querySelector('[data-action="underline"]');
        if (underlineBtn) underlineBtn.classList.toggle('active', document.queryCommandState('underline'));

        const strikeBtn = config.toolbar.querySelector('[data-action="strikethrough"]');
        if (strikeBtn) strikeBtn.classList.toggle('active', document.queryCommandState('strikeThrough'));

        // Check highlight
        const selection = window.getSelection();
        if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const parent = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
            
            const highlightBtn = config.toolbar.querySelector('.tm-highlight-btn');
            const highlightMark = parent.closest('mark[data-highlight]');
            if (highlightBtn) {
                highlightBtn.classList.toggle('active', !!highlightMark);
            }
            
            const textColorBtn = config.toolbar.querySelector('.tm-textcolor-btn');
            const textColorSpan = parent.closest('span[data-textcolor]');
            if (textColorBtn) {
                textColorBtn.classList.toggle('active', !!textColorSpan);
                const indicator = textColorBtn.querySelector('.tm-color-indicator');
                if (indicator && textColorSpan) {
                    indicator.style.backgroundColor = textColorSpan.style.color;
                } else if (indicator) {
                    indicator.style.backgroundColor = 'transparent';
                }
            }
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboardShortcuts(e) {
        if (!config.currentRange) return;

        const isCtrl = e.ctrlKey || e.metaKey;

        if (isCtrl && e.key === 'b') {
            e.preventDefault();
            restoreSelection();
            execCommand('bold');
            updateActiveStates();
        } else if (isCtrl && e.key === 'i') {
            e.preventDefault();
            restoreSelection();
            execCommand('italic');
            updateActiveStates();
        } else if (isCtrl && e.key === 'u') {
            e.preventDefault();
            restoreSelection();
            execCommand('underline');
            updateActiveStates();
        } else if (isCtrl && e.key === 'k') {
            e.preventDefault();
            showLinkPopup();
        }
    }

    /**
     * Destroy
     */
    function destroy() {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('dragstart', handleDragStart);
        document.removeEventListener('keydown', handleKeyboardShortcuts);
        document.removeEventListener('scroll', updateImageResizerPosition, true);
        window.removeEventListener('resize', updateImageResizerPosition);
        
        if (config.toolbar) config.toolbar.remove();
        if (config.linkPopup) config.linkPopup.remove();
        if (config.lunaDialog) config.lunaDialog.remove();
        if (config.imageResizer) config.imageResizer.remove();
        
        config = {
            targets: [],
            toolbar: null,
            currentRange: null,
            selectedText: '',
            activeDropdown: null,
            linkPopup: null,
            lunaDialog: null,
            onHighlight: null,
            onAskLuna: null,
            onSaveToVault: null,
            imageResizer: null,
            selectedImage: null,
            _imageResizerListenersBound: false,
            _imageResizeState: null
        };
    }

    function addTargets(selectors) {
        if (Array.isArray(selectors)) {
            config.targets = [...config.targets, ...selectors];
        } else {
            config.targets.push(selectors);
        }
    }

    function removeTargets(selectors) {
        const toRemove = Array.isArray(selectors) ? selectors : [selectors];
        config.targets = config.targets.filter(t => !toRemove.includes(t));
    }

    /**
     * Replace currently selected text with new HTML
     */
    function replaceSelection(html) {
        restoreSelection();
        if (config.currentRange) {
            document.execCommand('insertHTML', false, html);
            // Update range after insert
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                config.currentRange = selection.getRangeAt(0).cloneRange();
            }
        }
    }

    return {
        init,
        destroy,
        addTargets,
        removeTargets,
        hideToolbar,
        showToolbar,
        replaceSelection
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TMTextEditor;
}
