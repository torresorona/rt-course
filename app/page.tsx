import { db } from "@/db";
import { modules, progress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  const allModules = await db
    .select()
    .from(modules)
    .orderBy(modules.order);

  let userProgress: Record<string, number | null> = {};
  if (userId) {
    const rows = await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId));
    userProgress = Object.fromEntries(
      rows.map((r) => [r.moduleSlug, r.quizScore])
    );
  }

  const completedCount = Object.values(userProgress).filter(
    (s) => s != null && s >= 80
  ).length;

  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-sand-900">
          Respiratory Therapy Course
        </h1>
        <p className="text-lg text-sand-600">
          Study modules, quizzes, and resources for your coursework.
        </p>
      </div>

      {/* Progress summary */}
      {userId && allModules.length > 0 && (
        <div className="mb-8 flex items-center gap-4 rounded-2xl bg-sand-100 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-100 text-sage-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-sand-700">Your progress</p>
            <p className="text-lg font-semibold text-sand-900">
              {completedCount} of {allModules.length} modules completed
            </p>
          </div>
        </div>
      )}

      {/* Sign in prompt */}
      {!userId && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-100/50 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <p className="text-sm text-sand-700">
            <Link
              href="/sign-in"
              className="font-semibold text-sky-600 underline decoration-sky-300 underline-offset-2 transition hover:text-sky-700"
            >
              Sign in
            </Link>{" "}
            to track your progress and take quizzes.
          </p>
        </div>
      )}

      {/* Module cards */}
      <div className="space-y-3">
        {allModules.map((mod) => {
          const score = userProgress[mod.slug];
          const passed = score != null && score >= 80;

          return (
            <Link
              key={mod.slug}
              href={`/modules/${mod.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 transition-all hover:border-sand-300 hover:shadow-sm"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                  passed
                    ? "bg-sage-100 text-sage-700"
                    : "bg-sand-100 text-sand-500 group-hover:bg-sand-200 group-hover:text-sand-700"
                }`}
              >
                {passed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  String(mod.order).padStart(2, "0")
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sand-900 group-hover:text-terracotta-600 transition-colors">
                  {mod.title}
                </p>
              </div>
              {score != null && (
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    score >= 80
                      ? "bg-sage-100 text-sage-700"
                      : score >= 50
                        ? "bg-clay-100 text-clay-500"
                        : "bg-clay-100 text-terracotta-600"
                  }`}
                >
                  {score}%
                </span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-sand-300 transition-colors group-hover:text-sand-500"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          );
        })}

        {allModules.length === 0 && (
          <div className="rounded-2xl border border-dashed border-sand-300 p-8 text-center text-sand-500">
            No modules yet. Run{" "}
            <code className="rounded bg-sand-100 px-2 py-0.5 text-xs font-medium text-sand-700">
              npm run db:seed
            </code>{" "}
            to get started.
          </div>
        )}
      </div>
    </div>
  );
}
