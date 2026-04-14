importScripts('lib/dexie.min.js', 'db.js', 'extractor.js');

// Access shared globals from importScripts
const { GraphDB } = self;
const { KnowledgeExtractor } = self;

// Keep-alive heartbeat (MV3 Service Worker persistence)
chrome.alarms.create('deepsleep_pulse', { periodInMinutes: 4.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'deepsleep_pulse') {
    console.log('🧠 DeepSleep Pulse: Service Worker is active.');
  }
});

chrome.runtime?.onMessage?.addListener((request, _sender, sendResponse) => {
  if (request.type === 'CAPTURE_THOUGHT') {
    processThoughtAsync(request.ai, request.content, request.fullLog)
      .then(usageCount => sendResponse({ success: true, usageCount }))
      .catch(err => {
        console.error('[Background] Capture failed:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }

  if (request.type === 'GET_RECENT_THOUGHTS') {
    GraphDB.getAllData()
      .then(data => {
        const sorted = data.nodes.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
        sendResponse({ success: true, thoughts: sorted });
      })
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === 'GET_USAGE_COUNTS') {
    chrome.storage.local.get('aiUsageCounts', (result) => {
      sendResponse({ success: true, aiUsageCounts: result.aiUsageCounts || {} });
    });
    return true;
  }
});

async function processThoughtAsync(ai, content, fullLog) {
  // Increment per-AI usage count (persisted — drives lobe growth)
  const stored = await chrome.storage.local.get('aiUsageCounts');
  const aiUsageCounts = stored.aiUsageCounts || {};
  aiUsageCounts[ai] = (aiUsageCounts[ai] || 0) + 1;
  await chrome.storage.local.set({ aiUsageCounts });
  const usageCount = aiUsageCounts[ai];

  // Extract Concepts and Relationships
  const { concepts, relationships } = KnowledgeExtractor.extractPatterns(content);

  if (concepts.length > 0) {
    const dbConceptIds = {};

    for (const c of concepts) {
      if (!dbConceptIds[c.name]) {
        const vector = await KnowledgeExtractor.embed(c.name);
        dbConceptIds[c.name] = await GraphDB.addConcept(c.name, ai, vector);
        c.dbId = dbConceptIds[c.name];
      } else {
        c.dbId = dbConceptIds[c.name];
      }
    }

    for (const r of relationships) {
      const sourceConcept = concepts.find(c => c.id === r.source);
      const targetConcept = concepts.find(c => c.id === r.target);
      if (sourceConcept?.dbId && targetConcept?.dbId) {
        r.dbId = await GraphDB.addRelationship(sourceConcept.dbId, targetConcept.dbId, r.type, content);
        r.sourceDbId = sourceConcept.dbId;
        r.targetDbId = targetConcept.dbId;
      }
    }

    await GraphDB.calculateImportance();
  }

  // Notify any open brain UI — include usageCount so the lobe can grow
  chrome.tabs.query({ url: chrome.runtime.getURL('brain.html') + '*' }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'NEW_THOUGHT',
        ai,
        text: content,
        concepts,
        relationships,
        usageCount
      }).catch(() => {});
    });
  });

  return usageCount;
}

// Reconnection logic for content scripts after update
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ url: [
      '*://chatgpt.com/*', '*://claude.ai/*', '*://gemini.google.com/*',
      '*://grok.com/*', '*://chat.deepseek.com/*', '*://perplexity.ai/*',
      '*://www.kimi.com/*', '*://kimi.moonshot.cn/*'
    ] }, (tabs) => {
        tabs.forEach(tab => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    console.log('[DeepSleep] Extension updated. Reconnecting observers...');
                    window.location.reload();
                }
            }).catch(e => console.warn('[Background] Auto-reload failed for tab:', tab.id, e));
        });
    });
});
