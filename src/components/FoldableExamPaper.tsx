import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  PenTool, 
  Highlighter, 
  Eraser, 
  RotateCcw, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Rows,
  Square
} from 'lucide-react';
import { Paper, AnnotationStroke, Point } from '../types';
import { haptics } from '../services/haptics';

interface FoldableExamPaperProps {
  paper: Paper;
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  strokes: AnnotationStroke[];
  onUpdateStrokes: (strokes: AnnotationStroke[]) => void;
}

export const FoldableExamPaper: React.FC<FoldableExamPaperProps> = ({
  paper,
  currentQuestionIndex,
  onSelectQuestion,
  strokes,
  onUpdateStrokes,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'single' | 'scroll'>('single');
  const totalPages = Math.max(3, paper.questions.length);

  // Stylus tools
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [inkColor, setInkColor] = useState('#38BDF8'); // Cyan dyed liquid resin
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paperContainerRef = useRef<HTMLDivElement | null>(null);

  const colors = [
    { name: 'Cyan Resin', hex: '#38BDF8' },
    { name: 'Emerald Ink', hex: '#34D399' },
    { name: 'Amber Glow', hex: '#FBBF24' },
    { name: 'Coral Red', hex: '#F87171' },
    { name: 'Graphite', hex: '#64748B' },
  ];

  // Render ink strokes on hardware-accelerated canvas
  const renderStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pageStrokes = viewMode === 'single'
      ? strokes.filter((s) => s.pageIndex === currentPage)
      : strokes;

    for (const stroke of pageStrokes) {
      if (stroke.points.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        const xc = (stroke.points[i].x + stroke.points[i - 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i - 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, xc, yc);
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'highlighter') {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width || 20;
        ctx.globalAlpha = 0.35;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width || 2.2;
        ctx.globalAlpha = 0.9;
      }

      ctx.stroke();
    }

    // Active stroke in progress
    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        const xc = (currentStroke[i].x + currentStroke[i - 1].x) / 2;
        const yc = (currentStroke[i].y + currentStroke[i - 1].y) / 2;
        ctx.quadraticCurveTo(currentStroke[i - 1].x, currentStroke[i - 1].y, xc, yc);
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (activeTool === 'highlighter') {
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 20;
        ctx.globalAlpha = 0.35;
      } else {
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 2.2;
        ctx.globalAlpha = 0.9;
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  }, [strokes, currentPage, viewMode, currentStroke, activeTool, inkColor]);

  // Sync canvas size to container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !paperContainerRef.current) return;
    canvas.width = paperContainerRef.current.offsetWidth;
    canvas.height = paperContainerRef.current.offsetHeight;
    renderStrokes();
  }, [renderStrokes, zoomLevel, viewMode]);

  useEffect(() => {
    renderStrokes();
  }, [renderStrokes]);

  // Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'eraser') {
      const remaining = strokes.filter((s) => {
        if (viewMode === 'single' && s.pageIndex !== currentPage) return true;
        return !s.points.some((p) => Math.hypot(p.x - x, p.y - y) < 25);
      });
      if (remaining.length !== strokes.length) {
        haptics.playPaperTurn();
        onUpdateStrokes(remaining);
      }
      return;
    }

    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentStroke((prev) => [...prev, { x, y }]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 1) {
      const newStroke: AnnotationStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        tool: activeTool,
        color: inkColor,
        width: activeTool === 'highlighter' ? 20 : 2.2,
        points: currentStroke,
        pageIndex: currentPage,
      };
      onUpdateStrokes([...strokes, newStroke]);
    }
    setCurrentStroke([]);
  };

  const handleClearStrokes = () => {
    haptics.playPaperTurn();
    if (viewMode === 'single') {
      onUpdateStrokes(strokes.filter((s) => s.pageIndex !== currentPage));
    } else {
      onUpdateStrokes([]);
    }
  };

  const handleDownloadPDF = () => {
    haptics.playSplitterSnap();
    window.print();
  };

  // Filter questions for single page mode or all for scroll mode
  const displayedQuestions = viewMode === 'single'
    ? (paper.questions[currentPage - 1] ? [paper.questions[currentPage - 1]] : paper.questions)
    : paper.questions;

  return (
    <div className="flex flex-col h-full bg-[#0D0F14] border-r border-white/[0.08] relative select-none">
      {/* Top PDF Deck Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/50 border-b border-white/[0.08] backdrop-blur-md z-20">
        {/* Left: View Mode Toggle & Page Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs">
            <button
              onClick={() => {
                haptics.playPaperTurn();
                setViewMode('single');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'single' ? 'bg-purple-600/30 text-purple-200 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Single Page PDF View"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Page</span>
            </button>
            <button
              onClick={() => {
                haptics.playPaperTurn();
                setViewMode('scroll');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'scroll' ? 'bg-purple-600/30 text-purple-200 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Continuous Scroll PDF View"
            >
              <Rows className="w-3.5 h-3.5" />
              <span>Scroll</span>
            </button>
          </div>

          {/* Page Selector (in single page mode) */}
          {viewMode === 'single' && (
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5 text-xs font-mono">
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  haptics.playPaperTurn();
                  setCurrentPage((p) => Math.max(1, p - 1));
                  onSelectQuestion(Math.max(0, currentPage - 2));
                }}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  haptics.playPaperTurn();
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  onSelectQuestion(Math.min(paper.questions.length - 1, currentPage));
                }}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Center: Stylus & Liquid Resin Ink Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => {
              haptics.playPaperTurn();
              setActiveTool('pen');
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'pen'
                ? 'bg-white/[0.14] text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Liquid Ink Pen"
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              haptics.playPaperTurn();
              setActiveTool('highlighter');
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'highlighter'
                ? 'bg-white/[0.14] text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Amber Highlighter"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              haptics.playPaperTurn();
              setActiveTool('eraser');
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-white/[0.14] text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          {/* Color Palette Dots */}
          <div className="flex items-center gap-1 pl-1 ml-1 border-l border-white/[0.1]">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  haptics.playPaperTurn();
                  setInkColor(c.hex);
                }}
                className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                  inkColor === c.hex ? 'scale-125 ring-2 ring-white/60' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          <button
            onClick={handleClearStrokes}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors ml-1 cursor-pointer"
            title="Clear Ink"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Zoom & Download PDF */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
              className="p-1 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-300">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(175, z + 15))}
              className="p-1 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer"
            title="Download Official PDF"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline font-mono">PDF</span>
          </button>
        </div>
      </div>

      {/* Main Vector PDF Paper Canvas Container */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
        <div
          ref={paperContainerRef}
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="relative w-full max-w-3xl"
        >
          {/* Authentic Clean White PDF Sheet */}
          <div className="relative min-h-[960px] bg-[#FFFFFF] rounded-sm text-slate-900 shadow-2xl border border-slate-300 overflow-hidden">
            {/* Top Official PDF Banner */}
            <div className="px-10 pt-8 pb-5 border-b-2 border-slate-900 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-mono font-bold tracking-widest uppercase text-slate-800">
                    {paper.board === 'IGCSE'
                      ? 'Cambridge Assessment International Education'
                      : paper.board === 'CBSE'
                      ? 'Central Board of Secondary Education'
                      : 'Council for the Indian School Certificate Examinations'}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950 mt-1 font-sans">
                    {paper.subjectName.toUpperCase()}
                  </h2>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    {paper.seriesLabel}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-black text-slate-950">{paper.paperCode}</div>
                  <div className="text-xs text-slate-600">{paper.session} {paper.year}</div>
                  <div className="text-xs font-semibold text-slate-800 mt-1">{paper.durationMinutes} minutes</div>
                </div>
              </div>

              {/* Candidate Details Docket Grid */}
              <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-300 font-mono text-xs">
                <div className="border border-slate-400 p-2 rounded bg-slate-50">
                  <span className="text-[10px] text-slate-500 block uppercase">Center No.</span>
                  <span className="font-bold text-slate-900">GB-842</span>
                </div>
                <div className="border border-slate-400 p-2 rounded bg-slate-50">
                  <span className="text-[10px] text-slate-500 block uppercase">Candidate No.</span>
                  <span className="font-bold text-slate-900">4019</span>
                </div>
                <div className="border border-slate-400 p-2 rounded bg-slate-50">
                  <span className="text-[10px] text-slate-500 block uppercase">Max Marks</span>
                  <span className="font-bold text-slate-900">{paper.totalMarks}</span>
                </div>
                <div className="border border-slate-400 p-2 rounded bg-slate-50">
                  <span className="text-[10px] text-slate-500 block uppercase">Calculator</span>
                  <span className="font-bold text-slate-900">Allowed</span>
                </div>
              </div>

              {/* Instructions to Candidates */}
              <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700 leading-relaxed font-sans">
                <strong>READ THESE INSTRUCTIONS FIRST:</strong> Answer all questions. Use a black or dark blue pen. You may use an HB pencil for any diagrams or graphs. Write your working in the spaces provided. Give non-exact numerical answers correct to 3 significant figures.
              </div>
            </div>

            {/* Questions Layout */}
            <div className="p-10 space-y-12">
              {displayedQuestions.map((q, idx) => {
                const globalIndex = paper.questions.findIndex((item) => item.id === q.id);
                const isSelected = globalIndex === currentQuestionIndex;

                return (
                  <div
                    key={q.id}
                    onClick={() => onSelectQuestion(globalIndex)}
                    className={`relative p-6 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/40 ring-2 ring-purple-600/50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-baseline justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono text-sm font-bold flex items-center justify-center">
                          {q.number}
                        </span>
                        <h3 className="font-bold text-lg text-slate-950 font-sans">
                          {q.title}
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        [{q.totalMarks} marks]
                      </span>
                    </div>

                    {q.contextText && (
                      <p className="text-sm text-slate-700 italic mb-4 leading-relaxed font-sans">
                        {q.contextText}
                      </p>
                    )}

                    {/* Subparts */}
                    <div className="space-y-6">
                      {q.subparts.map((sub) => (
                        <div key={sub.id} className="pl-4 border-l-2 border-slate-300 space-y-3">
                          <div className="flex items-baseline justify-between text-sm text-slate-900 font-medium font-sans">
                            <span className="font-mono font-bold mr-2 text-slate-950">{sub.label}</span>
                            <span className="flex-1 whitespace-pre-line leading-relaxed">{sub.text}</span>
                            <span className="font-mono text-xs font-bold text-slate-600 shrink-0 ml-3">
                              [{sub.maxMarks}]
                            </span>
                          </div>

                          {/* Math Formula Callout */}
                          {sub.mathFormula && (
                            <div className="p-3 rounded-lg bg-slate-100 font-mono text-sm text-slate-900 border border-slate-300">
                              {sub.mathFormula}
                            </div>
                          )}

                          {/* Vector Diagrams if specified */}
                          {sub.diagramType === 'coordinate_geometry' && (
                            <div className="my-4 p-4 bg-white rounded-lg border border-slate-300 flex justify-center">
                              <svg width="300" height="170" viewBox="0 0 300 170" className="text-slate-800">
                                <line x1="30" y1="140" x2="270" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />
                                <line x1="150" y1="20" x2="150" y2="155" stroke="#cbd5e1" strokeWidth="1.5" />
                                <line x1="70" y1="45" x2="230" y2="115" stroke="#2563eb" strokeWidth="2.5" />
                                <circle cx="70" cy="45" r="4.5" fill="#2563eb" />
                                <circle cx="230" cy="115" r="4.5" fill="#2563eb" />
                                <text x="75" y="40" fontSize="12" fontFamily="monospace" fontWeight="bold">P (-3, 8)</text>
                                <text x="190" y="130" fontSize="12" fontFamily="monospace" fontWeight="bold">Q (5, 2)</text>
                                <circle cx="150" cy="80" r="3.5" fill="#059669" />
                                <text x="160" y="75" fontSize="11" fontFamily="monospace" fill="#059669">M (1, 5)</text>
                              </svg>
                            </div>
                          )}

                          {sub.diagramType === 'speed_time_graph' && (
                            <div className="my-4 p-4 bg-white rounded-lg border border-slate-300 flex justify-center">
                              <svg width="300" height="150" viewBox="0 0 300 150" className="text-slate-800">
                                <line x1="40" y1="120" x2="260" y2="120" stroke="#475569" strokeWidth="2" />
                                <line x1="40" y1="20" x2="40" y2="120" stroke="#475569" strokeWidth="2" />
                                <path d="M 40 120 L 170 45 L 250 45" fill="none" stroke="#dc2626" strokeWidth="2.5" />
                                <text x="20" y="50" fontSize="11" fontFamily="monospace">45</text>
                                <text x="160" y="135" fontSize="11" fontFamily="monospace">25s</text>
                                <text x="35" y="15" fontSize="11" fontFamily="sans-serif">v (m/s)</text>
                                <text x="265" y="125" fontSize="11" fontFamily="sans-serif">t (s)</text>
                              </svg>
                            </div>
                          )}

                          {/* Ruled writing answer spaces */}
                          <div className="pt-2 space-y-4">
                            <div className="w-full border-b border-slate-300 h-6" />
                            <div className="w-full border-b border-slate-300 h-6" />
                            <div className="w-full border-b border-slate-300 h-6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stylus Resin Ink Canvas Overlay */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="absolute inset-0 cursor-crosshair z-10 touch-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
