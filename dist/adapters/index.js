"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KimiAdapter = exports.ClaudeAdapter = exports.ChatGPTAdapter = void 0;
class ChatGPTAdapter {
    name = 'chatgpt';
    extractConversation(payload) {
        return payload?.message?.content?.parts?.[0] || null;
    }
}
exports.ChatGPTAdapter = ChatGPTAdapter;
class ClaudeAdapter {
    name = 'claude';
    extractConversation(payload) {
        return payload?.completion || null;
    }
}
exports.ClaudeAdapter = ClaudeAdapter;
class KimiAdapter {
    name = 'kimi';
    extractConversation(payload) {
        return payload?.choices?.[0]?.message?.content || null;
    }
}
exports.KimiAdapter = KimiAdapter;
