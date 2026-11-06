import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import { haptics } from '../services/haptics';

interface PrismStartupAnimationProps {
  onComplete: () => void;
}

interface SpectralBand {
  name: string;
  color: string;
  glowColor: string;
  wavelength: number; // nm
  n: number;          // refractive index
}

export const PrismStartupAnimation: React.FC<PrismStartupAnimationProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<'laser' | 'refract' | 'reveal' | 'ready'>('laser');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Audio/tactile triggers
    const t1 = setTimeout(() => {
      setPhase('refract');
      haptics.playSplitterSnap();
    }, 550);

    const t2 = setTimeout(() => {
      setPhase('reveal');
      haptics.playGlassExplosion();
    }, 1400);

    const t3 = setTimeout(() => {
      setPhase('ready');
    }, 2600);

    // Physics definition: Snell's Law & Cauchy's Dispersion Equation
    // n(lambda) = A + B / lambda^2
    const spectralBands: SpectralBand[] = [
      { name: 'Red', color: '#FF3B30', glowColor: 'rgba(255, 59, 48, 0.45)', wavelength: 700, n: 1.512 },
      { name: 'Orange', color: '#FF9500', glowColor: 'rgba(255, 149, 0, 0.45)', wavelength: 620, n: 1.517 },
      { name: 'Yellow', color: '#FFCC00', glowColor: 'rgba(255, 204, 0, 0.45)', wavelength: 580, n: 1.522 },
      { name: 'Green', color: '#34C759', glowColor: 'rgba(52, 199, 89, 0.45)', wavelength: 530, n: 1.528 },
      { name: 'Cyan', color: '#32ADE6', glowColor: 'rgba(50, 173, 230, 0.5)', wavelength: 490, n: 1.535 },
      { name: 'Blue', color: '#007AFF', glowColor: 'rgba(0, 122, 255, 0.5)', wavelength: 450, n: 1.543 },
      { name: 'Violet', color: '#AF52DE', glowColor: 'rgba(175, 82, 222, 0.55)', wavelength: 400, n: 1.554 },
    ];

    // Flying photons / dust particles along the beam
    const photons = Array.from({ length: 45 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 80,
      vx: 3 + Math.random() * 5,
      size: 1 + Math.random() * 2,
      opacity: Math.random(),
    }));

    const render = () => {
      t += 0.022;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2 + mouseX * 0.3;
      const cy = canvas.height / 2 + mouseY * 0.3 - 20;

      // 1. Equilateral Triangle Prism Geometry
      // Apex at top, symmetric sloped faces
      const prismSide = Math.min(260, canvas.width * 0.28);
      const prismHeight = (Math.sqrt(3) / 2) * prismSide;

      const apex = { x: cx, y: cy - prismHeight * 0.62 };
      const leftBase = { x: cx - prismSide / 2, y: cy + prismHeight * 0.38 };
      const rightBase = { x: cx + prismSide / 2, y: cy + prismHeight * 0.38 };

      // 2. Incident Laser Ray (Shooting from left)
      const laserStartY = cy + 20 + mouseY * 0.4;
      const laserStartX = -40;

      // Intersection with left face: line between leftBase and apex
      // Parameter t on left face edge
      const hitProgress = 0.52; // Hits slightly below midpoint of left face
      const hitPoint = {
        x: leftBase.x + (apex.x - leftBase.x) * hitProgress,
        y: leftBase.y + (apex.y - leftBase.y) * hitProgress,
      };

      // Draw Incident Laser Beam
      const beamProgress = Math.min(1, t * 2.2);
      const curLaserX = laserStartX + (hitPoint.x - laserStartX) * beamProgress;
      const curLaserY = laserStartY + (hitPoint.y - laserStartY) * beamProgress;

      ctx.save();
      // Outer volumetric laser glow
      const laserGlow = ctx.createLinearGradient(laserStartX, laserStartY, hitPoint.x, hitPoint.y);
      laserGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
      laserGlow.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
      laserGlow.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

      ctx.beginPath();
      ctx.moveTo(laserStartX, laserStartY);
      ctx.lineTo(curLaserX, curLaserY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 14;
      ctx.stroke();

      // Sharp white core
      ctx.beginPath();
      ctx.moveTo(laserStartX, laserStartY);
      ctx.lineTo(curLaserX, curLaserY);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.8;
      ctx.shadowColor = 'rgba(255, 255, 255, 1)';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();

      // 3. Draw The 2D Triangular Prism Body
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(apex.x, apex.y);
      ctx.lineTo(rightBase.x, rightBase.y);
      ctx.lineTo(leftBase.x, leftBase.y);
      ctx.closePath();

      // Refractive crystal body fill
      const prismFillGrad = ctx.createLinearGradient(leftBase.x, apex.y, rightBase.x, rightBase.y);
      prismFillGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
      prismFillGrad.addColorStop(0.4, 'rgba(192, 132, 252, 0.08)');
      prismFillGrad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');

      ctx.fillStyle = prismFillGrad;
      ctx.fill();

      // Specular Bevel Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Internal bevel facet reflection line
      ctx.beginPath();
      ctx.moveTo(apex.x, apex.y);
      ctx.lineTo(cx, cy + 25);
      ctx.lineTo(leftBase.x, leftBase.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // 4. Snell's Law Refraction & Dispersion (Activates when laser strikes face)
      if (t > 0.45) {
        // Specular flare at point of entry
        const flareSize = 10 + Math.sin(t * 12) * 2.5;
        const flareGrad = ctx.createRadialGradient(hitPoint.x, hitPoint.y, 0, hitPoint.x, hitPoint.y, flareSize * 2);
        flareGrad.addColorStop(0, '#FFFFFF');
        flareGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
        flareGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.save();
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(hitPoint.x, hitPoint.y, flareSize * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Surface Fresnel reflection beam (bouncing upward-left)
        ctx.save();
        const reflLen = 220;
        const reflAngle = -Math.PI * 0.65;
        ctx.beginPath();
        ctx.moveTo(hitPoint.x, hitPoint.y);
        ctx.lineTo(hitPoint.x + Math.cos(reflAngle) * reflLen, hitPoint.y + Math.sin(reflAngle) * reflLen);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();

        // 5. Internal Paths & Dispersive Exit Beams
        const dispersionDist = Math.max(canvas.width * 0.7, 700);
        const exitProgress = Math.min(1, (t - 0.45) * 1.8);

        spectralBands.forEach((band, idx) => {
          // Snell's Law computation:
          // Higher n -> larger deviation angle (Violet bends downwards the most)
          // Red (low n = 1.512) bends least, Violet (high n = 1.554) bends most
          const deviationFactor = (band.n - 1.512) / (1.554 - 1.512); // 0 (red) to 1 (violet)

          // Internal exit point on right face:
          // Red exits higher up, Violet exits slightly lower down on right face
          const rightFaceProgress = 0.50 + deviationFactor * 0.12;
          const exitPoint = {
            x: apex.x + (rightBase.x - apex.x) * rightFaceProgress,
            y: apex.y + (rightBase.y - apex.y) * rightFaceProgress,
          };

          // Draw internal refracted beam
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(hitPoint.x, hitPoint.y);
          ctx.lineTo(exitPoint.x, exitPoint.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.restore();

          // External physics dispersion angle
          // Red: shallow deviation (~ +12 deg), Violet: steep deviation (~ +34 deg)
          const exitAngleRad = (10 + deviationFactor * 24) * (Math.PI / 180);

          const targetX = exitPoint.x + Math.cos(exitAngleRad) * dispersionDist * exitProgress;
          const targetY = exitPoint.y + Math.sin(exitAngleRad) * dispersionDist * exitProgress;

          // Draw Spectral Ray with volumetric bloom
          ctx.save();
          // Soft bloom aura
          const auraGrad = ctx.createLinearGradient(exitPoint.x, exitPoint.y, targetX, targetY);
          auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
          auraGrad.addColorStop(0.12, band.color);
          auraGrad.addColorStop(0.7, band.glowColor);
          auraGrad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.moveTo(exitPoint.x, exitPoint.y);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = auraGrad;
          ctx.lineWidth = 12 + Math.sin(t * 4 + idx) * 2;
          ctx.stroke();

          // Sharp vibrant core ray
          ctx.beginPath();
          ctx.moveTo(exitPoint.x, exitPoint.y);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = band.color;
          ctx.lineWidth = 2.6;
          ctx.shadowColor = band.color;
          ctx.shadowBlur = 18;
          ctx.stroke();

          ctx.restore();
        });

        // Exit point specular flare
        const exitFlarePoint = {
          x: apex.x + (rightBase.x - apex.x) * 0.56,
          y: apex.y + (rightBase.y - apex.y) * 0.56,
        };
        const exitFlare = ctx.createRadialGradient(exitFlarePoint.x, exitFlarePoint.y, 0, exitFlarePoint.x, exitFlarePoint.y, 18);
        exitFlare.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        exitFlare.addColorStop(0.5, 'rgba(192, 132, 252, 0.4)');
        exitFlare.addColorStop(1, 'transparent');

        ctx.save();
        ctx.fillStyle = exitFlare;
        ctx.beginPath();
        ctx.arc(exitFlarePoint.x, exitFlarePoint.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 6. Flying photons along beam
        ctx.save();
        photons.forEach((p) => {
          p.x += p.vx;
          if (p.x > canvas.width + 50) {
            p.x = exitFlarePoint.x;
            p.y = exitFlarePoint.y + (Math.random() - 0.5) * 30;
          }

          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.7})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#08090A] flex flex-col items-center justify-center overflow-hidden select-none">
      {/* 2D Masterpiece Physics Optics Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Skip Intro Button */}
      <button
        onClick={() => {
          haptics.playSplitterSnap();
          onComplete();
        }}
        className="absolute top-8 right-8 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-slate-300 hover:text-white border border-white/[0.1] backdrop-blur-md transition-all cursor-pointer"
      >
        <span>Skip Intro</span>
        <SkipForward className="w-3.5 h-3.5" />
      </button>

      {/* Center Cinematic Typography Reveal */}
      <div className="relative z-20 text-center pointer-events-none px-6">
        <AnimatePresence>
          {(phase === 'reveal' || phase === 'ready') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] text-purple-300 font-mono text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Physical Optics · Snells Law</span>
              </div>

              <h1 className="text-6xl md:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-cyan-200 drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                PRISM
              </h1>

              <p className="text-slate-400 font-mono text-xs md:text-sm tracking-widest uppercase max-w-lg mx-auto">
                AUTHENTIC PAST PAPERS · LIVE MARK SCHEMES · PHYSICAL PRECISION
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enter Action Button */}
      {phase === 'ready' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-30 mt-14"
        >
          <button
            onClick={() => {
              haptics.playSplitterSnap();
              onComplete();
            }}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all cursor-pointer group"
          >
            <span>Enter Prism</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
