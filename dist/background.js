"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BackgroundEngine {
    MAX_NEURONS = 100;
    constructor() {
        this.init();
    }
    init() {
        console.log('🧠 [DeepSleep 1.0.0] Cognitive Engine Online.');
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true;
        });
    }
    async handleMessage(message, sender, sendResponse) {
        if (message.type === 'CAPTURE_THOUGHT') {
            await this.saveThought(message.ai, message.content, sender);
            sendResponse({ success: true });
        }
        else if (message.type === 'GET_RECENT_THOUGHTS') {
            const memories = await this.getMemories();
            sendResponse({ success: true, thoughts: memories });
        }
    }
    async getMemories() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['memories'], (result) => {
                const data = result;
                resolve(data.memories || []);
            });
        });
    }
    async saveThought(ai, content, sender) {
        const thoughts = await this.getMemories();
        const newThought = {
            id: crypto.randomUUID(),
            aiSource: ai,
            content: content,
            timestamp: Date.now(),
            metadata: {
                url: sender.url || '',
                title: sender.tab?.title || '',
                confidence: 1.0
            },
            color: this.getAIColor(ai)
        };
        thoughts.unshift(newThought);
        if (thoughts.length > this.MAX_NEURONS)
            thoughts.pop();
        await chrome.storage.local.set({ memories: thoughts });
        console.log(`[DeepSleep] Saved thought from ${ai}`);
    }
    getAIColor(ai) {
        const colors = {
            chatgpt: '#10b981',
            claude: '#d97706',
            gemini: '#3b82f6',
            kimi: '#8b5cf6',
            grok: '#f1f5f9'
        };
        return colors[ai] || '#64748b';
    }
}
new BackgroundEngine();
