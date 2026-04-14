import { compileMDX } from "next-mdx-remote/rsc";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import Quiz from "@/components/Quiz";
import DataTable from "@/components/DataTable";
import AudioPlayer from "@/components/AudioPlayer";
import ReceptorTable from "@/components/ReceptorTable";

const mdxComponents = { DataTable };

const views = [
  { id: "review", label: "Review" },
  { id: "resources", label: "Resources" },
  { id: "quiz", label: "Quiz" },
];

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { slug } = await params;
  const { view: activeView = "review" } = await searchParams;
  const slugPath = slug.join("/");
  const filePath = join(process.cwd(), "content", ...slug, "lesson.mdx");

  if (!existsSync(filePath)) {
    notFound();
  }

  const source = readFileSync(filePath, "utf-8");

  const { content, frontmatter } = await compileMDX<{
    title: string;
    description?: string;
  }>({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: true },
  });

  // Read module.json for breadcrumb if it exists
  const moduleSlug = slug[0];
  const moduleJsonPath = join(process.cwd(), "content", moduleSlug, "module.json");
  let moduleTitle: string | null = null;
  if (existsSync(moduleJsonPath)) {
    const moduleData = JSON.parse(readFileSync(moduleJsonPath, "utf-8"));
    moduleTitle = moduleData.title ?? null;
  }

  // Detect audio file for this lesson
  const audioMap: Record<string, string> = {
    "pharmacology/lesson-1": "/audio/Respiratory_Pharmacology_and_Receptor_Cheat_Codes.m4a",
    "pharmacology/lesson-2": "/audio/Airway_Pharmacology_and_Respiratory_Math.m4a",
  };
  const audioSrc = audioMap[slugPath] ?? null;

  // Check if this lesson has resources
  const hasResources = slugPath === "pharmacology/lesson-1";

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-sand-500">
        <Link href="/" className="transition-colors hover:text-terracotta-600">
          Home
        </Link>
        {moduleTitle && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            <Link href={`/modules/${moduleSlug}`} className="transition-colors hover:text-terracotta-600">
              {moduleTitle}
            </Link>
          </>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        <span className="text-sand-700">{frontmatter.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-sand-900 sm:text-3xl">
          {frontmatter.title}
        </h1>
        {frontmatter.description && (
          <p className="mt-2 text-base text-sand-600">
            {frontmatter.description}
          </p>
        )}
      </div>

      {/* View switcher */}
      <div className="sticky top-[57px] z-10 -mx-6 mb-6 border-b border-sand-200 bg-sand-50/95 px-6 backdrop-blur-sm">
        <div className="flex gap-1">
          {views.map((v) => (
            <Link
              key={v.id}
              href={`/${slugPath}?view=${v.id}`}
              scroll={false}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeView === v.id
                  ? "text-sand-900"
                  : "text-sand-500 hover:text-sand-700"
              }`}
            >
              {v.label}
              {activeView === v.id && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-terracotta-500" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Review view */}
      {activeView === "review" && (
        <div className="space-y-6">
          {audioSrc && (
            <AudioPlayer src={audioSrc} title={`Listen: ${frontmatter.title}`} />
          )}
          <article className="rounded-2xl border border-sand-200 bg-white px-8 py-10 sm:px-10">
            <div className="prose prose-sand max-w-none">{content}</div>
          </article>
        </div>
      )}

      {/* Resources view */}
      {activeView === "resources" && (
        <div className="space-y-6">
          {slugPath === "pharmacology/lesson-1" && <ReceptorTable />}
          {!hasResources && (
            <div className="rounded-2xl border border-dashed border-sand-300 p-8 text-center text-sand-500">
              No additional resources for this lesson yet.
            </div>
          )}
        </div>
      )}

      {/* Quiz view */}
      {activeView === "quiz" && (
        <Quiz slug={slugPath} />
      )}
    </div>
  );
}
