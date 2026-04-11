document.getElementById('open-brain').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('brain.html') });
});

document.getElementById('clear-memory').addEventListener('click', () => {
  const req = indexedDB.deleteDatabase('DeepSleepGraph');
  req.onsuccess = () => {
    document.getElementById('status').textContent = 'Graph Purged';
    setTimeout(() => {
      document.getElementById('status').textContent = 'Active Semantic Graph';
    }, 2000);
  };
});

// Load recent memories for the "Bridge"
async function loadRecentMemories() {
    const list = document.getElementById('recent-memories');
    try {
        const db = window.GraphDB; // Accessed via db.js script tag
        if (!db) return;
        
        const data = await db.getAllData();
        const nodes = data.nodes.sort((a,b) => b.timestamp - a.timestamp).slice(0, 5);
    } catch (e) {
        console.error(e);
    }
}
