/* injector.js - DeepSleep Neural Injector v7.0 (INDUSTRIAL SHADOW BUILD) */

(function() {
    const DS_VERSION = 'v7.0.0-industrial';
    console.log(`🧠 [DeepSleep ${DS_VERSION}] Initializing Shadow DOM Guardian...`);

    const PLATFORM_SELECTORS = {
        chatgpt:    '#prompt-textarea, [data-testid="chatgpt-prompt-textarea"], textarea[placeholder*="ChatGPT"]',
        claude:     'div[contenteditable="true"].ProseMirror, [aria-label*="Write your prompt"], .ProseMirror[contenteditable="true"]',
        gemini:     'div[contenteditable="true"][aria-label*="Enter a prompt"], .ql-editor, rich-textarea div[contenteditable="true"]',
        grok:       'textarea[aria-label*="Ask"], textarea[placeholder*="Ask"], .public-DraftEditor-content[contenteditable="true"]',
        deepseek:   '#chat-input, textarea[placeholder*="Send"], div[contenteditable="true"][data-placeholder*="Send"]',
        perplexity: 'textarea[placeholder*="Ask"], textarea[aria-label*="Ask"], div[contenteditable="true"][aria-label*="Ask"]',
        kimi:       'div[contenteditable="true"][class*="editor"], textarea[class*="input"], .chat-input-editor',
        local:      '[role="textbox"], textarea.textarea, .chat-input textarea',
        generic:    '[role="textbox"], [contenteditable="true"]:not([class*="message"]):not([class*="response"]), textarea'
    };

    class DeepSleepShadow {
        constructor() {
            this.root = null;
            this.shadow = null;
            this.init();
        }

        init() {
            if (document.getElementById('deepsleep-root')) return;

            this.root = document.createElement('div');
            this.root.id = 'deepsleep-root';
            // Prepend to documentElement to avoid body re-renders
            document.documentElement.prepend(this.root);

            this.shadow = this.root.attachShadow({ mode: 'open' });
            this.injectStyles();
            this.createUI();
            this.setupGuardian();
            
            // Initial Auto-Recall
            setTimeout(() => this.autoRecall(), 2500);
        }

        injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
                
                :host {
                    --ds-primary: #3b82f6;
                    --ds-bg: #030712;
                    --ds-card: rgba(15, 23, 42, 0.95);
                }

                .ds-banner {
                    position: fixed; top: 0; left: 0; width: 100%; height: 50px;
                    background: rgba(3, 7, 18, 0.95); backdrop-filter: blur(10px);
                    color: white; z-index: 2147483647; display: flex;
                    align-items: center; justify-content: space-between; padding: 0 24px;
                    font-family: 'Inter', sans-serif; box-shadow: 0 4px 30px rgba(0,0,0,0.5);
                    border-bottom: 2px solid var(--ds-primary); transition: all 0.3s ease;
                }

                .ds-btn-sync {
                    background: linear-gradient(135deg, var(--ds-primary), #2563eb);
                    color: white; border: none; padding: 8px 16px; border-radius: 6px;
                    font-size: 11px; font-weight: 800; cursor: pointer;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); transition: all 0.2s;
                }
                .ds-btn-sync:hover { transform: scale(1.05); filter: brightness(1.1); }

                .ds-trigger {
                    position: fixed; bottom: 80px; right: 20px;
                    width: 48px; height: 48px; background: var(--ds-bg);
                    border: 2px solid rgba(59, 130, 246, 0.5); border-radius: 50%;
                    cursor: pointer; z-index: 10000; display: flex;
                    align-items: center; justify-content: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5), 0 0 10px rgba(59, 130, 246, 0.3);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .ds-trigger:hover { transform: scale(1.1); border-color: var(--ds-primary); }

                .ds-overlay {
                    position: fixed; bottom: 140px; right: 20px; width: 320px;
                    background: var(--ds-card); border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px; padding: 16px; z-index: 10001;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.8); backdrop-filter: blur(10px);
                    display: none; flex-direction: column; gap: 12px;
                    font-family: 'Inter', sans-serif;
                }
                .ds-overlay.active { display: flex; }
                
                .ds-memory-item {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 6px; padding: 10px; cursor: pointer;
                    transition: all 0.2s; border-left: 3px solid var(--ds-primary);
                    font-size: 12px; color: #e2e8f0;
                }
                .ds-memory-item:hover { background: rgba(255,255,255,0.08); transform: translateX(4px); }
            `;
            this.shadow.appendChild(style);
        }

        createUI() {
            const container = document.createElement('div');
            container.id = 'ds-container';
            
            // Floating Widget
            const trigger = document.createElement('div');
            trigger.className = 'ds-trigger';
            trigger.innerHTML = `<span style="font-size: 24px;">🧠</span>`;
            trigger.onclick = () => {
                const overlay = this.shadow.querySelector('.ds-overlay');
                overlay.classList.toggle('active');
                if (overlay.classList.contains('active')) this.loadMemories();
            };

            // Recalled Memories Overlay
            const overlay = document.createElement('div');
            overlay.className = 'ds-overlay';
            overlay.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="font-size:11px; font-weight:800; color:#94a3b8;">NEURAL OVERVIEW</span>
                    <span style="cursor:pointer;" id="ds-close-overlay">×</span>
                </div>
                <div id="ds-memory-list" style="display:flex; flex-direction:column; gap:8px;"></div>
            `;

            container.appendChild(trigger);
            container.appendChild(overlay);
            this.shadow.appendChild(container);

            this.shadow.getElementById('ds-close-overlay').onclick = () => overlay.classList.remove('active');
        }

        setupGuardian() {
            const observer = new MutationObserver((mutations) => {
                if (!document.getElementById('deepsleep-root')) {
                    console.log('🚨 [DeepSleep] Node removed by platform. Re-injecting Shadow Guardian...');
                    this.init();
                }
            });
            observer.observe(document.documentElement, { childList: true });
        }

        async autoRecall() {
            const isNewChat = document.querySelectorAll(
              '[data-message-author-role], .message, .chat-line, ' +
              '.ds-message-content, [class*="message-content"], [class*="chat-message"]'
            ).length === 0;
            if (isNewChat) {
                chrome.runtime.sendMessage({ type: 'GET_RECENT_THOUGHTS' }, (response) => {
                    if (response?.success && response.thoughts?.[0]) {
                        this.showBanner(response.thoughts[0]);
                    }
                });
            }
        }

        showBanner(thought) {
            if (this.shadow.getElementById('ds-sync-banner')) return;
            
            const banner = document.createElement('div');
            banner.id = 'ds-sync-banner';
            banner.className = 'ds-banner';
            banner.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 20px;">🧠</span>
                    <div>
                        <div style="font-size: 11px; font-weight: 800; color: #3b82f6;">DEEPSLEEP SYNC</div>
                        <div style="font-size: 10px; color: #94a3b8;">Bridge from ${thought.aiSource.toUpperCase()}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="ds-btn-sync" id="ds-force-sync">FORCE SYNC BRAIN ⚡</button>
                    <div style="cursor:pointer; font-size:20px;" id="ds-close-banner">×</div>
                </div>
            `;
            
            this.shadow.querySelector('#ds-container').appendChild(banner);
            this.shadow.getElementById('ds-force-sync').onclick = () => this.injectContext(thought, true);
            this.shadow.getElementById('ds-close-banner').onclick = () => banner.remove();
        }

        async loadMemories() {
            const list = this.shadow.getElementById('ds-memory-list');
            chrome.runtime.sendMessage({ type: 'GET_RECENT_THOUGHTS' }, (response) => {
                if (response?.success && response.thoughts?.length > 0) {
                    list.innerHTML = '';
                    response.thoughts.forEach(thought => {
                        const item = document.createElement('div');
                        item.className = 'ds-memory-item';
                        item.innerHTML = `<strong>${thought.aiSource.toUpperCase()}</strong>: ${thought.name}`;
                        item.onclick = () => this.injectContext(thought);
                        list.appendChild(item);
                    });
                }
            });
        }

        injectContext(thought, isAuto = false) {
            let target = null;
            for (let key in PLATFORM_SELECTORS) {
                target = document.querySelector(PLATFORM_SELECTORS[key]);
                if (target) break;
            }

            if (target) {
                const contextText = `[DeepSleep Recall: Shared Perspective from ${thought.aiSource.toUpperCase()}]\nContext Data: ${thought.name}\n---\n`;
                target.focus();

                const setValue = (el, value) => {
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                    if (!setter && el.tagName !== 'TEXTAREA') {
                        document.execCommand('insertText', false, value);
                    } else {
                        setter.call(el, value);
                    }
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                };

                if (target.tagName === 'TEXTAREA') {
                    setValue(target, contextText + target.value);
                } else {
                    document.execCommand('insertText', false, contextText);
                }

                target.style.outline = '2px solid #3b82f6';
                setTimeout(() => target.style.outline = 'none', 1000);
                
                if (isAuto) {
                    const btn = this.shadow.getElementById('ds-force-sync');
                    if (btn) {
                        btn.innerText = 'NEURONS BRIDGED ✨';
                        btn.style.background = '#10b981';
                    }
                }
            }
        }
    }

    // Launch Guardian
    new DeepSleepShadow();
})();
