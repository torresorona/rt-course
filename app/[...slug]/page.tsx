import { compileMDX } from "next-mdx-remote/rsc";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import Quiz from "@/components/Quiz";
import DataTable from "@/components/DataTable";
import AudioPlayer from "@/components/AudioPlayer";

const components = { Quiz, DataTable, AudioPlayer };

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
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
    components,
    options: { parseFrontmatter: true },
  });

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-sand-500">
        <Link
          href="/"
          className="transition-colors hover:text-terracotta-600"
        >
          Modules
        </Link>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-sand-700">{frontmatter.title}</span>
      </nav>

      {/* Article */}
      <article className="rounded-2xl border border-sand-200 bg-white px-8 py-10 sm:px-10">
        <header className="mb-8 border-b border-sand-200 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-sand-900 sm:text-3xl">
            {frontmatter.title}
          </h1>
          {frontmatter.description && (
            <p className="mt-3 text-base text-sand-600">
              {frontmatter.description}
            </p>
          )}
        </header>
        <div className="prose prose-sand max-w-none">{content}</div>
      </article>
    </div>
  );
}
