import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Layers,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import { Board, Paper, Subject } from '../types';
import { haptics } from '../services/haptics';

interface TrackersViewProps {
  board: Board;
  subjects: Subject[];
  papers: Paper[];
  onLaunchPaper: (paper: Paper) => void;
}

export const TrackersView: React.FC<TrackersViewProps> = ({
  board,
  subjects,
  papers,
  onLaunchPaper,
}) => {
  const boardPapers = papers.filter((p) => p.board === board);
  const solvedPapers = boardPapers.filter((p) => p.status === 'solved');
  const inProgressPapers = boardPapers.filter((p) => p.status === 'in_progress');

  // Compute total marks earned vs available
  let earnedMarks = 0;
  let availableMarks = 0;
  solvedPapers.forEach((p) => {
    earnedMarks += p.score || 0;
    availableMarks += p.totalMarks;
  });

  const overallAccuracy = availableMarks > 0 ? Math.round((earnedMarks / availableMarks) * 100) : 0;
  const totalHoursLogged = solvedPapers.reduce((acc, p) => acc + (p.durationMinutes || 90), 0) / 60;

  // Grade Prediction logic
  const getPredictedGrade = (accuracy: number) => {
    if (board === 'IGCSE') {
      if (accuracy >= 85) return { grade: 'A*', label: 'Top 5th Percentile', color: 'text-emerald-400' };
      if (accuracy >= 72) return { grade: 'A', label: 'Solid Distinction', color: 'text-cyan-400' };
      if (accuracy >= 60) return { grade: 'B', label: 'Strong Credit', color: 'text-purple-400' };
      return { grade: 'C', label: 'Pass Candidate', color: 'text-amber-400' };
    } else {
      if (accuracy >= 90) return { grade: '95%+', label: 'Outstanding Merit', color: 'text-emerald-400' };
      if (accuracy >= 80) return { grade: '85-94%', label: 'First Division', color: 'text-cyan-400' };
      return { grade: '75-84%', label: 'Credit Grade', color: 'text-purple-400' };
    }
  };

  const predicted = getPredictedGrade(overallAccuracy);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-32 space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
              Performance Telemetry & Analytics
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-xs text-slate-400">{board} Curriculum</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Student Trackers & Target Projection
          </h2>
        </div>

        {/* Projected Grade Highlight Badge */}
        <div className="p-3.5 rounded-2xl liquid-glass specular-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-mono text-lg font-black">
            {predicted.grade}
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Projected Exam Grade</div>
            <div className={`text-xs font-bold ${predicted.color}`}>{predicted.label}</div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Accuracy */}
        <div className="p-5 rounded-2xl liquid-glass specular-border space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Accuracy</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">
            {overallAccuracy}%
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {earnedMarks} / {availableMarks || 130} marks awarded
          </div>
        </div>

        {/* Card 2: Hours Solved */}
        <div className="p-5 rounded-2xl liquid-glass specular-border space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Exam Seat Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">
            {totalHoursLogged.toFixed(1)} <span className="text-base text-slate-400 font-normal">hrs</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Across {solvedPapers.length} completed sessions
          </div>
        </div>

        {/* Card 3: Solved Papers */}
        <div className="p-5 rounded-2xl liquid-glass specular-border space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Papers Solved</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">
            {solvedPapers.length}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {inProgressPapers.length} in progress · {boardPapers.length} available
          </div>
        </div>

        {/* Card 4: Study Velocity Streak */}
        <div className="p-5 rounded-2xl liquid-glass specular-border space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Daily Streak</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">
            4 <span className="text-base text-slate-400 font-normal">days</span>
          </div>
          <div className="text-xs text-emerald-400 font-mono">
            ● Consistent exam velocity
          </div>
        </div>
      </div>

      {/* Subject-Wise Mastery Radar */}
      <div className="p-6 rounded-2xl liquid-glass specular-border space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Subject Mastery Breakdown</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Target Threshold: 85% (A*)</span>
        </div>

        <div className="space-y-4">
          {subjects.map((sub) => {
            const subPapers = boardPapers.filter((p) => p.subjectId === sub.id);
            const subSolved = subPapers.filter((p) => p.status === 'solved');
            let subScore = 0;
            let subMax = 0;
            subSolved.forEach((p) => {
              subScore += p.score || 0;
              subMax += p.totalMarks;
            });
            const subAccuracy = subMax > 0 ? Math.round((subScore / subMax) * 100) : sub.id === 'math' ? 84 : 70;

            return (
              <div key={sub.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="font-semibold text-slate-200">{sub.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{sub.code}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400">{subSolved.length} solved</span>
                    <span className="font-bold text-slate-100">{subAccuracy}%</span>
                  </div>
                </div>

                {/* Fluid Mastery Bar */}
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${subAccuracy}%`,
                      backgroundColor: sub.color,
                      boxShadow: `0 0 10px ${sub.color}80`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revision Queue: Weak Topics & Questions Tagged for Revision */}
      <div className="p-6 rounded-2xl liquid-glass specular-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100 tracking-tight">
              Revision Queue & Method Focus
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Prioritized by lost method marks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              code: '0580/42',
              topic: 'Coordinate Geometry (Perpendicular Bisector)',
              reason: 'Missed standard integer form ax + by + c = 0',
              loss: '-2 marks (A1)',
              paperId: 'igcse-math-2024-mj-42',
            },
            {
              code: '0580/42',
              topic: 'Calculus: Second Derivative Nature Test',
              reason: 'Forgot to evaluate d²y/dx² at x = 1 and x = 2 explicitly',
              loss: '-2 marks (M1)',
              paperId: 'igcse-math-2024-mj-42',
            },
            {
              code: '0625/42',
              topic: 'Velocity-Time Graph Area under Curve',
              reason: 'Used linear approximation instead of integral split',
              loss: '-1 mark (A1)',
              paperId: 'igcse-phys-2024-mj-42',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                const target = papers.find((p) => p.id === item.paperId);
                if (target) {
                  haptics.playSplitterSnap();
                  onLaunchPaper(target);
                }
              }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer flex items-start justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-purple-300">
                    {item.code}
                  </span>
                  <span className="text-xs text-slate-200 font-medium">
                    {item.topic}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.reason}
                </p>
              </div>

              <div className="text-right shrink-0 ml-3">
                <span className="text-xs font-mono font-bold text-rose-400 block">
                  {item.loss}
                </span>
                <span className="text-[10px] text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 mt-1">
                  Review <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
