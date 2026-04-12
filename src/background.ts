import { CognitiveThought } from './types.js';

class BackgroundEngine {
    private MAX_NEURONS = 100;

    constructor() {
        this.init();
    }

    private init() {
        console.log('🧠 [DeepSleep 1.0.0] Cognitive Engine Online.');
        
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open
        });
    }

    private async handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (res?: any) => void) {
        if (message.type === 'CAPTURE_THOUGHT') {
            await this.saveThought(message.ai, message.content, sender);
            sendResponse({ success: true });
        } else if (message.type === 'GET_RECENT_THOUGHTS') {
            const memories = await this.getMemories();
            sendResponse({ success: true, thoughts: memories });
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

    private async saveThought(ai: string, content: string, sender: chrome.runtime.MessageSender) {
        const thoughts = await this.getMemories();
        
        const newThought: CognitiveThought = {
            id: crypto.randomUUID(),
            aiSource: ai as any,
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
        if (thoughts.length > this.MAX_NEURONS) thoughts.pop();

        await chrome.storage.local.set({ memories: thoughts });
        console.log(`[DeepSleep] Saved thought from ${ai}`);
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
