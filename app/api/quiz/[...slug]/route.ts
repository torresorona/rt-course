import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { quizzes, questions, answers } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
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
    answers: (answersByQuestion.get(question.id) ?? []).map(({ id, text, order }) => ({
      id,
      text,
      order,
    })),
  }));

  return NextResponse.json({
    id: quiz.id,
    title: quiz.title,
    questions: questionsWithAnswers,
  });
}
