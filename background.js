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

chrome.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
  if (request.type === 'CAPTURE_THOUGHT') {
    processThoughtAsync(request.ai, request.content, request.fullLog)
      .then(() => sendResponse({success: true}))
      .catch(err => {
          console.error('[Background] Capture failed:', err);
          sendResponse({success: false, error: err.message});
      });
    return true; 
  }
  
  if (request.type === 'GET_RECENT_THOUGHTS') {
    GraphDB.getAllData()
      .then(data => {
          // Sort by timestamp and take top 5
          const sorted = data.nodes.sort((a,b) => b.timestamp - a.timestamp).slice(0, 5);
          sendResponse({ success: true, thoughts: sorted });
      })
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function processThoughtAsync(ai, content, fullLog) {
  // Extract Concepts and Relationships
  const { concepts, relationships } = KnowledgeExtractor.extractPatterns(content);
  
  if (concepts.length > 0) {
      const dbConceptIds = {};
      
      // Store concepts
      for (const c of concepts) {
        if (!dbConceptIds[c.name]) {
          // Compute real semantic embedding vector [^24^] (Aligned with README)
          const vector = await KnowledgeExtractor.embed(c.name); 
          dbConceptIds[c.name] = await GraphDB.addConcept(c.name, ai, vector);
          c.dbId = dbConceptIds[c.name];
        } else {
          c.dbId = dbConceptIds[c.name];
        }
      }
    
      // Store edges
      for (const r of relationships) {
         const sourceConcept = concepts.find(c => c.id === r.source);
         const targetConcept = concepts.find(c => c.id === r.target);
         
         if (sourceConcept && targetConcept && sourceConcept.dbId && targetConcept.dbId) {
             r.dbId = await GraphDB.addRelationship(sourceConcept.dbId, targetConcept.dbId, r.type, content);
             r.sourceDbId = sourceConcept.dbId;
             r.targetDbId = targetConcept.dbId;
         }
      }
    
      await GraphDB.calculateImportance();
  }

  // Notify any open brain UI
  chrome.tabs.query({url: chrome.runtime.getURL('brain.html') + '*'}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'NEW_THOUGHT',
        ai: ai,
        text: content,
        concepts: concepts,
        relationships: relationships
      }).catch(() => {});
    });
  });
}

// Reconnection logic for content scripts after update
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ url: ['*://chat.openai.com/*', '*://claude.ai/*', '*://gemini.google.com/*'] }, (tabs) => {
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
