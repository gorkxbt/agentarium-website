import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  animationDelay?: number;
  hoverable?: boolean;
  borderGlow?: boolean;
};

const GlassCard = ({
  children,
  className = '',
  glowColor = 'rgba(0, 255, 65, 0.3)',
  animationDelay = 0,
  hoverable = false,
  borderGlow = false
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: animationDelay,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={hoverable ? { 
        y: -5,
        boxShadow: `0 10px 25px -5px ${glowColor}`
      } : undefined}
      className={`
        relative backdrop-blur-md bg-black/40 
        border border-white/10
        ${borderGlow ? `before:absolute before:inset-0 before:p-[1px] before:rounded-[inherit] before:bg-gradient-to-b before:from-agent-green/50 before:to-transparent before:-z-10` : ''}
        ${hoverable ? 'transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
      style={{
        boxShadow: `0 0 15px -5px ${glowColor}`,
      }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard; 