import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, X } from 'lucide-react';
import { haptics } from '../services/haptics';

interface KeyboardCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardCheatSheet: React.FC<KeyboardCheatSheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Exam Navigation',
      shortcuts: [
        { key: 'K', desc: 'Advance to next question / subpart' },
        { key: 'J', desc: 'Return to previous question' },
        { key: 'F', desc: 'Toggle 3D Booklet / Single-page focus' },
        { key: 'D', desc: 'Export / Download examination PDF' },
      ],
    },
    {
      category: 'Mark Scheme & Scoring',
      shortcuts: [
        { key: 'M / Tab', desc: 'Slide Mark Scheme Curtain in/out' },
        { key: '1 - 6', desc: 'Award 1 to 6 marks for active question' },
        { key: '0', desc: 'Award 0 marks (No mark)' },
        { key: 'Space', desc: 'Quick peek mark scheme drawer' },
      ],
    },
    {
      category: 'Paper Discovery & Tools',
      shortcuts: [
        { key: '⌘K / Ctrl+K', desc: 'Summon Quick Switch paper search' },
        { key: 'P', desc: 'Switch to Liquid Pen ink tool' },
        { key: 'H', desc: 'Switch to Amber Highlighter tool' },
        { key: 'E', desc: 'Switch to Ink Eraser' },
        { key: '?', desc: 'Show / hide this shortcut cheat sheet' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl p-6 rounded-2xl liquid-glass specular-border shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={() => {
              haptics.playSplitterSnap();
              onClose();
            }}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                Keyboard-First Flow & Shortcuts
              </h3>
              <p className="text-xs text-slate-400">
                Execute examination workflows with tactile precision
              </p>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {shortcutGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
                  {group.category}
                </span>
                <div className="space-y-1.5">
                  {group.shortcuts.map((sc, scIdx) => (
                    <div
                      key={scIdx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs"
                    >
                      <span className="text-slate-300">{sc.desc}</span>
                      <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-slate-200 border border-white/20 text-[11px]">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 font-mono">Esc</kbd> to dismiss</span>
            <button
              onClick={() => {
                haptics.playSplitterSnap();
                onClose();
              }}
              className="px-3 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
