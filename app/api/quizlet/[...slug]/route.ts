import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { quizzes, questions, answers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const moduleSlug = slug.join("/");

  const quiz = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.moduleSlug, moduleSlug))
    .then((rows) => rows[0]);

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quiz.id))
    .orderBy(questions.order);

  const lines: string[] = [];

  for (const q of quizQuestions) {
    const correctAnswers = await db
      .select()
      .from(answers)
      .where(and(eq(answers.questionId, q.id), eq(answers.correct, true)));

    const correctAnswerText = correctAnswers[0]?.text ?? "True";
    // Tab delimited format optimal for Quizlet import
    lines.push(`${q.text}\t${correctAnswerText}`);
  }

  const textContent = lines.join("\n");

  const filename = `quizlet-${moduleSlug.replace(/\//g, "-")}.txt`;

  return new NextResponse(textContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
