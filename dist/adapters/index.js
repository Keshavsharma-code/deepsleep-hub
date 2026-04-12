export class ChatGPTAdapter {
    name = 'chatgpt';
    extractConversation(payload) {
        return payload?.message?.content?.parts?.[0] || null;
    }
}
export class ClaudeAdapter {
    name = 'claude';
    extractConversation(payload) {
        return payload?.completion || null;
    }
}
export class KimiAdapter {
    name = 'kimi';
    extractConversation(payload) {
        return payload?.choices?.[0]?.message?.content || null;
    }
}
