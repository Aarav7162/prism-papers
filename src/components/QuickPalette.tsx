import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowRight, Clock, Award, X, Sparkles } from 'lucide-react';
import { Paper } from '../types';
import { haptics } from '../services/haptics';

interface QuickPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  papers: Paper[];
  onSelectPaper: (paper: Paper) => void;
}

export const QuickPalette: React.FC<QuickPaletteProps> = ({
  isOpen,
  onClose,
  papers,
  onSelectPaper,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredPapers = papers.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const searchString = `${p.board} ${p.subjectName} ${p.year} ${p.session} ${p.paperCode} ${p.seriesLabel}`.toLowerCase();
    const tokens = q.split(/\s+/);
    return tokens.every((token) => searchString.includes(token));
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation within the palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        haptics.playPaperTurn();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredPapers.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        haptics.playPaperTurn();
        setSelectedIndex((prev) => (prev - 1 + filteredPapers.length) % Math.max(1, filteredPapers.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredPapers[selectedIndex]) {
          haptics.playSplitterSnap();
          onSelectPaper(filteredPapers[selectedIndex]);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredPapers, selectedIndex, onSelectPaper, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/70 backdrop-blur-md">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl rounded-2xl liquid-glass specular-border shadow-2xl overflow-hidden"
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by board, subject, year or code (e.g. math 2023 o/n, 0580/42)..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.06] rounded border border-white/10">
              ESC to exit
            </kbd>
          </div>

          {/* Quick Filter Hints */}
          <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.05] flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Solved (90%+)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-amber-400/80 shadow-[0_0_6px_#f59e0b]" />
                In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
                Unattempted
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {filteredPapers.length} papers
            </span>
          </div>

          {/* Results List */}
          <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-white/[0.03]">
            {filteredPapers.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No past papers match "{query}". Try "math", "0580", or "2024".
              </div>
            ) : (
              filteredPapers.map((paper, idx) => {
                const isSelected = idx === selectedIndex;
                const isSolved = paper.status === 'solved';
                const isInProgress = paper.status === 'in_progress';

                return (
                  <div
                    key={paper.id}
                    onClick={() => {
                      haptics.playSplitterSnap();
                      onSelectPaper(paper);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-500/15 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Jewel-toned Status Badge */}
                      <div className="shrink-0 flex items-center justify-center">
                        {isSolved ? (
                          <div
                            className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]"
                            title="Solved"
                          />
                        ) : isInProgress ? (
                          <div
                            className="w-3 h-3 rounded-full border-2 border-amber-400 shadow-[0_0_8px_#F59E0B]"
                            title="In Progress"
                          />
                        ) : (
                          <div
                            className="w-3 h-3 rounded-full bg-[#1E222A] border border-slate-700"
                            title="Unattempted"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-purple-300">
                            {paper.paperCode}
                          </span>
                          <span className="text-xs text-slate-400 font-medium truncate">
                            {paper.board} · {paper.subjectName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium truncate mt-0.5">
                          {paper.seriesLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0 ml-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{paper.durationMinutes}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-500" />
                        <span>{paper.totalMarks} marks</span>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-purple-300 translate-x-1' : 'text-slate-600'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-5 py-2.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Use ↑ ↓ to navigate</span>
            <span>Press Enter ↵ to launch paper</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
