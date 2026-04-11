/* injector.js - Neural Context Injector v2.5 (Force Sync Edition) */

(function() {
    const DS_VERSION = 'v2.5.0-force-sync';
    console.log(`🧠 [DeepSleep ${DS_VERSION}] Initializing Industrial Injector...`);

    const PLATFORM_SELECTORS = {
        chatgpt: '#prompt-textarea',
        claude: 'div[contenteditable="true"][aria-label*="Claude"], .ProseMirror',
        gemini: 'div[contenteditable="true"][aria-label*="Gemini"], .ql-editor',
        kimi: 'div[contenteditable="true"], .input-box textarea',
        generic: '[contenteditable="true"], textarea'
    };

    function createUI() {
        if (document.getElementById('deepsleep-injector-trigger')) return;

        const trigger = document.createElement('div');
        trigger.id = 'deepsleep-injector-trigger';
        trigger.className = 'deepsleep-injector-trigger';
        trigger.innerHTML = '<span class="deepsleep-injector-icon">🧠</span>';
        
        const overlay = document.createElement('div');
        overlay.className = 'deepsleep-overlay';
        overlay.innerHTML = `
            <div class="deepsleep-header">
                <span>RECALLED MEMORIES</span>
                <span style="cursor:pointer; font-size: 16px;" id="ds-close">×</span>
            </div>
            <div class="deepsleep-memory-list" id="ds-memory-list">
                <div style="font-size: 11px; color: #64748b; padding: 10px;">DeepSleep Hub 2.5: Searching Neurons...</div>
            </div>
        `;

        document.body.appendChild(trigger);
        document.body.appendChild(overlay);

        trigger.onclick = (e) => {
            e.stopPropagation();
            overlay.classList.toggle('active');
            if (overlay.classList.contains('active')) loadMemories();
        };

        const closeBtn = document.getElementById('ds-close');
        if (closeBtn) closeBtn.onclick = () => overlay.classList.remove('active');
        window.onclick = () => overlay.classList.remove('active');
        overlay.onclick = (e) => e.stopPropagation();

        // Initial Autorecall Attempt
        setTimeout(autoRecall, 2500);
    }

    async function autoRecall() {
        const hasMessages = document.querySelectorAll('[data-message-author-role]').length > 0;
        if (hasMessages) return; // Only for fresh sessions

        chrome.runtime.sendMessage({ type: 'GET_RECENT_THOUGHTS' }, (response) => {
            if (response && response.success && response.thoughts && response.thoughts.length > 0) {
                const thought = response.thoughts[0];
                showBanner(thought);
            }
        });
    }

    function showBanner(thought) {
        if (document.getElementById('ds-sync-banner')) return;
        
        const banner = document.createElement('div');
        banner.id = 'ds-sync-banner';
        banner.style = 'background: #0f172a; border-bottom: 2px solid #3b82f6; padding: 12px; position: fixed; top: 0; left: 0; width: 100%; z-index: 10002; display: flex; align-items: center; justify-content: space-between; font-family: "SF Mono", monospace; box-shadow: 0 4px 20px rgba(0,0,0,0.5);';
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="animation: ds-pulse 2s infinite">📡</span>
                <span style="color: #60a5fa; font-size: 11px; font-weight: 800; letter-spacing: 1px;">DEEPSLEEP NEURAL SYNC ACTIVE [v2.5]</span>
                <span style="color: #94a3b8; font-size: 10px;">Detected: ${thought.aiSource.toUpperCase()}</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="ds-force-sync" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 10px; font-weight: 700; cursor: pointer;">FORCE SYNC BRAIN ⚡</button>
                <button id="ds-hide-banner" style="background: transparent; color: #64748b; border: 1px solid #334155; padding: 6px; border-radius: 4px; font-size: 10px; cursor: pointer;">×</button>
            </div>
            <style>
                @keyframes ds-pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
            </style>
        `;
        document.body.prepend(banner);

        document.getElementById('ds-force-sync').onclick = () => injectContext(thought, true);
        document.getElementById('ds-hide-banner').onclick = () => banner.remove();
    }

    async function loadMemories() {
        const list = document.getElementById('ds-memory-list');
        chrome.runtime.sendMessage({ type: 'GET_RECENT_THOUGHTS' }, (response) => {
            if (response && response.success && response.thoughts && response.thoughts.length > 0) {
                list.innerHTML = '';
                response.thoughts.forEach(thought => {
                    const item = document.createElement('div');
                    item.className = 'deepsleep-memory-item';
                    item.style.borderLeftColor = thought.color || '#3b82f6';
                    item.innerHTML = `
                        <div class="ds-ai-tag" style="color: ${thought.color}">${thought.aiSource.toUpperCase()}</div>
                        <div class="ds-content">${thought.name}</div>
                    `;
                    item.onclick = () => injectContext(thought);
                    list.appendChild(item);
                });
            } else {
                list.innerHTML = '<div style="font-size: 11px; color: #64748b; padding: 10px;">Neural Cache Empty. Start chatting!</div>';
            }
        });
    }

    function injectContext(thought, isAuto = false) {
        let target = null;
        for (let key in PLATFORM_SELECTORS) {
            target = document.querySelector(PLATFORM_SELECTORS[key]);
            if (target) break;
        }

        if (target) {
            const contextText = `[DeepSleep Recall: Shared Perspective from ${thought.aiSource.toUpperCase()}]\nContext Data: ${thought.name}\n---\n`;
            
            target.focus();
            
            if (target.tagName === 'TEXTAREA') {
                const start = target.value.startsWith('[DeepSleep') ? 0 : target.value.length;
                target.value = contextText + target.value;
                target.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                // High-Reliability contenteditable injection
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(target);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('insertText', false, contextText);
                
                // Trigger React/Next.js state updates
                target.dispatchEvent(new Event('input', { bubbles: true }));
                target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: contextText }));
            }

            if (isAuto) {
                const btn = document.getElementById('ds-force-sync');
                if (btn) {
                    btn.innerText = 'NEURONS BRIDGED ✨';
                    btn.style.background = '#10b981';
                }
            } else {
                document.querySelector('.deepsleep-overlay').classList.remove('active');
            }
            console.log(`🧠 [DeepSleep] ${thought.aiSource} context injected successfully.`);
        } else {
            console.error('🧠 [DeepSleep] ERROR: Could not locate chat input box.');
        }
    }

    setTimeout(createUI, 3000);
})();
