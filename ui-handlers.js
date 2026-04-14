document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-ui');
    const uiLayer = document.getElementById('ui-layer');
    const bottomBar = document.querySelector('.bottom-bar');
    let uiVisible = true;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        uiVisible = !uiVisible;
        if (uiVisible) {
          if (uiLayer) uiLayer.style.display = 'flex';
          if (bottomBar) bottomBar.style.display = 'flex';
          toggleBtn.innerText = 'REMOVE UI ⌘';
        } else {
          if (uiLayer) uiLayer.style.display = 'none';
          if (bottomBar) bottomBar.style.display = 'none';
          toggleBtn.innerText = 'RESTORE UI ⌘';
        }
      });
    }

    const simButtons = [
        { id: 'btn-gpt',        ai: 'openai',     text: 'Reasoning optimized. Context stream active.', concept: 'Optimization' },
        { id: 'btn-claude',     ai: 'claude',     text: 'Ethical analysis and semantic bridge active.', concept: 'Analysis' },
        { id: 'btn-gemini',     ai: 'gemini',     text: 'Multimodal extraction indexing triggered.', concept: 'Indexing' },
        { id: 'btn-grok',       ai: 'grok',       text: 'Real-time information stream intercepted.', concept: 'Real-Time' },
        { id: 'btn-deepseek',   ai: 'deepseek',   text: 'Deep reasoning trace vectorized and stored.', concept: 'Reasoning' },
        { id: 'btn-perplexity', ai: 'perplexity', text: 'Search-augmented answer captured and indexed.', concept: 'Search' },
        { id: 'btn-kimi',       ai: 'kimi',       text: 'Long-context vector scanning complete.', concept: 'Vectors' },
        { id: 'btn-core',       ai: 'deepsleep',  text: 'DeepSleep β — universal hub synchronizing all AI memory.', concept: 'Core Sync' }
    ];

    simButtons.forEach(btnConfig => {
        const btn = document.getElementById(btnConfig.id);
        if (btn) {
            btn.addEventListener('click', () => {
                if (window._handleExtMsg) {
                    window._handleExtMsg({
                        type: 'NEW_THOUGHT',
                        ai: btnConfig.ai,
                        text: btnConfig.text,
                        concepts: [{name: btnConfig.concept}]
                    });
                }
            });
        }
    });

    if (uiLayer) uiLayer.style.transition = 'opacity 0.3s ease';
    if (bottomBar) bottomBar.style.transition = 'opacity 0.3s ease';
});
