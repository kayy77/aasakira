
import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
}

const CherryBlossomBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize petals
    const createPetal = (): Petal => ({
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 2 + 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.5 ? '#ec4899' : '#a855f7',
    });

    // Create initial petals
    for (let i = 0; i < 20; i++) {
      petalsRef.current.push(createPetal());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach((petal, index) => {
        // Update petal position
        petal.y += petal.speed;
        petal.x += Math.sin(petal.y * 0.01) * 0.5;
        petal.rotation += petal.rotationSpeed;

        // Reset petal when it goes off screen
        if (petal.y > canvas.height + 20) {
          petalsRef.current[index] = createPetal();
          return;
        }

        // Draw petal
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate((petal.rotation * Math.PI) / 180);
        ctx.globalAlpha = petal.opacity;

        // Create petal shape
        ctx.fillStyle = petal.color;
        ctx.beginPath();
        
        // Simple petal shape using ellipses
        ctx.ellipse(0, -petal.size/2, petal.size/3, petal.size, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.ellipse(0, petal.size/2, petal.size/3, petal.size, 0, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default CherryBlossomBackground;
