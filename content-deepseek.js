/* content-deepseek.js - DeepSleep Neural Scraper for DeepSeek */

(function() {
  console.log('🧠 [DeepSleep] DeepSeek adapter active.');

  // DeepSeek renders markdown in .ds-markdown elements
  const SELECTORS = [
    '.ds-markdown',
    '[class*="markdown-body"]',
    '[class*="message-content"]',
    'div[class*="assistant"]',
    '[class*="chat-message"]'
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
          ai: 'deepseek',
          content: text.substring(0, 1000)
        });
        break;
      }
    }
  }

  const observer = new MutationObserver(() => {
    clearTimeout(window._dsDeepSeekDebounce);
    window._dsDeepSeekDebounce = setTimeout(capture, 2000);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
