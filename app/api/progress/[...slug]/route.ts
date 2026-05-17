import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { progress } from "@/db/schema";
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

  const row = await db
    .select()
    .from(progress)
    .where(
      and(
        eq(progress.userId, userId),
        eq(progress.moduleSlug, moduleSlug),
        eq(progress.quizSlug, quizSlug)
      )
    )
    .then((rows) => rows[0]);

  if (!row || row.quizScore == null) {
    return NextResponse.json({ saved: false });
  }

  return NextResponse.json({
    saved: true,
    score: row.quizScore,
    responses: row.quizResponses,
    results: row.quizResults,
  });
}

export async function DELETE(
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

  await db
    .update(progress)
    .set({
      quizScore: null,
      quizResponses: null,
      quizResults: null,
      completedAt: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(progress.userId, userId),
        eq(progress.moduleSlug, moduleSlug),
        eq(progress.quizSlug, quizSlug)
      )
    );

  return NextResponse.json({ ok: true });
}
