"use strict";
console.log('🧠 [DeepSleep] Content Bridge Active.');
window.addEventListener('message', (event) => {
    if (event.data?.type === 'DEEPSLEEP_API_CAPTURE') {
        const { url, payload } = event.data;
        chrome.runtime.sendMessage({
            type: 'API_DATA_CAPTURED',
            url: url,
            payload: payload
        });
    }
});
