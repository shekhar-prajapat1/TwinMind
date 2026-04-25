import React from 'react';

const Header = ({ onOpenSettings, onExport }) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: 'var(--bg)', // mockup shows dark bg for header
      borderBottom: '1px solid var(--border)',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'white' }}>
          TwinMind — Live Suggestions Web App
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-dim)' }}>
        <span>3-column layout • Transcript • Live Suggestions • Chat</span>
        <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
        <button onClick={onExport} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '13px', padding: 0 }}>Export</button>
        <button onClick={onOpenSettings} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '13px', padding: 0 }}>Settings</button>
      </div>
    </header>
  );
};

export default Header;

