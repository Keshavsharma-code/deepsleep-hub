/* content-grok.js - DeepSleep Neural Scraper for Grok (xAI) */

(function() {
  console.log('🧠 [DeepSleep] Grok adapter active.');

  // Grok uses a standard div-based response structure
  const SELECTORS = [
    '.message-bubble',
    '[class*="message-content"]',
    '[class*="response-text"]',
    'div[class*="prose"]',
    '.public-DraftEditor-content'
  ];

  let lastCaptured = '';

  function capture() {
    for (const sel of SELECTORS) {
      const els = document.querySelectorAll(sel);
      if (!els.length) continue;
      const text = els[els.length - 1].innerText?.trim();
      if (text && text.length > 30 && text !== lastCaptured) {
        lastCaptured = text;
        chrome.runtime.sendMessage({
          type: 'CAPTURE_THOUGHT',
          ai: 'grok',
          content: text.substring(0, 1000)
        });
        break;
      }
    }
  }

  const observer = new MutationObserver(() => {
    clearTimeout(window._dsGrokDebounce);
    window._dsGrokDebounce = setTimeout(capture, 2000);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
