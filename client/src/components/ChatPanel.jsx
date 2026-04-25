import { useState, useRef, useEffect } from "react";

export default function ChatPanel({ chat, onSend }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {chat.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)',
            fontSize: '13px',
            textAlign: 'center',
            padding: '40px'
          }}>
            Click a suggestion or type a question below.
          </div>
        ) : (
          chat.map((msg, i) => (
            <div key={i} className="fade-in" style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg)',
                color: msg.role === 'user' ? 'white' : 'var(--text)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                fontSize: '14px',
                lineHeight: '1.5',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {msg.text}
              </div>
              <span style={{ 
                fontSize: '10px', 
                color: 'var(--text-dim)', 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '0 4px'
              }}>
                {msg.timestamp}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ 
        display: 'flex', 
        gap: '8px', 
        background: 'var(--bg)',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        marginTop: '16px'
      }}>
        <input
          type="text"
          value={input}
          placeholder="Ask anything..."
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            outline: 'none',
            fontSize: '14px'
          }}
        />
        <button type="submit" className="button" style={{ padding: '8px 16px', borderRadius: '8px' }}>
          Send
        </button>
      </form>
    </div>
  );
}