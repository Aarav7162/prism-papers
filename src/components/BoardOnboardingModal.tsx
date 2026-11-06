import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, BookOpen, Layers, ArrowRight, Search, Filter } from 'lucide-react';
import { Board, Subject, SubjectCategory } from '../types';
import { BOARDS_CONFIG, ALL_70_SUBJECTS } from '../data/mockPapers';
import { haptics } from '../services/haptics';

interface BoardOnboardingModalProps {
  isOpen: boolean;
  onComplete: (selectedBoard: Board, selectedSubjectIds: string[]) => void;
  initialBoard?: Board;
  initialSelectedSubjectIds?: string[];
  isSettingsMode?: boolean;
  onClose?: () => void;
}

export const BoardOnboardingModal: React.FC<BoardOnboardingModalProps> = ({
  isOpen,
  onComplete,
  initialBoard = 'IGCSE',
  initialSelectedSubjectIds = ['math_ext', 'physics_igcse', 'chemistry_igcse', 'computer_science', 'economics_igcse'],
  isSettingsMode = false,
  onClose,
}) => {
  const [selectedBoard, setSelectedBoard] = useState<Board>(initialBoard);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSelectedSubjectIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'STEM', 'Commerce', 'Humanities', 'Languages', 'Creative'];

  // Filter subjects for the selected board & search query & category
  const filteredSubjects = ALL_70_SUBJECTS.filter((sub) => {
    // Check if offered in chosen board (or general)
    const matchesBoard = sub.boards.includes(selectedBoard) || sub.boards.length === 0;
    if (!matchesBoard && selectedBoard !== 'IB') return false;

    // Check category
    if (activeCategory !== 'All' && sub.category !== activeCategory) return false;

    // Check search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q);
    }

    return true;
  });

  const toggleSubject = (subId: string) => {
    haptics.playPaperTurn();
    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((id) => id !== subId));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  const handleSelectAllFiltered = () => {
    haptics.playSplitterSnap();
    const newIds = Array.from(new Set([...selectedSubjects, ...filteredSubjects.map((s) => s.id)]));
    setSelectedSubjects(newIds);
  };

  const handleFinish = () => {
    haptics.playSplitterSnap();
    onComplete(selectedBoard, selectedSubjects);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl my-6 p-7 rounded-3xl liquid-glass specular-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Ambient Corner Glows */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curriculum Enrollment</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {isSettingsMode ? 'Manage Your Board & Subjects' : 'Choose Your Examination Board & Subjects'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            PRISM isolates your workspace to <strong className="text-slate-200">only your chosen board</strong> and <strong className="text-slate-200">only your enrolled subjects</strong>.
          </p>
        </div>

        {/* Step 1: Choose Your Board */}
        <div className="space-y-2 mb-5 shrink-0">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Select Your Exam Board</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {BOARDS_CONFIG.map((b) => {
              const isSelected = selectedBoard === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    haptics.playPaperTurn();
                    setSelectedBoard(b.id);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer border text-center transition-all ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-100">{b.id}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {b.id === 'IB' ? (
                      <span className="text-purple-300 font-mono font-semibold">Coming Soon</span>
                    ) : (
                      b.name.split(' ')[0]
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Choose Enrolled Subjects from 70+ Catalog */}
        <div className="space-y-3 flex-1 flex flex-col min-h-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>2. Choose Enrolled Subjects (70+ Catalog)</span>
            </label>

            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {selectedSubjects.length} subjects enrolled
            </span>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject name or code (e.g. math, 0580, physics)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/[0.08] text-xs font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/40"
              />
            </div>

            {/* Department Categories */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                      : 'bg-white/[0.03] text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 py-1">
            {filteredSubjects.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-500 font-mono">
                No subjects found matching "{searchQuery}".
              </div>
            ) : (
              filteredSubjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.id);
                return (
                  <div
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/50 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-white/[0.02] border-white/[0.05] text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="text-xs font-semibold truncate">
                          {sub.name}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5 ml-4">
                        {sub.code} · {sub.category}
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'border-white/20'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 font-mono">
            <span>Enrolled: </span>
            <strong className="text-purple-300 font-semibold">{selectedSubjects.length} subjects</strong>
            <span> in {selectedBoard}</span>
          </div>

          <div className="flex items-center gap-2">
            {isSettingsMode && onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs tracking-tight shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all cursor-pointer"
            >
              <span>{isSettingsMode ? 'Save & Update Cockpit' : 'Launch Cockpit'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
