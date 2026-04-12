import { CognitiveThought } from './types.js';
import { ChatGPTAdapter, ClaudeAdapter, KimiAdapter, IPlatformAdapter } from './adapters/index.js';

// Note: In a real extension build, we would use a bundler for transformers.js
// For now, we assume it's available in the lib/ or dist/ context
const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

class BackgroundEngine {
    private MAX_NEURONS = 100;
    private adapters: IPlatformAdapter[] = [
        new ChatGPTAdapter(),
        new ClaudeAdapter(),
        new KimiAdapter()
    ];
    private embedder: any = null;

    constructor() {
        this.init();
    }

    private async init() {
        console.log('🧠 [DeepSleep 1.0.0] Cognitive Engine Online.');
        
        // Initialize Semantic Engine Lazy
        this.initEmbedder();

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true;
        });
    }

    private async initEmbedder() {
        try {
            // @ts-ignore - Loading from CDN dynamically if not bundled
            const { pipeline, env } = await import(TRANSFORMERS_CDN);
            env.allowLocalModels = false;
            this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log('🚀 [DeepSleep] Semantic Engine Primed.');
        } catch (e) {
            console.error('❌ [DeepSleep] Failed to load Semantic Engine:', e);
        }
    }

    private async handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (res?: any) => void) {
        if (message.type === 'CAPTURE_THOUGHT') {
            await this.saveThought(message.ai, message.content, sender);
            sendResponse({ success: true });
        } else if (message.type === 'API_DATA_CAPTURED') {
            await this.processApiCapture(message.url, message.payload, sender);
            sendResponse({ success: true });
        } else if (message.type === 'GET_RECENT_THOUGHTS') {
            const memories = await this.getMemories();
            sendResponse({ success: true, thoughts: memories });
        }
    }

    private async processApiCapture(url: string, payload: any, sender: chrome.runtime.MessageSender) {
        let content = null;
        let ai: any = 'unknown';

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

    private async getMemories(): Promise<CognitiveThought[]> {
        return new Promise((resolve) => {
            chrome.storage.local.get(['memories'], (result) => {
                const data = result as { memories?: CognitiveThought[] };
                resolve(data.memories || []);
            });
        });
    }

    private async saveThought(ai: any, content: string, sender: chrome.runtime.MessageSender, rawJson: any = null) {
        const thoughts = await this.getMemories();
        
        let vector: number[] | undefined = undefined;
        if (this.embedder) {
            const output = await this.embedder(content, { pooling: 'mean', normalize: true });
            vector = Array.from(output.data);
        }

        const newThought: CognitiveThought = {
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
        if (thoughts.length > this.MAX_NEURONS) thoughts.pop();

        await chrome.storage.local.set({ memories: thoughts });
        console.log(`[DeepSleep] Saved semantic thought from ${ai}`);
    }

    private getAIColor(ai: string): string {
        const colors: Record<string, string> = {
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
