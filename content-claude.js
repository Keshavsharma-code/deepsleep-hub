(function() {
  'use strict';
  
  function extractFullChat() {
    const messages = [];
    const turns = document.querySelectorAll('.font-claude-message, [class*="user"]');
    
    turns.forEach(turn => {
      const role = turn.closest('[class*="user"]') ? 'user' : 'assistant';
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
  
  const queue = new window.BatchedMessageQueue(5, 2000);

  function init() {
    const observer = new MutationObserver((mutations) => {
      const responses = document.querySelectorAll('.font-claude-message, [class*="message"]');
      responses.forEach(msg => {
        if (msg.dataset.deepsleepProcessed) return;
        
        // Check if it's Claude's response (not user)
        if (!msg.closest('[class*="user"]')) {
          const text = msg.innerText || msg.textContent;
          if (text && text.length > 20) {
            const fullChat = extractFullChat();
            
            queue.push({
              ai: 'claude',
              content: text.substring(0, 500),
              fullLog: fullChat
            });
            msg.dataset.deepsleepProcessed = 'true';
            
            msg.style.borderLeft = '3px solid #f97316';
            msg.style.paddingLeft = '10px';
            msg.style.transition = 'all 0.3s';
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  setTimeout(init, 3000); // Wait for Claude to load
})();
