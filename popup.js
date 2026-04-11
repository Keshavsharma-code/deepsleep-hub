document.getElementById('open-brain').addEventListener('click', () => {
  chrome.tabs.create({url: chrome.runtime.getURL('brain.html')});
});

document.getElementById('clear-memory').addEventListener('click', () => {
  const req = indexedDB.deleteDatabase('DeepSleepHub'); // Corrected DB name
  req.onsuccess = () => {
    document.getElementById('status').textContent = 'Graph Purged';
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
});

// Load recent memories for the "Bridge"
async function loadRecentMemories() {
    const list = document.getElementById('recent-memories');
    try {
        const { getDB } = await import('./db.js');
        const db = getDB();
        const nodes = await db.nodes.orderBy('timestamp').reverse().limit(5).toArray();
        
        if (nodes.length > 0) {
            list.innerHTML = '';
            nodes.forEach(node => {
                const div = document.createElement('div');
                div.style.padding = '8px';
                div.style.background = 'rgba(255,255,255,0.05)';
                div.style.borderRadius = '4px';
                div.style.fontSize = '11px';
                div.style.cursor = 'pointer';
                div.style.borderLeft = `3px solid ${node.color || '#3b82f6'}`;
                div.innerHTML = `<strong>${node.aiSource.toUpperCase()}</strong>: ${node.name.substring(0, 40)}...`;
                
                div.addEventListener('click', () => {
                    const text = `[DeepSleep Memory Bridge | Source: ${node.aiSource}]\nContext: ${node.name}`;
                    navigator.clipboard.writeText(text).then(() => {
                        div.style.background = 'rgba(16, 185, 129, 0.2)';
                        const original = div.innerHTML;
                        div.innerHTML = 'COPIED! 📋';
                        setTimeout(() => {
                            div.innerHTML = original;
                            div.style.background = 'rgba(255,255,255,0.05)';
                        }, 1000);
                    });
                });
                list.appendChild(div);
            });
        }
    } catch (e) {
        console.error('Failed to load memories:', e);
    }
}

document.addEventListener('DOMContentLoaded', loadRecentMemories);
