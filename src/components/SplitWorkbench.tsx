import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  CheckSquare, 
  Square, 
  Award, 
  FileEdit, 
  Sparkles, 
  Send,
  Eye,
  Check,
  Lock,
  Unlock,
  Flag,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Question, RubricStep } from '../types';
import { haptics } from '../services/haptics';

interface SplitWorkbenchProps {
  currentQuestion: Question;
  awardedMarks: Record<string, number>;
  completedSteps: Record<string, boolean>;
  studentAnswers: Record<string, string>;
  flaggedQuestions: Record<string, boolean>;
  onAwardMark: (subpartId: string, marks: number) => void;
  onToggleStep: (stepId: string) => void;
  onUpdateAnswer: (subpartId: string, text: string) => void;
  onToggleFlag: (questionId: string) => void;
  scratchpadNotes: string;
  onUpdateScratchpad: (notes: string) => void;
  onFinishExamForGrading: () => void;
  onSubmitFinalScore: () => void;
  isGradingMode: boolean; // false during exam, true at the end
  isSubmitted: boolean;
  totalPaperScore: number;
  maxPaperMarks: number;
}

export const SplitWorkbench: React.FC<SplitWorkbenchProps> = ({
  currentQuestion,
  awardedMarks,
  completedSteps,
  studentAnswers,
  flaggedQuestions,
  onAwardMark,
  onToggleStep,
  onUpdateAnswer,
  onToggleFlag,
  scratchpadNotes,
  onUpdateScratchpad,
  onFinishExamForGrading,
  onSubmitFinalScore,
  isGradingMode,
  isSubmitted,
  totalPaperScore,
  maxPaperMarks,
}) => {
  const [activeTab, setActiveTab] = useState<'working' | 'scratchpad'>('working');

  const getRubricCodeColor = (code: RubricStep['code']) => {
    switch (code) {
      case 'M1':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'A1':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'B1':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'C1':
      case 'SC':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  const isCurrentFlagged = flaggedQuestions[currentQuestion.id] || false;

  return (
    <div className="flex flex-col h-full bg-[#08090A] text-slate-100 overflow-hidden select-none">
      {/* Workbench Header Tabs */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <button
            onClick={() => {
              haptics.playPaperTurn();
              setActiveTab('working');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
              activeTab === 'working'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isGradingMode ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Official Mark Scheme</span>
              </>
            ) : (
              <>
                <FileEdit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Response Docket</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              haptics.playPaperTurn();
              setActiveTab('scratchpad');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
              activeTab === 'scratchpad'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Scratchpad</span>
          </button>
        </div>

        {/* Status Pill: Exam in Progress vs Grading Mode */}
        <div className="flex items-center gap-2">
          {isGradingMode ? (
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 font-mono text-xs">
              <span className="text-emerald-400 font-semibold">Self-Mark Tally:</span>
              <span className="font-bold text-emerald-300 text-sm">{totalPaperScore}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{maxPaperMarks}</span>
            </div>
          ) : (
            <button
              onClick={() => {
                haptics.playPaperTurn();
                onToggleFlag(currentQuestion.id);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                isCurrentFlagged
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200'
              }`}
              title="Flag question for review"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{isCurrentFlagged ? 'Flagged' : 'Flag Question'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workbench Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'working' ? (
          /* When in Exam Solving Mode (Before End): Show candidate input spaces */
          !isGradingMode ? (
            <div className="space-y-6">
              {/* Question Context Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
                    Candidate Working Area
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 tracking-tight">
                    Question {currentQuestion.number}: {currentQuestion.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mark Scheme locked until paper submission</span>
                </div>
              </div>

              {/* Response fields for each subpart */}
              {currentQuestion.subparts.map((sub) => {
                const answer = studentAnswers[sub.id] || '';

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl liquid-glass-subtle specular-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-white/[0.08] font-mono text-xs font-bold text-purple-300">
                          {sub.label}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">
                          Candidate Final Answer & Working
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        [{sub.maxMarks} marks]
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      {sub.text}
                    </div>

                    {/* Text input / working notes */}
                    <textarea
                      value={answer}
                      onChange={(e) => onUpdateAnswer(sub.id, e.target.value)}
                      placeholder={`Enter final answer for ${sub.label} and show key working steps...`}
                      rows={3}
                      className="w-full p-3 rounded-lg bg-black/40 border border-white/[0.08] text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 resize-y"
                    />
                  </div>
                );
              })}

              {/* Helpful exam tip */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Solve under realistic conditions using your keyboard or stylus. Once you click <strong className="text-purple-300">"Finish Exam & Grade with Mark Scheme"</strong> below, the full examiner rubrics will unlock for self-marking.
                </p>
              </div>
            </div>
          ) : (
            /* When in Grading Mode (At the End): Show REAL Mark Scheme side-by-side */
            <div className="space-y-6">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300">
                      Official Mark Scheme Unlocked
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Compare your candidate answers against official method (M) and accuracy (A) rubrics.
                    </div>
                  </div>
                </div>
              </div>

              {/* Subpart Step Rubrics */}
              {currentQuestion.subparts.map((sub) => {
                const currentAwarded = awardedMarks[sub.id] || 0;
                const candidateAnswer = studentAnswers[sub.id] || 'No written response';

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl liquid-glass-subtle specular-border space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-white/[0.08] font-mono text-xs font-bold text-purple-300">
                          {sub.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          Mark Allocation (Max {sub.maxMarks})
                        </span>
                      </div>

                      {/* Score Tagging Buttons */}
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-mono text-slate-400 mr-1">Award:</span>
                        {[...Array(sub.maxMarks + 1)].map((_, markVal) => {
                          const isSelected = currentAwarded === markVal;
                          return (
                            <button
                              key={markVal}
                              onClick={() => {
                                haptics.playMarkScore(markVal);
                                onAwardMark(sub.id, markVal);
                              }}
                              className={`w-6 h-6 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.8)] scale-110'
                                  : 'bg-white/[0.05] text-slate-400 hover:text-white border border-white/[0.06]'
                              }`}
                            >
                              {markVal}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Candidate Answer vs Official Model Answer */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-black/50 border border-white/[0.06]">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">
                          Your Answer
                        </span>
                        <div className="font-mono text-slate-300 break-words">
                          {candidateAnswer}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                        <span className="text-[10px] font-mono text-emerald-400 block uppercase mb-1">
                          Official Correct Answer
                        </span>
                        <div className="font-mono text-emerald-300 font-bold">
                          {sub.officialAnswer}
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Method Rubric Breakdown */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        Official Criteria Checklist
                      </span>
                      {sub.rubricSteps.map((step) => {
                        const isChecked = completedSteps[step.id] || false;
                        return (
                          <div
                            key={step.id}
                            onClick={() => {
                              haptics.playMarkScore(step.marks);
                              onToggleStep(step.id);
                            }}
                            className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]'
                            }`}
                          >
                            <button className="mt-0.5 text-slate-400 hover:text-white shrink-0">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold border ${getRubricCodeColor(
                                    step.code
                                  )}`}
                                >
                                  {step.code}
                                </span>
                                <span className="text-xs font-semibold text-slate-200">
                                  {step.title}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {step.description}
                              </p>
                            </div>

                            <span className="font-mono text-xs text-slate-500 shrink-0">
                              +{step.marks}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Scratchpad Tab */
          <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
                Student Scratchpad & Working Notes
              </span>
              <span className="text-xs text-slate-500">Auto-saved to LocalStorage</span>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {['\\frac{a}{b}', 'x^2', '\\sqrt{x}', '\\int', '\\sum', '\\Delta', '\\pi', '\\theta'].map((snippet) => (
                <button
                  key={snippet}
                  onClick={() => {
                    haptics.playPaperTurn();
                    onUpdateScratchpad(scratchpadNotes + ` ${snippet} `);
                  }}
                  className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 transition-colors cursor-pointer"
                >
                  {snippet}
                </button>
              ))}
            </div>

            <textarea
              value={scratchpadNotes}
              onChange={(e) => onUpdateScratchpad(e.target.value)}
              placeholder="Jot down rough calculations, formulas, or algebraic expansions..."
              className="flex-1 w-full p-4 rounded-xl liquid-glass-subtle specular-border bg-black/40 text-slate-200 text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/40 resize-none"
            />
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar: Finish Exam or Submit Score */}
      <div className="p-4 border-t border-white/[0.08] bg-black/50 backdrop-blur-md flex items-center justify-between">
        {!isGradingMode ? (
          <>
            <div className="text-xs text-slate-400 font-mono">
              <span>Exam mode active</span>
            </div>

            <button
              onClick={() => {
                haptics.playSplitterSnap();
                onFinishExamForGrading();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-tight shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Finish Exam & Grade with Mark Scheme</span>
            </button>
          </>
        ) : (
          <>
            <div className="text-xs text-slate-400 font-mono">
              <span>Total: </span>
              <strong className="text-emerald-400 text-sm">{totalPaperScore}</strong> / {maxPaperMarks}
            </div>

            <button
              onClick={() => {
                haptics.playGlassExplosion();
                onSubmitFinalScore();
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                isSubmitted
                  ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              }`}
            >
              {isSubmitted ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Evaluation Completed</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Finalize Score & Log to Tracker</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
