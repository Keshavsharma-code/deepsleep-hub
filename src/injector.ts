import { CognitiveThought } from './types.js';

class CognitiveInjector {
    private PLATFORM_SELECTORS = {
        chatgpt: '#prompt-textarea, [data-testid="chatgpt-prompt-textarea"]',
        claude: 'div[contenteditable="true"][aria-label*="Claude"]',
        kimi: '.chat-input-editor[role="textbox"]',
        generic: '[role="textbox"], textarea'
    };

    private root: HTMLElement | null = null;
    private shadow: ShadowRoot | null = null;

    constructor() {
        this.init();
    }

    private init() {
        if (document.getElementById('deepsleep-root')) return;

        this.root = document.createElement('div');
        this.root.id = 'deepsleep-root';
        document.documentElement.prepend(this.root);

        this.shadow = this.root.attachShadow({ mode: 'open' });
        this.injectStyles();
        this.setupGuardian();
        
        setTimeout(() => this.adaptiveRecall(), 2000);
    }

    private injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :host { --ds-primary: #3b82f6; }
            .ds-handshake {
                position: fixed; top: 10px; right: 10px; width: 4px; height: 4px;
                background: var(--ds-primary); border-radius: 50%;
                box-shadow: 0 0 10px var(--ds-primary); z-index: 2147483647;
                transition: all 0.5s;
            }
            .ds-handshake.active { transform: scale(3); opacity: 0.8; }
        `;
        this.shadow?.appendChild(style);
    }

    private setupGuardian() {
        new MutationObserver(() => {
            if (!document.getElementById('deepsleep-root')) this.init();
        }).observe(document.documentElement, { childList: true });
    }

    private adaptiveRecall() {
        chrome.runtime.sendMessage({ type: 'GET_RECENT_THOUGHTS' }, (response) => {
            if (response?.success && response.thoughts?.length > 0) {
                const thought = response.thoughts[0];
                this.autoInject(thought);
            }
        });
    }

    private autoInject(thought: CognitiveThought) {
        let target = null;
        for (const selector of Object.values(this.PLATFORM_SELECTORS)) {
            target = document.querySelector(selector) as HTMLElement;
            if (target) break;
        }

        if (target && target.innerText.trim() === "") {
            console.log('🤖 [DeepSleep] Adaptive Recall: Automatically bridging context...');
            const payload = `[DeepSleep Adaptive Recall from ${thought.aiSource.toUpperCase()}]\n${thought.content}\n---\n`;
            
            target.focus();
            
            // Visual Handshake
            const handshake = document.createElement('div');
            handshake.className = 'ds-handshake active';
            this.shadow?.appendChild(handshake);
            
            document.execCommand('insertText', false, payload);
            
            target.style.outline = '2px solid var(--ds-primary)';
            setTimeout(() => {
                target.style.outline = 'none';
                handshake.remove();
            }, 2000);
        }
    }
}

new CognitiveInjector();
