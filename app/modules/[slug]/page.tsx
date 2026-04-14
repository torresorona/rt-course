import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import AudioPlayer from "@/components/AudioPlayer";

interface Lesson {
  slug: string;
  title: string;
  description?: string;
}

interface AudioEntry {
  title: string;
  src: string;
}

interface Resource {
  title: string;
  description: string;
  url: string;
  type?: string;
}

export default async function ModuleLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const moduleDir = join(process.cwd(), "content", slug);
  const moduleJsonPath = join(moduleDir, "module.json");

  if (!existsSync(moduleJsonPath)) notFound();

  const moduleData = JSON.parse(readFileSync(moduleJsonPath, "utf-8"));
  const lessons: Lesson[] = moduleData.lessons ?? [];
  const resources: Resource[] = moduleData.resources ?? [];
  const audioEntries: AudioEntry[] = moduleData.audio ?? [];

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-sand-500">
        <Link href="/" className="transition-colors hover:text-terracotta-600">
          Home
        </Link>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        <span className="text-sand-700">{moduleData.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-sand-900">
          {moduleData.title}
        </h1>
        {moduleData.description && (
          <p className="text-base text-sand-600">{moduleData.description}</p>
        )}
      </div>

      {/* Lessons section */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sand-500">
          Lessons
        </h2>
        <div className="space-y-3">
          {lessons.map((lesson, i) => (
            <Link
              key={lesson.slug}
              href={`/${lesson.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 transition-all hover:border-sand-300 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-sm font-bold text-sand-500 transition-colors group-hover:bg-sand-200 group-hover:text-sand-700">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sand-900 transition-colors group-hover:text-terracotta-600">
                  {lesson.title}
                </p>
                {lesson.description && (
                  <p className="mt-0.5 line-clamp-2 text-sm text-sand-500">
                    {lesson.description}
                  </p>
                )}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-sand-300 transition-colors group-hover:text-sand-500"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Audio section */}
      {audioEntries.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sand-500">
            Audio
          </h2>
          {audioEntries.map((entry, i) => (
            <AudioPlayer key={i} src={entry.src} title={entry.title} />
          ))}
        </section>
      )}

      {/* Resources section */}
      {resources.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sand-500">
            Resources
          </h2>
          <div className="space-y-3">
            {resources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 transition-all hover:border-sand-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sand-900 transition-colors group-hover:text-terracotta-600">
                    {res.title}
                  </p>
                  <p className="mt-0.5 text-sm text-sand-500">
                    {res.description}
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-sand-300 transition-colors group-hover:text-sand-500"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
