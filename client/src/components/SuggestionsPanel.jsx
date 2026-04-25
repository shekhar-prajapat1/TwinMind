export default function SuggestionsPanel({ batches, onClickSuggestion }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {batches.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '13px'
        }}>
          Suggestions appear here once recording starts.
        </div>
      ) : (
        batches.map((batch, batchIndex) => (
          <div key={batch.id} className="fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            opacity: batchIndex === 0 ? 1 : 0.6 // Mockup says older batches fade
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0 4px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                BATCH AT {batch.timestamp}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {batch.items.map((suggestion, index) => (
                <div
                  key={index}
                  className="card"
                  onClick={() => onClickSuggestion(suggestion.preview)}
                >
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text)' }}>
                    {suggestion.preview}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}