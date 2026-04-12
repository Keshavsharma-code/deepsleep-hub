"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CognitiveInjector {
    PLATFORM_SELECTORS = {
        chatgpt: '#prompt-textarea, [data-testid="chatgpt-prompt-textarea"]',
        claude: 'div[contenteditable="true"][aria-label*="Claude"]',
        kimi: '.chat-input-editor[role="textbox"]',
        generic: '[role="textbox"], textarea'
    };
    root = null;
    shadow = null;
    constructor() {
        this.init();
    }
    init() {
        if (document.getElementById('deepsleep-root'))
            return;
        this.root = document.createElement('div');
        this.root.id = 'deepsleep-root';
        document.documentElement.prepend(this.root);
        this.shadow = this.root.attachShadow({ mode: 'open' });
        this.injectStyles();
        this.setupGuardian();
        setTimeout(() => this.adaptiveRecall(), 2000);
    }
    injectStyles() {
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
    setupGuardian() {
        new MutationObserver(() => {
            if (!document.getElementById('deepsleep-root'))
                this.init();
        }).observe(document.documentElement, { childList: true });
    }
    adaptiveRecall() {
        chrome.runtime.sendMessage({ type: 'GET_RECENT_THOUGHTS' }, (response) => {
            if (response?.success && response.thoughts?.length > 0) {
                const thought = response.thoughts[0];
                this.autoInject(thought);
            }
        });
    }
    autoInject(thought) {
        let target = null;
        for (const selector of Object.values(this.PLATFORM_SELECTORS)) {
            target = document.querySelector(selector);
            if (target)
                break;
        }
        const payload = `[DeepSleep Adaptive Recall from ${thought.aiSource.toUpperCase()}]\n${thought.content}\n---\n`;
        if (target && (target.innerText.trim() === "" || target.tagName === 'TEXTAREA')) {
            console.log('🤖 [DeepSleep] Adaptive Recall: Automatically bridging context...');
            target.focus();
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
        else {
            this.copyToBridge(payload);
        }
    }
    copyToBridge(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('📋 [DeepSleep] Context copied to clipboard for manual bridge.');
            this.showToast('HANDSHAKE READY: Paste into chat (Ctrl+V)');
        });
    }
    showToast(msg) {
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
