/* content.js - Universal Neural Scraper v4.0 (Omni-Platform) */

(function() {
    console.log('🧠 DeepSleep Omni-Observer Active.');

    // Industrial generic selectors for ANY AI platform
    const OMNI_SELECTORS = [
        '[data-message-author-role="assistant"]',
        '.markdown',
        '.model-response',
        '.font-claude-message',
        '.chat-message-content',
        '.response-content',
        '.p-chat-message__body',
        '.message-content',
        '[role="log"] div',
        'div[class*="message"]'
    ];

    let lastCapturedText = "";

    function captureThoughts() {
        let found = false;
        for (const selector of OMNI_SELECTORS) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                const latest = elements[elements.length - 1];
                const text = latest.innerText.trim();
                
                if (text && text.length > 30 && text !== lastCapturedText) {
                    lastCapturedText = text;
                    chrome.runtime.sendMessage({
                        type: 'CAPTURE_THOUGHT',
                        ai: window.location.host.split('.')[1] || 'unknown',
                        content: text
                    });
                    
                    // Visual proof of capture on the widget
                    pulseWidget();
                    found = true;
                    break;
                }
            }
        }
    }

    function pulseWidget() {
        const widget = document.getElementById('deepsleep-injector-trigger');
        if (widget) {
            widget.style.boxShadow = '0 0 30px #10b981';
            widget.style.transform = 'scale(1.2)';
            setTimeout(() => {
                widget.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
                widget.style.transform = 'scale(1)';
            }, 500);
        }
    }

    // High-performance observer
    const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        for(let mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                shouldCheck = true;
                break;
            }
        }
        if (shouldCheck) {
            clearTimeout(window.dsDebounce);
            window.dsDebounce = setTimeout(captureThoughts, 2000);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
