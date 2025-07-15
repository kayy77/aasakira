
import React from 'react';
import { motion } from 'framer-motion';

interface SamuraiEffectsProps {
  children: React.ReactNode;
  showGlow?: boolean;
  showPetals?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const SamuraiEffects: React.FC<SamuraiEffectsProps> = ({ 
  children, 
  showGlow = false, 
  showPetals = false,
  intensity = 'medium'
}) => {
  const glowVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  const petalVariants = {
    initial: { 
      y: -20, 
      x: 0, 
      opacity: 0, 
      rotate: 0 
    },
    animate: { 
      y: [0, 100, 200, 300],
      x: [0, 30, -20, 10],
      opacity: [0, 0.8, 0.6, 0],
      rotate: [0, 180, 360, 540],
      transition: {
        duration: 8,
        ease: "easeOut",
        repeat: Infinity,
        delay: Math.random() * 3
      }
    }
  };

  const intensityClasses = {
    low: 'shadow-md',
    medium: 'shadow-lg shadow-purple-500/20',
    high: 'shadow-2xl shadow-purple-500/40'
  };

  return (
    <div className="relative">
      {/* Glow Effect */}
      {showGlow && (
        <motion.div
          className={`absolute inset-0 rounded-lg ${intensityClasses[intensity]} pointer-events-none`}
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Cherry Blossom Petals */}
      {showPetals && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-pink-300 rounded-full opacity-70"
              style={{
                left: `${20 + i * 15}%`,
                top: '0%'
              }}
              variants={petalVariants}
              initial="initial"
              animate="animate"
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default SamuraiEffects;
