import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { readFileSync, existsSync } from "fs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Quiz from "@/components/Quiz";
import DataTable from "@/components/DataTable";
import AudioPlayer from "@/components/AudioPlayer";
import YouTube from "@/components/YouTube";
import {
  discoverQuizFiles,
  getLessonAudioSrc,
  getLessonContext,
  getLessonMdxPath,
  lessonHasResources,
  readModuleData,
} from "@/lib/content";
import { renderInteractiveComponent } from "@/lib/content/interactive";
import type { LessonResource } from "@/lib/content/types";

function MdxTable(props: React.ComponentProps<"table">) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-sand-200">
      <table {...props} />
    </div>
  );
}

const mdxComponents = { DataTable, YouTube, table: MdxTable };

function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/live/") || parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/").filter(Boolean)[1] ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function SignInQuizPrompt() {
  return (
    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-100/50 px-5 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
      </div>
      <p className="text-sm text-sand-700">
        <Link href="/sign-in" className="font-semibold text-sky-600 underline decoration-sky-300 underline-offset-2 transition hover:text-sky-700">
          Sign in
        </Link>{" "}
        to take this quiz and track your progress.
      </p>
    </div>
  );
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { slug } = await params;
  const { view: requestedView = "review" } = await searchParams;
  const slugPath = slug.join("/");
  const { userId } = await auth();
  const filePath = getLessonMdxPath(slug);

  if (!existsSync(filePath)) {
    notFound();
  }

  const { moduleSlug, moduleTitle, lesson } = getLessonContext(slugPath);
  const moduleData = readModuleData(moduleSlug);
  const lessonResources: LessonResource[] = lesson?.resources ?? [];
  const audioSrc =
    moduleData && lesson
      ? getLessonAudioSrc(moduleData, lesson, slugPath)
      : moduleData
        ? getLessonAudioSrc(moduleData, null, slugPath)
        : null;
  const hasResources = lessonHasResources(lesson);

  const source = readFileSync(filePath, "utf-8");

  const { content, frontmatter } = await compileMDX<{
    title: string;
    description?: string;
  }>({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm] } },
  });

  const isModuleExam = frontmatter.title?.toLowerCase().includes("module exam");
  const quizFiles = discoverQuizFiles(slug);
  const hasDefaultQuiz = quizFiles.some((q) => q.slug === "default");
  const extraQuizzes = lesson?.quizzes ?? [];

  const views = [
    { id: "review", label: "Review" },
    { id: "resources", label: "Resources" },
    ...(hasDefaultQuiz
      ? [{ id: "quiz", label: isModuleExam ? "Module Exam" : "Quiz" }]
      : []),
    ...extraQuizzes.map((q) => ({ id: q.view, label: q.label })),
  ];
  const activeView = views.some((view) => view.id === requestedView) ? requestedView : "review";
  const activeExtraQuiz = extraQuizzes.find((q) => q.view === activeView);

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

      {/* Sticky Audio Bar (Review view only) */}
      {activeView === "review" && audioSrc && (
        <div className="sticky top-[102px] z-[11] mb-6">
          <AudioPlayer src={audioSrc} title={`Listen: ${frontmatter.title}`} />
        </div>
      )}

      {/* Review view */}
      {activeView === "review" && (
        <div className="space-y-6">
          <article className="rounded-2xl border border-sand-200 bg-white px-8 py-10 sm:px-10">
            <div className="prose prose-sand max-w-none">{content}</div>
          </article>
        </div>
      )}

      {/* Resources view */}
      {activeView === "resources" && (
        <div className="space-y-6">
          {lesson?.interactive && renderInteractiveComponent(lesson.interactive)}
          {lessonResources.length > 0 && (
            <div className="space-y-6">
              {lessonResources.map((resource) => {
                const videoId = resource.type === "video" ? getYouTubeVideoId(resource.url) : null;

                return videoId ? (
                  <YouTube
                    key={resource.url}
                    id={videoId}
                    title={resource.title}
                    caption={resource.description}
                  />
                ) : (
                  <a
                    key={resource.url}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 transition-all hover:border-sand-300 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sand-900 transition-colors group-hover:text-terracotta-600">
                        {resource.title}
                      </p>
                      <p className="mt-0.5 text-sm text-sand-500">
                        {resource.description}
                      </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-sand-300 transition-colors group-hover:text-sand-500"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  </a>
                );
              })}
            </div>
          )}
          {!hasResources && (
            <div className="rounded-2xl border border-dashed border-sand-300 p-8 text-center text-sand-500">
              No additional resources for this lesson yet.
            </div>
          )}
        </div>
      )}

      {/* Default quiz view */}
      {activeView === "quiz" && (
        userId ? <Quiz slug={slugPath} /> : <SignInQuizPrompt />
      )}

      {/* Extra quiz views (e.g. X-ray Exam) */}
      {activeExtraQuiz && activeView === activeExtraQuiz.view && (
        userId ? (
          <Quiz slug={slugPath} name={activeExtraQuiz.slug} />
        ) : (
          <SignInQuizPrompt />
        )
      )}
    </div>
  );
}
