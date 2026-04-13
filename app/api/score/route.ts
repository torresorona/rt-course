import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { answers, questions, quizzes, progress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

interface SubmitBody {
  moduleSlug: string;
  responses: Record<string, number>; // questionId -> answerId
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: SubmitBody = await request.json();
  const { moduleSlug, responses } = body;

  if (!moduleSlug || !responses) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify the quiz exists
  const quiz = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.moduleSlug, moduleSlug))
    .then((rows) => rows[0]);

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  // Get all questions for this quiz
  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quiz.id));

  // Grade each response
  let correct = 0;
  const results: { questionId: number; correct: boolean }[] = [];

  for (const q of quizQuestions) {
    const selectedAnswerId = responses[String(q.id)];
    if (!selectedAnswerId) {
      results.push({ questionId: q.id, correct: false });
      continue;
    }

    const answer = await db
      .select()
      .from(answers)
      .where(
        and(
          eq(answers.id, selectedAnswerId),
          eq(answers.questionId, q.id)
        )
      )
      .then((rows) => rows[0]);

    const isCorrect = answer?.correct ?? false;
    if (isCorrect) correct++;
    results.push({ questionId: q.id, correct: isCorrect });
  }

  const total = quizQuestions.length;
  const score = Math.round((correct / total) * 100);

  // Upsert progress
  const existing = await db
    .select()
    .from(progress)
    .where(
      and(
        eq(progress.userId, userId),
        eq(progress.moduleSlug, moduleSlug)
      )
    )
    .then((rows) => rows[0]);

  if (existing) {
    await db
      .update(progress)
      .set({
        quizScore: score,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(progress.id, existing.id));
  } else {
    await db.insert(progress).values({
      userId,
      moduleSlug,
      quizScore: score,
      completedAt: new Date(),
    });
  }

  return NextResponse.json({ score, correct, total, results });
}
