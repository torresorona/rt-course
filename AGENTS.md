<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# RT Course — Antigravity Project Guide

> **Respiratory Therapy Course** — A Next.js 16 open learning platform with MDX lessons, interactive quizzes, audio playback, and local progress tracking. Built for a military Respiratory Therapy student.

---

## 1. Tech Stack & Versions

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.3 |
| React | React + ReactDOM | 19.2.4 |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` | ^4 |
| Database | Neon Postgres (serverless) | `@neondatabase/serverless` ^1.0.2 |
| ORM | Drizzle ORM + Drizzle Kit | ^0.45.2 / ^0.31.10 |
| Content | MDX via `next-mdx-remote` + `gray-matter` + `remark-gfm` | ^6.0.0 / ^4.0.3 / ^4.0.1 |
| Language | TypeScript | ^5 |
| Package Manager | npm | — |
| Deployment | Vercel | — |

### Key Notes
- **Next.js 16** has breaking changes vs training data (see rule above).
- **Tailwind v4** uses `@theme inline` blocks instead of `tailwind.config.js` — the entire design system is defined in `app/globals.css`.
- **No auth** — the site is fully open; no Clerk, no sign-in, no middleware.
- **No middleware.ts** — there is no middleware file in this project.

---

## 2. Project Structure

```
rt-course/
├── app/
│   ├── layout.tsx              # Root layout — nav, footer
│   ├── page.tsx                # Home — lists all modules from content/
│   ├── globals.css             # Tailwind v4 theme (sand/terracotta/sage/clay/sky palette)
│   ├── [...slug]/
│   │   └── page.tsx            # Lesson viewer — MDX rendering, view tabs (Review/Resources/Quiz)
│   ├── modules/
│   │   └── [slug]/
│   │       └── page.tsx        # Module landing — lessons list, audio, resources
│   └── api/
│       ├── quiz/[...slug]/route.ts     # GET quiz data from filesystem (no auth)
│       ├── quizlet/[...slug]/route.ts  # GET Quizlet export from filesystem (no auth)
│       └── feedback/route.ts           # POST feedback to DB
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
      "description": "Brief lesson description.",
      "audio": "/audio/module-slug/podcast.m4a",
      "interactive": "ReceptorTable",
      "resources": [{ "title": "...", "description": "...", "url": "...", "type": "video" }],
      "quizzes": [{ "slug": "xray", "view": "xray-exam", "label": "X-ray Exam" }]
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
- Per-lesson audio is set via `audio` on each lesson entry in `module.json` (module-level `audio` is still used on the module landing page)
- Lesson audio is read by `lib/content` (`getLessonAudioSrc`) — no code changes needed when adding audio

### Resources (Interactive Components)

Set `interactive` on a lesson in `module.json` to one of: `ReceptorTable`, `LabRanges`, `GCSScenarios`, `PulmonaryDiagnosticsIReview`, `CylinderDurationExercises`. Register new components in `lib/content/interactive.tsx`.

| Slug | Component |
|------|-----------|
| `pharmacology/lesson-1` | `ReceptorTable` |
| `patient-assessment/lesson-1` | `LabRanges` |
| `patient-assessment/lesson-2` | `GCSScenarios` |

---

## 5. Database Architecture

The database is used only for the feedback feature. Quiz data and progress are fully filesystem/localStorage-based.

### Tables (Drizzle schema in `db/schema.ts`)

```
feedback    → id, user_id (null), type, message, page_url, contact_email, status, user_agent, created_at, updated_at
```

### Database Commands
```bash
npm run db:push    # Push schema to Neon (drizzle-kit push)
npm run db:studio  # Open Drizzle Studio GUI
```

---

## 6. API Routes

