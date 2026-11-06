import React, { useEffect, useState } from 'react';

export const AmbientMesh: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.3 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#08090A]">
      {/* Primary Slow-Shifting Ultraviolet Glow */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[65vw] h-[65vw] rounded-full blur-[140px] opacity-40 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.18) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)',
          transform: `translate(${mousePos.x * 40 - 20}px, ${mousePos.y * 30 - 15}px)`,
        }}
      />

      {/* Secondary Cold Slate / Cyan Refraction */}
      <div
        className="absolute top-[40%] -right-[15%] w-[60vw] h-[60vw] rounded-full blur-[160px] opacity-35 transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.12) 0%, rgba(148, 163, 184, 0.05) 50%, transparent 75%)',
          transform: `translate(${-(mousePos.x * 50 - 25)}px, ${-(mousePos.y * 40 - 20)}px)`,
        }}
      />

      {/* Tertiary Subtle Deep Purple Horizon */}
      <div
        className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[50vw] rounded-full blur-[180px] opacity-30"
        style={{
          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.09) 0%, rgba(30, 41, 59, 0.12) 60%, transparent 80%)',
        }}
      />

      {/* Dynamic Cursor-Tethered Specular Ambient Cone */}
      <div
        className="absolute w-[450px] h-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-25 mix-blend-screen transition-opacity duration-300"
        style={{
          left: `calc(var(--cursor-x, 50%))`,
          top: `calc(var(--cursor-y, 50%))`,
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(147, 197, 253, 0.05) 40%, transparent 70%)',
        }}
      />

      {/* Microscopic Noise Grid for Film/Glass Texture */}
      <div 
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
