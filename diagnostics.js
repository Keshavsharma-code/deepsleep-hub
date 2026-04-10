// diagnostics.js
// PRODUCTION-GRADE Monitoring & Diagnostics for deepsleep-hub

import { getDB } from './db.js';

class DeepSleepDiagnostics {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      errors: [],
      performance: []
    };
  }
  
  log(event, data = {}) {
    const entry = {
      timestamp: Date.now(),
      event,
      data,
      memory: performance.memory?.usedJSHeapSize
    };
    
    if (event === 'error') {
      this.metrics.errors.push(entry);
      if (this.metrics.errors.length > 50) this.metrics.errors.shift();
    }
    
    console.log(`[DeepSleep Diagnostics] ${event}`, data);
  }
  
  async healthCheck() {
    const db = getDB();
    let dbStatus = false;
    let storageStatus = false;

    try {
      await db.nodes.count();
      dbStatus = true;
    } catch (e) {
      this.log('error', { type: 'db_health_check_failed', error: e.message });
    }

    try {
      if (navigator.storage && navigator.storage.estimate) {
        const { usage, quota } = await navigator.storage.estimate();
        storageStatus = (usage / quota < 0.95);
      } else {
        storageStatus = true; // Fallback
      }
    } catch (e) {
      storageStatus = true;
    }

    const report = {
      healthy: dbStatus && storageStatus,
      database: dbStatus ? 'Connected' : 'Error',
      storage: storageStatus ? 'Stable' : 'Near Quota',
      uptime: Math.floor((Date.now() - this.metrics.startTime) / 1000) + 's'
    };

    this.log('health_report', report);
    return report;
  }
  
  getSummary() {
    return {
      uptime: (Date.now() - this.metrics.startTime) / 1000,
      errorCount: this.metrics.errors.length,
      lastError: this.metrics.errors[this.metrics.errors.length - 1]
    };
  }
}

export const diagnostics = new DeepSleepDiagnostics();
window.DeepSleepDiagnostics = diagnostics;
