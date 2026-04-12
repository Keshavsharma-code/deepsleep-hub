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
        this.createWidget();
        this.setupGuardian();
        
        setTimeout(() => this.adaptiveRecall(), 2000);
        console.log('🦾 [DeepSleep] Industrial Injector Online.');
    }

    private createWidget() {
        const widget = document.createElement('div');
        widget.id = 'ds-widget';
        widget.className = 'ds-brain-widget';
        widget.innerHTML = '🧠';
        widget.onclick = () => this.adaptiveRecall();
        this.shadow?.appendChild(widget);
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
            .ds-brain-widget {
                position: fixed; bottom: 20px; right: 20px; width: 44px; height: 44px;
                background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 20px; cursor: pointer; z-index: 2147483647;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                user-select: none;
            }
            .ds-brain-widget:hover { transform: scale(1.1) rotate(5deg); border-color: var(--ds-primary); }
            @keyframes dsPulse { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
            .ds-pulse { animation: dsPulse 2s infinite; }
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

        const payload = `[DeepSleep Adaptive Recall from ${thought.aiSource.toUpperCase()}]\n${thought.content}\n---\n`;

        if (target && (target.innerText.trim() === "" || target.tagName === 'TEXTAREA')) {
            console.log('🤖 [DeepSleep] Adaptive Recall: Automatically bridging context...');
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
        } else {
            // Clipboard Fallback
            this.copyToBridge(payload);
        }
    }

    private copyToBridge(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('📋 [DeepSleep] Context copied to clipboard for manual bridge.');
            this.showToast('HANDSHAKE READY: Paste into chat (Ctrl+V)');
        });
    }

    private showToast(msg: string) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            background: #10b981; color: white; padding: 12px 24px; border-radius: 8px;
            font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 800;
            z-index: 2147483647; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            animation: dsFadeUp 0.3s ease-out;
        `;
        toast.innerText = msg;
        this.shadow?.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
}

new CognitiveInjector();
