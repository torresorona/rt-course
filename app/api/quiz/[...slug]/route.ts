import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { quizzes, questions, answers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const moduleSlug = slug.join("/");
  const url = new URL(request.url);
  const quizSlug = url.searchParams.get("slug") ?? "default";

  const quiz = await db
    .select()
    .from(quizzes)
    .where(and(eq(quizzes.moduleSlug, moduleSlug), eq(quizzes.slug, quizSlug)))
    .then((rows) => rows[0]);

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quiz.id))
    .orderBy(questions.order);

  const questionsWithAnswers = await Promise.all(
    quizQuestions.map(async (q) => {
      const questionAnswers = await db
        .select({
          id: answers.id,
          text: answers.text,
          order: answers.order,
        })
        .from(answers)
        .where(eq(answers.questionId, q.id))
        .orderBy(answers.order);

      return {
        id: q.id,
        text: q.text,
        image: q.image ?? null,
        answers: questionAnswers,
      };
    })
  );

  return NextResponse.json({
    id: quiz.id,
    title: quiz.title,
    questions: questionsWithAnswers,
  });
}
