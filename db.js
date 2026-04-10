import Dexie from 'https://unpkg.com/dexie@3.2.4/dist/dexie.mjs';

const db = new Dexie('DeepSleepGraph');
db.version(1).stores({
  nodes: 'id, name, type, aiSource, *vector',
  edges: 'id, source, target, type, strength',
  snippets: 'id, text, nodeId, timestamp'
});

export const AI_COLORS = {
  openai: '#ffffff',
  codex: '#3b82f6',
  claude: '#f97316',
  gemini: '#a855f7',
  kimi: '#ef4444',
  deepsleep_beta: '#fbbf24'
};

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0.5;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const GraphDB = {
  addConcept: async (name, aiSource, vector) => {
    const id = `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const color = AI_COLORS[aiSource] || '#ffffff';
    await db.nodes.put({
      id,
      name,
      type: 'concept',
      aiSource,
      vector,
      timestamp: Date.now(),
      color: color,
      importance: 1
    });
    return id;
  },
  
  addRelationship: async (source, target, type, context) => {
    const sourceNode = await db.nodes.get(source);
    const targetNode = await db.nodes.get(target);
    const strength = (sourceNode && targetNode && sourceNode.vector && targetNode.vector) 
        ? cosineSimilarity(sourceNode.vector, targetNode.vector) : 0.8;
    
    const id = `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.edges.put({
      id,
      source,
      target,
      type,
      strength,
      context: context?.substring(0, 200),
      timestamp: Date.now()
    });
    return id;
  },
  
  calculateImportance: async () => {
    const nodes = await db.nodes.toArray();
    const edges = await db.edges.toArray();
    
    const damping = 0.85;
    const iterations = 10;
    
    nodes.forEach(n => n.rank = 1);
    
    for (let i = 0; i < iterations; i++) {
      nodes.forEach(node => {
        const incoming = edges.filter(e => e.target === node.id);
        const rank = (1 - damping) + damping * incoming.reduce((sum, edge) => {
          const source = nodes.find(n => n.id === edge.source);
          const outgoing = edges.filter(e => e.source === edge.source).length;
          return sum + (source?.rank || 0) / (outgoing || 1);
        }, 0);
        node.rank = rank;
      });
    }
    
    nodes.forEach(n => n.importance = n.rank);
    await db.nodes.bulkPut(nodes);
    return nodes;
  },
  
  getAllData: async () => {
    return {
      nodes: await db.nodes.toArray(),
      edges: await db.edges.toArray()
    };
  }
};
