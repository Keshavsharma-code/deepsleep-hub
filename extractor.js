self.KnowledgeExtractor = {
  extractPatterns: (text) => {
    const concepts = [];
    const relationships = [];
    
    if (!text || text.length < 5) return { concepts, relationships };

    // Prevent ReDoS with safe length check
    const safeText = text.substring(0, 5000);

    const conceptPatterns = [
      /\b([a-zA-Z0-9]+-vs-[a-zA-Z0-9]+)\b/g,
      /\b([a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+)\b/g,
      /\b(llm-[a-zA-Z0-9]+-[a-zA-Z0-9]+)\b/g,
      /\b([a-zA-Z0-9]+\s workflows?)\b/gi,
      /\b(retrieval[-\s][a-zA-Z0-9]+)\b/gi,
      /\b(neural\s[a-zA-Z0-9]+)\b/gi,
      /\b([a-zA-Z0-9]+\sarchitecture)\b/gi
    ];
    
    conceptPatterns.forEach(pattern => {
      try {
        const matches = [...safeText.matchAll(pattern)];
        for (const match of matches) {
          const name = match[1].trim();
          concepts.push({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            type: 'concept',
            confidence: 0.9
          });
        }
      } catch (e) {
        console.warn('[Extractor] Pattern failed:', e);
      }
    });

    // Fallback if no specific patterns found
    if (concepts.length === 0 && safeText.length > 50) {
      const words = safeText.split(/\s+/).filter(w => w.length > 7);
      if (words.length > 0) {
        const seed = words[Math.floor(Math.random() * words.length)];
        const cleanSeed = seed.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanSeed.length > 3) {
            concepts.push({
              id: `c_${cleanSeed}`,
              name: cleanSeed.toUpperCase(),
              type: 'concept',
              confidence: 0.4
            });
        }
      }
    }
    
    // Relationship Inference
    if (concepts.length >= 2) {
      for (let i = 0; i < Math.min(concepts.length - 1, 5); i++) {
          relationships.push({
            source: concepts[i].id,
            target: concepts[i+1].id,
            type: 'ASSOCIATED',
            strength: 0.6 + Math.random() * 0.4
          });
      }
    }
    
    return { concepts, relationships };
  },
  
  embed: async (text) => {
    // Check if browser is online for CDN model
    if (!navigator.onLine) {
       return Array.from({length: 384}, () => Math.random() - 0.5);
    }

    try {
      // Lazy load with timeout
      const modulePromise = import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('Timeout'), 5000));
      
      const { pipeline } = await Promise.race([modulePromise, timeoutPromise]);
      const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      const output = await embedder(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch(e) {
      console.warn("[Extractor] Embedding fallback used:", e);
      return Array.from({length: 384}, () => Math.random() - 0.5);
    }
  }
};
