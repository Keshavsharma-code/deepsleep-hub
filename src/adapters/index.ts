import { CognitiveThought, AISource } from '../types.js';

export interface IPlatformAdapter {
    name: AISource;
    extractConversation(payload: any): string | null;
}

export class ChatGPTAdapter implements IPlatformAdapter {
    name: AISource = 'chatgpt';
    extractConversation(payload: any): string | null {
        return payload?.message?.content?.parts?.[0] || null;
    }
}

export class ClaudeAdapter implements IPlatformAdapter {
    name: AISource = 'claude';
    extractConversation(payload: any): string | null {
        return payload?.completion || null;
    }
}

export class KimiAdapter implements IPlatformAdapter {
    name: AISource = 'kimi';
    extractConversation(payload: any): string | null {
        return payload?.choices?.[0]?.message?.content || null;
    }
}
