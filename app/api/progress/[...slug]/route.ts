import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { progress } from "@/db/schema";
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

  const row = await db
    .select()
    .from(progress)
    .where(
      and(eq(progress.userId, userId), eq(progress.moduleSlug, moduleSlug))
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
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const moduleSlug = slug.join("/");

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
      and(eq(progress.userId, userId), eq(progress.moduleSlug, moduleSlug))
    );

  return NextResponse.json({ ok: true });
}
