# TwinMind - Live Suggestions

TwinMind is an always-on AI meeting copilot that listens to live audio and surfaces context-aware suggestions in real-time, helping users sound smart, prepared, and insightful during discussions.

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- A Groq API Key

### Local Development
1. **Clone the repository.**
2. **Start the Backend:**
   ```bash
   cd server
   npm install
   node index.js
   ```
   The backend will start on `http://localhost:5000`.

3. **Start the Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

4. **Configure Settings:**
   Open the app in your browser, click **Settings**, and paste your Groq API Key. The app will immediately begin working.

## 🛠️ Tech Stack & Choices

- **Frontend:** React + Vite. Chosen for its fast HMR, lightweight footprint, and component-based architecture, which perfectly suits the complex state management required for audio chunking, transcript appending, and dynamic chat rendering.
- **Backend:** Node.js + Express. Provides a lightweight, non-blocking proxy to handle audio buffers (via `multer`) and stream interactions securely to the Groq API without exposing keys on the client.
- **Styling:** Pure CSS (CSS Variables). Utilized for maximum performance and highly customizable dark-theme matching without the overhead of heavy component libraries.
- **AI Models (Groq Cloud):**
  - Transcription: `whisper-large-v3`
  - Generation/Inference: `llama-3.3-70b-versatile` (See Tradeoffs below).

## 🧠 Prompt Strategy

The core challenge of live meeting suggestions is avoiding generic, useless advice ("Ask for more details"). To solve this:
1. **Recency Bias Extraction:** Instead of passing the massive, ever-growing transcript array into the suggestions engine, the backend uses a custom `getLastSentence` helper. This forces the LLM to focus *strictly* on the absolute most recent conversational context, guaranteeing hyper-relevant suggestions.
2. **Strict System Formatting:** The default prompt explicitly forbids generic responses and enforces an exact JSON array output of size 3 (Question, Insight, Clarification).
3. **De-duplication:** The frontend maintains a flat list of previously generated suggestions and strictly filters incoming batches against this list (case-insensitive) to prevent the AI from repeatedly offering the exact same advice during pauses.
4. **Editable via UI:** Both the `suggestionPrompt` and `chatPrompt` are exposed via the Settings modal. The frontend passes these down as the primary system instructions, allowing evaluators to modify the logic dynamically.

## ⚖️ Tradeoffs & Implementation Notes

### 1. Model Deprecation Fallback
The assignment strictly requested using `gpt-oss-120b` for suggestions and chat to standardise prompt quality evaluation. However, during development, the Groq API returned a `404 model_not_found` / `model_decommissioned` error for this specific model ID. 
To ensure a robust, crash-free evaluation experience, the backend implements an automatic fallback mechanism: it attempts `gpt-oss-120b` first, but upon failure, instantly falls back to the current, highly capable `llama-3.3-70b-versatile`. 

### 2. Audio Chunking Interval
While the assignment suggested a `~30s` interval for transcript batching, the `MicRecorder` was optimized down to `10s` intervals. This dramatically improves the "live" feeling of the app and surfaces suggestions significantly faster, vastly improving the UX in a real-time meeting setting.

### 3. File Extension Enforcement
Groq's Whisper API is highly strict regarding file extensions. Browsers often generate `audio/webm` blobs without explicit extensions. The Node.js backend intercepts the raw chunk, writes it to the local disk using `multer.diskStorage`, and forces a `.webm` extension before piping it to Groq, preventing `400 Invalid File Type` rejections.

---

*Developed for the TwinMind Live Suggestions Assignment.*
