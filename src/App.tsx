import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  Play, 
  Settings,
  BookOpen,
  Layers
} from 'lucide-react';
import { Board, Paper, Subject, AnnotationStroke } from './types';
import { ALL_70_SUBJECTS, INITIAL_PAPERS, generatePapersForSubject } from './data/mockPapers';
import { haptics } from './services/haptics';
import { AmbientMesh } from './components/AmbientMesh';
import { IslandDock } from './components/IslandDock';
import { DiscoveryMatrix } from './components/DiscoveryMatrix';
import { TrackersView } from './components/TrackersView';
import { FoldableExamPaper } from './components/FoldableExamPaper';
import { SplitWorkbench } from './components/SplitWorkbench';
import { LiquidSplitter } from './components/LiquidSplitter';
import { MarkSchemeCurtain } from './components/MarkSchemeCurtain';
import { QuickPalette } from './components/QuickPalette';
import { OnboardingTour } from './components/OnboardingTour';
import { KeyboardCheatSheet } from './components/KeyboardCheatSheet';
import { PrismConfetti } from './components/PrismConfetti';
import { PrismStartupAnimation } from './components/PrismStartupAnimation';
import { BoardOnboardingModal } from './components/BoardOnboardingModal';

export default function App() {
  // --- 3D Startup Animation State (plays every time you open Prism) ---
  const [showStartupAnimation, setShowStartupAnimation] = useState<boolean>(true);

  // --- Curriculum & Subject Enrollment State ---
  const [showBoardOnboarding, setShowBoardOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('prism_onboarded');
  });

  const [isSettingsMode, setIsSettingsMode] = useState<boolean>(false);

  // Chosen Board (only this board is shown)
  const [board, setBoard] = useState<Board>(() => {
    return (localStorage.getItem('prism_board') as Board) || 'IGCSE';
  });

  // Chosen Enrolled Subjects (only these subjects are shown)
  const [enrolledSubjectIds, setEnrolledSubjectIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('prism_user_subjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fallback
      }
    }
    return ['math_ext', 'physics_igcse', 'chemistry_igcse', 'computer_science', 'economics_igcse'];
  });

  // Filter full Subject objects for only the enrolled subjects with legacy fallback
  const enrolledSubjects: Subject[] = (() => {
    const list = ALL_70_SUBJECTS.filter((s) =>
      enrolledSubjectIds.includes(s.id) ||
      (enrolledSubjectIds.includes('math') && (s.id === 'math_ext' || s.id === 'cbse_math')) ||
      (enrolledSubjectIds.includes('physics') && (s.id === 'physics_igcse' || s.id === 'physics_cbse')) ||
      (enrolledSubjectIds.includes('chemistry') && (s.id === 'chemistry_igcse' || s.id === 'chemistry_cbse')) ||
      (enrolledSubjectIds.includes('economics') && (s.id === 'economics_igcse' || s.id === 'economics_cbse'))
    );
    if (list.length > 0) return list;
    return board === 'CBSE'
      ? ALL_70_SUBJECTS.filter((s) => s.boards.includes('CBSE')).slice(0, 5)
      : ALL_70_SUBJECTS.filter((s) => s.boards.includes('IGCSE')).slice(0, 5);
  })();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    const saved = localStorage.getItem('prism_subject');
    return saved || 'math_ext';
  });

  // Ensure selectedSubjectId is always one of the enrolled subjects
  useEffect(() => {
    if (enrolledSubjects.length > 0 && !enrolledSubjectIds.includes(selectedSubjectId)) {
      setSelectedSubjectId(enrolledSubjects[0].id);
    }
  }, [enrolledSubjectIds, selectedSubjectId, enrolledSubjects]);

  const [dashboardView, setDashboardView] = useState<'matrix' | 'trackers'>('matrix');

  // Master Papers Database
  const [papers, setPapers] = useState<Paper[]>(() => {
    const saved = localStorage.getItem('prism_papers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PAPERS;
      }
    }
    return INITIAL_PAPERS;
  });

  // Auto-generate papers for any newly enrolled subject
  useEffect(() => {
    setPapers((prevPapers) => {
      let updated = [...prevPapers];
      let hasChanges = false;

      enrolledSubjects.forEach((sub) => {
        const exists = updated.some((p) => p.board === board && p.subjectId === sub.id);
        if (!exists) {
          const generated = generatePapersForSubject(board, sub);
          updated = [...updated, ...generated];
          hasChanges = true;
        }
      });

      return hasChanges ? updated : prevPapers;
    });
  }, [board, enrolledSubjects]);

  // Active Paper Solving Deck State
  const [activePaper, setActivePaper] = useState<Paper | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [splitRatio, setSplitRatio] = useState<number>(55); // 55% left, 45% right

  // Candidate Working & Responses during exam
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Real Mark Scheme & Evaluation Mode ("taken at the end")
  const [isGradingMode, setIsGradingMode] = useState<boolean>(false);
  const [awardedMarks, setAwardedMarks] = useState<Record<string, number>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [scratchpadNotes, setScratchpadNotes] = useState<string>('');
  const [strokes, setStrokes] = useState<AnnotationStroke[]>([]);
  const [timerRemaining, setTimerRemaining] = useState<number>(150 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Modals & Overlays
  const [isQuickPaletteOpen, setIsQuickPaletteOpen] = useState(false);
  const [isOnboardingTourOpen, setIsOnboardingTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('prism_board', board);
  }, [board]);

  useEffect(() => {
    localStorage.setItem('prism_subject', selectedSubjectId);
  }, [selectedSubjectId]);

  useEffect(() => {
    localStorage.setItem('prism_user_subjects', JSON.stringify(enrolledSubjectIds));
  }, [enrolledSubjectIds]);

  useEffect(() => {
    localStorage.setItem('prism_papers', JSON.stringify(papers));
  }, [papers]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!activePaper || !isTimerRunning || timerRemaining <= 0 || isGradingMode) return;
    const interval = setInterval(() => {
      setTimerRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [activePaper, isTimerRunning, timerRemaining, isGradingMode]);

  // Handle Startup Animation Completion
  const handleStartupComplete = () => {
    setShowStartupAnimation(false);
    if (!localStorage.getItem('prism_onboarded')) {
      setShowBoardOnboarding(true);
    }
  };

  // Handle Board & Subject Onboarding Completion
  const handleBoardOnboardingComplete = (chosenBoard: Board, chosenSubjects: string[]) => {
    localStorage.setItem('prism_onboarded', 'true');
    localStorage.setItem('prism_board', chosenBoard);
    localStorage.setItem('prism_user_subjects', JSON.stringify(chosenSubjects));
    setBoard(chosenBoard);
    setEnrolledSubjectIds(chosenSubjects);
    if (chosenSubjects.length > 0) {
      setSelectedSubjectId(chosenSubjects[0]);
    }
    setShowBoardOnboarding(false);
    setIsSettingsMode(false);
    haptics.playGlassExplosion();
  };

  // Launch Paper into Solving Deck
  const handleLaunchPaper = (paper: Paper) => {
    haptics.playSplitterSnap();
    setActivePaper(paper);
    setCurrentQuestionIndex(0);
    setTimerRemaining(paper.durationMinutes * 60);
    setIsTimerRunning(true);
    setIsSubmitted(paper.status === 'solved');
    setIsGradingMode(paper.status === 'solved');

    const savedState = localStorage.getItem(`prism_attempt_${paper.id}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setAwardedMarks(parsed.awardedMarks || {});
        setCompletedSteps(parsed.completedSteps || {});
        setStudentAnswers(parsed.studentAnswers || {});
        setFlaggedQuestions(parsed.flaggedQuestions || {});
        setScratchpadNotes(parsed.scratchpadNotes || '');
        setStrokes(parsed.strokes || []);
      } catch {
        setAwardedMarks({});
        setCompletedSteps({});
        setStudentAnswers({});
        setFlaggedQuestions({});
        setScratchpadNotes('');
        setStrokes([]);
      }
    } else {
      setAwardedMarks({});
      setCompletedSteps({});
      setStudentAnswers({});
      setFlaggedQuestions({});
      setScratchpadNotes('');
      setStrokes([]);
    }
  };

  // Auto-save active attempt
  useEffect(() => {
    if (!activePaper) return;
    const attemptData = {
      awardedMarks,
      completedSteps,
      studentAnswers,
      flaggedQuestions,
      scratchpadNotes,
      strokes,
      timerRemaining,
    };
    localStorage.setItem(`prism_attempt_${activePaper.id}`, JSON.stringify(attemptData));
  }, [activePaper, awardedMarks, completedSteps, studentAnswers, flaggedQuestions, scratchpadNotes, strokes, timerRemaining]);

  const handleBackToDashboard = () => {
    haptics.playPaperTurn();
    setActivePaper(null);
  };

  const handleUpdateAnswer = (subpartId: string, text: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [subpartId]: text,
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleFinishExamForGrading = () => {
    haptics.playGlassExplosion();
    setIsTimerRunning(false);
    setIsGradingMode(true);
  };

  const handleAwardMark = (subpartId: string, marks: number) => {
    setAwardedMarks((prev) => ({
      ...prev,
      [subpartId]: marks,
    }));
  };

  const handleToggleStep = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const handleSubmitFinalScore = () => {
    if (!activePaper) return;
    setIsSubmitted(true);
    setIsConfettiActive(true);

    const totalScore = Object.values(awardedMarks).reduce((acc, curr) => acc + curr, 0);

    setPapers((prev) =>
      prev.map((p) => {
        if (p.id === activePaper.id) {
          return {
            ...p,
            status: 'solved',
            score: totalScore,
            bestScore: Math.max(p.bestScore || 0, totalScore),
          };
        }
        return p;
      })
    );
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        haptics.playSplitterSnap();
        setIsQuickPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        haptics.playPaperTurn();
        setIsCheatSheetOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setIsQuickPaletteOpen(false);
        setIsCheatSheetOpen(false);
        setIsCurtainOpen(false);
        setIsOnboardingTourOpen(false);
        return;
      }

      if (activePaper) {
        if (e.key.toLowerCase() === 'k') {
          e.preventDefault();
          haptics.playPaperTurn();
          setCurrentQuestionIndex((prev) =>
            Math.min(activePaper.questions.length - 1, prev + 1)
          );
        } else if (e.key.toLowerCase() === 'j') {
          e.preventDefault();
          haptics.playPaperTurn();
          setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
        } else if (e.key.toLowerCase() === 'm' || e.key === 'Tab') {
          e.preventDefault();
          setIsCurtainOpen((prev) => !prev);
        } else if (['0', '1', '2', '3', '4', '5', '6'].includes(e.key) && isGradingMode) {
          const markVal = parseInt(e.key, 10);
          const currentQ = activePaper.questions[currentQuestionIndex];
          if (currentQ && currentQ.subparts.length > 0) {
            const firstSubpart = currentQ.subparts[0];
            if (markVal <= firstSubpart.maxMarks) {
              e.preventDefault();
              haptics.playMarkScore(markVal);
              handleAwardMark(firstSubpart.id, markVal);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePaper, currentQuestionIndex, isGradingMode]);

  const currentQuestion = activePaper?.questions[currentQuestionIndex] || activePaper?.questions[0];
  const totalPaperScore = Object.values(awardedMarks).reduce((acc, curr) => acc + curr, 0);

  // Filter papers only for user's chosen board & enrolled subjects
  const enrolledPapers = papers.filter(
    (p) => p.board === board && enrolledSubjectIds.includes(p.subjectId)
  );

  return (
    <div className="relative min-h-screen bg-[#08090A] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* 3D WebGL Three.js Optical Laser Prism Startup Animation */}
      {showStartupAnimation && (
        <PrismStartupAnimation onComplete={handleStartupComplete} />
      )}

      {/* Board & 70+ Subject Enrollment Modal */}
      <BoardOnboardingModal
        isOpen={(showBoardOnboarding && !showStartupAnimation) || isSettingsMode}
        onComplete={handleBoardOnboardingComplete}
        initialBoard={board}
        initialSelectedSubjectIds={enrolledSubjectIds}
        isSettingsMode={isSettingsMode}
        onClose={() => setIsSettingsMode(false)}
      />

      {/* Dynamic Ambient Refraction Mesh */}
      <AmbientMesh />

      {/* Glass Prism Confetti celebration */}
      <PrismConfetti
        active={isConfettiActive}
        onComplete={() => setIsConfettiActive(false)}
      />

      {/* Top Bar following Top Bar Contract (3 zones separated by gap-8) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 border-b border-white/[0.08] bg-black/40 backdrop-blur-2xl">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-cyan-200 whitespace-nowrap">
            PRISM
          </span>
          <span className="text-slate-600">/</span>
          {/* Active Board Badge */}
          <span className="font-mono text-xs font-semibold text-slate-300 px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
            {board}
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => {
              handleBackToDashboard();
              setDashboardView('matrix');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 cursor-pointer ${
              !activePaper && dashboardView === 'matrix' ? 'text-purple-300 font-semibold' : ''
            }`}
          >
            Discovery Matrix
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => {
              handleBackToDashboard();
              setDashboardView('trackers');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 cursor-pointer ${
              !activePaper && dashboardView === 'trackers' ? 'text-purple-300 font-semibold' : ''
            }`}
          >
            Trackers & Mastery
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => {
              haptics.playPaperTurn();
              setIsSettingsMode(true);
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 cursor-pointer flex items-center gap-1.5"
            title="Manage curriculum & subjects"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
            <span>Curriculum Settings</span>
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => {
              haptics.playPaperTurn();
              setShowStartupAnimation(true);
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 cursor-pointer flex items-center gap-1"
            title="Replay optical physics laser prism intro"
          >
            <Play className="w-3 h-3 text-cyan-400" />
            <span>Replay Intro</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {activePaper ? (
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Exit Deck</span>
            </button>
          ) : (
            <button
              onClick={() => {
                haptics.playSplitterSnap();
                setIsQuickPaletteOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Quick Jump</span>
              <kbd className="px-1.5 py-0.5 rounded bg-purple-800/80 font-mono text-[10px] text-purple-200">
                ⌘K
              </kbd>
            </button>
          )}
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col relative z-10">
        {!activePaper ? (
          dashboardView === 'matrix' ? (
            /* View 1: Discovery Matrix (ONLY enrolled subjects shown!) */
            <DiscoveryMatrix
              board={board}
              subjects={enrolledSubjects}
              papers={enrolledPapers}
              selectedSubjectId={selectedSubjectId}
              onSelectSubject={setSelectedSubjectId}
              onLaunchPaper={handleLaunchPaper}
              onOpenSubjectSettings={() => setIsSettingsMode(true)}
            />
          ) : (
            /* View 2: Trackers & Analytics (ONLY enrolled subjects shown!) */
            <TrackersView
              board={board}
              subjects={enrolledSubjects}
              papers={enrolledPapers}
              onLaunchPaper={handleLaunchPaper}
            />
          )
        ) : (
          /* View 3: Dual-Pane Solving Deck */
          <div
            ref={containerRef}
            className="flex-1 flex flex-row overflow-hidden relative"
            style={{ height: 'calc(100vh - 61px)' }}
          >
            {/* Left Pane: Question Paper (Vector PDF Canvas) */}
            <div
              style={{ width: `${splitRatio}%` }}
              className="h-full overflow-hidden relative"
            >
              <FoldableExamPaper
                paper={activePaper}
                currentQuestionIndex={currentQuestionIndex}
                onSelectQuestion={setCurrentQuestionIndex}
                strokes={strokes}
                onUpdateStrokes={setStrokes}
              />
            </div>

            {/* Fluid Adjustable Liquid Splitter */}
            <LiquidSplitter
              splitRatio={splitRatio}
              onRatioChange={setSplitRatio}
              containerRef={containerRef}
            />

            {/* Right Pane: Split Workbench */}
            <div
              style={{ width: `${100 - splitRatio}%` }}
              className="h-full overflow-hidden relative"
            >
              {currentQuestion ? (
                <SplitWorkbench
                  currentQuestion={currentQuestion}
                  awardedMarks={awardedMarks}
                  completedSteps={completedSteps}
                  studentAnswers={studentAnswers}
                  flaggedQuestions={flaggedQuestions}
                  onAwardMark={handleAwardMark}
                  onToggleStep={handleToggleStep}
                  onUpdateAnswer={handleUpdateAnswer}
                  onToggleFlag={handleToggleFlag}
                  scratchpadNotes={scratchpadNotes}
                  onUpdateScratchpad={setScratchpadNotes}
                  onFinishExamForGrading={handleFinishExamForGrading}
                  onSubmitFinalScore={handleSubmitFinalScore}
                  isGradingMode={isGradingMode}
                  isSubmitted={isSubmitted}
                  totalPaperScore={totalPaperScore}
                  maxPaperMarks={activePaper.totalMarks}
                />
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  Select a question to view working docket
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Island Dock (ONLY user's board & enrolled subjects shown!) */}
      <IslandDock
        currentBoard={board}
        enrolledSubjectCount={enrolledSubjects.length}
        onOpenQuickPalette={() => setIsQuickPaletteOpen(true)}
        onOpenTour={() => {
          setIsOnboardingTourOpen(true);
          setTourStep(0);
        }}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenEnrollmentSettings={() => setIsSettingsMode(true)}
        activePaperTimeRemaining={activePaper ? timerRemaining : undefined}
        isSolvingActive={!!activePaper}
        currentView={dashboardView}
        onSelectView={(v) => {
          handleBackToDashboard();
          setDashboardView(v);
        }}
      />

      {/* Mark Scheme Curtain (Tab/M slide-out drawer) */}
      {currentQuestion && (
        <MarkSchemeCurtain
          isOpen={isCurtainOpen}
          onClose={() => setIsCurtainOpen(false)}
          question={currentQuestion}
        />
      )}

      {/* ⌘K Quick Switch Palette (ONLY searches enrolled board & subjects!) */}
      <QuickPalette
        isOpen={isQuickPaletteOpen}
        onClose={() => setIsQuickPaletteOpen(false)}
        papers={enrolledPapers}
        onSelectPaper={handleLaunchPaper}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingTourOpen}
        onClose={() => {
          setIsOnboardingTourOpen(false);
          localStorage.setItem('prism_tour_completed', 'true');
        }}
        currentStep={tourStep}
        onStepChange={setTourStep}
      />

      {/* Keyboard Shortcuts Cheat Sheet (?) */}
      <KeyboardCheatSheet
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
}
