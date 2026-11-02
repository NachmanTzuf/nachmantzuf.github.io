import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  width?: number;
  accent?: string;
  style?: React.CSSProperties;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  width = 700,
  accent = '#fbbf24',
  style,
}) => {
  const height = Math.round((width * 852) / 393);
  const outerRadius = Math.round(width * 0.088);
  const innerRadius = Math.round(width * 0.076);

  return (
    <div
      style={{
        width,
        height,
        padding: 8,
        boxSizing: 'content-box',
        borderRadius: outerRadius,
        background:
          'linear-gradient(135deg, #9ca3af 0%, #1e293b 28%, #64748b 52%, #0f172a 75%, #475569 100%)',
        boxShadow: `0 35px 90px rgba(0,0,0,0.85), 0 0 45px ${accent}33, inset 0 0 0 1px rgba(255,255,255,0.22)`,
        position: 'relative',
        ...style,
      }}
    >
      {/* 100% Full Edge-to-Edge Screen Display */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: innerRadius,
          overflow: 'hidden',
          background: '#040810',
        }}
      >
        {children}
      </div>
    </div>
  );
};
