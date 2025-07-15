
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
  const petalVariants = {
    initial: {
      y: -20,
      x: 0,
      opacity: 0,
      rotate: 0,
    },
    animate: {
      y: [0, 200, 400],
      x: [0, 30, -20, 40],
      opacity: [0, 0.6, 0.3, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 8,
        ease: "easeOut",
        repeat: Infinity,
        delay: Math.random() * 5,
      }
    }
  };

  return (
    <div className="relative">
      {/* Cherry Blossom Petals */}
      {showPetals && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-300 text-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
              }}
              variants={petalVariants}
              initial="initial"
              animate="animate"
            >
              🌸
            </motion.div>
          ))}
        </div>
      )}

      {/* Glowing Effect */}
      <div className={`relative ${showGlow ? 'animate-pulse' : ''}`}>
        {showGlow && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur-sm -z-10" />
        )}
        {children}
      </div>
    </div>
  );
};

export default SamuraiEffects;
