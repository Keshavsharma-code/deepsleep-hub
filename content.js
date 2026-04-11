/* content.js - DeepSleep Gold Scraper & Injector (v3.0) */

(function() {
    console.log('🧠 DeepSleep Scraper Active.');

    // 1. SELECTORS & CONFIG
    const SELECTORS = {
        'chatgpt.com': '[data-message-author-role="assistant"] .markdown, [data-testid="conversation-turn-2"]',
        'claude.ai': '.font-claude-message, .ProseMirror',
        'gemini.google.com': '.response-content, .model-response',
        'kimi.moonshot.cn': '.markdown'
    };

    const INPUT_SELECTORS = [
        '#prompt-textarea',
        '[contenteditable="true"]',
        'textarea'
    ];

    // 2. UI: FLOATING BRAIN WIDGET
    function createWidget() {
        if (document.getElementById('ds-widget')) return;
        
        const widget = document.createElement('div');
        widget.id = 'ds-widget';
        widget.style = `
            position: fixed; bottom: 20px; right: 20px; 
            width: 50px; height: 50px; background: #000; 
            border: 2px solid #10b981; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            cursor: pointer; z-index: 999999; font-size: 24px;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
            user-select: none; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        widget.innerHTML = '🧠';
        widget.title = 'DeepSleep Neural Recall';

        widget.onclick = (e) => {
            e.stopPropagation();
            showOverlay();
        };

        document.body.appendChild(widget);
    }

    // 3. UI: RECALL OVERLAY
    function showOverlay() {
        let overlay = document.getElementById('ds-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'ds-overlay';
            overlay.style = `
                position: fixed; bottom: 80px; right: 20px; 
                width: 350px; max-height: 500px; background: #0a0a0e; 
                border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
                display: flex; flex-direction: column; padding: 15px; 
                z-index: 1000000; box-shadow: 0 10px 40px rgba(0,0,0,0.8);
                font-family: 'SF Mono', 'Courier New', monospace; color: white;
            `;
            document.body.appendChild(overlay);
        }

        overlay.style.display = 'flex';
        renderMemories(overlay);
    }

    function renderMemories(overlay) {
        overlay.innerHTML = '<div style="font-size: 11px; color:#64748b; margin-bottom: 10px; text-transform:uppercase; letter-spacing:1px;">Recent Neural Memories</div>';
        
        chrome.runtime.sendMessage({ type: 'GET_MEMORIES' }, (response) => {
            if (response && response.memories && response.memories.length > 0) {
                response.memories.slice(0, 5).forEach(m => {
                    const item = document.createElement('div');
                    item.style = 'background:rgba(255,255,255,0.05); padding:10px; border-radius:6px; margin-bottom:8px; cursor:pointer; font-size:12px; border-left:3px solid #10b981;';
                    item.innerHTML = `<strong>${m.source.toUpperCase()}</strong>: ${m.text.substring(0, 100)}...`;
                    item.onclick = () => injectMemory(m);
                    overlay.appendChild(item);
                });
            } else {
                overlay.innerHTML += '<div style="color:#64748b; font-size:11px;">No memories captured yet. Start chatting.</div>';
            }
            
            const close = document.createElement('div');
            close.innerHTML = 'CLOSE';
            close.style = 'text-align:center; font-size:9px; margin-top:10px; cursor:pointer; color:#ef4444;';
            close.onclick = () => overlay.style.display = 'none';
            overlay.appendChild(close);
        });
    }

    // 4. INJECTION LOGIC
    function injectMemory(memory) {
        const target = INPUT_SELECTORS.map(s => document.querySelector(s)).find(el => el !== null);
        if (target) {
            const context = `[DeepSleep Recall: ${memory.source}]\nContext: ${memory.text}\n---\n`;
            target.focus();
            document.execCommand('insertText', false, context);
            document.getElementById('ds-overlay').style.display = 'none';
            
            // Visual feedback on widget
            const widget = document.getElementById('ds-widget');
            widget.style.borderColor = '#3b82f6';
            setTimeout(() => widget.style.borderColor = '#10b981', 1000);
        }
    }

    // 5. SCRAPING LOGIC (MutationObserver)
    const observer = new MutationObserver((mutations) => {
        const host = window.location.host.replace('www.', '');
        const selector = SELECTORS[host];
        if (!selector) return;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && (node.matches(selector) || node.querySelector(selector))) {
                    const text = (node.matches(selector) ? node : node.querySelector(selector)).innerText;
                    if (text && text.length > 20) {
                        chrome.runtime.sendMessage({
                            type: 'CAPTURE',
                            text: text,
                            source: host.includes('chatgpt') ? 'chatgpt' : 
                                    host.includes('claude') ? 'claude' : 
                                    host.includes('gemini') ? 'gemini' : 'kimi',
                            timestamp: Date.now()
                        });
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 6. INITIALIZATION
    setTimeout(createWidget, 2000);
})();
