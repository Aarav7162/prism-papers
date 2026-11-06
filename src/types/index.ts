export type Board = 'IGCSE' | 'CBSE' | 'IB' | 'ICSE';

export type SubjectCategory = 'STEM' | 'Commerce' | 'Humanities' | 'Languages' | 'Creative';

export interface Subject {
  id: string;
  name: string;
  code: string;
  category: SubjectCategory;
  boards: Board[];
  iconName?: string;
  color: string;
}

export interface RubricStep {
  id: string;
  code: 'M1' | 'A1' | 'B1' | 'C1' | 'SC';
  title: string;
  description: string;
  marks: number;
}

export interface QuestionSubpart {
  id: string;
  label: string;
  text: string;
  mathFormula?: string;
  diagramType?: 'coordinate_geometry' | 'quadratic_curve' | 'circuit_diagram' | 'vector_triangle' | 'speed_time_graph';
  maxMarks: number;
  rubricSteps: RubricStep[];
  officialAnswer: string;
}

export interface Question {
  id: string;
  number: number;
  title: string;
  contextText?: string;
  totalMarks: number;
  subparts: QuestionSubpart[];
}

export interface Paper {
  id: string;
  board: Board;
  subjectId: string;
  subjectName: string;
  year: number;
  session: 'May/June' | 'Oct/Nov' | 'Feb/March' | 'Annual';
  paperCode: string; // e.g., "0580/42", "CBSE-12-MAT-041"
  seriesLabel: string;
  totalMarks: number;
  durationMinutes: number;
  questions: Question[];
  status: 'solved' | 'in_progress' | 'unattempted';
  score?: number;
  bestScore?: number;
  avgSolveTimeMinutes?: number;
  lastAttempted?: string;
  fileKey?: string;
  pdfUrl?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface AnnotationStroke {
  id: string;
  tool: 'pen' | 'highlighter' | 'eraser';
  color: string;
  width: number;
  points: Point[];
  pageIndex: number;
}
