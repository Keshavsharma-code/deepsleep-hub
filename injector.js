/* injector.js - Neural Context Injector for DeepSleep Hub */

(function() {
    console.log('🧠 DeepSleep Neural Injector Initializing...');

    function createUI() {
        const trigger = document.createElement('div');
        trigger.className = 'deepsleep-injector-trigger';
        trigger.innerHTML = '<span class="deepsleep-injector-icon">🧠</span>';
        trigger.title = 'DeepSleep Neural Injection';

        const overlay = document.createElement('div');
        overlay.className = 'deepsleep-overlay';
        overlay.innerHTML = `
            <div class="deepsleep-header">
                <span>Recent Neural Memories</span>
                <span style="cursor:pointer" id="ds-close">×</span>
            </div>
            <div class="deepsleep-memory-list" id="ds-memory-list">
                <div style="font-size: 11px; color: #64748b; padding: 10px;">Awaiting capture...</div>
            </div>
            <div style="font-size: 9px; color: #475569; text-align: center; margin-top: 8px;">
                Click to inject into chat
            </div>
        `;

        document.body.appendChild(trigger);
        document.body.appendChild(overlay);

        trigger.onclick = (e) => {
            e.stopPropagation();
            overlay.classList.toggle('active');
            if (overlay.classList.contains('active')) {
                loadMemories();
            }
        };

        overlay.onclick = (e) => e.stopPropagation();
        
        const closeBtn = document.getElementById('ds-close');
        if (closeBtn) closeBtn.onclick = () => overlay.classList.remove('active');

        window.onclick = () => overlay.classList.remove('active');
        
        // Autorecall: Check for new chat and inject context automatically
        setTimeout(autoRecall, 1000);
    }

    async function autoRecall() {
        const isNewChat = window.location.href.includes('new') || 
                         window.location.pathname === '/' || 
                         document.querySelectorAll('[data-message-author-role]').length === 0;
        
        if (isNewChat) {
            console.log('🧠 DeepSleep: New session detected. Initiating Autorecall...');
            chrome.runtime.sendMessage({ type: 'GET_RECENT_THOUGHTS' }, (response) => {
                if (response && response.success && response.thoughts.length > 0) {
                    const topThought = response.thoughts[0];
                    const banner = document.createElement('div');
                    banner.style = 'background: #1e1b4b; color: #818cf8; padding: 8px; font-size: 10px; text-align: center; border-bottom: 1px solid #312e81; font-family: monospace; letter-spacing: 1px;';
                    banner.innerHTML = `NEURAL SYNC ACTIVE: RECALLED ${topThought.aiSource.toUpperCase()} CONTEXT`;
                    document.body.prepend(banner);
                    
                    // Delay injection to ensure textarea is ready
                    setTimeout(() => injectContext(topThought, true), 1000);
                }
            });
        }
    }

    async function loadMemories() {
        const list = document.getElementById('ds-memory-list');
        chrome.runtime.sendMessage({ type: 'GET_RECENT_THOUGHTS' }, (response) => {
            if (response && response.success && response.thoughts.length > 0) {
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
                list.innerHTML = '<div style="font-size: 11px; color: #64748b; padding: 10px;">No memories found yet.</div>';
            }
        });
    }

    function injectContext(thought, isAuto = false) {
        const textareas = [
            document.querySelector('#prompt-textarea'),
            document.querySelector('[contenteditable="true"]'),
            document.querySelector('textarea.m-0')
        ];

        const target = textareas.find(t => t !== null);
        if (target) {
            const contextText = isAuto ? 
                `[Neural Autorecall Enabled | Perspective: Previous ${thought.aiSource.toUpperCase()} Session]\nContext: ${thought.name}\n---\n` :
                `\n\n[DeepSleep Memory | Source: ${thought.aiSource.toUpperCase()}]\nContext: ${thought.name}\n\n`;
            
            if (target.tagName === 'TEXTAREA') {
                target.value = contextText + target.value;
                target.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                target.focus();
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(target);
                range.collapse(true); // Start of box
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('insertText', false, contextText);
            }
            
            if (!isAuto) {
                const overlay = document.querySelector('.deepsleep-overlay');
                overlay.classList.remove('active');
            }
            console.log('[DeepSleep] Context injected.');
        }
    }

    // Wait for page to settle
    setTimeout(createUI, 2000);
})();
