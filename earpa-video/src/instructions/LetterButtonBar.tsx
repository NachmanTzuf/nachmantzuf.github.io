import React from 'react';

interface Props {
  activeNotes?: string[];
  themeColor: string;
  themeGlow: string;
}

/**
 * NativeButtonGlowOverlay:
 * Eliminates double-stacked UI containers.
 * The underlying app screenshot already displays the native buttons.
 * This component overlays strictly transparent bounding zones, illuminating
 * ONLY the active button with a radiant halo that highlights the native UI.
 */
export const LetterButtonBar: React.FC<Props> = ({
  activeNotes = [],
  themeColor,
  themeGlow,
}) => {
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];

  return (
    <>
      {/* Notation Mode Indicator Chip: Replaces 1 2 3 with Letter Mode C D E */}
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          right: 30,
          padding: '4px 12px',
          borderRadius: 8,
          backgroundColor: '#1b222c',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          fontSize: 12,
          fontWeight: 800,
          color: '#d9cbb5',
          letterSpacing: '0.12em',
          zIndex: 40,
          pointerEvents: 'none',
        }}
      >
        C D E
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: 14,
          right: 14,
          height: 66,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2px',
          zIndex: 40,
          pointerEvents: 'none',
        }}
      >
        {notes.map((note, idx) => {
          const isActive = activeNotes.includes(note);
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                height: 64,
                margin: '0 3px',
                borderRadius: 16,
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.22)' : 'rgba(24, 30, 42, 0.95)',
                border: isActive ? `2.5px solid ${themeColor}` : '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: isActive ? `0 0 25px ${themeColor}, inset 0 0 15px ${themeGlow}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: isActive ? 900 : 700,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  textShadow: isActive ? `0 0 12px ${themeColor}` : 'none',
                }}
              >
                {note}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};
