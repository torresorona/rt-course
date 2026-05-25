import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Quiz from "@/components/Quiz";
import DataTable from "@/components/DataTable";
import AudioPlayer from "@/components/AudioPlayer";
import ReceptorTable from "@/components/ReceptorTable";
import LabRanges from "@/components/LabRanges";
import GCSScenarios from "@/components/GCSScenarios";
import YouTube from "@/components/YouTube";

function MdxTable(props: React.ComponentProps<"table">) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-sand-200">
      <table {...props} />
    </div>
  );
}

const mdxComponents = { DataTable, YouTube, table: MdxTable };

interface LessonResource {
  title: string;
  description: string;
  url: string;
  type?: string;
}

interface ModuleLesson {
  slug: string;
  title: string;
  description?: string;
  resources?: LessonResource[];
}

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
  const { userId } = await auth();
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
    options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm] } },
  });

  const isModuleExam = frontmatter.title?.toLowerCase().includes("module exam");
  const hasXrayExam = slugPath === "pulmonary-diagnostics-ii/lesson-6"

  const views = [
    { id: "review", label: "Review" },
    { id: "resources", label: "Resources" },
    { id: "quiz", label: isModuleExam ? "Module Exam" : "Quiz" },
    ...(hasXrayExam ? [{ id: "xray-exam", label: "X-ray Exam" }] : []),
  ];

  // Read module.json for breadcrumb if it exists
  const moduleSlug = slug[0];
  const moduleJsonPath = join(process.cwd(), "content", moduleSlug, "module.json");
  let moduleTitle: string | null = null;
  let lessonResources: LessonResource[] = [];
  if (existsSync(moduleJsonPath)) {
    const moduleData = JSON.parse(readFileSync(moduleJsonPath, "utf-8"));
    moduleTitle = moduleData.title ?? null;
    const currentLesson = (moduleData.lessons as ModuleLesson[] | undefined)?.find(
      (lesson) => lesson.slug === slugPath
    );
    lessonResources = currentLesson?.resources ?? [];
  }

  // Detect audio file for this lesson
  const audioMap: Record<string, string> = {
    "pharmacology/lesson-1": "/audio/pharmacology/Respiratory_Pharmacology_and_Receptor_Cheat_Codes.m4a",
    "pharmacology/lesson-2": "/audio/pharmacology/Airway_Pharmacology_and_Respiratory_Math.m4a",
    "pharmacology/lesson-3": "/audio/pharmacology/Clinical_Guide_to_Respiratory_Pharmacology.m4a",
    "pharmacology/lesson-4": "/audio/pharmacology/Pharmacology_for_Pain_Sedation_and_Emergencies.m4a",
    "patient-assessment/lesson-1": "/audio/patient-assessment/Respiratory_Therapy_History_and_Lab_Values.m4a",
    "patient-assessment/lesson-2": "/audio/patient-assessment/Clinical_Signs_in_Respiratory_Patient_Inspection.m4a",
    "patient-assessment/lesson-3": "/audio/patient-assessment/Identifying_Critical_Respiratory_and_Vital_Signs.m4a",
    "patient-assessment/lesson-4": "/audio/patient-assessment/Acoustic_Physics_of_Respiratory_Assessment.m4a",
    "cardiac-diagnostics-i/lesson-1": "/audio/cardiac-diagnostics-i/How_to_read_a_12-lead_ECG.m4a",
    "cardiac-diagnostics-i/lesson-2": "/audio/cardiac-diagnostics-i/The_Five_Step_ECG_Interpretation_Method.m4a",
    "cardiac-diagnostics-i/lesson-3": "/audio/cardiac-diagnostics-i/Sinus_Atrial_and_Junctional_Heart_Rhythms.m4a",
    "cardiac-diagnostics-i/lesson-4": "/audio/cardiac-diagnostics-i/Ventricular_Rhythms_and_Conduction_Blocks.m4a",
    "cardiac-diagnostics-i/lesson-5": "/audio/cardiac-diagnostics-i/Why_Your_Resting_Heart_Lies.m4a",
    "cardiac-diagnostics-ii/lesson-1": "/audio/cardiac-diagnostics-ii/How_Sound_Waves_Map_the_Heart.m4a",
    "cardiac-diagnostics-ii/lesson-2": "/audio/cardiac-diagnostics-ii/Fixing_the_Heart_s_Plumbing_and_Wiring.m4a",
    "cardiac-diagnostics-ii/lesson-3": "/audio/cardiac-diagnostics-ii/Cardiac_Rehab_and_Hemodynamic_Monitoring.m4a",
    "pulmonary-diagnostics-i/lesson-1": "/audio/pulmonary-diagnostics-i/Spirometry_and_Pulmonary_Diagnostic_Essentials.m4a",
    "pulmonary-diagnostics-i/lesson-2": "/audio/pulmonary-diagnostics-i/Lung_Volume_Studies_and_Diagnostic_Formulas.m4a",
    "pulmonary-diagnostics-i/lesson-3": "/audio/pulmonary-diagnostics-i/DLCO_and_Bronchoprovocation_Testing_Essentials.m4a",
    "pulmonary-diagnostics-i/lesson-4": "/audio/pulmonary-diagnostics-i/How_doctors_measure_breathing_limits.m4a",
    "pulmonary-diagnostics-i/lesson-5": "/audio/pulmonary-diagnostics-i/Clinical_protocols_for_lung_inflammation_and_exertion.m4a",
    "pulmonary-diagnostics-i/lesson-6": "/audio/pulmonary-diagnostics-i/The_physical_battle_for_our_breath.m4a",
    "pulmonary-diagnostics-ii/lesson-1": "/audio/pulmonary-diagnostics-ii/The_Physics_of_Arterial_Blood_Gas_Sampling.m4a",
    "pulmonary-diagnostics-ii/lesson-2": "/audio/pulmonary-diagnostics-ii/The_Invisible_Tightrope_of_Blood_pH.m4a",
    "pulmonary-diagnostics-ii/lesson-3": "/audio/pulmonary-diagnostics-ii/The_Invisible_Math_of_Clinical_Oxygenation.m4a",
    "pulmonary-diagnostics-ii/lesson-4": "/audio/pulmonary-diagnostics-ii/The_Physics_of_Clinical_Chest_X-Rays.m4a",
    "pulmonary-diagnostics-ii/lesson-5": "/audio/pulmonary-diagnostics-ii/How_doctors_read_shadows_on_lung_scans.m4a",
    "cardiovascular-anatomy-physiology/lesson-1": "/audio/cardiovascular-anatomy-physiology/Anatomy_of_the_Human_Heart_Engine.m4a",
    "cardiovascular-anatomy-physiology/lesson-2": "/audio/cardiovascular-anatomy-physiology/How_your_body_moves_blood_against_gravity.m4a",
    "cardiovascular-anatomy-physiology/lesson-3": "/audio/cardiovascular-anatomy-physiology/The_Engineering_Logic_of_Your_Heart.m4a",
    "cardiovascular-anatomy-physiology/lesson-4": "/audio/cardiovascular-anatomy-physiology/Your_Body_s_Hidden_Blood_Reservoir.m4a",
    "cardiovascular-anatomy-physiology/lesson-5": "/audio/cardiovascular-anatomy-physiology/The_Physics_of_Your_Heart_s_Engine.m4a",
    "pulmonary-anatomy-physiology/lesson-1": "/audio/pulmonary-anatomy-physiology/The_Engineering_of_a_Single_Breath.m4a",
    "pulmonary-anatomy-physiology/lesson-2": "/audio/pulmonary-anatomy-physiology/The_Physics_of_Human_Gas_Exchange.m4a",
    "pulmonary-anatomy-physiology/lesson-3": "/audio/pulmonary-anatomy-physiology/Why_You_Breathe_to_Expel_Brain_Acid.m4a",
    "pulmonary-anatomy-physiology/lesson-4": "/audio/pulmonary-anatomy-physiology/How_Your_Body_Balances_Blood_pH.m4a",
  };
  const audioSrc = audioMap[slugPath] ?? null;

  // Check if this lesson has resources
  const hasResources =
    lessonResources.length > 0 ||
    slugPath === "pharmacology/lesson-1" ||
    slugPath === "patient-assessment/lesson-1" ||
    slugPath === "patient-assessment/lesson-2";

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
          {slugPath === "pharmacology/lesson-1" && <ReceptorTable />}
          {slugPath === "patient-assessment/lesson-1" && <LabRanges />}
          {slugPath === "patient-assessment/lesson-2" && <GCSScenarios />}
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

      {/* Quiz view */}
      {activeView === "quiz" && (
        userId ? (
          <Quiz slug={slugPath} />
        ) : (
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
        )
      )}

      {/* X-ray Exam view */}
      {activeView === "xray-exam" && (
        userId ? (
          <Quiz slug={slugPath} name="xray" />
        ) : (
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
        )
      )}
    </div>
  );
}
