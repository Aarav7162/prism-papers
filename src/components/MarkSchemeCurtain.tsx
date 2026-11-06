import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, ChevronDown, Award } from 'lucide-react';
import { Question } from '../types';
import { haptics } from '../services/haptics';

interface MarkSchemeCurtainProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
}

export const MarkSchemeCurtain: React.FC<MarkSchemeCurtainProps> = ({
  isOpen,
  onClose,
  question,
}) => {
  useEffect(() => {
    if (isOpen) {
      haptics.playCurtainSlide('open');
    }
  }, [isOpen]);

  const handleClose = () => {
    haptics.playCurtainSlide('close');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
          />

          {/* Curtain Drawer Sheet (iOS sheets style) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 36,
            }}
            className="relative w-full max-w-3xl max-h-[75vh] p-6 rounded-t-3xl liquid-glass specular-border shadow-2xl pointer-events-auto overflow-y-auto"
          >
            {/* Grab Notch Bar */}
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4 cursor-pointer" onClick={handleClose} />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                    Mark Scheme Curtain (Quick Glance)
                  </span>
                  <h3 className="text-base font-bold text-slate-100 tracking-tight">
                    Question {question.number}: {question.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono text-slate-300 border border-white/20">
                  M or Esc to dismiss
                </kbd>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rubrics Content */}
            <div className="py-4 space-y-4">
              {question.subparts.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-300">
                      {sub.label} official marks: {sub.maxMarks}
                    </span>
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      Answer: {sub.officialAnswer}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {sub.rubricSteps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-start gap-2.5 text-xs text-slate-300 p-2 rounded bg-white/[0.02]"
                      >
                        <span className="font-mono font-bold text-cyan-400 px-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {step.code}
                        </span>
                        <div className="flex-1">
                          <strong className="text-slate-200">{step.title}:</strong> {step.description}
                        </div>
                        <span className="font-mono text-slate-500">+{step.marks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center text-xs text-slate-500 font-mono">
              Press Tab or M to tuck away
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
