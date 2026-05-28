import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import type { LessonContext, ModuleData, ModuleInfo, ModuleLesson } from "./types";

const CONTENT_DIR = join(process.cwd(), "content");

export function getContentDir() {
  return CONTENT_DIR;
}

export function getModuleJsonPath(moduleSlug: string) {
  return join(CONTENT_DIR, moduleSlug, "module.json");
}

export function readModuleData(moduleSlug: string): ModuleData | null {
  const path = getModuleJsonPath(moduleSlug);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8")) as ModuleData;
}

export function getAllModules(): ModuleInfo[] {
  const dirs = readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((d) =>
    d.isDirectory(),
  );

  const modules: ModuleInfo[] = [];
  for (const dir of dirs) {
    const data = readModuleData(dir.name);
    if (!data) continue;
    modules.push({
      slug: dir.name,
      title: data.title ?? dir.name,
      description: data.description,
      order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
    });
  }

  modules.sort((a, b) => a.order - b.order);
  return modules;
}

export function getLesson(moduleSlug: string, slugPath: string): ModuleLesson | null {
  const data = readModuleData(moduleSlug);
  if (!data?.lessons) return null;
  return data.lessons.find((lesson) => lesson.slug === slugPath) ?? null;
}

export function getLessonContext(slugPath: string): LessonContext {
  const moduleSlug = slugPath.split("/")[0] ?? "";
  const data = readModuleData(moduleSlug);
  const lesson =
    data?.lessons?.find((entry) => entry.slug === slugPath) ?? null;

  return {
    slugPath,
    moduleSlug,
    moduleTitle: data?.title ?? null,
    lesson,
  };
}

/** Resolve lesson audio: per-lesson field, or fall back to module audio by lesson index */
export function getLessonAudioSrc(
  moduleData: ModuleData,
  lesson: ModuleLesson | null,
  slugPath: string,
): string | null {
  if (lesson?.audio) return lesson.audio;

  const lessonIndex = moduleData.lessons?.findIndex((l) => l.slug === slugPath) ?? -1;
  if (lessonIndex >= 0 && moduleData.audio?.[lessonIndex]?.src) {
    return moduleData.audio[lessonIndex].src;
  }

  return null;
}

export function lessonHasResources(lesson: ModuleLesson | null): boolean {
  if (!lesson) return false;
  return Boolean(
    lesson.interactive ||
      (lesson.resources && lesson.resources.length > 0),
  );
}

export function getLessonMdxPath(slug: string[]) {
  return join(CONTENT_DIR, ...slug, "lesson.mdx");
}

export function getQuizPath(slug: string[], quizFile = "quiz.json") {
  return join(CONTENT_DIR, ...slug, quizFile);
}

export function discoverQuizFiles(slug: string[]): { fileName: string; slug: string }[] {
  const lessonDir = join(CONTENT_DIR, ...slug);
  if (!existsSync(lessonDir)) return [];

  const files = readdirSync(lessonDir);
  const quizFiles: { fileName: string; slug: string }[] = [];
  for (const file of files) {
    const match = file.match(/^quiz(?:-(.+))?\.json$/);
    if (match) {
      quizFiles.push({ fileName: file, slug: match[1] ?? "default" });
    }
  }
  return quizFiles;
}
