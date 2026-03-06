import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface MiniSparklineProps {
  className?: string;
  color?: string;
  points?: number;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({ 
  className = '', 
  color = 'rgba(74, 222, 128, 0.15)',
  points = 12 
}) => {
  const path = useMemo(() => {
    const width = 200;
    const height = 60;
    const step = width / (points - 1);
    const pts: [number, number][] = [];
    
    // Generate a nice upward-trending line
    for (let i = 0; i < points; i++) {
      const trend = (i / points) * height * 0.5;
      const noise = Math.sin(i * 1.8) * 12 + Math.cos(i * 0.7) * 8;
      const y = height - trend - noise - 5;
      pts.push([i * step, Math.max(2, Math.min(height - 2, y))]);
    }
    
    // Create smooth curve
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1][0] + pts[i][0]) / 2;
      d += ` Q ${pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * 0.5} ${pts[i - 1][1]}, ${cx} ${(pts[i - 1][1] + pts[i][1]) / 2}`;
    }
    d += ` L ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
    
    // Area fill
    const areaD = d + ` L ${pts[pts.length - 1][0]} ${height} L ${pts[0][0]} ${height} Z`;
    
    return { line: d, area: areaD };
  }, [points]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.svg
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d={path.area} fill="url(#sparkFill)" />
        <path d={path.line} fill="none" stroke={color} strokeWidth="1.5" />
      </motion.svg>
    </div>
  );
};

export default MiniSparkline;
