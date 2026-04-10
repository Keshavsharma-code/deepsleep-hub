// DeepSleep Hub - Local Llama / Generic LLM Scraper
// Designed to capture content from localhost interfaces like Ollama / Open WebUI

console.log('🧠 DeepSleep Local Scout initialized on localhost...');

function scrapeGeneric() {
  // Common patterns for local chat interfaces (Open WebUI, etc.)
  const messages = document.querySelectorAll('.message-content, .chat-bubble, .message');
  if (messages.length === 0) return;

  const lastMessage = messages[messages.length - 1];
  const text = lastMessage.innerText.trim();

  if (text.length > 20 && text !== window.lastScrapedLocalText) {
    window.lastScrapedLocalText = text;
    console.log('Extracted Local Thought:', text.substring(0, 50) + '...');
    
    chrome.runtime.sendMessage({
      type: 'EXTRACTED_CONTENT',
      ai: 'codex', // Map local models to the Codex/Blue region by default
      text: text,
      url: window.location.href
    });
  }
}

// Observe DOM for changes
const observer = new MutationObserver(() => {
  scrapeGeneric();
});

observer.observe(document.body, { childList: true, subtree: true });
scrapeGeneric();
