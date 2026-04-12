const OMNI_SELECTORS = [
    '[data-message-author-role="assistant"]',
    '.markdown',
    '.model-response',
    '.font-claude-message',
    'div[class*="message"]'
];

let lastCapturedText = "";

function captureThoughts() {
    for (const selector of OMNI_SELECTORS) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            const latest = elements[elements.length - 1] as HTMLElement;
            const text = latest.innerText.trim();
            
            if (text && text.length > 30 && text !== lastCapturedText) {
                lastCapturedText = text;
                chrome.runtime.sendMessage({
                    type: 'CAPTURE_THOUGHT',
                    ai: window.location.host.split('.')[1] || 'unknown',
                    content: text
                });
                break;
            }
        }
    }
}

const observer = new MutationObserver((mutations) => {
    if (mutations.some(m => m.addedNodes.length > 0)) {
        setTimeout(captureThoughts, 2000);
    }
});

observer.observe(document.body, { childList: true, subtree: true });
console.log('🧠 [DeepSleep 1.0.0] Cognitive Observer Active.');
