import React, { useEffect, useRef } from 'react';

interface PrismParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  strokeColor: string;
  opacity: number;
  facets: number;
  aspect: number;
}

interface PrismConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

export const PrismConfetti: React.FC<PrismConfettiProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: PrismParticle[] = [];
    const colors = [
      'rgba(216, 180, 254, 0.75)', // Violet crystal
      'rgba(147, 197, 253, 0.75)', // Cold slate azure
      'rgba(110, 231, 183, 0.8)',  // Emerald facet
      'rgba(253, 230, 138, 0.75)', // Amber prism
      'rgba(255, 255, 255, 0.9)',  // Diamond white
    ];

    const count = 90;
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.45;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 14;
      particles.push({
        x: originX + (Math.random() - 0.5) * 60,
        y: originY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        size: 8 + Math.random() * 16,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        strokeColor: 'rgba(255, 255, 255, 0.85)',
        opacity: 1,
        facets: Math.random() > 0.5 ? 3 : 4, // Triangles or Rhombus crystals
        aspect: 0.6 + Math.random() * 0.8,
      });
    }

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gravity
        p.vx *= 0.985; // Air resistance
        p.rotation += p.vRot;

        if (frame > 50) {
          p.opacity -= 0.015;
        }

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(1, p.aspect);

          ctx.fillStyle = p.color;
          ctx.strokeStyle = p.strokeColor;
          ctx.lineWidth = 1;
          ctx.globalAlpha = Math.max(0, p.opacity);

          // Specular prism facet drawing
          ctx.beginPath();
          if (p.facets === 3) {
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.86, p.size * 0.5);
            ctx.lineTo(-p.size * 0.86, p.size * 0.5);
          } else {
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.65, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.65, 0);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Internal specular glare line
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.5);
          ctx.lineTo(p.size * 0.3, p.size * 0.2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.restore();
        }
      }

      if (alive) {
        animId = requestAnimationFrame(render);
      } else {
        if (onComplete) onComplete();
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};
