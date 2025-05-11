import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderGlow?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(29, 185, 84, 0.3)',
  borderGlow = false,
  intensity = 'medium'
}) => {
  // Define glow intensities
  const glowIntensity = {
    low: {
      backdrop: 'backdrop-blur-sm',
      shadow: 'shadow-md',
      borderOpacity: 'border-opacity-20'
    },
    medium: {
      backdrop: 'backdrop-blur-md',
      shadow: 'shadow-lg',
      borderOpacity: 'border-opacity-30'
    },
    high: {
      backdrop: 'backdrop-blur-lg',
      shadow: 'shadow-xl',
      borderOpacity: 'border-opacity-40'
    }
  };

  const { backdrop, shadow, borderOpacity } = glowIntensity[intensity];

  return (
    <div
      className={`relative bg-gradient-to-br from-white/10 to-white/5 ${backdrop} ${shadow} border border-white/10 rounded-xl overflow-hidden ${className}`}
      style={{
        boxShadow: borderGlow ? `0 0 20px ${glowColor}` : 'none',
      }}
    >
      {/* Glow effect */}
      {borderGlow && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)`,
            opacity: 0.6
          }}
        />
      )}
      
      {/* Inner border for additional depth */}
      <div className="absolute inset-[1px] rounded-[10px] bg-agent-black/30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
      
      {/* Scanline effect for futuristic look */}
      <div className="scanline absolute inset-0 pointer-events-none opacity-30" />
    </div>
  );
};

export default GlassCard; 