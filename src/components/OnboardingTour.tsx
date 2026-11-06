import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Keyboard, 
  Layers, 
  SplitSquareVertical, 
  Sliders, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X,
  Compass
} from 'lucide-react';
import { haptics } from '../services/haptics';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export const TOUR_STEPS = [
  {
    title: 'Welcome to Prism',
    subtitle: 'High-density physical-grade past paper cockpit',
    icon: Compass,
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <p>
          Prism merges the tactical speed of <span className="text-purple-300 font-medium">Linear</span> with physical fluid precision.
        </p>
        <p>
          Discover authentic past papers across 70+ subjects in <strong className="text-slate-100">IGCSE</strong>, <strong className="text-slate-100">CBSE</strong>, and <strong className="text-slate-100">ICSE</strong>, and solve them under realistic examination conditions.
        </p>
      </div>
    ),
  },
  {
    title: 'Keyboard-First Flow',
    subtitle: 'Zero mouse latency for maximum focus',
    icon: Keyboard,
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
            <span className="text-slate-400">Next Question</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/20">K</kbd>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
            <span className="text-slate-400">Prev Question</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/20">J</kbd>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
            <span className="text-slate-400">Award Marks</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/20">1 - 6</kbd>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
            <span className="text-slate-400">Mark Curtain</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/20">M / Tab</kbd>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">?</kbd> at any time to inspect all active hotkeys.
        </p>
      </div>
    ),
  },
  {
    title: 'Official Vector PDF Examination Papers',
    subtitle: 'Tactile physical exam experience',
    icon: Layers,
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <p>
          Examination papers render as authentic PDF documents with official board formatting, candidate dockets, and sharp vector math formulas.
        </p>
        <p>
          Switch between <strong className="text-slate-100">Single Page</strong> and <strong className="text-slate-100">Continuous Scroll</strong> mode, or download a printable PDF booklet.
        </p>
        <p className="text-xs text-slate-400">
          Use the stylus tool to annotate with liquid ink pens, highlighters, and erasers.
        </p>
      </div>
    ),
  },
  {
    title: 'Dual-Pane Workbench & Real Mark Schemes',
    subtitle: 'Solve first, then unlock official criteria at the end',
    icon: SplitSquareVertical,
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <p>
          While solving, record your responses in the candidate docket without answer spoilers.
        </p>
        <p>
          When you finish, the <span className="text-emerald-400 font-semibold">Official Mark Scheme</span> unlocks to evaluate method marks (<span className="text-cyan-400 font-mono">M1</span>), accuracy marks (<span className="text-emerald-400 font-mono">A1</span>), and independent marks (<span className="text-purple-400 font-mono">B1</span>).
        </p>
      </div>
    ),
  },
  {
    title: 'Quick Switch Palette & Matrix',
    subtitle: 'Instant paper jumping at the speed of thought',
    icon: Sparkles,
    content: (
      <div className="space-y-3 text-sm text-slate-300">
        <p>
          Press <kbd className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30 font-mono">⌘K</kbd> to summon the fuzzy-matching paper search palette.
        </p>
        <p>
          Watch your progress light up in the <strong className="text-slate-100">Tactile Completion Rail</strong>: solved papers glow as cut-crystal emerald facets, while revision papers pulse amber.
        </p>
      </div>
    ),
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  currentStep,
  onStepChange,
}) => {
  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep] || TOUR_STEPS[0];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    haptics.playPaperTurn();
    if (isLast) {
      onClose();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrev = () => {
    haptics.playPaperTurn();
    if (!isFirst) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg p-7 rounded-2xl liquid-glass specular-border shadow-2xl overflow-hidden"
        >
          {/* Ambient Corner Refraction Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              haptics.playSplitterSnap();
              onClose();
            }}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-colors"
            title="Dismiss Tour"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                {step.title}
              </h3>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-slate-400 font-medium -mt-2 mb-4">
            {step.subtitle}
          </p>

          {/* Body Content */}
          <div className="min-h-[140px] mb-6">
            {step.content}
          </div>

          {/* Footer Controls & Step Indicators */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
            {/* Step Pills */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    haptics.playPaperTurn();
                    onStepChange(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'w-6 bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]'
                      : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all cursor-pointer"
              >
                {isLast ? 'Get Started' : 'Continue'}
                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
