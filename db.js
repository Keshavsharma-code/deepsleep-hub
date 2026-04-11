const Dexie = globalThis.Dexie || (typeof self !== 'undefined' ? self.Dexie : null);

// db.js - Production-grade database layer
class DeepSleepDB extends Dexie {
  constructor() {
    super('DeepSleepHub');
    
    // Schema versioning for future migrations
    this.version(1).stores({
      nodes: 'id, name, type, aiSource, *vector, timestamp, contentHash, *tags',
      edges: 'id, source, target, type, strength, timestamp',
      snippets: 'id, text, nodeId, timestamp'
    });
  }

  // Prevent duplicate nodes via content hashing
  async addNode(data) {
    const hash = this.hashContent(data.name || data.text);
    const existing = await this.nodes.where('contentHash').equals(hash).first();
    if (existing) return existing.id;
    
    const id = data.id || `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.nodes.add({
      ...data,
      id,
      contentHash: hash,
      timestamp: Date.now(),
      tags: this.extractTags(data.name || data.text)
    });
    return id;
  }

  hashContent(text) {
    if (!text) return '0';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString();
  }

  extractTags(text) {
    if (!text) return [];
    const tags = text.match(/#\w+/g) || [];
    return tags.map(t => t.substring(1));
  }
}

// Singleton with connection pooling
let dbInstance = null;
export const getDB = () => {
  if (!dbInstance) dbInstance = new DeepSleepDB();
  return dbInstance;
};

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
    const db = getDB();
    const color = AI_COLORS[aiSource] || '#ffffff';
    return await db.addNode({
      name,
      type: 'concept',
      aiSource,
      vector,
      color,
      importance: 1
    });
  },
  
  addRelationship: async (source, target, type, context) => {
    const db = getDB();
    const sourceNode = await db.nodes.get(source);
    const targetNode = await db.nodes.get(target);
    const strength = (sourceNode && targetNode && sourceNode.vector && targetNode.vector) 
        ? cosineSimilarity(sourceNode.vector, targetNode.vector) : 0.8;
    
    const id = `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.edges.add({
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
    const db = getDB();
    const nodes = await db.nodes.toArray();
    const edges = await db.edges.toArray();
    
    const damping = 0.85;
    const iterations = 5; // Reduced for performance [^24^]
    
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
    const db = getDB();
    return {
      nodes: await db.nodes.toArray(),
      edges: await db.edges.toArray()
    };
  }
};

// Expose to window for the brain UI
window.GraphDB = GraphDB;
window.DeepSleepDB = DeepSleepDB;
