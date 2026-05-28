export interface LessonResource {
  title: string;
  description: string;
  url: string;
  type?: string;
}

/** Additional quiz tab beyond the default quiz.json */
export interface LessonQuizTab {
  /** File slug: quiz-{slug}.json (e.g. "xray" → quiz-xray.json) */
  slug: string;
  /** URL query view id (e.g. "xray-exam") */
  view: string;
  label: string;
}

export type InteractiveComponentId =
  | "ReceptorTable"
  | "LabRanges"
  | "GCSScenarios"
  | "PulmonaryDiagnosticsIReview"
  | "CylinderDurationExercises";

export interface ModuleLesson {
  slug: string;
  title: string;
  description?: string;
  /** Per-lesson podcast audio path (used on the lesson Review tab) */
  audio?: string;
  /** Built-in interactive study tool for the Resources tab */
  interactive?: InteractiveComponentId;
  resources?: LessonResource[];
  /** Extra quiz tabs (in addition to quiz.json when present) */
  quizzes?: LessonQuizTab[];
}

export interface ModuleAudioEntry {
  title: string;
  src: string;
}

export type ModuleResource = LessonResource;

export interface ModuleData {
  title: string;
  description?: string;
  order?: number;
  lessons: ModuleLesson[];
  audio?: ModuleAudioEntry[];
  resources?: ModuleResource[];
}

export interface ModuleInfo {
  slug: string;
  title: string;
  description?: string;
  order: number;
}

export interface LessonContext {
  slugPath: string;
  moduleSlug: string;
  moduleTitle: string | null;
  lesson: ModuleLesson | null;
}
