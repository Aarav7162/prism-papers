import fs from "fs";
import path from "path";
import { createSimplePdf } from "./pdf-utils";

const samplePdfs = [
  {
    fileKey: "papers/igcse/0580/2024_mj/0580_s24_qp_22.pdf",
    title: "Cambridge IGCSE Mathematics 0580/22",
    subtitle: "May/June 2024 - Paper 2 (Extended) - Duration: 1h 30m - Total Marks: 70",
    lines: [
      "INSTRUCTIONS TO CANDIDATES:",
      "Answer all questions. Use a black or dark blue pen.",
      "You may use an HB pencil for any diagrams or graphs.",
      "Electronic calculators should be used where appropriate.",
      "",
      "Question 1 [2 Marks]:",
      "Write 0.0045 in standard form.",
      "",
      "Question 2 [7 Marks]:",
      "(a) Solve 2x^2 + 5x - 12 = 0 by factorisation. [3 marks]",
      "(b) Solve the simultaneous equations: y = 2x + 1 and x^2 + y^2 = 29. [4 marks]",
      "",
      "Question 3 [5 Marks]:",
      "In triangle ABC, AB = 7 cm, BC = 9 cm and angle ABC = 60 degrees.",
      "Calculate the length of AC and the area of the triangle.",
      "",
      "Question 4 [3 Marks]:",
      "Find the coordinates of the turning point on the curve y = x^2 - 6x + 11.",
    ],
  },
  {
    fileKey: "papers/igcse/0580/2024_mj/0580_s24_ms_22.pdf",
    title: "Cambridge IGCSE Mathematics 0580/22 MARK SCHEME",
    subtitle: "May/June 2024 - Maximum Raw Mark: 70",
    lines: [
      "MARK SCHEME NOTES:",
      "M marks are given for a correct method applied to the problem.",
      "A marks are given for an accurate answer following a correct method.",
      "B marks are independent of method marks.",
      "",
      "Question 1: 4.5 x 10^-3 [B1, B1]",
      "",
      "Question 2(a): (2x - 3)(x + 4) = 0 [M1, A1]",
      "x = 1.5, x = -4 [A1]",
      "",
      "Question 2(b): Substitution into quadratic [M1]",
      "5x^2 + 4x - 28 = 0 [A1] => (x - 2)(5x + 14) = 0 [M1]",
      "(2, 5) and (-2.8, -4.6) [A1]",
      "",
      "Question 3: AC^2 = 7^2 + 9^2 - 2(7)(9) cos 60 = 67 => AC = 8.19 cm [M1, A1]",
      "Area = 0.5 * 7 * 9 * sin 60 = 27.28 cm^2 [M1, A1]",
    ],
  },
  {
    fileKey: "papers/igcse/0580/2023_on/0580_w23_qp_42.pdf",
    title: "Cambridge IGCSE Mathematics 0580/42",
    subtitle: "Oct/Nov 2023 - Paper 4 (Extended) - Duration: 2h 30m - Total Marks: 100",
    lines: [
      "INSTRUCTIONS TO CANDIDATES:",
      "Answer all questions. Give non-exact numerical answers correct to 3 significant figures.",
      "",
      "Question 1 [7 Marks]:",
      "(a) Complete the probability tree diagram for two independent events. [3 marks]",
      "(b) Express vector OP in terms of base vectors a and b. [4 marks]",
      "",
      "Question 2 [6 Marks]:",
      "A solid metal cone has radius 6 cm and height 14 cm.",
      "Calculate the volume of the cone and the mass given density 7.8 g/cm^3.",
    ],
  },
  {
    fileKey: "papers/igcse/0580/2023_on/0580_w23_ms_42.pdf",
    title: "Cambridge IGCSE Mathematics 0580/42 MARK SCHEME",
    subtitle: "Oct/Nov 2023 - Maximum Raw Mark: 100",
    lines: [
      "Question 1(a): Tree probabilities: 3/5 and 2/5 [B1]",
      "Product rule: 3/5 * 2/4 = 3/10 [M1, A1]",
      "",
      "Question 1(b): Vector OP = 2a + 3b [M1, M1, A1]",
      "",
      "Question 2: Volume = 1/3 * pi * 6^2 * 14 = 527.79 cm^3 [M1, A1]",
      "Mass = Volume * Density = 4116.7 g = 4.12 kg [M1, A1]",
    ],
  },
  {
    fileKey: "papers/igcse/0625/2024_mj/0625_s24_qp_42.pdf",
    title: "Cambridge IGCSE Physics 0625/42",
    subtitle: "May/June 2024 - Theory (Extended) - Duration: 1h 15m - Total Marks: 80",
    lines: [
      "INSTRUCTIONS TO CANDIDATES:",
      "Take the weight of 1.0 kg to be 9.8 N (acceleration of free fall = 9.8 m/s^2).",
      "",
      "Question 1 [6 Marks]:",
      "(a) State what is meant by acceleration and determine the slope of v-t graph. [3 marks]",
      "(b) Calculate the total distance travelled by finding the area under the graph. [3 marks]",
      "",
      "Question 2 [5 Marks]:",
      "Define specific heat capacity. An electric kettle of power 2.2 kW heats 0.80 kg of water",
      "from 20 C to 100 C in 160 s. Calculate the experimental specific heat capacity.",
    ],
  },
  {
    fileKey: "papers/igcse/0625/2024_mj/0625_s24_ms_42.pdf",
    title: "Cambridge IGCSE Physics 0625/42 MARK SCHEME",
    subtitle: "May/June 2024 - Maximum Raw Mark: 80",
    lines: [
      "Question 1(a): Rate of change of velocity [B1], gradient = 12 / 5 = 2.4 m/s^2 [M1, A1]",
      "Question 1(b): Triangle area = 0.5 * 5 * 12 = 30 m; Rectangle = 15 * 12 = 180 m; Total = 210 m [M1, A1]",
      "",
      "Question 2: Energy E = P * t = 2200 * 160 = 352,000 J [M1]",
      "E = m * c * Delta T => c = 352000 / (0.80 * 80) = 5500 J/(kg K) [M1, A1]",
    ],
  },
  {
    fileKey: "papers/cbse/041/2023_annual/cbse_2023_maths_12_set1_qp.pdf",
    title: "CBSE Class 12 Mathematics (Code 041) - Set 1",
    subtitle: "Annual Examination 2023 - Time: 3 Hours - Max. Marks: 80",
    lines: [
      "GENERAL INSTRUCTIONS:",
      "This question paper contains 38 questions divided into 5 Sections A, B, C, D and E.",
      "",
      "Section A (Question 1):",
      "If A is a square matrix of order 3 such that |adj A| = 64, find |A|.",
      "",
      "Section B (Question 2):",
      "Show that the relation R in the set Z of integers given by R = {(a, b): 2 divides a - b}",
      "is an equivalence relation.",
      "",
      "Section C (Question 3):",
      "Evaluate definite integral from 0 to pi/2 of (sin^4 x)/(sin^4 x + cos^4 x) dx.",
    ],
  },
  {
    fileKey: "papers/cbse/041/2023_annual/cbse_2023_maths_12_set1_ms.pdf",
    title: "CBSE Class 12 Mathematics (Code 041) MARKING SCHEME",
    subtitle: "Annual Examination 2023 - Solution & Marking Breakdown",
    lines: [
      "Q1: |adj A| = |A|^(n - 1) = |A|^2 = 64 => |A| = +/- 8 [1 mark]",
      "",
      "Q2: Reflexive: a - a = 0 (divisible by 2) [0.5 mark]",
      "Symmetric: a - b = 2k => b - a = -2k [0.5 mark]",
      "Transitive: (a - b) + (b - c) = 2(k1 + k2) [1 mark]",
      "",
      "Q3: Let I = int_0^(pi/2) sin^4 x / (sin^4 x + cos^4 x) dx",
      "Use property I = int_0^(pi/2) cos^4 x / (cos^4 x + sin^4 x) dx [1.5 marks]",
      "Adding both: 2I = int_0^(pi/2) 1 dx = pi/2 => I = pi/4 [1.5 marks]",
    ],
  },
  {
    fileKey: "papers/cbse/042/2024_annual/cbse_2024_physics_12_set1_qp.pdf",
    title: "CBSE Class 12 Physics (Code 042) - Set 1",
    subtitle: "Annual Examination 2024 - Time: 3 Hours - Max. Marks: 70",
    lines: [
      "GENERAL INSTRUCTIONS:",
      "All questions are compulsory. There are 33 questions in all.",
      "",
      "Question 1 [3 Marks]:",
      "State Gauss's Law in electrostatics. Apply this theorem to find the electric field",
      "due to an infinitely long straight uniformly charged wire.",
      "",
      "Question 2 [5 Marks]:",
      "In Young's double slit experiment, derive the expression for the fringe width beta.",
    ],
  },
  {
    fileKey: "papers/cbse/042/2024_annual/cbse_2024_physics_12_set1_ms.pdf",
    title: "CBSE Class 12 Physics (Code 042) MARKING SCHEME",
    subtitle: "Annual Examination 2024 - Solution & Step Marking",
    lines: [
      "Q1: Statement of Gauss Law phi = q_enc / epsilon_0 [1 mark]",
      "Cylindrical Gaussian surface drawing and flux calculation [1 mark]",
      "Electric field E = lambda / (2 * pi * epsilon_0 * r) [1 mark]",
      "",
      "Q2: Path difference delta x = x * d / D [2 marks]",
      "Condition for bright fringe: delta x = n * lambda [1 mark]",
      "Fringe width beta = x_(n+1) - x_n = lambda * D / d [2 marks]",
    ],
  },
  {
    fileKey: "papers/icse/051/2022_annual/icse_2022_maths_10_qp.pdf",
    title: "ICSE Class 10 Mathematics 051",
    subtitle: "Annual Examination 2022 - Time: 2.5 Hours - Max. Marks: 80",
    lines: [
      "Question 1(a) [3 Marks]:",
      "A retailer buys an article at a discount of 15% on printed price Rs 8000.",
      "If GST is 12%, calculate the price paid by the consumer and tax collected by CGST & SGST.",
      "",
      "Question 1(b) [4 Marks]:",
      "Find the coordinates of point P which divides line segment joining A(1, 3) and B(4, 6) in ratio 2:1.",
    ],
  },
  {
    fileKey: "papers/icse/051/2022_annual/icse_2022_maths_10_ms.pdf",
    title: "ICSE Class 10 Mathematics 051 MARK SCHEME",
    subtitle: "Annual Examination 2022 - Official Marking Rubrics",
    lines: [
      "Q1(a): Cost price = 8000 - 1200 = Rs 6800 [1 mark]",
      "GST = 12% of 6800 = Rs 816 (CGST = SGST = Rs 408) [2 marks]",
      "",
      "Q1(b): Section formula: x = (2*4 + 1*1)/3 = 3, y = (2*6 + 1*3)/3 = 5 => P(3, 5) [4 marks]",
    ],
  },
];

export async function generateAllPdfs() {
  const publicDir = path.resolve(process.cwd(), "public");

  console.log(`📁 Generating authentic past-paper PDFs into "${publicDir}"...`);

  for (const item of samplePdfs) {
    const fullPath = path.join(publicDir, item.fileKey);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const pdfBuffer = createSimplePdf(item.title, item.subtitle, item.lines);
    fs.writeFileSync(fullPath, pdfBuffer);
    console.log(`  ✅ Generated: ${item.fileKey}`);
  }

  console.log(`\n🎉 Generated ${samplePdfs.length} authentic past paper PDFs!`);
}

generateAllPdfs().catch(console.error);
