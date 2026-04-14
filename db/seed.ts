import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const contentDir = join(process.cwd(), "content");
  const moduleDirs = readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  for (let i = 0; i < moduleDirs.length; i++) {
    const moduleDir = moduleDirs[i];
    const moduleName = moduleDir.name;
    const moduleJsonPath = join(contentDir, moduleName, "module.json");

    // Read module title from module.json
    let moduleTitle = moduleName;
    if (existsSync(moduleJsonPath)) {
      const moduleData = JSON.parse(readFileSync(moduleJsonPath, "utf-8"));
      moduleTitle = moduleData.title ?? moduleName;
    }

    // Scan for lesson subdirectories
    const lessonDirs = readdirSync(join(contentDir, moduleName), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    for (const lessonDir of lessonDirs) {
      const slug = `${moduleName}/${lessonDir.name}`;
      const mdxPath = join(contentDir, moduleName, lessonDir.name, "lesson.mdx");
      const quizPath = join(contentDir, moduleName, lessonDir.name, "quiz.json");

      // Read lesson title from MDX frontmatter
      let title = lessonDir.name;
      if (existsSync(mdxPath)) {
        const { data } = matter(readFileSync(mdxPath, "utf-8"));
        title = data.title ?? lessonDir.name;
      }

      // Upsert module entry (one per lesson for quiz lookups)
      const existing = await db
        .select()
        .from(schema.modules)
        .where(eq(schema.modules.slug, slug));

      if (existing.length === 0) {
        await db.insert(schema.modules).values({ slug, title, order: i * 100 + parseInt(lessonDir.name.replace(/\D/g, "") || "0") });
      } else {
        await db
          .update(schema.modules)
          .set({ title })
          .where(eq(schema.modules.slug, slug));
      }

      // Seed quiz if quiz.json exists
      if (!existsSync(quizPath)) continue;

      const quizData = JSON.parse(readFileSync(quizPath, "utf-8"));

      // Delete existing quiz (cascade deletes questions + answers)
      await db
        .delete(schema.quizzes)
        .where(eq(schema.quizzes.moduleSlug, slug));

      // Insert quiz
      const [quiz] = await db
        .insert(schema.quizzes)
        .values({ moduleSlug: slug, title: quizData.title ?? `${title} Quiz` })
        .returning();

      // Insert questions and answers
      for (let q = 0; q < quizData.questions.length; q++) {
        const questionData = quizData.questions[q];
        const [question] = await db
          .insert(schema.questions)
          .values({ quizId: quiz.id, text: questionData.text, order: q + 1 })
          .returning();

        const answerValues = questionData.answers.map(
          (a: { text: string; correct?: boolean }, idx: number) => ({
            questionId: question.id,
            text: a.text,
            correct: a.correct ?? false,
            order: idx + 1,
          })
        );
        await db.insert(schema.answers).values(answerValues);
      }

      console.log(`  Seeded "${slug}" with ${quizData.questions.length} questions`);
    }

    console.log(`  Module "${moduleTitle}" done`);
  }

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
