document.getElementById('open-brain').addEventListener('click', () => {
  chrome.tabs.create({url: chrome.runtime.getURL('brain.html')});
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
