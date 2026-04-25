import { useState, useEffect } from "react";
import Header from "./components/Header";
import MicRecorder from "./components/MicRecorder";
import TranscriptPanel from "./components/TranscriptPanel";
import SuggestionsPanel from "./components/SuggestionsPanel";
import ChatPanel from "./components/ChatPanel";
import SettingsModal from "./components/SettingsModal";

import {
  transcribeAudio,
  getSuggestions,
  sendChat,
} from "./api";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [suggestionBatches, setSuggestionBatches] = useState([]);
  const [chat, setChat] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings (persisted)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("twinmind_settings");
    const parsed = saved ? JSON.parse(saved) : {};
    
    return {
      apiKey: parsed.apiKey || "",
      suggestionPrompt: parsed.suggestionPrompt || `You are an expert real-time meeting assistant.
You will be given ONE latest sentence from a conversation.
Generate EXACTLY 3 high-quality suggestions:
1. A precise follow-up question
2. A useful insight or next step
3. A clarification to remove ambiguity

Rules:
- Use ONLY the given sentence
- Each suggestion must be DIFFERENT in intent
- Avoid vague phrases
- Keep suggestions concise (8–15 words)

Return ONLY JSON:
[
  { "preview": "..." },
  { "preview": "..." },
  { "preview": "..." }
]`,
      detailedAnswerPrompt: parsed.detailedAnswerPrompt || `You are a highly capable AI meeting assistant.
A user has clicked on a brief suggestion. Your job is to expand on this suggestion and provide a highly detailed, actionable, and comprehensive answer using the provided conversation context.`,
      chatPrompt: parsed.chatPrompt || `You are a highly capable AI meeting assistant. 
Use the transcript context to provide detailed, accurate, and helpful answers to the user's manual questions.`,
      suggestionContextWindow: parsed.suggestionContextWindow || parsed.contextWindow || 3,
      chatContextWindow: parsed.chatContextWindow || 10,
    };
  });

  useEffect(() => {
    localStorage.setItem("twinmind_settings", JSON.stringify(settings));
  }, [settings]);

  const handleToggleRecording = () => {
    setIsRecording(prev => !prev);
  };

  // 🎤 Handle audio chunk
  const handleChunk = async (audioBlob) => {
    if (!settings.apiKey) {
      alert("Please enter your Groq API Key in Settings first.");
      setIsRecording(false);
      return;
    }

    try {
      const res = await transcribeAudio(audioBlob, settings.apiKey);
      const text = res.text;

      if (!text || text.trim().length < 2) return;

      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newEntry = { text, timestamp };

      setTranscript(prev => {
        const updated = [...prev, newEntry];
        fetchSuggestions(updated);
        return updated;
      });

    } catch (error) {
      console.error("Transcription Error:", error);
    }
  };

  // 💡 Suggestions (NO DUPLICATES FIXED)
  const fetchSuggestions = async (currentTranscript) => {
    try {
      const contextText = currentTranscript
        .slice(-settings.suggestionContextWindow)
        .map(t => t.text)
        .join(" ");

      const suggestions = await getSuggestions(
        contextText,
        settings.apiKey,
        settings.suggestionPrompt
      );

      // 🔥 remove duplicates across ALL batches
      setSuggestionBatches(prev => {
        const existing = prev
          .flatMap(batch => batch.items)
          .map(s => s.preview.toLowerCase());

        const unique = suggestions.filter(
          s => !existing.includes(s.preview.toLowerCase())
        );

        if (unique.length === 0) return prev;

        return [
          {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            items: unique,
          },
          ...prev,
        ];
      });

    } catch (error) {
      console.error("Suggestions Error:", error);
    }
  };

  const handleRefreshSuggestions = () => {
    fetchSuggestions(transcript);
  };

  // 💬 Chat
  const handleClickSuggestion = async (suggestionText) => {
    if (!settings.apiKey) return;

    const timestamp = new Date().toLocaleTimeString();

    setChat(prev => [
      ...prev,
      { role: "user", text: suggestionText, timestamp },
    ]);

    try {
      // Use chatContextWindow to limit context, and detailedAnswerPrompt for clicked suggestions
      const contextText = transcript
        .slice(-settings.chatContextWindow)
        .map(t => t.text)
        .join(" ");

      const res = await sendChat(
        suggestionText,
        contextText,
        settings.apiKey,
        settings.detailedAnswerPrompt
      );

      setChat(prev => [
        ...prev,
        {
          role: "assistant",
          text: res.reply,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  const handleManualSend = async (text) => {
    if (!settings.apiKey || !text.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    setChat(prev => [...prev, { role: "user", text, timestamp }]);

    try {
      // Manual chat uses chatPrompt (separate from detailedAnswerPrompt)
      const contextText = transcript
        .slice(-settings.chatContextWindow)
        .map(t => t.text)
        .join(" ");

      const res = await sendChat(text, contextText, settings.apiKey, settings.chatPrompt);

      setChat(prev => [
        ...prev,
        { role: "assistant", text: res.reply, timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  // 📦 Export
  const handleExport = () => {
    const data = {
      transcript,
      suggestionBatches,
      chat,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `twinmind-session-${Date.now()}.json`;
    a.click();
  };

  return (
    <div id="root">
      <Header
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExport={handleExport}
      />

      <main className="app-container">
        {/* LEFT */}
        <section className="panel">
          <div className="panel-header">
            <h2>1. MIC &amp; TRANSCRIPT</h2>
            <span style={{ fontSize: '11px', color: isRecording ? 'var(--accent)' : 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {isRecording ? 'LIVE' : 'IDLE'}
            </span>
          </div>
          <div className="panel-content">
            <MicRecorder isRecording={isRecording} onToggleRecording={handleToggleRecording} onChunk={handleChunk} />
            <TranscriptPanel transcript={transcript} />
          </div>
        </section>

        {/* MIDDLE */}
        <section className="panel">
          <div className="panel-header">
            <h2>2. LIVE SUGGESTIONS</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {suggestionBatches.length} BATCHES
            </span>
          </div>

          <div className="panel-content" style={{ padding: 0 }}>
            {/* Action Bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleRefreshSuggestions}
                className="button secondary"
                style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }}
              >
                ↻ Reload suggestions
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>auto-refresh in 26s</span>
            </div>
            
            <div style={{ padding: '20px' }}>
              <SuggestionsPanel
                batches={suggestionBatches}
                onClickSuggestion={handleClickSuggestion}
              />
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="panel">
          <div className="panel-header">
            <h2>3. CHAT (DETAILED ANSWERS)</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em' }}>
              SESSION-ONLY
            </span>
          </div>
          <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <ChatPanel chat={chat} onSend={handleManualSend} />
          </div>
        </section>
      </main>

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings);
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;