// PRODUCTION-GRADE Batched Message Queue for deepsleep-hub

class BatchedMessageQueue {
  constructor(batchSize = 10, flushInterval = 1500) {
    this.queue = [];
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.timer = null;
    this.isProcessing = false;
  }
  
  push(message) {
    this.queue.push({
      ...message,
      timestamp: Date.now()
    });
    
    console.log(`[Queue] Added message. Current size: ${this.queue.length}`);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }
  
  scheduleFlush() {
    if (this.timer) return;
    this.timer = setTimeout(() => this.flush(), this.flushInterval);
  }
  
  async flush() {
    if (this.queue.length === 0 || this.isProcessing) return;
    
    this.isProcessing = true;
    const batch = this.queue.splice(0, this.batchSize);
    this.timer = null;
    
    try {
      console.log(`[Queue] Flushing batch of ${batch.length} messages...`);
      for (const msg of batch) {
          // Send to background for persistent processing
          chrome.runtime.sendMessage({
            type: 'CAPTURE_THOUGHT',
            ai: msg.ai || 'unknown',
            content: msg.content,
            fullLog: msg.fullLog || false
          }).catch(err => {
              console.warn('[Queue] Background offline, message dropped:', err);
          });
      }
    } catch (e) {
      console.error('[Queue] Flush error:', e);
      // Optional: Put back in queue? Avoiding for now to prevent loops
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) this.scheduleFlush();
    }
  }
}

window.BatchedMessageQueue = BatchedMessageQueue;
