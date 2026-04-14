/* content-perplexity.js - DeepSleep Neural Scraper for Perplexity AI */

(function() {
  console.log('🧠 [DeepSleep] Perplexity adapter active.');

  // Perplexity renders answers in prose containers
  const SELECTORS = [
    '.prose',
    '[class*="answer-text"]',
    '[class*="prose"]',
    '[class*="markdown"]',
    '[data-testid="answer-text"]'
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
          ai: 'perplexity',
          content: text.substring(0, 1000)
        });
        break;
      }
    }
  }

  const observer = new MutationObserver(() => {
    clearTimeout(window._dsPplxDebounce);
    window._dsPplxDebounce = setTimeout(capture, 2000);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
