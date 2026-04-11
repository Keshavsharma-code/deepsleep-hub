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

    function injectContext(thought) {
        // Find AI input areas
        const textareas = [
            document.querySelector('#prompt-textarea'), // ChatGPT
            document.querySelector('[contenteditable="true"]'), // General LLMs
            document.querySelector('textarea.m-0') // Generic fallback
        ];

        const target = textareas.find(t => t !== null);
        if (target) {
            const contextText = `\n\n[DeepSleep Memory | Source: ${thought.aiSource.toUpperCase()}]\nContext: ${thought.name}\n\n`;
            
            if (target.tagName === 'TEXTAREA') {
                const start = target.selectionStart;
                const end = target.selectionEnd;
                target.value = target.value.substring(0, start) + contextText + target.value.substring(end);
                target.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                // For contenteditable
                target.focus();
                document.execCommand('insertText', false, contextText);
            }
            
            // Visual feedback
            const overlay = document.querySelector('.deepsleep-overlay');
            overlay.classList.remove('active');
            
            console.log('[DeepSleep] Context injected successfully.');
        } else {
            console.warn('[DeepSleep] No chat input found for injection.');
            // Fallback to clipboard if injection fails
            const text = `[DeepSleep Memory | Source: ${thought.aiSource.toUpperCase()}]\nContext: ${thought.name}`;
            navigator.clipboard.writeText(text);
            alert('Could not find input box. Context copied to clipboard instead!');
        }
    }

    // Wait for page to settle
    setTimeout(createUI, 2000);
})();
