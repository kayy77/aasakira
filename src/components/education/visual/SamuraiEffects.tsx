
import React from 'react';
import { motion } from 'framer-motion';

interface SamuraiEffectsProps {
  children: React.ReactNode;
  showGlow?: boolean;
  showPetals?: boolean;
}

const SamuraiEffects = ({ children, showGlow = false, showPetals = false }: SamuraiEffectsProps) => {
  const petalVariants = {
    initial: { y: -10, x: 0, opacity: 0, rotate: 0 },
    animate: { 
      y: window.innerHeight + 100, 
      x: Math.random() * 100 - 50,
      opacity: [0, 1, 1, 0],
      rotate: 360,
      transition: { 
        duration: Math.random() * 3 + 4,
        ease: "easeInOut",
        repeat: Infinity,
        delay: Math.random() * 5
      }
    }
  };

  return (
    <div className="relative">
      {/* Sakura Petals */}
      {showPetals && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px'
              }}
              variants={petalVariants}
              initial="initial"
              animate="animate"
            />
          ))}
        </div>
      )}

      {/* Glow Effect */}
      <motion.div
        className={`relative ${showGlow ? 'shadow-lg shadow-purple-500/20' : ''}`}
        animate={showGlow ? {
          boxShadow: [
            '0 0 20px rgba(168, 85, 247, 0.2)',
            '0 0 40px rgba(168, 85, 247, 0.4)',
            '0 0 20px rgba(168, 85, 247, 0.2)'
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SamuraiEffects;
