import { existsSync, readFileSync } from "fs";
import { getQuizPath } from "@/lib/content";
import { NextResponse } from "next/server";

interface RawAnswer {
  text: string;
  correct?: boolean;
}

interface RawQuestion {
  text: string;
  answers: RawAnswer[];
}

interface QuizFile {
  questions: RawQuestion[];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const quizPath = getQuizPath(slug, "quiz.json");

  if (!existsSync(quizPath)) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const raw: QuizFile = JSON.parse(readFileSync(quizPath, "utf-8"));
  const moduleSlug = slug.join("/");

  const lines = raw.questions.map((q) => {
    const correctAnswer = q.answers.find((a) => a.correct);
    return `${q.text}\t${correctAnswer?.text ?? "True"}`;
  });

  const filename = `quizlet-${moduleSlug.replace(/\//g, "-")}.txt`;

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
