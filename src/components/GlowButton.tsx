import { motion } from 'framer-motion';
import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const GlowButton = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  className = '',
  ...props
}: GlowButtonProps) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-2 px-4',
    md: 'text-sm py-2.5 px-5',
    lg: 'text-base py-3 px-6',
  };
  
  // Variant classes
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-agent-green/90 to-agent-green/80
      hover:from-agent-green hover:to-agent-green
      text-black font-medium
      shadow-[0_0_15px_rgba(0,255,65,0.5)]
      hover:shadow-[0_0_25px_rgba(0,255,65,0.7)]
      border border-agent-green/50
    `,
    secondary: `
      bg-black/50 backdrop-blur-sm
      text-agent-green font-medium
      shadow-[0_0_10px_rgba(0,255,65,0.2)]
      hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]
      border border-agent-green/30
      hover:border-agent-green/60
    `,
    outline: `
      bg-transparent
      text-agent-green font-medium
      shadow-none
      hover:shadow-[0_0_10px_rgba(0,255,65,0.2)]
      border border-agent-green/40
      hover:border-agent-green/70
      hover:bg-agent-green/5
    `,
  };
  
  return (
    <motion.button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-md
        transition-all duration-300
        flex items-center justify-center gap-2
        ${className}
      `}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="relative -ml-1">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="relative -mr-1">{icon}</span>
      )}
    </motion.button>
  );
};

export default GlowButton; 