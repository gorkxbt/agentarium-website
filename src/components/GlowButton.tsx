import React, { useState } from 'react';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  className = '',
  fullWidth = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Base classes
  const baseClasses = `
    relative font-medium rounded-md inline-flex items-center justify-center
    transition-all duration-300 ease-in-out focus:outline-none
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 space-x-1.5',
    md: 'text-sm px-4 py-2 space-x-2',
    lg: 'text-base px-5 py-2.5 space-x-2.5'
  };
  
  // Variant classes
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-agent-green-muted to-agent-green
      text-black font-semibold
      hover:from-agent-green hover:to-agent-green
      active:from-agent-green-dark active:to-agent-green-muted
    `,
    secondary: `
      bg-agent-black/70 backdrop-blur-sm
      text-agent-green border border-agent-green-muted/40
      hover:bg-agent-black hover:border-agent-green-muted/70
      active:bg-agent-gray
    `,
    outline: `
      bg-transparent
      text-agent-green-muted border border-agent-green-muted/40
      hover:bg-agent-green-muted/5 hover:border-agent-green-muted/70
      active:bg-agent-green-muted/10
    `
  };
  
  // Handle hover effects
  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    if (!disabled) setIsHovered(false);
  };
  
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect for primary */}
      {variant === 'primary' && (
        <div 
          className={`absolute inset-0 rounded-md transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={{
            boxShadow: '0 0 20px rgba(29, 185, 84, 0.7)',
            zIndex: -1
          }}
        />
      )}
      
      {/* Content with icon */}
      <div className="flex items-center justify-center">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </div>
      
      {/* Subtle highlight effect for top edge */}
      {variant === 'primary' && (
        <div 
          className="absolute inset-x-0 top-0 h-[1px] rounded-t-md bg-white/30"
          style={{ opacity: 0.7 }}
        />
      )}
    </button>
  );
};

export default GlowButton; 