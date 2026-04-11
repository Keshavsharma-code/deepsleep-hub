// popup.js - v5.0
document.addEventListener('DOMContentLoaded', async () => {
    // Reset hidden widget state
    document.getElementById('reset-widget').onclick = () => {
        chrome.storage.local.set({ 'ds_widget_hidden': false }, () => {
            alert('Brain icon restored. Refresh your AI tabs to see it!');
        });
    };

    // Update memory count
    chrome.runtime.sendMessage({ type: 'GET_RECENT_THOUGHTS' }, (response) => {
        const countEl = document.getElementById('count');
        if (response && response.success) {
            const count = response.thoughts ? response.thoughts.length : 0;
            countEl.innerText = `${count} Memories Encoded`;
        } else {
            countEl.innerText = 'Neural Cache Empty';
        }
    });
});
