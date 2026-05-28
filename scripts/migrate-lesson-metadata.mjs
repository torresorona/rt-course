/**
 * One-time migration: add per-lesson `audio`, `interactive`, and `quizzes` to module.json.
 * Run: node scripts/migrate-lesson-metadata.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const contentDir = join(root, "content");

/** Former audioMap in app/[...slug]/page.tsx */
const lessonAudio = {
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
  "microbiology/lesson-1": "/audio/microbiology/Bacterial_armor_and_viral_hacks.m4a",
  "microbiology/lesson-2": "/audio/microbiology/The_Battle_for_Biological_Real_Estate.m4a",
  "microbiology/lesson-3": "/audio/microbiology/The_Microscopic_War_Beneath_Your_Skin.m4a",
  "cardiovascular-anatomy-physiology/lesson-1": "/audio/cardiovascular-anatomy-physiology/Anatomy_of_the_Human_Heart_Engine.m4a",
  "cardiovascular-anatomy-physiology/lesson-2": "/audio/cardiovascular-anatomy-physiology/How_your_body_moves_blood_against_gravity.m4a",
  "cardiovascular-anatomy-physiology/lesson-3": "/audio/cardiovascular-anatomy-physiology/The_Engineering_Logic_of_Your_Heart.m4a",
  "cardiovascular-anatomy-physiology/lesson-4": "/audio/cardiovascular-anatomy-physiology/Your_Body_s_Hidden_Blood_Reservoir.m4a",
  "cardiovascular-anatomy-physiology/lesson-5": "/audio/cardiovascular-anatomy-physiology/The_Physics_of_Your_Heart_s_Engine.m4a",
  "pulmonary-anatomy-physiology/lesson-1": "/audio/pulmonary-anatomy-physiology/The_Engineering_of_a_Single_Breath.m4a",
  "pulmonary-anatomy-physiology/lesson-2": "/audio/pulmonary-anatomy-physiology/The_Physics_of_Human_Gas_Exchange.m4a",
  "pulmonary-anatomy-physiology/lesson-3": "/audio/pulmonary-anatomy-physiology/Why_You_Breathe_to_Expel_Brain_Acid.m4a",
  "pulmonary-anatomy-physiology/lesson-4": "/audio/pulmonary-anatomy-physiology/How_Your_Body_Balances_Blood_pH.m4a",
  "respiratory-therapeutics/lesson-1": "/audio/respiratory-therapeutics/How_Respiratory_Documentation_Prevents_Medical_Errors.m4a",
  "respiratory-therapeutics/lesson-2": "/audio/respiratory-therapeutics/The_Invisible_Engineering_of_Medical_Gases.m4a",
};

const lessonInteractive = {
  "pharmacology/lesson-1": "ReceptorTable",
  "patient-assessment/lesson-1": "LabRanges",
  "patient-assessment/lesson-2": "GCSScenarios",
  "pulmonary-diagnostics-i/lesson-7": "PulmonaryDiagnosticsIReview",
  "respiratory-therapeutics/lesson-2": "CylinderDurationExercises",
};

const lessonExtraQuizzes = {
  "pulmonary-diagnostics-ii/lesson-6": [
    { slug: "xray", view: "xray-exam", label: "X-ray Exam" },
  ],
};

// cardiac-diagnostics-i lesson-6 was NOT in audioMap — only lessons 1-5 had audio

const moduleDirs = readdirSync(contentDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let updated = 0;

for (const moduleSlug of moduleDirs) {
  const jsonPath = join(contentDir, moduleSlug, "module.json");
  if (!existsSync(jsonPath)) continue;

  const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
  if (!Array.isArray(data.lessons)) continue;

  let changed = false;

  for (const lesson of data.lessons) {
    const audio = lessonAudio[lesson.slug];
    if (audio && lesson.audio !== audio) {
      lesson.audio = audio;
      changed = true;
    }

    const interactive = lessonInteractive[lesson.slug];
    if (interactive && lesson.interactive !== interactive) {
      lesson.interactive = interactive;
      changed = true;
    }

    const quizzes = lessonExtraQuizzes[lesson.slug];
    if (quizzes && JSON.stringify(lesson.quizzes) !== JSON.stringify(quizzes)) {
      lesson.quizzes = quizzes;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
    updated++;
    console.log(`Updated ${jsonPath}`);
  }
}

console.log(`Done. ${updated} module(s) updated.`);
