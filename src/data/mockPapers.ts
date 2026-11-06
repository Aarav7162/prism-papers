import { Board, Paper, Subject } from '../types';

export const BOARDS_CONFIG: { id: Board; name: string; subtitle: string; available: boolean }[] = [
  { id: 'IGCSE', name: 'Cambridge IGCSE', subtitle: 'International General Certificate of Secondary Education', available: true },
  { id: 'CBSE', name: 'CBSE Board', subtitle: 'Central Board of Secondary Education (Class 10 & 12)', available: true },
  { id: 'IB', name: 'IB Diploma', subtitle: 'International Baccalaureate DP Curriculum', available: false }, // Ambient Coming Soon
  { id: 'ICSE', name: 'CISCE / ICSE', subtitle: 'Council for the Indian School Certificate', available: true },
];

export const ALL_70_SUBJECTS: Subject[] = [
  // --- 1. STEM & Sciences (20 subjects) ---
  { id: 'math_ext', name: 'Mathematics (Extended)', code: '0580', category: 'STEM', boards: ['IGCSE'], color: '#38BDF8' },
  { id: 'math_add', name: 'Additional Mathematics', code: '0606', category: 'STEM', boards: ['IGCSE'], color: '#0EA5E9' },
  { id: 'math_intl', name: 'International Mathematics', code: '0607', category: 'STEM', boards: ['IGCSE'], color: '#0284C7' },
  { id: 'cbse_math', name: 'Mathematics Standard', code: '041', category: 'STEM', boards: ['CBSE'], color: '#38BDF8' },
  { id: 'cbse_applied_math', name: 'Applied Mathematics', code: '241', category: 'STEM', boards: ['CBSE'], color: '#0284C7' },
  { id: 'physics_igcse', name: 'Physics (Extended)', code: '0625', category: 'STEM', boards: ['IGCSE'], color: '#818CF8' },
  { id: 'physics_cbse', name: 'Physics Senior', code: '042', category: 'STEM', boards: ['CBSE'], color: '#6366F1' },
  { id: 'chemistry_igcse', name: 'Chemistry (Extended)', code: '0620', category: 'STEM', boards: ['IGCSE'], color: '#34D399' },
  { id: 'chemistry_cbse', name: 'Chemistry Senior', code: '043', category: 'STEM', boards: ['CBSE'], color: '#10B981' },
  { id: 'biology_igcse', name: 'Biology (Extended)', code: '0610', category: 'STEM', boards: ['IGCSE'], color: '#4ADE80' },
  { id: 'biology_cbse', name: 'Biology Senior', code: '044', category: 'STEM', boards: ['CBSE'], color: '#22C55E' },
  { id: 'combined_sci', name: 'Combined Science', code: '0653', category: 'STEM', boards: ['IGCSE'], color: '#2DD4BF' },
  { id: 'coordinated_sci', name: 'Co-ordinated Sciences (Double)', code: '0654', category: 'STEM', boards: ['IGCSE'], color: '#14B8A6' },
  { id: 'computer_science', name: 'Computer Science', code: '0478 / 083', category: 'STEM', boards: ['IGCSE', 'CBSE'], color: '#F59E0B' },
  { id: 'ict', name: 'Information & Communication Tech (ICT)', code: '0417', category: 'STEM', boards: ['IGCSE'], color: '#D97706' },
  { id: 'cbse_informatics', name: 'Informatics Practices', code: '065', category: 'STEM', boards: ['CBSE'], color: '#B45309' },
  { id: 'biotechnology', name: 'Biotechnology', code: '045', category: 'STEM', boards: ['CBSE'], color: '#A855F7' },
  { id: 'marine_science', name: 'Marine Science', code: '0697', category: 'STEM', boards: ['IGCSE'], color: '#06B6D4' },
  { id: 'env_management', name: 'Environmental Management', code: '0680', category: 'STEM', boards: ['IGCSE'], color: '#10B981' },
  { id: 'agriculture', name: 'Agriculture', code: '0600', category: 'STEM', boards: ['IGCSE'], color: '#84CC16' },

  // --- 2. Commerce & Business (12 subjects) ---
  { id: 'economics_igcse', name: 'Economics', code: '0455', category: 'Commerce', boards: ['IGCSE'], color: '#F43F5E' },
  { id: 'economics_cbse', name: 'Economics Senior', code: '030', category: 'Commerce', boards: ['CBSE'], color: '#E11D48' },
  { id: 'business_studies', name: 'Business Studies', code: '0450 / 054', category: 'Commerce', boards: ['IGCSE', 'CBSE'], color: '#FB7185' },
  { id: 'accounting', name: 'Accounting / Accountancy', code: '0452 / 055', category: 'Commerce', boards: ['IGCSE', 'CBSE'], color: '#FDA4AF' },
  { id: 'enterprise', name: 'Enterprise', code: '0454', category: 'Commerce', boards: ['IGCSE'], color: '#EC4899' },
  { id: 'entrepreneurship', name: 'Entrepreneurship', code: '066', category: 'Commerce', boards: ['CBSE'], color: '#DB2777' },
  { id: 'travel_tourism', name: 'Travel & Tourism', code: '0471', category: 'Commerce', boards: ['IGCSE'], color: '#BE185D' },
  { id: 'commerce_general', name: 'Commerce General', code: '7100', category: 'Commerce', boards: ['IGCSE'], color: '#F472B6' },
  { id: 'commercial_studies', name: 'Commercial Studies', code: 'ICSE-06', category: 'Commerce', boards: ['ICSE'], color: '#FB7185' },
  { id: 'financial_marketing', name: 'Financial Markets Management', code: 'CBSE-FM', category: 'Commerce', boards: ['CBSE'], color: '#F43F5E' },
  { id: 'banking_insurance', name: 'Banking & Insurance', code: 'CBSE-BI', category: 'Commerce', boards: ['CBSE'], color: '#E11D48' },
  { id: 'marketing_sales', name: 'Marketing & Salesmanship', code: 'CBSE-MK', category: 'Commerce', boards: ['CBSE'], color: '#BE185D' },

  // --- 3. Humanities & Social Sciences (16 subjects) ---
  { id: 'history_igcse', name: 'History (Modern World)', code: '0470', category: 'Humanities', boards: ['IGCSE'], color: '#F59E0B' },
  { id: 'history_cbse', name: 'History (India & World)', code: '027', category: 'Humanities', boards: ['CBSE'], color: '#D97706' },
  { id: 'geography_igcse', name: 'Geography', code: '0460', category: 'Humanities', boards: ['IGCSE'], color: '#10B981' },
  { id: 'geography_cbse', name: 'Geography Senior', code: '029', category: 'Humanities', boards: ['CBSE'], color: '#059669' },
  { id: 'global_perspectives', name: 'Global Perspectives', code: '0457', category: 'Humanities', boards: ['IGCSE'], color: '#6366F1' },
  { id: 'sociology_igcse', name: 'Sociology', code: '0495', category: 'Humanities', boards: ['IGCSE'], color: '#8B5CF6' },
  { id: 'sociology_cbse', name: 'Sociology Senior', code: '039', category: 'Humanities', boards: ['CBSE'], color: '#7C3AED' },
  { id: 'psychology_cbse', name: 'Psychology', code: '037', category: 'Humanities', boards: ['CBSE'], color: '#C084FC' },
  { id: 'pol_science_cbse', name: 'Political Science', code: '028', category: 'Humanities', boards: ['CBSE'], color: '#38BDF8' },
  { id: 'legal_studies', name: 'Legal Studies', code: '074', category: 'Humanities', boards: ['CBSE'], color: '#0EA5E9' },
  { id: 'world_literature', name: 'World Literature', code: '0408', category: 'Humanities', boards: ['IGCSE'], color: '#A855F7' },
  { id: 'philosophy', name: 'Philosophy', code: 'CBSE-PH', category: 'Humanities', boards: ['CBSE'], color: '#9333EA' },
  { id: 'islamiyat', name: 'Islamiyat', code: '0493', category: 'Humanities', boards: ['IGCSE'], color: '#059669' },
  { id: 'pakistan_studies', name: 'Pakistan Studies', code: '0448', category: 'Humanities', boards: ['IGCSE'], color: '#10B981' },
  { id: 'bangladesh_studies', name: 'Bangladesh Studies', code: '0449', category: 'Humanities', boards: ['IGCSE'], color: '#047857' },
  { id: 'religious_studies', name: 'Religious Studies', code: '0490', category: 'Humanities', boards: ['IGCSE'], color: '#D97706' },

  // --- 4. Languages & Literature (14 subjects) ---
  { id: 'eng_first_lang', name: 'English - First Language', code: '0500', category: 'Languages', boards: ['IGCSE'], color: '#38BDF8' },
  { id: 'eng_second_lang', name: 'English as a Second Language', code: '0510', category: 'Languages', boards: ['IGCSE'], color: '#0EA5E9' },
  { id: 'eng_literature', name: 'English Literature', code: '0475', category: 'Languages', boards: ['IGCSE'], color: '#818CF8' },
  { id: 'cbse_eng_core', name: 'English Core', code: '301', category: 'Languages', boards: ['CBSE'], color: '#6366F1' },
  { id: 'french_foreign', name: 'French - Foreign Language', code: '0520', category: 'Languages', boards: ['IGCSE'], color: '#60A5FA' },
  { id: 'spanish_foreign', name: 'Spanish - Foreign Language', code: '0530', category: 'Languages', boards: ['IGCSE'], color: '#F97316' },
  { id: 'german_foreign', name: 'German - Foreign Language', code: '0525', category: 'Languages', boards: ['IGCSE'], color: '#EAB308' },
  { id: 'mandarin_chinese', name: 'Chinese - Second Language', code: '0523', category: 'Languages', boards: ['IGCSE'], color: '#EF4444' },
  { id: 'arabic_foreign', name: 'Arabic - Foreign Language', code: '0544', category: 'Languages', boards: ['IGCSE'], color: '#10B981' },
  { id: 'hindi_second', name: 'Hindi as a Second Language', code: '0549 / 302', category: 'Languages', boards: ['IGCSE', 'CBSE'], color: '#F97316' },
  { id: 'urdu_second', name: 'Urdu as a Second Language', code: '0539', category: 'Languages', boards: ['IGCSE'], color: '#14B8A6' },
  { id: 'sanskrit_cbse', name: 'Sanskrit Core', code: '322', category: 'Languages', boards: ['CBSE'], color: '#F59E0B' },
  { id: 'latin_language', name: 'Latin', code: '0480', category: 'Languages', boards: ['IGCSE'], color: '#94A3B8' },
  { id: 'classical_greek', name: 'Classical Greek', code: '0481', category: 'Languages', boards: ['IGCSE'], color: '#64748B' },

  // --- 5. Creative, Technical & Applied (12 subjects) ---
  { id: 'art_design', name: 'Art & Design', code: '0400', category: 'Creative', boards: ['IGCSE'], color: '#EC4899' },
  { id: 'music_igcse', name: 'Music', code: '0410', category: 'Creative', boards: ['IGCSE'], color: '#A855F7' },
  { id: 'drama_igcse', name: 'Drama', code: '0411', category: 'Creative', boards: ['IGCSE'], color: '#F43F5E' },
  { id: 'design_technology', name: 'Design & Technology', code: '0445', category: 'Creative', boards: ['IGCSE'], color: '#F59E0B' },
  { id: 'physical_education', name: 'Physical Education', code: '0413 / 048', category: 'Creative', boards: ['IGCSE', 'CBSE'], color: '#10B981' },
  { id: 'food_nutrition', name: 'Food & Nutrition', code: '0648', category: 'Creative', boards: ['IGCSE'], color: '#EAB308' },
  { id: 'engineering_graphics', name: 'Engineering Graphics', code: '046', category: 'Creative', boards: ['CBSE'], color: '#38BDF8' },
  { id: 'painting_cbse', name: 'Painting & Fine Arts', code: '049', category: 'Creative', boards: ['CBSE'], color: '#F472B6' },
  { id: 'home_science', name: 'Home Science', code: '064', category: 'Creative', boards: ['CBSE'], color: '#FB7185' },
  { id: 'dance_kathak', name: 'Kathak / Classical Dance', code: 'CBSE-KD', category: 'Creative', boards: ['CBSE'], color: '#C084FC' },
  { id: 'sculpture_cbse', name: 'Sculpture & Applied Art', code: '051', category: 'Creative', boards: ['CBSE'], color: '#CBD5E1' },
  { id: 'commercial_art', name: 'Applied Art / Commercial Art', code: '052', category: 'Creative', boards: ['CBSE'], color: '#E2E8F0' },
];

