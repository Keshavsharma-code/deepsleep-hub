export const KnowledgeExtractor = {
  extractPatterns: (text) => {
    const concepts = [];
    const relationships = [];
    
    const conceptPatterns = [
      /\b([a-zA-Z0-9]+-vs-[a-zA-Z0-9]+)\b/g,
      /\b([a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+)\b/g,
      /\b(llm-[a-zA-Z0-9]+-[a-zA-Z0-9]+)\b/g,
      /\b([a-zA-Z0-9]+ workflows?)\b/gi,
      /\b(retrieval[-\s][a-zA-Z0-9]+)\b/gi,
    ];
    
    // Add some random concept extraction for demonstration if no pattern matched
    if (concepts.length === 0 && text.length > 20) {
      const words = text.split(/\s+/).filter(w => w.length > 5);
      if (words.length > 0) {
        const fakeConcept = words[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        concepts.push({
          id: fakeConcept,
          name: fakeConcept,
          type: 'concept',
          confidence: 0.5
        });
      }
    }
    
    conceptPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        concepts.push({
          id: match[1].toLowerCase().replace(/\s+/g, '-'),
          name: match[1],
          type: 'concept',
          confidence: 0.9
        });
      }
    });

    if (text.includes('implements') || text.includes('builds on') || concepts.length >= 2) {
      concepts.forEach((c1, i) => {
        concepts.slice(i+1).forEach(c2 => {
          relationships.push({
            source: c1.id,
            target: c2.id,
            type: 'IMPLEMENTS',
            strength: 0.8
          });
        });
      });
    }
    
    return { concepts, relationships };
  },
  
  embed: async (text) => {
    try {
      const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
      const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      const output = await embedder(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch(e) {
      console.warn("Embedding failed, returning random vector", e);
      return Array.from({length: 384}, () => Math.random() - 0.5);
    }
  }
};
