import { PrismaClient, PaperType, ProgressStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting PRISM database seeding...");

  // 1. Seed Boards
  const boardsData = [
    {
      id: "cbse",
      name: "Central Board of Secondary Education",
      isActive: true,
    },
    {
      id: "igcse",
      name: "Cambridge Assessment International Education (IGCSE)",
      isActive: true,
    },
    {
      id: "icse",
      name: "Council for the Indian School Certificate Examinations (ICSE/ISC)",
      isActive: true,
    },
    {
      id: "ib",
      name: "International Baccalaureate",
      isActive: false, // Specified in requirements: set false for IB as "Coming Soon"
    },
  ];

  for (const board of boardsData) {
    await prisma.board.upsert({
      where: { id: board.id },
      update: { name: board.name, isActive: board.isActive },
      create: board,
    });
  }
  console.log(`✅ Seeded ${boardsData.length} Examination Boards.`);

  // 2. Seed Core Subjects
  const subjectsData = [
    // CBSE Class 10
    {
      boardId: "cbse",
      code: "041",
      name: "Mathematics",
      gradeLevel: "Class 10",
    },
    {
      boardId: "cbse",
      code: "086",
      name: "Science",
      gradeLevel: "Class 10",
    },
    // CBSE Class 12
    {
      boardId: "cbse",
      code: "041",
      name: "Mathematics",
      gradeLevel: "Class 12",
    },
    {
      boardId: "cbse",
      code: "042",
      name: "Physics",
      gradeLevel: "Class 12",
    },
    {
      boardId: "cbse",
      code: "043",
      name: "Chemistry",
      gradeLevel: "Class 12",
    },
    // ICSE Class 10
    {
      boardId: "icse",
      code: "51",
      name: "Mathematics",
      gradeLevel: "Class 10",
    },
    {
      boardId: "icse",
      code: "52",
      name: "Physics",
      gradeLevel: "Class 10",
    },
    {
      boardId: "icse",
      code: "53",
      name: "Chemistry",
      gradeLevel: "Class 10",
    },
    // ICSE / ISC Class 12
    {
      boardId: "icse",
      code: "860",
      name: "Mathematics",
      gradeLevel: "Class 12",
    },
    {
      boardId: "icse",
      code: "861",
      name: "Physics",
      gradeLevel: "Class 12",
    },
    // IGCSE Cambridge
    {
      boardId: "igcse",
      code: "0580",
      name: "Extended Mathematics",
      gradeLevel: "IGCSE",
    },
    {
      boardId: "igcse",
      code: "0625",
      name: "Physics",
      gradeLevel: "IGCSE",
    },
    {
      boardId: "igcse",
      code: "0620",
      name: "Chemistry",
      gradeLevel: "IGCSE",
    },
  ];

  const createdSubjects: Record<string, string> = {};

  for (const sub of subjectsData) {
    const subject = await prisma.subject.upsert({
      where: {
        boardId_code_gradeLevel: {
          boardId: sub.boardId,
          code: sub.code,
          gradeLevel: sub.gradeLevel,
        },
      },
      update: { name: sub.name },
      create: sub,
    });
    const key = `${sub.boardId}:${sub.code}:${sub.gradeLevel}`;
    createdSubjects[key] = subject.id;
  }
  console.log(`✅ Seeded ${subjectsData.length} Core Subjects.`);

  // 3. Seed Realistic Sample Papers & Mark Schemes (Years 2021-2024)
  const mathIgcseId = createdSubjects["igcse:0580:IGCSE"];
  const physicsIgcseId = createdSubjects["igcse:0625:IGCSE"];
  const mathCbse12Id = createdSubjects["cbse:041:Class 12"];
  const physicsCbse12Id = createdSubjects["cbse:042:Class 12"];
  const mathIcse10Id = createdSubjects["icse:51:Class 10"];

  interface PaperSeedDefinition {
    subjectId: string;
    year: number;
    session: string;
    variant: string;
    totalMarks: number;
    durationMins: number;
    qpKey: string;
    msKey: string;
    questions: Array<{
      questionNum: string;
      maxMarks: number;
      topicTags: string[];
      rubric: Array<{ code: string; desc: string; marks: number }>;
    }>;
  }

  const paperDefinitions: PaperSeedDefinition[] = [
    // Cambridge IGCSE Math 0580 - 2024 May/June Variant 22
    {
      subjectId: mathIgcseId,
      year: 2024,
      session: "May/June",
      variant: "22",
      totalMarks: 70,
      durationMins: 90,
      qpKey: "papers/igcse/0580/2024_mj/0580_s24_qp_22.pdf",
      msKey: "papers/igcse/0580/2024_mj/0580_s24_ms_22.pdf",
      questions: [
        {
          questionNum: "1",
          maxMarks: 2,
          topicTags: ["Number", "Standard Form"],
          rubric: [
            { code: "B1", desc: "Recognize power of 10", marks: 1 },
            { code: "B1", desc: "Correct standard form 4.5 x 10^-3", marks: 1 },
          ],
        },
        {
          questionNum: "2(a)",
          maxMarks: 3,
          topicTags: ["Algebra", "Quadratic Equations", "Factorisation"],
          rubric: [
            { code: "M1", desc: "Correct splitting of middle term or quadratic formula substitution", marks: 1 },
            { code: "A1", desc: "Factors (2x - 3)(x + 4)", marks: 1 },
            { code: "A1", desc: "Final solutions x = 1.5, x = -4", marks: 1 },
          ],
        },
        {
          questionNum: "2(b)",
          maxMarks: 4,
          topicTags: ["Algebra", "Simultaneous Equations"],
          rubric: [
            { code: "M1", desc: "Equating equations or valid elimination step", marks: 1 },
            { code: "A1", desc: "Single variable quadratic formed", marks: 1 },
            { code: "M1", desc: "Method for solving quadratic", marks: 1 },
            { code: "A1", desc: "Both pairs of coordinates (x, y) correct", marks: 1 },
          ],
        },
        {
          questionNum: "3",
          maxMarks: 5,
          topicTags: ["Trigonometry", "Sine and Cosine Rules"],
          rubric: [
            { code: "M1", desc: "Correct application of Cosine rule a^2 = b^2 + c^2 - 2bc cos(A)", marks: 2 },
            { code: "A1", desc: "Evaluation of length to 3 significant figures", marks: 1 },
            { code: "M1", desc: "Area of triangle 0.5 * a * b * sin(C)", marks: 1 },
            { code: "A1", desc: "Total area correct", marks: 1 },
          ],
        },
        {
          questionNum: "4(a)",
          maxMarks: 3,
          topicTags: ["Calculus", "Differentiation", "Stationary Points"],
          rubric: [
            { code: "M1", desc: "Differentiate y = ax^n with respect to x", marks: 1 },
            { code: "A1", desc: "Set dy/dx = 0 for stationary point", marks: 1 },
            { code: "B1", desc: "Coordinates of turning point", marks: 1 },
          ],
        },
      ],
    },
    // Cambridge IGCSE Math 0580 - 2023 Oct/Nov Variant 42
    {
      subjectId: mathIgcseId,
      year: 2023,
      session: "Oct/Nov",
      variant: "42",
      totalMarks: 100,
      durationMins: 150,
      qpKey: "papers/igcse/0580/2023_on/0580_w23_qp_42.pdf",
      msKey: "papers/igcse/0580/2023_on/0580_w23_ms_42.pdf",
      questions: [
        {
          questionNum: "1(a)",
          maxMarks: 3,
          topicTags: ["Probability", "Tree Diagrams"],
          rubric: [
            { code: "B1", desc: "Complete tree diagram branch probabilities", marks: 1 },
            { code: "M1", desc: "Multiply along branches for intersection", marks: 1 },
            { code: "A1", desc: "Correct probability fraction/decimal", marks: 1 },
          ],
        },
        {
          questionNum: "1(b)",
          maxMarks: 4,
          topicTags: ["Vectors", "Geometric Proof"],
          rubric: [
            { code: "M1", desc: "Express vector in terms of base vectors a and b", marks: 2 },
            { code: "M1", desc: "Collinear ratio verification", marks: 1 },
            { code: "A1", desc: "Accurate conclusion stated", marks: 1 },
          ],
        },
        {
          questionNum: "2",
          maxMarks: 6,
          topicTags: ["Mensuration", "Cones and Spheres", "Volume"],
          rubric: [
            { code: "M1", desc: "Cone volume formula 1/3 * pi * r^2 * h", marks: 1 },
            { code: "M1", desc: "Hemisphere volume 2/3 * pi * r^3", marks: 1 },
            { code: "M1", desc: "Equating composite volume to given mass/density", marks: 2 },
            { code: "A1", desc: "Value of radius r calculated accurately", marks: 2 },
          ],
        },
      ],
    },
    // Cambridge IGCSE Physics 0625 - 2024 May/June Variant 42
    {
      subjectId: physicsIgcseId,
      year: 2024,
      session: "May/June",
      variant: "42",
      totalMarks: 80,
      durationMins: 75,
      qpKey: "papers/igcse/0625/2024_mj/0625_s24_qp_42.pdf",
      msKey: "papers/igcse/0625/2024_mj/0625_s24_ms_42.pdf",
      questions: [
        {
          questionNum: "1(a)",
          maxMarks: 3,
          topicTags: ["Kinematics", "Velocity-Time Graphs", "Acceleration"],
          rubric: [
            { code: "M1", desc: "Gradient of graph = delta v / delta t", marks: 1 },
            { code: "A1", desc: "Numeric value of acceleration 2.4", marks: 1 },
            { code: "B1", desc: "Correct unit m/s^2", marks: 1 },
          ],
        },
        {
          questionNum: "1(b)",
          maxMarks: 3,
          topicTags: ["Kinematics", "Distance", "Integration/Area"],
          rubric: [
            { code: "M1", desc: "Area under graph = trapezoid or triangle + rectangle", marks: 2 },
            { code: "A1", desc: "Correct total displacement with unit meters", marks: 1 },
          ],
        },
        {
          questionNum: "2",
          maxMarks: 5,
          topicTags: ["Thermal Physics", "Specific Heat Capacity"],
          rubric: [
            { code: "M1", desc: "Thermal energy formula Q = mc Delta T", marks: 2 },
            { code: "M1", desc: "Electrical power formula P = V * I = E / t", marks: 2 },
            { code: "A1", desc: "Final specific heat capacity in J/(kg * K)", marks: 1 },
          ],
        },
      ],
    },
    // CBSE Class 12 Mathematics 041 - 2023 Annual Set 1
    {
      subjectId: mathCbse12Id,
      year: 2023,
      session: "Annual",
      variant: "Set 1",
      totalMarks: 80,
      durationMins: 180,
      qpKey: "papers/cbse/041/2023_annual/cbse_2023_maths_12_set1_qp.pdf",
      msKey: "papers/cbse/041/2023_annual/cbse_2023_maths_12_set1_ms.pdf",
      questions: [
        {
          questionNum: "1",
          maxMarks: 1,
          topicTags: ["Matrices", "Determinants"],
          rubric: [
            { code: "B1", desc: "Correct determinant formula |adj A| = |A|^(n-1)", marks: 1 },
          ],
        },
        {
          questionNum: "2",
          maxMarks: 2,
          topicTags: ["Relations and Functions", "Equivalence Relation"],
          rubric: [
            { code: "M1", desc: "Reflexive and Symmetric tests verified", marks: 1 },
            { code: "A1", desc: "Transitive condition demonstrated", marks: 1 },
          ],
        },
        {
          questionNum: "3",
          maxMarks: 4,
          topicTags: ["Calculus", "Definite Integrals", "Properties"],
          rubric: [
            { code: "M1", desc: "Use property int_0^a f(x) dx = int_0^a f(a - x) dx", marks: 2 },
            { code: "M1", desc: "Add equations 2I = int_0^a ...", marks: 1 },
            { code: "A1", desc: "Final value pi/4", marks: 1 },
          ],
        },
        {
          questionNum: "4",
          maxMarks: 5,
          topicTags: ["Three Dimensional Geometry", "Shortest Distance"],
          rubric: [
            { code: "M1", desc: "Direction ratios and vector b1 x b2", marks: 2 },
            { code: "M1", desc: "Dot product (a2 - a1) . (b1 x b2)", marks: 2 },
            { code: "A1", desc: "Shortest distance formula and final scalar", marks: 1 },
          ],
        },
      ],
    },
    // CBSE Class 12 Physics 042 - 2024 Annual Set 1
    {
      subjectId: physicsCbse12Id,
      year: 2024,
      session: "Annual",
      variant: "Set 1",
      totalMarks: 70,
      durationMins: 180,
      qpKey: "papers/cbse/042/2024_annual/cbse_2024_physics_12_set1_qp.pdf",
      msKey: "papers/cbse/042/2024_annual/cbse_2024_physics_12_set1_ms.pdf",
      questions: [
        {
          questionNum: "1",
          maxMarks: 3,
          topicTags: ["Electrostatics", "Gauss Law", "Electric Flux"],
          rubric: [
            { code: "M1", desc: "State Gauss Law formula phi = q_enclosed / epsilon_0", marks: 1 },
            { code: "M1", desc: "Symmetry cylinder integration", marks: 1 },
            { code: "A1", desc: "Electric field due to infinitely long wire E = lambda / (2 pi eps0 r)", marks: 1 },
          ],
        },
        {
          questionNum: "2",
          maxMarks: 5,
          topicTags: ["Optics", "Wave Optics", "Young's Double Slit"],
          rubric: [
            { code: "M1", desc: "Path difference delta x = d sin theta = yd/D", marks: 2 },
            { code: "M1", desc: "Condition for constructive and destructive interference", marks: 2 },
            { code: "A1", desc: "Fringe width expression beta = lambda D / d", marks: 1 },
          ],
        },
      ],
    },
    // ICSE Class 10 Mathematics 51 - 2022 Annual
    {
      subjectId: mathIcse10Id,
      year: 2022,
      session: "Annual",
      variant: "Set 1",
      totalMarks: 80,
      durationMins: 150,
      qpKey: "papers/icse/051/2022_annual/icse_2022_maths_10_qp.pdf",
      msKey: "papers/icse/051/2022_annual/icse_2022_maths_10_ms.pdf",
      questions: [
        {
          questionNum: "1(a)",
          maxMarks: 3,
          topicTags: ["Commercial Mathematics", "Goods and Services Tax (GST)"],
          rubric: [
            { code: "M1", desc: "Intra-state calculation CGST = SGST = GST / 2", marks: 1 },
            { code: "M1", desc: "Total price paid by end consumer", marks: 1 },
            { code: "A1", desc: "Net tax deposited with government", marks: 1 },
          ],
        },
        {
          questionNum: "1(b)",
          maxMarks: 4,
          topicTags: ["Coordinate Geometry", "Section Formula"],
          rubric: [
            { code: "M1", desc: "Section formula [(m1 x2 + m2 x1)/(m1+m2), (m1 y2 + m2 y1)/(m1+m2)]", marks: 2 },
            { code: "A1", desc: "Point of division coordinates", marks: 1 },
            { code: "A1", desc: "Equation of perpendicular bisector", marks: 1 },
          ],
        },
      ],
    },
  ];

  let totalPapers = 0;
  let totalQuestions = 0;

  for (const def of paperDefinitions) {
    if (!def.subjectId) continue;

    // 1. Create Mark Scheme Paper first
    const markSchemePaper = await prisma.paper.create({
      data: {
        subjectId: def.subjectId,
        year: def.year,
        session: def.session,
        variant: def.variant,
        paperType: PaperType.MARK_SCHEME,
        fileKey: def.msKey,
        totalMarks: def.totalMarks,
        durationMins: def.durationMins,
      },
    });

    // 2. Create Question Paper linked to Mark Scheme
    const questionPaper = await prisma.paper.create({
      data: {
        subjectId: def.subjectId,
        year: def.year,
        session: def.session,
        variant: def.variant,
        paperType: PaperType.QUESTION_PAPER,
        fileKey: def.qpKey,
        totalMarks: def.totalMarks,
        durationMins: def.durationMins,
        markSchemeId: markSchemePaper.id,
      },
    });

    // 3. Create Questions for this Question Paper
    for (const q of def.questions) {
      await prisma.question.create({
        data: {
          paperId: questionPaper.id,
          questionNum: q.questionNum,
          maxMarks: q.maxMarks,
          topicTags: q.topicTags,
          rubricJson: q.rubric,
        },
      });
      totalQuestions++;
    }

    totalPapers += 2; // QP + MS
  }

  // 4. Create Demo User and Sample Progress & Bookmark for Testing
  const demoUser = await prisma.user.upsert({
    where: { email: "scholar@prism.org" },
    update: {},
    create: {
      email: "scholar@prism.org",
      name: "Alex Vance",
    },
  });

  const firstQp = await prisma.paper.findFirst({
    where: { paperType: PaperType.QUESTION_PAPER },
  });

  if (firstQp) {
    await prisma.userProgress.upsert({
      where: {
        userId_paperId: {
          userId: demoUser.id,
          paperId: firstQp.id,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        paperId: firstQp.id,
        status: ProgressStatus.IN_PROGRESS,
        scoreAchieved: 58.5,
        timeSpentSecs: 3600,
        answersJson: {
          q1: { answer: "4.5 x 10^-3", score: 2, marksAwarded: ["B1", "B1"] },
          q2a: { answer: "x = 1.5, x = -4", score: 3, marksAwarded: ["M1", "A1", "A1"] },
          canvasStrokes: [{ type: "path", points: [[10, 10], [50, 80], [120, 90]] }],
          scratchpadText: "Check quadratic formula: b^2 - 4ac = 49 - 4(2)(-12) = 145",
        },
      },
    });

    await prisma.bookmark.upsert({
      where: {
        userId_paperId: {
          userId: demoUser.id,
          paperId: firstQp.id,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        paperId: firstQp.id,
      },
    });
  }

  console.log(`✅ Seeded ${totalPapers} Papers and ${totalQuestions} Questions with Sub-Rubrics.`);
  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

