import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/auth";

interface TopicStat {
  topic: string;
  marksObtained: number;
  marksPossible: number;
  accuracy: number;
  questionCount: number;
  status: "WEAK" | "MODERATE" | "STRONG";
}

interface SubjectStat {
  subjectId: string;
  name: string;
  code: string;
  gradeLevel: string;
  boardName: string;
  totalPapersAvailable: number;
  attemptedCount: number;
  solvedCount: number;
  completionRate: number;
  averageScorePercent: number;
  timeSpentSecs: number;
}

/**
 * GET /api/user/analytics
 * Aggregates:
 * 1. Completion percentage by subject
 * 2. Average scores across subjects and papers
 * 3. Topic weakness heatmap: aggregate accuracy per topicTags with classification (WEAK, MODERATE, STRONG)
 * 4. Overall high-level KPIs and study time
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return apiError("Unauthorized. Please sign in to view analytics.", 401);
    }

    // 1. Fetch user progress with paper, subject, and question details
    const userProgress = await prisma.userProgress.findMany({
      where: { userId: user.id },
      include: {
        paper: {
          include: {
            subject: {
              include: {
                board: { select: { id: true, name: true } },
              },
            },
            questions: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 2. Fetch all subjects with total paper counts for catalog baseline
    const allSubjects = await prisma.subject.findMany({
      include: {
        board: { select: { id: true, name: true } },
        _count: {
          select: {
            papers: {
              where: { paperType: "QUESTION_PAPER" },
            },
          },
        },
      },
    });

    // 3. Aggregate Subject Statistics
    const subjectMap = new Map<
      string,
      {
        subjectId: string;
        name: string;
        code: string;
        gradeLevel: string;
        boardName: string;
        totalPapersAvailable: number;
        attempted: number;
        solved: number;
        totalScoreAchieved: number;
        totalScorePossible: number;
        timeSpentSecs: number;
      }
    >();

    for (const sub of allSubjects) {
      subjectMap.set(sub.id, {
        subjectId: sub.id,
        name: sub.name,
        code: sub.code,
        gradeLevel: sub.gradeLevel,
        boardName: sub.board.name,
        totalPapersAvailable: sub._count.papers,
        attempted: 0,
        solved: 0,
        totalScoreAchieved: 0,
        totalScorePossible: 0,
        timeSpentSecs: 0,
      });
    }

    // 4. Topic Weakness Heatmap Collector
    const topicMap = new Map<
      string,
      { marksObtained: number; marksPossible: number; count: number }
    >();

    let totalUserTimeSpentSecs = 0;
    let globalMarksObtained = 0;
    let globalMarksPossible = 0;

    for (const progress of userProgress) {
      const paper = progress.paper;
      const subStat = subjectMap.get(paper.subjectId);

      totalUserTimeSpentSecs += progress.timeSpentSecs;

      if (subStat) {
        subStat.attempted += 1;
        if (progress.status === "SOLVED") {
          subStat.solved += 1;
        }
        subStat.totalScoreAchieved += progress.scoreAchieved;
        subStat.totalScorePossible += paper.totalMarks;
        subStat.timeSpentSecs += progress.timeSpentSecs;
      }

      globalMarksObtained += progress.scoreAchieved;
      globalMarksPossible += paper.totalMarks;

      // Extract question answers/rubrics from answersJson
      const rawAnswers = (progress.answersJson ?? {}) as Record<string, any>;
      const paperOverallRatio =
        paper.totalMarks > 0 ? progress.scoreAchieved / paper.totalMarks : 0;

      // Aggregate accuracy per question topic tags
      for (const question of paper.questions) {
        if (!question.topicTags || question.topicTags.length === 0) continue;

        // Check if question has specific itemized mark in answersJson
        let questionScore: number | null = null;
        if (rawAnswers[question.questionNum]?.score !== undefined) {
          questionScore = Number(rawAnswers[question.questionNum].score);
        } else if (rawAnswers[question.id]?.score !== undefined) {
          questionScore = Number(rawAnswers[question.id].score);
        } else if (rawAnswers.questions?.[question.questionNum]?.score !== undefined) {
          questionScore = Number(rawAnswers.questions[question.questionNum].score);
        } else {
          // If not individually itemized, distribute paper ratio proportionally
          questionScore = question.maxMarks * paperOverallRatio;
        }

        const validScore = Math.min(
          Math.max(0, questionScore ?? 0),
          question.maxMarks
        );

        for (const tag of question.topicTags) {
          const current = topicMap.get(tag) || {
            marksObtained: 0,
            marksPossible: 0,
            count: 0,
          };
          current.marksObtained += validScore;
          current.marksPossible += question.maxMarks;
          current.count += 1;
          topicMap.set(tag, current);
        }
      }
    }

    // Format Subject breakdown
    const subjectBreakdown: SubjectStat[] = Array.from(subjectMap.values())
      .filter((s) => s.totalPapersAvailable > 0 || s.attempted > 0)
      .map((s) => ({
        subjectId: s.subjectId,
        name: s.name,
        code: s.code,
        gradeLevel: s.gradeLevel,
        boardName: s.boardName,
        totalPapersAvailable: s.totalPapersAvailable,
        attemptedCount: s.attempted,
        solvedCount: s.solved,
        completionRate:
          s.totalPapersAvailable > 0
            ? Number(((s.attempted / s.totalPapersAvailable) * 100).toFixed(1))
            : 0,
        averageScorePercent:
          s.totalScorePossible > 0
            ? Number(((s.totalScoreAchieved / s.totalScorePossible) * 100).toFixed(1))
            : 0,
        timeSpentSecs: s.timeSpentSecs,
      }));

    // Format Topic Weakness Heatmap
    const topicBreakdown: TopicStat[] = Array.from(topicMap.entries())
      .map(([topic, data]) => {
        const accuracy =
          data.marksPossible > 0
            ? Number(((data.marksObtained / data.marksPossible) * 100).toFixed(1))
            : 0;

        let status: "WEAK" | "MODERATE" | "STRONG" = "MODERATE";
        if (accuracy < 50) {
          status = "WEAK";
        } else if (accuracy >= 75) {
          status = "STRONG";
        }

        return {
          topic,
          marksObtained: Number(data.marksObtained.toFixed(1)),
          marksPossible: data.marksPossible,
          accuracy,
          questionCount: data.count,
          status,
        };
      })
      // Sort ascending by accuracy: weakest topics appear at top for immediate revision
      .sort((a, b) => a.accuracy - b.accuracy);

    const weakTopics = topicBreakdown.filter((t) => t.status === "WEAK");
    const strongTopics = topicBreakdown
      .filter((t) => t.status === "STRONG")
      .reverse();

    const overallAccuracy =
      globalMarksPossible > 0
        ? Number(((globalMarksObtained / globalMarksPossible) * 100).toFixed(1))
        : 0;

    return apiSuccess({
      overview: {
        totalAttempted: userProgress.length,
        totalSolved: userProgress.filter((p) => p.status === "SOLVED").length,
        totalTimeSpentSecs: totalUserTimeSpentSecs,
        totalTimeSpentHours: Number((totalUserTimeSpentSecs / 3600).toFixed(2)),
        overallAccuracy,
      },
      topicHeatmap: {
        weakest: topicBreakdown.slice(0, 5),
        all: topicBreakdown,
        weakCount: weakTopics.length,
        strongCount: strongTopics.length,
      },
      subjectBreakdown,
    });
  } catch (error) {
    console.error("Error generating user analytics:", error);
    return apiError("Failed to generate analytics", 500);
  }
}

