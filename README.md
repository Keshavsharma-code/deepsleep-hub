# DeepSleep-Hub (v2.0)
## The First Model-Agnostic AI Memory Layer

**Assistants change. Your context doesn't.**

DeepSleep-Hub is a coordinate-free, cinematic knowledge bridge that ensures your AI mental map persists across **ChatGPT, Claude, Gemini, and Local Llama**. It acts as the "connective tissue" for your digital intelligence—so when you switch from debugging with Claude to local reasoning with Llama, your neural interface already holds the relevant codebase context.

## 🚀 Quickstart: Installation

Because DeepSleep-Hub is a coordinate-free memory engine, it is currently deployed as a **Developer Mode** extension. It is NOT in the Chrome Web Store yet.

### 1. Enable Developer Mode
1. Open Google Chrome (or any Chromium browser like Brave/Edge).
2. Type `chrome://extensions/` in the address bar and hit Enter.
3. In the top-right corner, toggle **Developer mode** to **ON**.

### 2. Load the Engine
1. Click the **Load unpacked** button (top left).
2. Navigate to your local folder where this code is stored: `/Users/keshavsharma/basalt/deepsleep-hub`.
3. Select the `deepsleep-hub` folder and click **Open**.
4. You should now see the `DeepSleep Hub` card appear in your extensions list.

### 3. Open your Visual Cortex
1. Click the **Puzzle Piece** icon in the Chrome toolbar.
2. Click the **DeepSleep Hub** icon.
3. In the popup that appears, click **"Enter Semantic Visualization"**.
4. This will launch the 3D Brain interface into a new tab. Done.

---

## 🧪 Simulation Mode (No AI Required)
If you want to see the 3D biological visualizations without having to chat with a real LLM:
1. Load the extension as shown above.
2. Open [`test.html`](file:///Users/keshavsharma/basalt/deepsleep-hub/test.html) in your browser.
3. Open the **Semantic Visualization** (`brain.html`) in a second tab via the extension popup.
4. Keep both tabs visible. Click the **"Generate Fake AI Thoughts"** buttons in the `test.html` tab.
5. In real-time, watch your `brain.html` populates with concepts and neural edges.

## Architecture

1. **Extraction Layer**: Content scripts intercept AI conversations in real-time, sending chunks to a background Service Worker.
2. **Semantic Knowledge Engine**: A background worker determines Concepts and Relationships using Regex patterns.
3. **Graph Storage**: An IndexedDB implementation wrapped by `Dexie.js` persistently holds all nodes (Concepts) and edges (Relationships).
4. **The Visual Brain**: A hybrid WebGL application merging high-fidelity biological lobe meshes and advanced Three.js atmospheric effects.

## Supported Platforms
- **ChatGPT**: White Frontal Lobe
- **Claude**: Orange Temporal Lobe
- **Gemini**: Purple Occipital Lobe
- **Kimi**: Red Cerebellum Lobe
- **DeepSleep-Beta**: Gold Hippocampus Core
