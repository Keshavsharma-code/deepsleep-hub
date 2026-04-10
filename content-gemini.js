(function() {
  'use strict';
  
  function extractFullChat() {
    const messages = [];
    const turns = document.querySelectorAll('.response-message, .user-query-container');
    
    turns.forEach(turn => {
      const role = turn.className.includes('response-message') ? 'assistant' : 'user';
      const text = turn.innerText || turn.textContent;
      if (text && text.trim()) {
        messages.push({
          role: role,
          text: text.trim(),
          time: Date.now()
        });
      }
    });
    
    return JSON.stringify(messages.slice(-10));
  }
  
  function init() {
    const observer = new MutationObserver((mutations) => {
      const messages = document.querySelectorAll('.response-message, [data-test-id="response-content"]');
      messages.forEach(msg => {
        if (msg.dataset.deepsleepProcessed) return;
        const text = msg.innerText || msg.textContent;
        if (text && text.length > 20) {
          const fullChat = extractFullChat();
          
          chrome.runtime.sendMessage({
            type: 'CAPTURE_THOUGHT',
            ai: 'gemini',
            content: text.substring(0, 500),
            fullLog: fullChat
          });
          msg.dataset.deepsleepProcessed = 'true';
          
          msg.style.borderLeft = '3px solid #a855f7';
          msg.style.paddingLeft = '10px';
          msg.style.transition = 'all 0.3s';
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  setTimeout(init, 3000);
})();
