(function() {
  'use strict';
  
  function extractFullChat() {
    const messages = [];
    const turns = document.querySelectorAll('[data-message-author-role]');
    
    turns.forEach(turn => {
      const role = turn.getAttribute('data-message-author-role');
      const text = turn.innerText || turn.textContent;
      if (text.trim()) {
        messages.push({
          role: role,
          text: text.trim(),
          time: Date.now()
        });
      }
    });
    
    return JSON.stringify(messages.slice(-10)); // Last 10 exchanges
  }
  
  const queue = new window.BatchedMessageQueue(5, 2000);
  
  function initObserver() {
    const observer = new MutationObserver((mutations) => {
      const responses = document.querySelectorAll('[data-message-author-role="assistant"]');
      
      responses.forEach(msg => {
        if (msg.dataset.deepsleepProcessed) return;
        
        const text = msg.innerText || msg.textContent;
        if (text && text.length > 20) {
          const fullChat = extractFullChat();
          
          queue.push({
            ai: 'openai',
            content: text.substring(0, 500),
            fullLog: fullChat
          });
          
          msg.dataset.deepsleepProcessed = 'true';
          
          // Visual feedback on the page (subtle)
          msg.style.borderLeft = '3px solid #10a37f';
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
  
  setTimeout(initObserver, 3000);
})();
