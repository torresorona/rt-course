import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { quizzes, questions, answers } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

function shuffleAnswers<T>(items: T[]) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

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

  const questionIds = quizQuestions.map((question) => question.id);
  const answerRows = questionIds.length
    ? await db
        .select({
          id: answers.id,
          questionId: answers.questionId,
          text: answers.text,
          order: answers.order,
        })
        .from(answers)
        .where(inArray(answers.questionId, questionIds))
        .orderBy(answers.questionId, answers.order)
    : [];

  const answersByQuestion = new Map<number, typeof answerRows>();
  for (const answer of answerRows) {
    const questionAnswers = answersByQuestion.get(answer.questionId) ?? [];
    questionAnswers.push(answer);
    answersByQuestion.set(answer.questionId, questionAnswers);
  }

  const questionsWithAnswers = quizQuestions.map((question) => ({
    id: question.id,
    text: question.text,
    image: question.image ?? null,
    answers: shuffleAnswers(
      (answersByQuestion.get(question.id) ?? []).map(({ id, text }) => ({
        id,
        text,
      })),
    ),
  }));

  return NextResponse.json({
    id: quiz.id,
    title: quiz.title,
    questions: questionsWithAnswers,
  });
}
