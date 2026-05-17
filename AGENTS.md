<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# RT Course — Antigravity Project Guide

> **Respiratory Therapy Course** — A Next.js 16 learning platform with MDX lessons, interactive quizzes, audio playback, and progress tracking. Built for a military Respiratory Therapy student.

---

## 1. Tech Stack & Versions

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.3 |
| React | React + ReactDOM | 19.2.4 |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` | ^4 |
| Auth | Clerk (`@clerk/nextjs`) | ^7.0.12 |
| Database | Neon Postgres (serverless) | `@neondatabase/serverless` ^1.0.2 |
| ORM | Drizzle ORM + Drizzle Kit | ^0.45.2 / ^0.31.10 |
| Content | MDX via `next-mdx-remote` + `gray-matter` + `remark-gfm` | ^6.0.0 / ^4.0.3 / ^4.0.1 |
| Language | TypeScript | ^5 |
| Package Manager | npm | — |
| Deployment | Vercel | — |

### Key Notes
- **Next.js 16** has breaking changes vs training data (see rule above).
- **Tailwind v4** uses `@theme inline` blocks instead of `tailwind.config.js` — the entire design system is defined in `app/globals.css`.
- **Clerk v7** uses `<Show when="signed-in">` instead of older conditional components. The `proxy.ts` file at the project root contains the Clerk middleware config (not `middleware.ts`).
- **No middleware.ts at root** — Clerk middleware is in `proxy.ts`.

---

## 2. Project Structure

```
rt-course/
├── app/
│   ├── layout.tsx              # Root layout — ClerkProvider, nav, footer
│   ├── page.tsx                # Home — lists all modules from content/
│   ├── globals.css             # Tailwind v4 theme (sand/terracotta/sage/clay/sky palette)
│   ├── [...slug]/
│   │   └── page.tsx            # Lesson viewer — MDX rendering, view tabs (Review/Resources/Quiz)
│   ├── modules/
│   │   └── [slug]/
│   │       └── page.tsx        # Module landing — lessons list, audio, resources
│   ├── api/
│   │   ├── quiz/[...slug]/route.ts     # GET quiz data (auth required)
│   │   ├── progress/[...slug]/route.ts # GET/DELETE user progress (auth required)
│   │   └── score/route.ts              # POST quiz submission + grading (auth required)
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
│
├── components/
│   ├── AudioPlayer.tsx         # Client — custom audio player with speed control
│   ├── Quiz.tsx                # Client — quiz form with localStorage drafts + server grading
│   ├── DataTable.tsx           # Server — renders CSV files as styled tables
│   ├── YouTube.tsx             # Server — privacy-enhanced YouTube embed
│   ├── ReceptorTable.tsx       # Client — interactive expandable receptor reference
│   ├── LabRanges.tsx           # Client — lab values reference with flashcard mode
│   └── GCSScenarios.tsx        # Client — GCS clinical scenario trainer
│
├── content/                    # ⭐ ALL COURSE CONTENT LIVES HERE
│   ├── pulmonary-anatomy-physiology/ # Module 1 (order: 1) — 5 lessons
│   ├── cardiovascular-anatomy-physiology/ # Module 2 (order: 2) — 6 lessons
│   ├── pharmacology/           # Module 3 (order: 3) — 5 lessons
│   ├── patient-assessment/     # Module 4 (order: 4) — 4 lessons
│   ├── cardiac-diagnostics-i/  # Module 5 (order: 5) — 6 lessons
│   ├── cardiac-diagnostics-ii/ # Module 6 (order: 6) — 4 lessons
│   └── pulmonary-diagnostics-ii/ # Module 7 (order: 7) — 3 lessons
│
├── db/
│   ├── schema.ts               # Drizzle schema — modules, quizzes, questions, answers, progress
│   ├── index.ts                # DB connection (neon serverless)
│   └── seed.ts                 # Seeds modules + quizzes from content/ directory
│
├── public/
│   └── audio/                  # .m4a audio files (NotebookLM-generated podcasts)
│
├── proxy.ts                    # Clerk middleware configuration
├── drizzle.config.ts           # Drizzle Kit config (reads from .env.local)
├── next.config.ts              # serverExternalPackages: ["gray-matter"]
└── .env.local                  # DATABASE_URL, CLERK_*, GEMINI_API_KEY
```

---

## 3. Design System & Color Palette

All colors are defined as custom Tailwind theme tokens in `app/globals.css` using `@theme inline`. **Do not add a `tailwind.config.js`** — it won't work with Tailwind v4.

| Token Family | Purpose |
|-------------|---------|
| `sand-50` → `sand-900` | Primary neutral palette (backgrounds, text, borders) |
| `terracotta-500/600` | Accent (active states, links, selected quiz answers) |
| `sage-100` → `sage-700` | Success states (correct answers, passing scores) |
| `clay-100` → `clay-500` | Error/warning states (incorrect answers, failing scores) |
| `sky-100` → `sky-600` | Info states (sign-in prompts, resource badges) |

### Fonts
- **Geist Sans** (`--font-geist-sans`) — body text
- **Geist Mono** (`--font-geist-mono`) — code blocks, tabular numbers

### Design Conventions
- Rounded corners: `rounded-2xl` for cards, `rounded-xl` for inner elements
- Borders: `border border-sand-200` for cards
- Card backgrounds: `bg-white` on `bg-sand-50` body
- Interactive hover: `hover:border-sand-300 hover:shadow-sm`
- Module/lesson numbering: zero-padded (`01`, `02`, etc.)
- Prose styling via `@tailwindcss/typography` with warm overrides

---

## 4. Content Architecture

### Module Structure

Each module lives in `content/<module-slug>/` and contains:

```
content/<module-slug>/
├── module.json          # Module metadata (required)
├── lesson-1/
│   ├── lesson.mdx       # MDX content with frontmatter (required)
│   ├── quiz.json         # Quiz questions + answers (optional)
│   └── notebooklm-source.md  # Source material for audio generation (optional)
├── lesson-2/
│   └── ...
```

### `module.json` Schema

```json
{
  "title": "Module Title",
  "description": "Brief module description.",
  "order": 1,
  "lessons": [
    {
      "slug": "module-slug/lesson-1",
      "title": "Lesson Title",
      "description": "Brief lesson description."
    }
  ],
  "audio": [
    {
      "title": "Audio Title",
      "src": "/audio/Audio_File_Name.m4a"
    }
  ],
  "resources": [
    {
      "title": "Resource Title",
      "description": "Resource description.",
      "url": "https://...",
      "type": "video|jko|quizlet|study-guide|worksheet"
    }
  ]
}
```

### `lesson.mdx` Frontmatter

```yaml
---
title: "Lesson Title"
description: "Brief lesson description."
order: 1
---
```

### `quiz.json` Schema

```json
{
  "title": "Quiz Title",
  "questions": [
    {
      "text": "Question text?",
      "answers": [
        { "text": "Wrong answer" },
        { "text": "Correct answer", "correct": true },
        { "text": "Wrong answer" },
        { "text": "Wrong answer" }
      ]
    }
  ]
}
```

- Exactly one answer per question should have `"correct": true`
- Answers without `correct` field default to `false`
- Questions are 4-option multiple choice

### MDX Components Available in Lessons

These components are registered in `app/[...slug]/page.tsx` and can be used in any `.mdx` file:

- `<DataTable file="path/relative/to/content/" />` — renders a CSV as a styled table
- `<YouTube id="VIDEO_ID" title="..." caption="..." start={seconds} />` — YouTube embed
- Standard markdown tables get wrapped in `MdxTable` with rounded borders

### Audio Files

- All audio files are `.m4a` format stored in `public/audio/`
- Audio files are generated from NotebookLM using `notebooklm-source.md` as input
- Audio mapping in the lesson page is currently **hardcoded** in `app/[...slug]/page.tsx` (the `audioMap` object)
- Module-level audio is configured via `module.json`'s `audio` array

### Resources (Interactive Components)

Resource components are currently **hardcoded** by slug in `app/[...slug]/page.tsx`:

| Slug | Component |
|------|-----------|
| `pharmacology/lesson-1` | `<ReceptorTable />` |
| `patient-assessment/lesson-1` | `<LabRanges />` |
| `patient-assessment/lesson-2` | `<GCSScenarios />` |

---

## 5. Database Architecture

### Tables (Drizzle schema in `db/schema.ts`)

```
modules     → id, slug (unique), title, order
quizzes     → id, module_slug (FK→modules.slug), title
questions   → id, quiz_id (FK→quizzes.id), text, order
answers     → id, question_id (FK→questions.id), text, correct, order
progress    → id, user_id, module_slug (FK), quiz_score, quiz_responses (jsonb), quiz_results (jsonb), completed_at, updated_at
             unique index on (user_id, module_slug)
