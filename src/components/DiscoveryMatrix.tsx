import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Search, 
  BookOpen, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Board, Paper, Subject } from '../types';
import { haptics } from '../services/haptics';

interface DiscoveryMatrixProps {
  board: Board;
  subjects: Subject[];
  papers: Paper[];
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  onLaunchPaper: (paper: Paper) => void;
  onOpenSubjectSettings?: () => void;
}

export const DiscoveryMatrix: React.FC<DiscoveryMatrixProps> = ({
  board,
  subjects,
  papers,
  selectedSubjectId,
  onSelectSubject,
  onLaunchPaper,
  onOpenSubjectSettings,
}) => {
  const [hoveredPaperId, setHoveredPaperId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const activeSubject = (subjects && subjects.length > 0)
    ? (subjects.find((s) => s.id === selectedSubjectId) || subjects[0])
    : { id: 'math_ext', name: 'Mathematics', code: '0580', category: 'STEM' as const, boards: [board], color: '#38BDF8' };

  const boardPapers = activeSubject
    ? papers.filter((p) => p.board === board && (p.subjectId === activeSubject.id || p.subjectName.toLowerCase() === activeSubject.name.toLowerCase()))
    : [];

  // Group papers by descending year
  const years = [2025, 2024, 2023, 2022, 2021];

  // Completion metrics
  const solvedPapers = boardPapers.filter((p) => p.status === 'solved');
  const inProgressPapers = boardPapers.filter((p) => p.status === 'in_progress');
  const completionRate = boardPapers.length > 0 ? Math.round((solvedPapers.length / boardPapers.length) * 100) : 0;

  const handleTileMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // If user selected IB, show the ambient frosted "Coming Soon" showcase requested by user
  if (board === 'IB') {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-12 rounded-3xl liquid-glass specular-border text-center overflow-hidden"
        >
          {/* Ambient Refraction Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

          {/* Ambient Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-mono font-semibold tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>International Baccalaureate DP</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight max-w-xl mx-auto">
            IB Diploma Curriculum
          </h2>

          <div className="mt-4 max-w-lg mx-auto">
            {/* The user-specified Ambient Sign saying Coming Soon */}
            <div className="inline-block px-5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              Coming Soon
            </div>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              We are currently vectorizing authentic IBDP Mathematics (Analysis & Approaches HL/SL) and Physics HL paper series with official criteria descriptors. Stay tuned!
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="text-xs text-slate-500">In the meantime, explore:</span>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              Cambridge IGCSE
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              CBSE Senior Secondary
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              CISCE / ICSE
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-28">
      {/* Subject Selector Strip with Liquid Glass Badges */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {subjects.map((sub) => {
            const isSelected = sub.id === selectedSubjectId;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  haptics.playPaperTurn();
                  onSelectSubject(sub.id);
                }}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'text-white liquid-glass specular-border shadow-[0_0_20px_rgba(124,58,237,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span>{sub.name}</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {sub.code}
                  </span>
                </div>
              </button>
            );
          })}

          {onOpenSubjectSettings && (
            <button
              onClick={() => {
                haptics.playPaperTurn();
                onOpenSubjectSettings();
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold font-mono text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all cursor-pointer shrink-0"
              title="Add or remove subjects from 70+ directory"
            >
              + Manage Subjects
            </button>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>{board} Board ({subjects.length} Enrolled)</span>
        </div>
      </div>

      {/* The Tactile Heatmap Completion Rail */}
      <div className="mb-10 p-5 rounded-2xl liquid-glass-subtle specular-border">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 tracking-tight">Tactile Completion Rail</span>
            <span className="text-slate-500">·</span>
            <span className="font-mono text-slate-400">{activeSubject?.name || 'Subject'}</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="text-emerald-400 font-medium">
              {solvedPapers.length} Solved
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">
              {boardPapers.length} Papers
            </span>
            <span className="text-purple-300 font-bold ml-1">
              {completionRate}% Mastery
            </span>
          </div>
        </div>

        {/* The Crystal Heatmap Rail Segments */}
        <div className="grid grid-cols-10 gap-1.5">
          {boardPapers.map((p, idx) => {
            const isSolved = p.status === 'solved';
            const isInProgress = p.status === 'in_progress';
            return (
              <div
                key={p.id}
                onClick={() => {
                  haptics.playSplitterSnap();
                  onLaunchPaper(p);
                }}
                className={`group relative h-4 rounded-md cursor-pointer transition-all duration-300 ${
                  isSolved
                    ? 'bg-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.7)] border border-emerald-400/60'
                    : isInProgress
                    ? 'bg-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.5)] border border-amber-400/50'
                    : 'bg-[#1E222A]/70 border border-white/[0.06] hover:border-white/20'
                }`}
                title={`${p.paperCode} (${p.session} ${p.year}) — ${p.status.toUpperCase()}`}
              >
                {/* Micro crystal reflection line */}
                <div className="absolute inset-0 rounded-md bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Discovery Matrix Grid: Years Timeline Axis & Variant Pods */}
      <div className="space-y-8">
        {years.map((year) => {
          const yearPapers = boardPapers.filter((p) => p.year === year);
          if (yearPapers.length === 0) return null;

          return (
            <div key={year} className="relative flex items-start gap-6">
              {/* Year Timeline Axis on the Left */}
              <div className="w-16 shrink-0 pt-3">
                <div className="sticky top-20 flex flex-col items-center">
                  <span className="font-mono text-sm font-bold text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-slate-400">
                    {year}
                  </span>
                  <div className="w-[1px] h-12 bg-gradient-to-b from-purple-500/40 via-white/10 to-transparent mt-2" />
                </div>
              </div>

              {/* Variant Pods for this Year */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {yearPapers.map((paper) => {
                  const isHovered = hoveredPaperId === paper.id;
                  const isSolved = paper.status === 'solved';
                  const isInProgress = paper.status === 'in_progress';

                  return (
                    <div
                      key={paper.id}
                      onMouseEnter={() => setHoveredPaperId(paper.id)}
                      onMouseLeave={() => setHoveredPaperId(null)}
                      onMouseMove={handleTileMouseMove}
                      onClick={() => {
                        haptics.playSplitterSnap();
                        onLaunchPaper(paper);
                      }}
                      className="group relative p-5 rounded-2xl liquid-glass specular-border cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_20px_40px_rgba(0,0,0,0.85)] overflow-hidden"
                    >
                      {/* Cursor-Tethered Lens Flare on Hover */}
                      {isHovered && (
                        <div
                          className="absolute pointer-events-none w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 mix-blend-screen transition-opacity duration-150"
                          style={{
                            left: mousePos.x,
                            top: mousePos.y,
                            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(56, 189, 248, 0.2) 40%, transparent 70%)',
                          }}
                        />
                      )}

                      {/* Top Header of Pod: Paper Code & Jewel Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] font-mono text-xs font-bold text-slate-100 tracking-tight">
                            {paper.paperCode}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {paper.session}
                          </span>
                        </div>

                        {/* Jewel Badge */}
                        <div className="flex items-center gap-1.5">
                          {isSolved ? (
                            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-300">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                              Solved ({paper.score}/{paper.totalMarks})
                            </span>
                          ) : isInProgress ? (
                            <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300">
                              <span className="w-2 h-2 rounded-full border border-amber-400 shadow-[0_0_6px_#f59e0b]" />
                              In Progress
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                              <span className="w-2 h-2 rounded-full bg-slate-700" />
                              Unattempted
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Series Label */}
                      <h4 className="text-sm font-semibold text-slate-200 tracking-tight group-hover:text-purple-300 transition-colors mb-4 line-clamp-1">
                        {paper.seriesLabel}
                      </h4>

                      {/* Hover Peek Metrics: Question Count, Total Marks, Avg Time */}
                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          <span>{paper.questions.length || 8} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-slate-500" />
                          <span>{paper.totalMarks} marks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>~{paper.avgSolveTimeMinutes || 90}m</span>
                        </div>
                      </div>

                      {/* Launch CTA arrow indicator */}
                      <div className="mt-3 flex items-center justify-end text-[11px] text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="flex items-center gap-1">
                          Open Solving Deck <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
