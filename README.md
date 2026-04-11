# DeepSleep-Hub (v2.1)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.1--stable-blue.svg)](https://github.com/Keshavsharma-code/deepsleep-hub/releases)
[![Extension](https://img.shields.io/badge/Manifest-V3-orange.svg)](manifest.json)

> [!CAUTION]
> **DEVELOPER MODE REQUIRED**: This extension is a high-octane experimental memory engine. It is **NOT** in the Google Chrome Web Store. You must install it via the "Load Unpacked" method.

## 🚀 The AI Thought Bridge
DeepSleep-Hub doesn't just watch you chat—it extracts the semantic essence of your conversations across **ChatGPT, Claude, Gemini, and Kimi**. It stores these memories in a local, encrypted vector database so you can bridge the gap between AI assistants.

---

## 🛠 How to "Attach" to AI Models
DeepSleep Hub connects automatically to major LLM interfaces. Once installed:
1.  **Open any supported AI** (e.g., [chatgpt.com](https://chatgpt.com)).
2.  **Start Chatting**: As soon as the AI replies, the "Scout" script captures the thought.
3.  **Confirm Connection**: Look for a subtle **green border** on the AI's response—this is the physical confirmation that the thought has been bridged to your 3D neural map.

---

## 📥 Installation (The Real Way)
1.  Download the latest production build: [**DeepSleep-Hub-v2.1.zip**](https://github.com/Keshavsharma-code/deepsleep-hub/raw/main/DeepSleep-Hub-v2.1.zip).
2.  Open `chrome://extensions/` and toggle **Developer mode** to **ON**.
3.  Click **Load unpacked** and select the extension folder.

### 2. Load the Engine
1. Click the **Load unpacked** button (top left).
2. Navigate to your local folder where this code is stored.
3. Select the `deepsleep-hub` folder and click **Open**.
4. You should now see the `DeepSleep Hub` card appear in your extensions list.

### 3. Open your Visual Cortex
1. Click the **Puzzle Piece** icon in the Chrome toolbar.
2. Click the **DeepSleep Hub** icon.
3. In the popup that appears, click **"Enter Semantic Visualization"**.
4. This will launch the 3D Brain interface into a new tab. Done.

### 4. How to Confirm it's Working
Once installed, you can verify the connection in 3 seconds:
*   **The Toolbar**: You will see the glowing brain icon in your browser's extensions bar.
*   **The Initialization**: Open the brain interface. You should see a single golden node at the core saying **"Neural mesh initialized"**.
*   **The Pulse**: Type anything into ChatGPT. If you see a subtle green border appear on your AI response, the DeepSleep scout has successfully captured the thought.

---

![DeepSleep Technical Data Architecture](docs/technical_flow.png)

## 🛠 Troubleshooting & FAQs

If the brain doesn't look like the screenshots, check these "Fixes" first:

### 1. "I only see a black screen"
*   **The Fix**: This usually happens if a Browser Extenson (like uBlock Origin) is blocking the Three.js CDN. 
*   **Action**: Ensure you have an internet connection and have no "Script Blockers" preventing `jsdelivr.net` from loading. In v1.3+, the brain will automatically try a "Safe Boot" to bypass this.

### 2. "The Brain is empty / No nodes appearing"
*   **The Fix**: This is intended! The brain starts empty because it hasn't learned from you yet.
*   **Action**: Go to ChatGPT or Claude and start a conversation. As soon as the AI replies, the brain will capture the "Knowledge Extract" and show a new node in real-time.

### 3. "Everything disappeared! Where is my brain?"
*   **The Fix**: You are likely in **Zen Mode**.
*   **Action**: Press the **`Z`** key on your keyboard to toggle the UI visibility. This allows for a pure, cinematic view of the neural mesh.

### 4. "Buttons are not working"
*   **The Fix**: This happens if the extension context is lost.
*   **Action**: Refresh the `brain.html` tab. Ensure you loaded the folder via "Load Unpacked" and didn't just open the file directly from your desktop.

---

## 🧪 Simulation Mode (No AI Required)
If you want to see the 3D biological visualizations without having to chat with a real LLM:
1. Load the extension as shown above.
2. Open [`test.html`](file:///Users/keshavsharma/basalt/deepsleep-hub/test.html) in your browser.
3. Open the **Semantic Visualization** (`brain.html`) in a second tab.
4. Keep both tabs visible. Click the **"Generate Fake AI Thoughts"** buttons.

---

## 📖 How to Use

Once the extension is loaded, the engine works **automatically**. You don't need to manually sync anything.

1.  **Chat Normally**: Go to ChatGPT, Claude, or Gemini and talk to your AI assistants. 
2.  **Open the Cortex**: Click the DeepSleep icon in your toolbar and select **"Enter Semantic Visualization"**.
3.  **Explore the Brain**:
    *   **Drag**: Rotate the biological model.
    *   **Scroll**: Zoom through 4 levels of depth.
    *   **Trace (Right-Click)**: Right-click any node to reveal the exact context and LLM history.
4.  **Model Continuity**: Source concepts persist across assistants!

---

🔗 **DeepSleep Ecosystem**: For those seeking the full atmospheric experience, also use [DeepSleep-beta](https://github.com/Keshavsharma-code/DeepSleep-beta) for Dream Mode synthesis.

---

![DeepSleep User Journey](docs/user_journey.png)

## 🔒 Privacy & Safety
- **100% Local**: All data is stored in your browser's IndexedDB. 
- **No External Servers**: Your chat history never leaves your machine.
- **Model Agnostic**: Works across any supported LLM platform.