```

### Key Relationships
- `modules.slug` uses format `module-slug/lesson-N` (e.g., `pharmacology/lesson-1`)
- Cascade deletes: module → quizzes → questions → answers
- Progress tracks per-user, per-lesson quiz results

### Database Commands
```bash
npm run db:push    # Push schema to Neon (drizzle-kit push)
npm run db:seed    # Seed modules + quizzes from content/ directory
npm run db:studio  # Open Drizzle Studio GUI
```

The seed script (`db/seed.ts`) scans `content/` directories and:
1. Upserts module entries (one per lesson)
2. Deletes and re-creates quiz data from `quiz.json` files

---

## 6. API Routes

All API routes require Clerk authentication (`auth()` from `@clerk/nextjs/server`).

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/quiz/[...slug]` | GET | Fetch quiz questions + answers (excludes `correct` field) |
| `/api/progress/[...slug]` | GET | Get saved quiz results for current user |
| `/api/progress/[...slug]` | DELETE | Clear quiz results (reset quiz) |
| `/api/score` | POST | Submit quiz responses, grade, save to progress |

### Quiz Flow
1. Client loads quiz data from `/api/quiz/{slug}` and progress from `/api/progress/{slug}`
2. Draft answers saved to `localStorage` as user selects
3. On submit: POST to `/api/score` with `{ moduleSlug, responses }`
4. Server grades against correct answers, saves to `progress` table
5. Pass threshold: **80%** (shown in Quiz.tsx results view)

