/* popup.js - DeepSleep Hub v3.0 */

function loadMemories() {
    chrome.runtime.sendMessage({ type: 'GET_MEMORIES' }, (response) => {
        const list = document.getElementById('memory-list');
        if (response && response.memories && response.memories.length > 0) {
            list.innerHTML = '';
            response.memories.slice(0, 10).forEach(m => {
                const item = document.createElement('div');
                item.className = 'memory-item';
                const color = m.source === 'chatgpt' ? '#10a37f' : 
                             m.source === 'claude' ? '#d97757' : '#4285f4';
                
                item.style.borderLeft = `3px solid ${color}`;
                item.innerHTML = `
                    <div class="source-tag" style="color:${color}">${m.source.toUpperCase()}</div>
                    <div class="preview">${m.text.substring(0, 80)}...</div>
                `;
                
                item.onclick = () => {
                   navigator.clipboard.writeText(m.text);
                   const original = item.innerHTML;
                   item.innerHTML = '<div style="color:#10b981; font-weight:bold;">COPIED TO CLIPBOARD!</div>';
                   setTimeout(() => item.innerHTML = original, 1000);
                };
                
                list.appendChild(item);
            });
        }
    });
}

document.getElementById('open-brain').onclick = () => {
    chrome.tabs.create({ url: 'brain.html' });
};

document.getElementById('clear-memories').onclick = () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_MEMORIES' }, () => {
        window.location.reload();
    });
};

document.addEventListener('DOMContentLoaded', loadMemories);
