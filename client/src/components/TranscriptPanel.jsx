import { useEffect, useRef } from "react";

export default function TranscriptPanel({ transcript }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {transcript.length === 0 ? null : (
        transcript.map((entry, index) => (
          <div key={index} className="fade-in">
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
              <span style={{ color: 'var(--text-dim)', marginRight: '8px' }}>{entry.timestamp}</span>
              {entry.text}
            </p>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}