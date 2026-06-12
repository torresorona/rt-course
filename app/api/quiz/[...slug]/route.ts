import { existsSync, readFileSync } from "fs";
import { getQuizPath } from "@/lib/content";
import { NextResponse } from "next/server";

interface RawAnswer {
  text: string;
  correct?: boolean;
}

interface RawQuestion {
  text: string;
  image?: string;
  answers: RawAnswer[];
}

interface QuizFile {
  title: string;
  questions: RawQuestion[];
}

function shuffleArray<T>(items: T[]): T[] {
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
  const { slug } = await params;
  const url = new URL(request.url);
  const quizSlug = url.searchParams.get("slug") ?? "default";
  const quizFile = quizSlug === "default" ? "quiz.json" : `quiz-${quizSlug}.json`;
  const quizPath = getQuizPath(slug, quizFile);

  if (!existsSync(quizPath)) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const raw: QuizFile = JSON.parse(readFileSync(quizPath, "utf-8"));

  const questions = raw.questions.map((q, qi) => ({
    id: qi,
    text: q.text,
    image: q.image ?? null,
    answers: shuffleArray(
      q.answers.map((a, ai) => ({
        id: ai,
        text: a.text,
        correct: a.correct ?? false,
      }))
    ),
  }));

  return NextResponse.json({
    id: 0,
    title: raw.title,
    questions,
  });
}
