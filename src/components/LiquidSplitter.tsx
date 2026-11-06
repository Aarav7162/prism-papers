import React, { useState, useEffect, useRef } from 'react';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { haptics } from '../services/haptics';

interface LiquidSplitterProps {
  splitRatio: number; // percentage (e.g. 50 for 50/50)
  onRatioChange: (ratio: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const LiquidSplitter: React.FC<LiquidSplitterProps> = ({
  splitRatio,
  onRatioChange,
  containerRef,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const lastSnapRef = useRef<number>(splitRatio);

  const snapTargets = [30, 40, 50, 60, 70];

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      let newRatio = (relativeX / rect.width) * 100;

      // Bound between 20% and 80%
      newRatio = Math.max(20, Math.min(80, newRatio));

      // Magnetic snap detection
      for (const target of snapTargets) {
        if (Math.abs(newRatio - target) < 2.5) {
          if (lastSnapRef.current !== target) {
            haptics.playSplitterSnap();
            lastSnapRef.current = target;
          }
          newRatio = target;
          break;
        }
      }

      onRatioChange(newRatio);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      haptics.playSplitterSnap();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, onRatioChange, containerRef]);

  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
        haptics.playSplitterSnap();
      }}
      className={`relative w-[3px] hover:w-[6px] transition-all cursor-col-resize z-30 select-none group flex items-center justify-center ${
        isDragging
          ? 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] w-[6px]'
          : 'bg-white/[0.08] hover:bg-white/[0.25]'
      }`}
    >
      {/* Liquid Molten Stretch Glow Indicator */}
      {isDragging && (
        <div className="absolute inset-y-0 -left-2 -right-2 bg-purple-500/10 pointer-events-none blur-sm" />
      )}

      {/* Center Draggable Tactile Pill Handle */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-12 rounded-full border border-white/[0.15] flex items-center justify-center transition-all ${
          isDragging
            ? 'bg-purple-600 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.6)]'
            : 'bg-[#181B20]/90 text-slate-400 group-hover:text-white group-hover:bg-[#22262E]'
        }`}
      >
        <GripVertical className="w-3 h-3" />
      </div>

      {/* Floating Ratio Marker on Drag */}
      {isDragging && (
        <div className="absolute top-16 px-2 py-1 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-purple-200 pointer-events-none whitespace-nowrap shadow-xl">
          {Math.round(splitRatio)} / {100 - Math.round(splitRatio)}
        </div>
      )}
    </div>
  );
};