No authentication required on any route.

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/quiz/[...slug]` | GET | Read `quiz.json` from filesystem; returns questions + shuffled answers (includes `correct` field) |
| `/api/quizlet/[...slug]` | GET | Generate Quizlet tab-delimited export from `quiz.json` |
| `/api/feedback` | POST | Save feedback to DB |

### Quiz Flow
1. Client fetches quiz data from `/api/quiz/{slug}` (reads filesystem JSON, no DB)
2. Draft answers saved to `localStorage` as user selects
3. On submit: graded entirely client-side in `Quiz.tsx` using `answer.correct`
4. Results saved to `localStorage` — key: `quiz:<slug>:<name>:result` / `quiz:<slug>:<name>:responses`
5. Pass threshold: **80%** (shown in Quiz.tsx results view)

---

## 7. Routing Architecture

| URL Pattern | Route File | Description |
|-------------|-----------|-------------|
| `/` | `app/page.tsx` | Home — lists all modules |
| `/modules/{slug}` | `app/modules/[slug]/page.tsx` | Module landing page |
| `/{module}/{lesson}` | `app/[...slug]/page.tsx` | Lesson viewer (catch-all) |

### Lesson Page Views (Tab System)
The lesson page (`app/[...slug]/page.tsx`) has three views controlled by `?view=` query param:
- **Review** (default) — MDX content + audio player
- **Resources** — Interactive study tools (if available for this lesson)
- **Quiz** — Quiz form (open to all, no auth required)

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
7. Add `"audio": "/audio/..."` to the lesson entry in `module.json` if audio exists

No database seeding needed — quiz data is read directly from the filesystem at request time.

### Adding a New Lesson to an Existing Module

1. Create `content/<module-slug>/lesson-N/` directory
2. Add `lesson.mdx` with frontmatter
3. Add `quiz.json` if needed
4. Update `content/<module-slug>/module.json` to include the new lesson in the `lessons` array
5. Add `"audio": "/audio/..."` to the lesson entry in `module.json` if adding audio

### Adding a New Interactive Resource Component

1. Create the component in `components/`
2. Mark it `"use client"` if it needs state/interactivity
3. Add the component id to `InteractiveComponentId` and `lib/content/interactive.tsx`
4. Set `"interactive": "YourComponentId"` on the lesson in `module.json`

---

## 10. Development Commands

```bash
npm run dev        # Start Next.js dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npm run db:push    # Push Drizzle schema to Neon (feedback table only)
npm run db:studio  # Open Drizzle Studio
```

---

## 11. Environment Variables

Required in `.env.local`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres connection string |
| `GEMINI_API_KEY` | Google Gemini API key (for future AI features) |
| `RESEND_API_KEY` | Resend API key for feedback email alerts (optional) |
| `FEEDBACK_ALERT_TO` | Email address to receive feedback alerts (optional) |

---

## 12. Deployment & Promotion Workflow

Changes must be promoted through explicit, user-approved stages:

1. **Local / Dev first**
   - Implement and validate changes locally before any remote push.
   - Use `.env.local` for local commands; its values point to the dev Neon branch.
   - For new lessons/content, validate quiz JSON syntax locally (the build will catch parse errors).

2. **Pre-production next**
   - Only push to the remote `preview` branch after the user explicitly asks.
   - The `preview` branch triggers the Vercel pre-production deployment.
   - Pre-production uses environment values equivalent to `.env.preview`, pointing at the Neon preview instance.

3. **Production last**
   - Only push to `main` after the user explicitly confirms pre-production validation is complete.
   - `main` triggers the final Vercel production deployment.
   - Production uses production Vercel environment variables and the production Neon instance.

### Git Promotion Rules

- The only remote branches that may be pushed are `preview` and `main`.
- Do not push any other branch remotely without explicit user consent.
- Direct pushes are acceptable when the user asks for that promotion stage; pull requests are not required.

### Neon Schema Changes

- Neon branches isolate schema and data changes; schema changes applied to dev do not automatically affect preview or production.
- Use `npm run db:push` only for local/dev schema experimentation unless the user explicitly approves otherwise.
- For schema changes that will reach preview or production, prefer committed Drizzle migration files and apply the same migration per environment.
- Before applying schema changes to preview or production, confirm the target environment variables point to the intended Neon branch/instance.
- Consider Neon Schema Diff before promotion when the schema delta is non-trivial.

---

## 13. Known Technical Debt & Gotchas

### Content metadata (`lib/content`)
- Lesson **audio**, **interactive** tools, **resources**, and **extra quiz tabs** are driven by `module.json` lesson entries.
- Module-level `audio` remains for the module landing page playlist.
- Extra quizzes use `quiz-{slug}.json` plus a `quizzes` array on the lesson (e.g. `quiz-xray.json` → `{ "slug": "xray", "view": "xray-exam", "label": "X-ray Exam" }`).

### Architecture Notes
- The home page reads modules from the filesystem using `readdirSync` (reads `module.json` files) — **not** from the database.
- The module landing page (`/modules/[slug]`) also reads from the filesystem, not DB.
- The lesson page reads MDX from the filesystem and compiles at request time.
- Quiz data is read from `quiz.json` files on the filesystem — **no DB lookup**.
- Quiz grading happens client-side in `Quiz.tsx` using the `correct` field returned by `/api/quiz`.
- Quiz results and responses persist in `localStorage` — no server-side progress storage.

### Client vs Server Components
- Components using React state (`useState`, `useEffect`) are marked `"use client"`: `Quiz.tsx`, `AudioPlayer.tsx`, `ReceptorTable.tsx`, `LabRanges.tsx`, `GCSScenarios.tsx`
- Server components: `DataTable.tsx` (reads files with `fs`), `YouTube.tsx`
- MDX is compiled server-side via `compileMDX` from `next-mdx-remote/rsc`

### Tailwind v4 Caveats
- No `tailwind.config.js` — all configuration is in `globals.css` using `@theme inline`
- PostCSS config uses `@tailwindcss/postcss` plugin (not the old `tailwindcss` one)
- Typography plugin imported as `@plugin "@tailwindcss/typography"` (new v4 syntax)

---

## 14. Coding Conventions

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

## 15. Content Domain Context

This is a **Respiratory Therapy** course for a student in a military RT program. Content covers:

- **Pharmacology**: Drug actions, receptors (adrenergic/cholinergic), bronchodilators, cardiac meds, dose calculations
- **Patient Assessment**: History taking, lab values (CBC, BMP, coagulation), physical exam, vital signs, auscultation
- **Cardiac Diagnostics I**: 12-lead ECG, rhythm interpretation, arrhythmias, AV blocks, stress testing
- **Cardiac Diagnostics II**: Echocardiography, cardiac catheterization, hemodynamic monitoring, cardiac rehab
- **Pulmonary Diagnostics II**: ABG sampling, acid-base balance, oxygenation evaluation, blood gas analyzers

When creating new content, always use the provided content as the sole source — do not add external vocabulary, facts, or terminology not present in the source material. Avoid excessive auxiliary info or elaboration beyond what's in the original content. Maintain clinical accuracy and use proper medical terminology. Quiz questions should test understanding, not just recall — include clinical scenarios when possible.
