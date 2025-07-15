
import React from 'react';
import { motion } from 'framer-motion';

interface SamuraiEffectsProps {
  children: React.ReactNode;
  showGlow?: boolean;
  showPetals?: boolean;
}

const SamuraiEffects: React.FC<SamuraiEffectsProps> = ({ 
  children, 
  showGlow = false, 
  showPetals = false 
}) => {
  // Fixed variants with proper TypeScript types
  const glowVariants = {
    initial: { 
      opacity: 0 
    },
    animate: { 
      opacity: [0, 1, 0],
      transition: { 
        duration: 3, 
        ease: "easeInOut" as const, 
        repeat: Infinity 
      }
    }
  };

  const petalVariants = {
    initial: { 
      y: -100, 
      x: 0, 
      opacity: 0, 
      rotate: 0 
    },
    animate: { 
      y: [0, 100, 200],
      x: [0, 50, -20],
      opacity: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: { 
        duration: 8, 
        ease: "easeInOut" as const, 
        repeat: Infinity, 
        delay: Math.random() * 2 
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Cherry blossom petals - only show if showPetals is true */}
      {showPetals && [...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-pink-300 rounded-full opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          variants={petalVariants}
          initial="initial"
          animate="animate"
        />
      ))}
      
      {/* Mystical glow effect - only show if showGlow is true */}
      {showGlow && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 pointer-events-none"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
      )}
      
      {children}
    </div>
  );
};

export default SamuraiEffects;
