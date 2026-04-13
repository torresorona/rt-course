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

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Real-Time Systems</h1>
      <p className="mb-8 text-gray-600">
        A self-paced course on real-time computing fundamentals.
      </p>

      {!userId && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p>
            <Link href="/sign-in" className="font-medium text-blue-700 underline">
              Sign in
            </Link>{" "}
            to track your progress and take quizzes.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {allModules.map((mod) => {
          const score = userProgress[mod.slug];
          return (
            <Link
              key={mod.slug}
              href={`/${mod.slug}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition hover:border-gray-400 hover:bg-gray-50"
            >
              <div>
                <span className="mr-2 text-sm text-gray-400">
                  {String(mod.order).padStart(2, "0")}
                </span>
                <span className="font-medium">{mod.title}</span>
              </div>
              {score != null && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    score >= 80
                      ? "bg-green-100 text-green-800"
                      : score >= 50
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {score}%
                </span>
              )}
            </Link>
          );
        })}

        {allModules.length === 0 && (
          <p className="text-gray-500">
            No modules found. Run <code>npm run db:seed</code> to populate the database.
          </p>
        )}
      </div>
    </div>
  );
}
