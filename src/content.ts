/**
 * content.ts - DeepSleep Cognitive Bridge v1.0.0
 * Bridges Network Interceptor to Background Engine.
 */

// Inject Network Interceptor
function injectInterceptor() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('dist/interceptors/network.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => script.remove();
}

injectInterceptor();

// Listen for Interceptor Handshake
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

console.log('🧠 [DeepSleep 1.0.0] Cognitive Observer Active.');
