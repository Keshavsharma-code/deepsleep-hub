/**
 * DeepSleep Cognitive Types v1.0.0
 */

export type AISource = 'chatgpt' | 'claude' | 'gemini' | 'kimi' | 'grok' | 'local' | 'unknown';

export interface CognitiveThought {
    id: string;
    aiSource: AISource;
    content: string;
    timestamp: number;
    metadata: {
        url: string;
        title: string;
        topic?: string;
        confidence: number;
    };
    color?: string;
    vector?: number[];
    rawJson?: any;
}

export interface SyncMessage {
    type: 'CAPTURE_THOUGHT' | 'GET_RECENT_THOUGHTS' | 'CLEAR_MEMORY' | 'API_DATA_CAPTURED';
    payload?: any;
    url?: string;
    ai?: string;
    content?: string;
}

export interface StorageSchema {
    memories: CognitiveThought[];
    ds_widget_hidden: boolean;
}
