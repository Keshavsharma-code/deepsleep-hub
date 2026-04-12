"use strict";
(function () {
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest.prototype.open;
    console.log('📡 [DeepSleep] Main World Interceptor Active.');
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
            try {
                const clone = response.clone();
                const data = await clone.json();
                window.postMessage({
                    type: 'DEEPSLEEP_API_CAPTURE',
                    url: url,
                    payload: data
                }, '*');
            }
            catch (e) {
            }
        }
        return response;
    };
    window.XMLHttpRequest.prototype.open = function (method, url) {
        this._url = url;
        return originalXHR.apply(this, arguments);
    };
    const originalSend = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function () {
        this.addEventListener('load', function () {
            const url = this._url;
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
        return originalSend.apply(this, arguments);
    };
})();
