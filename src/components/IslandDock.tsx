import React from 'react';
import { motion } from 'motion/react';
import { Search, Clock, HelpCircle, HardDrive, Compass, Settings, CheckCircle2 } from 'lucide-react';
import { Board } from '../types';
import { haptics } from '../services/haptics';

interface IslandDockProps {
  currentBoard: Board;
  enrolledSubjectCount: number;
  onOpenQuickPalette: () => void;
  onOpenTour: () => void;
  onOpenCheatSheet: () => void;
  onOpenEnrollmentSettings: () => void;
  activePaperTimeRemaining?: number; // in seconds
  isSolvingActive: boolean;
  currentView?: 'matrix' | 'trackers';
  onSelectView?: (view: 'matrix' | 'trackers') => void;
}

export const IslandDock: React.FC<IslandDockProps> = ({
  currentBoard,
  enrolledSubjectCount,
  onOpenQuickPalette,
  onOpenTour,
  onOpenCheatSheet,
  onOpenEnrollmentSettings,
  activePaperTimeRemaining,
  isSolvingActive,
  currentView = 'matrix',
  onSelectView,
}) => {
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const isLowTime = isSolvingActive && (activePaperTimeRemaining ?? 9999) <= 300; // <= 5 min

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2 p-1.5 rounded-full liquid-glass specular-border shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
      >
        {/* 1. ⌘K Quick Jump Trigger */}
        <button
          onClick={() => {
            haptics.playSplitterSnap();
            onOpenQuickPalette();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] transition-all cursor-pointer group"
          title="Search Papers (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-300 transition-colors" />
          <span className="text-xs font-medium tracking-tight">Quick Jump</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.06] rounded border border-white/10 group-hover:border-purple-500/40">
            ⌘K
          </kbd>
        </button>

        {/* Subtle Divider */}
        <div className="w-[1px] h-5 bg-white/[0.08]" />

        {/* 2. User's Specific Enrolled Board Badge (Only their board shown!) */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08]">
          <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
          <span className="text-xs font-bold text-slate-100 tracking-wide font-mono">
            {currentBoard}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            ({enrolledSubjectCount} subjects)
          </span>
          <button
            onClick={() => {
              haptics.playPaperTurn();
              onOpenEnrollmentSettings();
            }}
            className="p-1 rounded text-slate-400 hover:text-purple-300 transition-colors ml-0.5"
            title="Manage curriculum & subjects"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="w-[1px] h-5 bg-white/[0.08]" />

        {/* 3. View Switcher: Archive Matrix vs Trackers (when not solving) */}
        {!isSolvingActive && onSelectView && (
          <>
            <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/[0.04]">
              <button
                onClick={() => {
                  haptics.playPaperTurn();
                  onSelectView('matrix');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                  currentView === 'matrix' ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Archive
              </button>
              <button
                onClick={() => {
                  haptics.playPaperTurn();
                  onSelectView('trackers');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                  currentView === 'trackers' ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Trackers
              </button>
            </div>
            <div className="w-[1px] h-5 bg-white/[0.08]" />
          </>
        )}

        {/* 4. Timer or Mode Status */}
        {isSolvingActive && activePaperTimeRemaining !== undefined ? (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              isLowTime
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-300'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'text-rose-400' : 'text-cyan-400'}`} />
            <span className="text-xs font-mono font-medium tabular-nums">
              {formatTimer(activePaperTimeRemaining)}
            </span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="font-mono text-[11px] text-slate-400">Local Mode</span>
          </div>
        )}

        {/* Tour & Help Triggers */}
        <div className="flex items-center gap-1 pl-1">
          <button
            onClick={() => {
              haptics.playPaperTurn();
              onOpenTour();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-purple-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Start Onboarding Tour"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              haptics.playPaperTurn();
              onOpenCheatSheet();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
