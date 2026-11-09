import React from 'react';

interface Props {
  activeNotes?: string[];
  themeColor: string;
  themeGlow: string;
}

export const LetterButtonBar: React.FC<Props> = ({
  activeNotes = [],
  themeColor,
  themeGlow,
}) => {
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 12,
        right: 12,
        height: 60,
        borderRadius: 22,
        backgroundColor: 'rgba(10, 20, 18, 0.94)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6px',
        zIndex: 40,
      }}
    >
      {notes.map((note, idx) => {
        const isActive = activeNotes.includes(note);
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              height: 48,
              margin: '0 2px',
              borderRadius: 14,
              backgroundColor: isActive ? themeColor : 'rgba(255, 255, 255, 0.06)',
              border: `1.5px solid ${isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.12)'}`,
              boxShadow: isActive ? `0 0 20px ${themeColor}, inset 0 0 10px #ffffff` : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <span
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: isActive ? '#000000' : '#ffffff',
                lineHeight: 1,
              }}
            >
              {note}
            </span>
            {idx === 7 && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: isActive ? '#000000' : 'rgba(255,255,255,0.5)',
                  marginTop: 1,
                }}
              >
                +8ve
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
