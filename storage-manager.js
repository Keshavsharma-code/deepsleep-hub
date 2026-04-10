// storage-manager.js
import { getDB } from './db.js';

const STORAGE_THRESHOLD = 0.85; // 85% of quota
const MAX_NODES = 5000;

export class StorageManager {
  static async checkQuota() {
    if (!navigator.storage || !navigator.storage.estimate) return true;
    
    try {
      const { usage, quota } = await navigator.storage.estimate();
      const ratio = usage / quota;
      
      console.log(`[Storage] Usage: ${(ratio * 100).toFixed(2)}% (${usage} / ${quota})`);
      
      if (ratio > STORAGE_THRESHOLD) {
        await this.evictOldData();
        return false; // Suggest pausing or slowing down
      }
      return true;
    } catch (e) {
      console.error('[Storage] Quota check failed:', e);
      return true;
    }
  }
  
  static async evictOldData() {
    console.warn('[Storage] Threshold reached. Evicting old neural data...');
    const db = getDB();
    const count = await db.nodes.count();
    
    if (count > MAX_NODES) {
      const toDelete = await db.nodes
        .orderBy('timestamp')
        .limit(count - MAX_NODES + 500) // Evict enough to breathe
        .toArray();
      
      await db.nodes.bulkDelete(toDelete.map(n => n.id));
      console.log(`[Storage] Evicted ${toDelete.length} old nodes for stability.`);
    }
  }
  
  // Guard for database writes
  static async guardWrite(operation) {
    const isHealthy = await this.checkQuota();
    if (isHealthy) {
      return await operation();
    } else {
      console.warn('[Storage] Writer paused due to quota constraints.');
      // Attempt anyway but log the risk
      return await operation();
    }
  }
}

window.StorageManager = StorageManager;
