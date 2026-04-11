/* background.js - DeepSleep Hub v3.0 Gold Bridge */

const MEMORY_LIMIT = 100;

// Listen for CAPTURE messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.type === 'CAPTURE') {
            saveMemory(request.text, request.source);
            sendResponse({ success: true });
        }
        
        if (request.type === 'GET_MEMORIES') {
            chrome.storage.local.get(['memories'], (result) => {
                sendResponse({ success: true, memories: result.memories || [] });
            });
            return true; // Keep channel open for async response
        }

        if (request.type === 'CLEAR_MEMORIES') {
            chrome.storage.local.set({ memories: [] }, () => {
                sendResponse({ success: true });
            });
            return true;
        }
    } catch (e) {
        console.error('[DeepSleep Background] Error:', e);
        sendResponse({ success: false, error: e.message });
    }
    return true; 
});

async function saveMemory(text, source) {
    chrome.storage.local.get(['memories'], (result) => {
        let memories = result.memories || [];
        
        // Add new memory to the front
        const newMemory = {
            id: `m_${Date.now()}`,
            text: text,
            source: source,
            timestamp: Date.now()
        };

        // De-duplicate: If same source has same text, dont add
        const isDuplicate = memories.some(m => m.source === source && m.text === text);
        if (isDuplicate) return;

        memories.unshift(newMemory);

        // LRU Eviction: maintain 100 items
        if (memories.length > MEMORY_LIMIT) {
            memories = memories.slice(0, MEMORY_LIMIT);
        }

        chrome.storage.local.set({ memories });
        console.log(`[DeepSleep] Memory Captured from ${source}: ${text.substring(0, 30)}...`);
        
        // Notify open brain tabs
        notifyBrainUI(newMemory);
    });
}

function notifyBrainUI(memory) {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            if (tab.url && tab.url.includes('brain.html')) {
                chrome.tabs.sendMessage(tab.id, { type: 'NEW_MEMORY', memory }).catch(() => {});
            }
        });
    });
}

// Keep-alive for Service Worker
chrome.alarms.create('ds_heartbeat', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => console.log('🧠 DeepSleep Hub: Active Heartbeat'));