---

## 7. Routing Architecture

| URL Pattern | Route File | Description |
|-------------|-----------|-------------|
| `/` | `app/page.tsx` | Home — lists all modules |
| `/modules/{slug}` | `app/modules/[slug]/page.tsx` | Module landing page |
| `/{module}/{lesson}` | `app/[...slug]/page.tsx` | Lesson viewer (catch-all) |
| `/sign-in` | `app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in |
| `/sign-up` | `app/sign-up/[[...sign-up]]/page.tsx` | Clerk sign-up |

### Lesson Page Views (Tab System)
The lesson page (`app/[...slug]/page.tsx`) has three views controlled by `?view=` query param:
- **Review** (default) — MDX content + audio player
- **Resources** — Interactive study tools (if available for this lesson)
- **Quiz** — Quiz form (requires auth)

---

## 8. Current Module Inventory

| # | Module Slug | Title | Lessons |
|---|-------------|-------|---------|
| 1 | `pulmonary-anatomy-physiology` | Pulmonary Anatomy & Physiology | 5 (incl. module exam) |
| 2 | `cardiovascular-anatomy-physiology` | Cardiovascular Anatomy & Physiology | 6 (incl. module exam) |
| 3 | `pharmacology` | Pharmacology | 5 (incl. module exam) |
| 4 | `patient-assessment` | Patient Assessment | 4 |
| 5 | `cardiac-diagnostics-i` | Cardiac Diagnostics I | 6 (incl. review + exam) |
| 6 | `cardiac-diagnostics-ii` | Cardiac Diagnostics II | 4 (incl. review + exam) |
| 7 | `pulmonary-diagnostics-ii` | Pulmonary Diagnostics II | 3 |

### NotebookLM Source Files
Some lessons have `notebooklm-source.md` files — these are expanded study guides used as input for generating audio podcasts via Google NotebookLM. Currently only `cardiac-diagnostics-i` lessons have these files.

---

## 9. Adding New Content — Step by Step

### Adding a New Module

1. Create directory: `content/<module-slug>/`
2. Create `module.json` with title, description, order, lessons array
3. Create lesson subdirectories: `content/<module-slug>/lesson-1/`, etc.
4. Create `lesson.mdx` in each lesson directory with frontmatter
5. Create `quiz.json` in each lesson directory
6. Create `notebooklm-source.md` for each content lesson (expanded conversational transcript for audio generation via NotebookLM)
7. Add audio file mapping to `audioMap` in `app/[...slug]/page.tsx` if audio exists
8. Run `npm run db:seed` to populate the database (validates quiz JSON syntax and loads questions)

### Adding a New Lesson to an Existing Module

1. Create `content/<module-slug>/lesson-N/` directory
2. Add `lesson.mdx` with frontmatter
3. Add `quiz.json` if needed
4. Update `content/<module-slug>/module.json` to include the new lesson in the `lessons` array
5. Update `audioMap` in `app/[...slug]/page.tsx` if adding audio
6. Run `npm run db:seed` (validates quiz JSON syntax and loads questions into DB)

### Adding a New Interactive Resource Component

1. Create the component in `components/`
2. Mark it `"use client"` if it needs state/interactivity
3. Import it in `app/[...slug]/page.tsx`
4. Add a condition in the Resources view section for the lesson slug
5. Update `hasResources` variable to include the new slug

---

## 10. Development Commands

```bash
npm run dev        # Start Next.js dev server (http://localhost:3000)
npm run build      # Production build (runs db:seed as postbuild)
npm run lint       # ESLint
npm run db:push    # Push Drizzle schema to Neon
npm run db:seed    # Seed database from content/ files
npm run db:studio  # Open Drizzle Studio
```

---

## 11. Environment Variables

Required in `.env.local`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk backend key |
| `GEMINI_API_KEY` | Google Gemini API key (for future AI features) |

---

## 12. Known Technical Debt & Gotchas

### Hardcoded Mappings
- **Audio map** (`audioMap` in `app/[...slug]/page.tsx`): Each lesson's audio file path is hardcoded. Adding a new lesson with audio requires manually updating this object.
- **Resource components** (`hasResources` + conditional rendering in `app/[...slug]/page.tsx`): Interactive resource components are conditionally rendered by slug string matching. Should ideally be driven by `module.json` config or MDX component usage.

### Architecture Notes
- The home page reads modules from the filesystem using `readdirSync` (reads `module.json` files) — **not** from the database.
- The module landing page (`/modules/[slug]`) also reads from the filesystem, not DB.
- The lesson page reads MDX from the filesystem and compiles at request time.
- Only quizzes and progress use the database.
- The seed script creates one `modules` DB row **per lesson** (not per module), using `module-slug/lesson-N` as the slug.

### Client vs Server Components
- Components using React state (`useState`, `useEffect`) are marked `"use client"`: `Quiz.tsx`, `AudioPlayer.tsx`, `ReceptorTable.tsx`, `LabRanges.tsx`, `GCSScenarios.tsx`
- Server components: `DataTable.tsx` (reads files with `fs`), `YouTube.tsx`
- MDX is compiled server-side via `compileMDX` from `next-mdx-remote/rsc`

### Tailwind v4 Caveats
- No `tailwind.config.js` — all configuration is in `globals.css` using `@theme inline`
- PostCSS config uses `@tailwindcss/postcss` plugin (not the old `tailwindcss` one)
- Typography plugin imported as `@plugin "@tailwindcss/typography"` (new v4 syntax)

---

## 13. Coding Conventions

- **TypeScript strict mode** enabled
- **Path alias**: `@/*` maps to project root (e.g., `@/db`, `@/components`)
- **File naming**: kebab-case for directories, PascalCase for components
- **Lesson directories**: always `lesson-N` (1-indexed)
- **Module slugs**: kebab-case (e.g., `cardiac-diagnostics-i`)
- **No semicolons**: the codebase uses semicolons (standard prettier/eslint config)
- **Inline SVGs**: icons are inline SVG elements, not an icon library
- **No icon library**: do not add lucide-react, heroicons, etc. — use inline SVGs matching existing patterns
- **Imports**: use `@/` alias for project imports; named exports for components

---

## 14. Content Domain Context

This is a **Respiratory Therapy** course for a student in a military RT program. Content covers:

- **Pharmacology**: Drug actions, receptors (adrenergic/cholinergic), bronchodilators, cardiac meds, dose calculations
- **Patient Assessment**: History taking, lab values (CBC, BMP, coagulation), physical exam, vital signs, auscultation
- **Cardiac Diagnostics I**: 12-lead ECG, rhythm interpretation, arrhythmias, AV blocks, stress testing
- **Cardiac Diagnostics II**: Echocardiography, cardiac catheterization, hemodynamic monitoring, cardiac rehab
- **Pulmonary Diagnostics II**: ABG sampling, acid-base balance, oxygenation evaluation, blood gas analyzers

When creating new content, always use the provided content as the sole source — do not add external vocabulary, facts, or terminology not present in the source material. Avoid excessive auxiliary info or elaboration beyond what's in the original content. Maintain clinical accuracy and use proper medical terminology. Quiz questions should test understanding, not just recall — include clinical scenarios when possible.
