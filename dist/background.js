"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("./adapters/index.js");
const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
class BackgroundEngine {
    MAX_NEURONS = 100;
    adapters = [
        new index_js_1.ChatGPTAdapter(),
        new index_js_1.ClaudeAdapter(),
        new index_js_1.KimiAdapter()
    ];
    embedder = null;
    constructor() {
        this.init();
    }
    async init() {
        console.log('🧠 [DeepSleep 1.0.0] Cognitive Engine Online.');
        this.initEmbedder();
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true;
        });
    }
    async initEmbedder() {
        try {
            const { pipeline, env } = await import(TRANSFORMERS_CDN);
            env.allowLocalModels = false;
            this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log('🚀 [DeepSleep] Semantic Engine Primed.');
        }
        catch (e) {
            console.error('❌ [DeepSleep] Failed to load Semantic Engine:', e);
        }
    }
    async handleMessage(message, sender, sendResponse) {
        if (message.type === 'CAPTURE_THOUGHT') {
            await this.saveThought(message.ai, message.content, sender);
            sendResponse({ success: true });
        }
        else if (message.type === 'API_DATA_CAPTURED') {
            await this.processApiCapture(message.url, message.payload, sender);
            sendResponse({ success: true });
        }
        else if (message.type === 'GET_RECENT_THOUGHTS') {
            const memories = await this.getMemories();
            sendResponse({ success: true, thoughts: memories });
        }
    }
    async processApiCapture(url, payload, sender) {
        let content = null;
        let ai = 'unknown';
        for (const adapter of this.adapters) {
            if (url.includes(adapter.name)) {
                ai = adapter.name;
                content = adapter.extractConversation(payload);
                break;
            }
        }
        if (content && content.length > 30) {
            await this.saveThought(ai, content, sender, payload);
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
    async saveThought(ai, content, sender, rawJson = null) {
        const thoughts = await this.getMemories();
        let vector = undefined;
        if (this.embedder) {
            const output = await this.embedder(content, { pooling: 'mean', normalize: true });
            vector = Array.from(output.data);
        }
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
            color: this.getAIColor(ai),
            rawJson: rawJson,
            vector: vector
        };
        thoughts.unshift(newThought);
        if (thoughts.length > this.MAX_NEURONS)
            thoughts.pop();
        await chrome.storage.local.set({ memories: thoughts });
        console.log(`[DeepSleep] Saved semantic thought from ${ai}`);
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
