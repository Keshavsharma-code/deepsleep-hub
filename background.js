import { GraphDB } from './db.js';
import { KnowledgeExtractor } from './extractor.js';

chrome.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
  if (request.type === 'CAPTURE_THOUGHT') {
    processThoughtAsync(request.ai, request.content, request.fullLog)
      .then(() => sendResponse({success: true}))
      .catch(err => sendResponse({success: false, error: err.message}));
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
          // Compute pseudo-embedding vector
          const vector = Array.from({length: 384}, () => Math.random() - 0.5); 
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
  chrome.tabs.query({url: chrome.runtime.getURL('brain.html')}, (tabs) => {
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
