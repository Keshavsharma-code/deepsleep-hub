# DeepSleep-Hub (v2.0.0 — THE OMNIBRAIN BUILD) 🚀🧠
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.0.0--OmniBrain-blue.svg)](https://github.com/Keshavsharma-code/deepsleep-hub/releases)
[![Stable](https://img.shields.io/badge/Stability-Industrial-orange.svg)](https://github.com/Keshavsharma-code/deepsleep-hub)
[![Engine](https://img.shields.io/badge/Engine-Vanilla_JS-lightgrey.svg)](https://github.com/Keshavsharma-code/deepsleep-hub)
[![AIs](https://img.shields.io/badge/AIs_Connected-8-purple.svg)](https://github.com/Keshavsharma-code/deepsleep-hub)
[![Works](https://img.shields.io/badge/Status-Actually_Works-brightgreen.svg)](https://github.com/Keshavsharma-code/deepsleep-hub)

![The Neural Cortex](docs/visual_brain.png)

## 🌌 8 AIs. One Brain. No AI Ever Forgets.

**DeepSleep Hub** is a real, working Chrome extension that connects **ChatGPT, Claude, Gemini, Grok, DeepSeek, Perplexity, and Kimi** through a single shared memory graph stored on your machine.

This is not a concept. This is not a mockup. Install it, open any of the 8 AI platforms, and watch it work.

> **The 3D brain is live.** Each AI has its own lobe. The more you use an AI, the bigger its lobe physically grows in real-time.

---

### 🔗 Also Try: DeepSleep Beta

> **[DeepSleep-beta](https://github.com/Keshavsharma-code/DeepSleep-beta)** — the terminal-based companion agent.
> A background daemon for local dev project memory and idle-time "dreaming." Run it alongside DeepSleep Hub for full local + browser AI memory.

---

## ✅ What Actually Works (Proof)

People see a 3D brain and assume it's fake. It isn't. Here's exactly what runs under the hood:

| Feature | How It Works | Status |
|---|---|---|
| **Captures AI responses** | `MutationObserver` on DOM + platform-specific selectors per AI | ✅ Live |
| **Shared memory graph** | IndexedDB via Dexie.js — all 8 AIs write to the same local DB | ✅ Live |
| **Context injected on new chat** | Shadow DOM injector detects empty chat, prepopulates input with recall block | ✅ Live |
| **3D brain visualization** | Three.js with bloom, OrbitControls, particle effects, synapse trails | ✅ Live |
| **Lobe grows with usage** | Per-AI usage count stored in `chrome.storage.local`, lobe scales up with smooth animation | ✅ Live |
| **Semantic embeddings** | Transformers.js (`all-MiniLM-L6-v2`) runs fully on-device, no API key needed | ✅ Live |
| **PageRank importance scoring** | Graph DB runs 5 iterations of damped PageRank to rank your most-used concepts | ✅ Live |
| **Works offline** | All storage is local. No server. No account. No data leaves your machine. | ✅ Live |

---

## 🧠 How the Interconnection Actually Works

When you use any supported AI, here is the exact sequence:

```
1. You get a response from Claude (or ChatGPT, Grok, DeepSeek, etc.)
2. DeepSleep's MutationObserver detects new content on the page
3. The response text is sent to the background service worker
4. The service worker extracts concepts and computes semantic embeddings
5. Concepts + relationships are stored in the shared IndexedDB graph
6. Your usage count for that AI increments → its brain lobe grows
7. You open a NEW chat on ANY of the 8 AIs
8. DeepSleep detects an empty chat and auto-recalls from the shared DB
9. A [DeepSleep Recall] block is injected into the input field
10. You hit Enter — the new AI now knows what the other AI discussed
```

That's real interconnection. Not simulated. Not mocked. The DB is shared across all tabs.

---

## 💡 Why DeepSleep?

1. **No context loss between AIs** — Claude figured something out. Switch to ChatGPT. DeepSleep bridges it instantly.
2. **8 platforms, one memory** — ChatGPT, Claude, Gemini, Grok, DeepSeek, Perplexity, Kimi all read from and write to the same graph.
3. **Living 3D brain** — watch your knowledge grow in real-time. The AI you use most has the biggest lobe.
4. **Multi-model workflows** — use Grok for real-time info, DeepSeek for reasoning, Claude for depth, GPT for output — all remembering each other.
5. **Your data stays yours** — 100% local. IndexedDB. No cloud sync. No tracking. No accounts.

---

## 🚀 Installation (2 Minutes)

1. **Download**: Clone this repo or download the ZIP.
   ```bash
   git clone https://github.com/Keshavsharma-code/deepsleep-hub.git
   ```
2. **Open Chrome** → go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle top-right)
4. **Click "Load Unpacked"** → select the `deepsleep-hub` folder (the root, not `src/`)
5. Done. Open any of the 8 AI platforms and start using them normally.

### Verify It's Running
Open `chrome://extensions` → find DeepSleep Hub → click **"Service Worker"** → check the console:
```
🧠 DeepSleep Pulse: Service Worker is active.
```
If you see that line, all 8 AIs are connected and memory is live.

---

## 🌐 Supported Platforms

| AI | URL | Lobe Color |
|---|---|---|
| ChatGPT | chatgpt.com | ⚪ White |
| Claude | claude.ai | 🟠 Orange |
| Gemini | gemini.google.com | 🟣 Purple |
| Grok | grok.com | 🔵 Cyan |
| DeepSeek | chat.deepseek.com | 🟢 Green |
| Perplexity | perplexity.ai | 🟡 Amber |
| Kimi | kimi.com / kimi.moonshot.cn | 🔴 Red |
| DeepSleep Core | — | 🟡 Gold |

---

## 🎯 Using Adaptive Recall

- **Capture is automatic** — just use any AI normally. The 🧠 floating widget pulses green when a thought is captured.
- **On a new chat** — DeepSleep detects the empty input and auto-injects a `[DeepSleep Recall]` block with context from your last session.
- **Manual recall** — click the floating 🧠 icon anytime to open the memory overlay and manually inject any stored thought.
- **Force Sync** — click "FORCE SYNC BRAIN ⚡" in the banner to manually bridge context to the current AI.

---

## 🧬 Visual Cortex (3D Brain)

1. Click the extension icon → **"ENTER VISUAL CORTEX"**
2. You'll see a live 3D brain with 8 lobes — one per AI
3. **Drag** to rotate, **scroll** to zoom, **click** a node to inspect its content
4. Each lobe grows as you use that AI more — the shape of the brain IS your usage pattern
5. Synaptic edges light up between related concepts across different AIs
6. Press **Space** to fire a random thought node. Press **Z** for Zen mode.

---

## 🛠 Troubleshooting

### 🧠 widget doesn't pulse green
The DOM selectors may not have matched yet. Try scrolling the page slightly after the AI finishes responding — this triggers the MutationObserver.

### Adaptive Recall not injecting context
- Make sure you have at least one prior conversation captured first (the DB needs something to recall).
- Refresh the page. Some platforms (ChatGPT especially) hide the textarea on load.
- Click the 🧠 icon manually and pick a memory from the list.

### Extension fails to load (red error in chrome://extensions)
- Make sure you're loading the **root `deepsleep-hub` folder**, not `src/` or `dist/`.
- Remove the extension and load unpacked again.

### AI ignores the recalled context
- Confirm the `[DeepSleep Recall]` block is actually inside the text area before sending.
- Some platforms need you to click inside the input box first before the injection registers.

---

## 🏗 Engineering Stack

| Layer | Technology |
|---|---|
| Capture | `MutationObserver` + platform-specific DOM selectors |
| Memory | `Dexie.js` IndexedDB — local graph DB with PageRank scoring |
| Embeddings | `Transformers.js` — `all-MiniLM-L6-v2` on-device, no API key |
| Injection | Shadow DOM isolated UI — survives platform re-renders |
| Visualization | `Three.js` — WebGL, bloom post-processing, OrbitControls |
| Persistence | `chrome.storage.local` — usage counts survive browser restarts |
| Background | Chrome MV3 service worker with keep-alive alarm |

---

![DeepSleep Technical Data Architecture](docs/technical_flow.png)

![DeepSleep Cognitive Bridge Workflow](docs/cognitive_bridge.png)

![DeepSleep User Journey](docs/user_journey.png)