export const SUBJECTS: Subject[] = ALL_70_SUBJECTS;

// Helper to seed past papers for any subject
export const generatePapersForSubject = (board: Board, subject: Subject): Paper[] => {
  const years = [2024, 2023, 2022, 2021];
  const results: Paper[] = [];

  years.forEach((year) => {
    const session = board === 'IGCSE' ? (year % 2 === 0 ? 'May/June' : 'Oct/Nov') : 'Annual';
    const paperCode = board === 'IGCSE' ? `${subject.code}/42` : `${subject.code}/1`;
    const is2024 = year === 2024;
    const is2023 = year === 2023;

    results.push({
      id: `${board.toLowerCase()}-${subject.id}-${year}`,
      board,
      subjectId: subject.id,
      subjectName: subject.name,
      year,
      session: session as Paper['session'],
      paperCode,
      seriesLabel: `${subject.name} Paper (${session} ${year})`,
      totalMarks: subject.category === 'STEM' ? (board === 'IGCSE' ? 130 : 80) : 100,
      durationMinutes: subject.category === 'STEM' ? 120 : 90,
      status: 'unattempted',
      score: undefined,
      bestScore: undefined,
      avgSolveTimeMinutes: undefined,
      questions: [
        {
          id: `q1_${subject.id}_${year}`,
          number: 1,
          title: `${subject.name} Core Principles & Analysis`,
          contextText: `Official Cambridge / Board examination context scenario for ${subject.name}.`,
          totalMarks: 7,
          subparts: [
            {
              id: `q1_a_${subject.id}_${year}`,
              label: '(a)',
              text: `Define the primary law or governing principle underlying ${subject.name} in this context, and state the governing units/conditions.`,
              maxMarks: 3,
              officialAnswer: `Core definition clearly articulated with accurate notation and governing conditions satisfied.`,
              rubricSteps: [
                { id: `s1_${subject.id}`, code: 'M1', title: 'Accurate Theoretical Formulation', description: 'States correct relationship or equation without error', marks: 1 },
                { id: `s2_${subject.id}`, code: 'A1', title: 'Calculated Parameter', description: 'Substitutes given values correctly', marks: 1 },
                { id: `s3_${subject.id}`, code: 'A1', title: 'Units & Final Accuracy', description: 'Accurate answer with valid SI / subject notation', marks: 1 },
              ],
            },
            {
              id: `q1_b_${subject.id}_${year}`,
              label: '(b)',
              text: `Evaluate the quantitative effect when the system parameters increase by 25%. Show complete step-by-step working.`,
              mathFormula: 'k = \\frac{\\Delta y}{\\Delta x} \\times 100\\%',
              maxMarks: 4,
              officialAnswer: `Final value verified as 1.25x with fractional reduction.`,
              rubricSteps: [
                { id: `s4_${subject.id}`, code: 'M1', title: 'Ratio Setup', description: 'Correct ratio or algebraic expansion', marks: 1 },
                { id: `s5_${subject.id}`, code: 'A1', title: 'Simplification Step', description: 'Combines like terms accurately', marks: 1 },
                { id: `s6_${subject.id}`, code: 'A1', title: 'Exact Numerical Answer', description: 'Value correct to 3 significant figures', marks: 2 },
              ],
            },
          ],
        },
        {
          id: `q2_${subject.id}_${year}`,
          number: 2,
          title: `Analytical Modeling & Problem Solving`,
          totalMarks: 6,
          subparts: [
            {
              id: `q2_a_${subject.id}_${year}`,
              label: '(a)',
              text: `Use coordinate or graphical methods to determine the point of equilibrium or optimum result.`,
              diagramType: subject.category === 'STEM' ? 'coordinate_geometry' : undefined,
              maxMarks: 6,
              officialAnswer: `x = 4.0, y = 2.5`,
              rubricSteps: [
                { id: `s7_${subject.id}`, code: 'B1', title: 'Graph Identification', description: 'Correct intercept or vertex identified', marks: 2 },
                { id: `s8_${subject.id}`, code: 'M1', title: 'Algebraic Solution', description: 'Simultaneous resolution or gradient calculation', marks: 2 },
                { id: `s9_${subject.id}`, code: 'A1', title: 'Final Coordinates', description: 'Accurate to 3 sig figs', marks: 2 },
              ],
            },
          ],
        },
      ],
    });
  });

  return results;
};

// Initial papers seeded for top subjects
export const INITIAL_PAPERS: Paper[] = [
  ...generatePapersForSubject('IGCSE', ALL_70_SUBJECTS[0]), // math_ext
  ...generatePapersForSubject('IGCSE', ALL_70_SUBJECTS[5]), // physics_igcse
  ...generatePapersForSubject('IGCSE', ALL_70_SUBJECTS[7]), // chemistry_igcse
  ...generatePapersForSubject('IGCSE', ALL_70_SUBJECTS[13]), // computer_science
  ...generatePapersForSubject('IGCSE', ALL_70_SUBJECTS[20]), // economics_igcse
  ...generatePapersForSubject('CBSE', ALL_70_SUBJECTS[3]),  // cbse_math
  ...generatePapersForSubject('CBSE', ALL_70_SUBJECTS[6]),  // physics_cbse
];
