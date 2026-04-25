import React, { useState } from 'react';

const SettingsModal = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState({ ...settings });

  const handleChange = (field, value) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="fade-in" style={{
        background: 'var(--panel-bg)',
        width: '500px',
        maxWidth: '90%',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div className="panel-header">
          <h2 style={{ fontSize: '18px', color: 'white' }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '70vh' }}>
          
          {/* API Key */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>GROQ API KEY</label>
            <input 
              type="password"
              value={localSettings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="gsk_..."
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'white', outline: 'none', width: '100%' }}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

          {/* Suggestions Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>SUGGESTIONS PROMPT</label>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)' }}>Shown in the middle column. Triggers every ~30s on new transcript context.</p>
            <textarea 
              value={localSettings.suggestionPrompt}
              onChange={(e) => handleChange('suggestionPrompt', e.target.value)}
              rows={6}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'white', outline: 'none', resize: 'vertical', fontSize: '12px', lineHeight: '1.5', fontFamily: 'var(--mono)' }}
            />
          </div>

          {/* Suggestions Context Window */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>SUGGESTIONS CONTEXT WINDOW (last N transcript chunks)</label>
            <input 
              type="number"
              value={localSettings.suggestionContextWindow}
              onChange={(e) => handleChange('suggestionContextWindow', parseInt(e.target.value))}
              min={1} max={20}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'white', outline: 'none', width: '100px' }}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

          {/* Detailed Answer Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>DETAILED ANSWER PROMPT</label>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)' }}>Used when a user clicks a suggestion card to get an expanded answer.</p>
            <textarea 
              value={localSettings.detailedAnswerPrompt}
              onChange={(e) => handleChange('detailedAnswerPrompt', e.target.value)}
              rows={4}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'white', outline: 'none', resize: 'vertical', fontSize: '12px', lineHeight: '1.5', fontFamily: 'var(--mono)' }}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

          {/* Chat Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>CHAT PROMPT</label>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)' }}>Used when the user types a question manually in the right panel.</p>
            <textarea 
              value={localSettings.chatPrompt}
              onChange={(e) => handleChange('chatPrompt', e.target.value)}
              rows={4}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'white', outline: 'none', resize: 'vertical', fontSize: '12px', lineHeight: '1.5', fontFamily: 'var(--mono)' }}
            />
          </div>

          {/* Expanded Answers Context Window */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>EXPANDED ANSWERS CONTEXT WINDOW (last N transcript chunks)</label>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)' }}>Applies to both clicked suggestions and manual chat messages.</p>
            <input 
              type="number"
              value={localSettings.chatContextWindow}
              onChange={(e) => handleChange('chatContextWindow', parseInt(e.target.value))}
              min={1} max={50}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'white', outline: 'none', width: '100px' }}
            />
          </div>

        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} className="button secondary">Cancel</button>
          <button onClick={() => onSave(localSettings)} className="button">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
