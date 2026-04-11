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
        { id: 'btn-gpt', ai: 'openai', color: '#ffffff', text: 'Simulated reasoning generated successfully. Optimization routines initialized.', concept: 'Optimization' },
        { id: 'btn-codex', ai: 'codex', color: '#3b82f6', text: 'Compiling syntax tree and resolving semantic tokens.', concept: 'Parser' },
        { id: 'btn-claude', ai: 'claude', color: '#f97316', text: 'Analyzing ethical constraints and structural nuance.', concept: 'Analysis' },
        { id: 'btn-gemini', ai: 'gemini', color: '#a855f7', text: 'Multimodal extraction indexing triggered.', concept: 'Indexing' },
        { id: 'btn-kimi', ai: 'kimi', color: '#ef4444', text: 'Long-context vector scanning complete.', concept: 'Vectors' }
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
