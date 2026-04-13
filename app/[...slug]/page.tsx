import { compileMDX } from "next-mdx-remote/rsc";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import Quiz from "@/components/Quiz";
import DataTable from "@/components/DataTable";

const components = { Quiz, DataTable };

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
    <article className="prose prose-gray max-w-none">
      <h1>{frontmatter.title}</h1>
      {frontmatter.description && (
        <p className="lead text-gray-600">{frontmatter.description}</p>
      )}
      {content}
    </article>
  );
}
