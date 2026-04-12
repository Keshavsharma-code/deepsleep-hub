"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest.prototype.open;
    const WATCH_LIST = [
        'chatgpt.com/backend-api/conversation',
        'claude.ai/api/organizations/',
        'gemini.google.com/app',
        'kimi.moonshot.cn/api/chat/'
    ];
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);
        const url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : '');
        if (WATCH_LIST.some(item => url.includes(item))) {
            const clone = response.clone();
            clone.json().then(data => {
                window.postMessage({
                    type: 'DEEPSLEEP_API_CAPTURE',
                    url: url,
                    payload: data
                }, '*');
            }).catch(() => { });
        }
        return response;
    };
    window.XMLHttpRequest.prototype.open = function (method, url) {
        this.addEventListener('load', function () {
            if (typeof url === 'string' && WATCH_LIST.some(item => url.includes(item))) {
                try {
                    const data = JSON.parse(this.responseText);
                    window.postMessage({
                        type: 'DEEPSLEEP_API_CAPTURE',
                        url: url,
                        payload: data
                    }, '*');
                }
                catch (e) { }
            }
        });
        return originalXHR.apply(this, arguments);
    };
    console.log('📡 [DeepSleep] Network Interceptor Active.');
})();
