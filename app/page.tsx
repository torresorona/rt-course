import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

interface ModuleInfo {
  slug: string;
  title: string;
  description?: string;
  order: number;
}

function getModules(): ModuleInfo[] {
  const contentDir = join(process.cwd(), "content");
  const dirs = readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const modules: ModuleInfo[] = [];
  for (let i = 0; i < dirs.length; i++) {
    const jsonPath = join(contentDir, dirs[i].name, "module.json");
    if (!existsSync(jsonPath)) continue;
    const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
    modules.push({
      slug: dirs[i].name,
      title: data.title ?? dirs[i].name,
      description: data.description,
      order: i + 1,
    });
  }
  return modules;
}

export default async function HomePage() {
  const { userId } = await auth();
  const allModules = getModules();

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

      {/* Sign in prompt */}
      {!userId && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-100/50 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
          </div>
          <p className="text-sm text-sand-700">
            <Link href="/sign-in" className="font-semibold text-sky-600 underline decoration-sky-300 underline-offset-2 transition hover:text-sky-700">
              Sign in
            </Link>{" "}
            to track your progress and take quizzes.
          </p>
        </div>
      )}

      {/* Module cards */}
      <div className="space-y-3">
        {allModules.map((mod) => (
          <Link
            key={mod.slug}
            href={`/modules/${mod.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 transition-all hover:border-sand-300 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-sm font-bold text-sand-500 transition-colors group-hover:bg-sand-200 group-hover:text-sand-700">
              {String(mod.order).padStart(2, "0")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sand-900 transition-colors group-hover:text-terracotta-600">
                {mod.title}
              </p>
              {mod.description && (
                <p className="mt-0.5 line-clamp-1 text-sm text-sand-500">
                  {mod.description}
                </p>
              )}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-sand-300 transition-colors group-hover:text-sand-500"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        ))}

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
