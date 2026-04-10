![DeepSleep High-Fidelity Clusters](docs/visual_brain.png)

# DeepSleep-Hub (v2.0)
## The First Model-Agnostic AI Memory Layer

**Assistants change. Your context doesn't.**

DeepSleep-Hub is a coordinate-free, cinematic knowledge bridge that ensures your AI mental map persists across **ChatGPT, Claude, Gemini, and Local Llama**. It acts as the "connective tissue" for your digital intelligence—so when you switch from debugging with Claude to local reasoning with Llama, your neural interface already holds the relevant codebase context.

![DeepSleep Cognitive Bridge Workflow](docs/cognitive_bridge.png)

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

![DeepSleep Technical Data Architecture](docs/technical_flow.png)

## 🧪 Simulation Mode (No AI Required)
If you want to see the 3D biological visualizations without having to chat with a real LLM:
1. Load the extension as shown above.
2. Open [`test.html`](file:///Users/keshavsharma/basalt/deepsleep-hub/test.html) in your browser.
3. Open the **Semantic Visualization** (`brain.html`) in a second tab via the extension popup.
4. Keep both tabs visible. Click the **"Generate Fake AI Thoughts"** buttons in the `test.html` tab.
5. Watch in real-time as your `brain.html` populates with concepts and neural edges.

---

## 📖 How to Use

Once the extension is loaded, the engine works **automatically**. You don't need to manually sync anything.

1.  **Chat Normally**: Go to ChatGPT, Claude, or Gemini and talk to your AI assistants. The extension silently extracts knowledge fragments in the background.
2.  **Open the Cortex**: Click the DeepSleep icon in your toolbar and select **"Enter Semantic Visualization"**.
3.  **Explore the Brain**:
    *   **Drag**: Rotate the biological model to explore differnet clusters.
    *   **Zoom**: Scroll to dive through 4 levels of depth—from the macro structure down to individual knowledge nodes.
    *   **Trace (Right-Click)**: Right-click any node to reveal the exact context and LLM history that generated that specific thought.
4.  **Model Continuity**: Switch between assistants! The brain will bridge the context between GPT-4, Claude, and Gemini into one unified neural map.

---

![DeepSleep User Journey](docs/user_journey.png)

## 🔒 Privacy & Safety
- **100% Local**: All data is stored in your browser's IndexedDB. 
- **No External Servers**: Your chat history never leaves your machine.
- **Model Agnostic**: Works across any supported LLM platform.

## Architecture

1. **Extraction Layer**: Content scripts intercept AI conversations in real-time, sending chunks to a background Service Worker.
2. **Semantic Knowledge Engine**: A background worker determines Concepts and Relationships using Regex patterns.
3. **Graph Storage**: An IndexedDB implementation wrapped by `Dexie.js` persistently holds all nodes (Concepts) and edges (Relationships).
4. **The Visual Brain**: A hybrid WebGL application merging high-fidelity biological lobe meshes and advanced Three.js atmospheric effects.
