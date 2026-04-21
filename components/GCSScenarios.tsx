"use client";

import { useState } from "react";

interface Option {
  score: number;
  label: string;
}

const EYE_OPTIONS: Option[] = [
  { score: 4, label: "E4 — Spontaneous" },
  { score: 3, label: "E3 — To speech/voice" },
  { score: 2, label: "E2 — To pain" },
  { score: 1, label: "E1 — None" },
];

const VERBAL_OPTIONS: Option[] = [
  { score: 5, label: "V5 — Oriented" },
  { score: 4, label: "V4 — Confused" },
  { score: 3, label: "V3 — Inappropriate words" },
  { score: 2, label: "V2 — Incomprehensible sounds" },
  { score: 1, label: "V1 — None" },
];

const MOTOR_OPTIONS: Option[] = [
  { score: 6, label: "M6 — Obeys commands" },
  { score: 5, label: "M5 — Localizes to pain" },
  { score: 4, label: "M4 — Withdraws from pain" },
  { score: 3, label: "M3 — Flexion (decorticate)" },
  { score: 2, label: "M2 — Extension (decerebrate)" },
  { score: 1, label: "M1 — None" },
];

interface Scenario {
  id: string;
  title: string;
  vignette: string;
  answer: { E: number; V: number; M: number };
  explanation: { E: string; V: string; M: string };
}

const SCENARIOS: Scenario[] = [
  {
    id: "fall",
    title: "Scenario 1 — Elderly fall",
    vignette:
      "A 72-year-old is brought in after a fall. When you enter the room they are looking around and track you as you approach. They tell you their name and today's date correctly but insist they are at home rather than the hospital. When you ask them to squeeze your hand, they do.",
    answer: { E: 4, V: 4, M: 6 },
    explanation: {
      E: "Eyes are already open and tracking — spontaneous opening = E4.",
      V: "They're talking coherently, oriented to person and time, but not to place — that partial disorientation is classic V4 (confused).",
      M: "They follow a motor command (squeeze hand) → M6.",
    },
  },
  {
    id: "tbi",
    title: "Scenario 2 — Closed head injury",
    vignette:
      "A patient with a known closed head injury does NOT open their eyes when you walk in or when you call their name. You apply a sternal rub — their eyes open briefly. They make only moaning sounds. During the sternal rub, both arms flex and curl tightly toward the chest.",
    answer: { E: 2, V: 2, M: 3 },
    explanation: {
      E: "No response to voice; eyes open only with painful stimulus → E2.",
      V: "Only moans/sounds with no intelligible words → V2 (incomprehensible).",
      M: "Arms flexing and curling toward the chest is decorticate posturing → M3.",
    },
  },
  {
    id: "brainstem",
    title: "Scenario 3 — Suspected brainstem lesion",
    vignette:
      "A patient in the ICU with a suspected midbrain lesion has closed eyes that do not open to voice or to pain. They produce no sounds. When you apply painful stimulus, the arms and legs extend out and go rigid.",
    answer: { E: 1, V: 1, M: 2 },
    explanation: {
      E: "No eye opening to any stimulus → E1.",
      V: "No sounds at all → V1.",
      M: "Extension with rigidity is decerebrate posturing → M2 (deeper/worse lesion than decorticate).",
    },
  },
];

type Component = "E" | "V" | "M";
type Responses = Record<string, Partial<Record<Component, number>>>;

function optionsFor(c: Component): Option[] {
  return c === "E" ? EYE_OPTIONS : c === "V" ? VERBAL_OPTIONS : MOTOR_OPTIONS;
}

function interpretTotal(total: number): string {
  if (total >= 13) return "Mild";
  if (total >= 9) return "Moderate";
  return "Severe";
}

export default function GCSScenarios() {
  const [responses, setResponses] = useState<Responses>({});
  const [submitted, setSubmitted] = useState(false);

  const setValue = (scenarioId: string, component: Component, score: number) => {
    setResponses((r) => ({
      ...r,
      [scenarioId]: { ...r[scenarioId], [component]: score },
    }));
  };

  const handleSubmit = () => setSubmitted(true);
  const handleReset = () => {
    setResponses({});
    setSubmitted(false);
  };

  const allAnswered = SCENARIOS.every((s) => {
    const r = responses[s.id];
    return r && r.E !== undefined && r.V !== undefined && r.M !== undefined;
  });

  const totalCorrect = SCENARIOS.reduce((acc, s) => {
    const r = responses[s.id];
    if (!r) return acc;
    let n = 0;
    if (r.E === s.answer.E) n++;
    if (r.V === s.answer.V) n++;
    if (r.M === s.answer.M) n++;
    return acc + n;
  }, 0);
  const totalPossible = SCENARIOS.length * 3;

  return (
    <div className="not-prose my-8 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-sand-900">
          Apply the Glasgow Coma Scale
        </h3>
        <p className="mt-1 text-sm text-sand-600">
          Read each scenario, assign an E / V / M score, then submit to check
          your work. Three components × three scenarios = 9 points total.
        </p>
      </div>

      {SCENARIOS.map((s) => {
        const r = responses[s.id] ?? {};
        const userTotal =
          r.E !== undefined && r.V !== undefined && r.M !== undefined
            ? r.E + r.V + r.M
            : null;
        const correctTotal = s.answer.E + s.answer.V + s.answer.M;

        return (
          <div
            key={s.id}
            className="rounded-2xl border border-sand-200 bg-white p-5"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-sand-500">
              {s.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-sand-800">
              {s.vignette}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(["E", "V", "M"] as Component[]).map((c) => {
                const userScore = r[c];
                const correctScore = s.answer[c];
                const isCorrect = submitted && userScore === correctScore;
                const isWrong =
                  submitted && userScore !== undefined && userScore !== correctScore;

                return (
                  <label key={c} className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-500">
                      {c === "E"
                        ? "Eye Opening"
                        : c === "V"
                          ? "Verbal"
                          : "Motor"}
                    </span>
                    <select
                      value={userScore ?? ""}
                      disabled={submitted}
                      onChange={(e) =>
                        setValue(s.id, c, parseInt(e.target.value))
                      }
                      className={`w-full rounded-lg border px-3 py-2 text-sm text-sand-900 transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-400 ${
                        isCorrect
                          ? "border-green-400 bg-green-50"
                          : isWrong
                            ? "border-red-400 bg-red-50"
                            : "border-sand-200 bg-white"
                      } ${submitted ? "cursor-not-allowed" : ""}`}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      {optionsFor(c).map((opt) => (
                        <option key={opt.score} value={opt.score}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
            </div>

            {/* Per-scenario total */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-sand-500">
                Running total:{" "}
                <span className="font-mono font-semibold text-sand-800">
                  {userTotal !== null ? userTotal : "—"}
                </span>
                {userTotal !== null && (
                  <span className="ml-2 text-sand-400">
                    ({interpretTotal(userTotal)})
                  </span>
                )}
              </p>
              {submitted && (
                <p className="text-xs font-semibold text-sand-700">
                  Correct: <span className="font-mono">{correctTotal}</span> (
                  {interpretTotal(correctTotal)})
                </p>
              )}
            </div>

            {/* Feedback */}
            {submitted && (
              <div className="mt-4 space-y-2 rounded-xl bg-sand-50 p-4">
                {(["E", "V", "M"] as Component[]).map((c) => {
                  const userScore = r[c];
                  const correctScore = s.answer[c];
                  const isCorrect = userScore === correctScore;
                  const correctOpt = optionsFor(c).find(
                    (o) => o.score === correctScore
                  );
                  return (
                    <div key={c} className="flex items-start gap-2 text-xs">
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                          isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <p className="text-sand-700">
                        <span className="font-semibold">
                          {c === "E" ? "Eye" : c === "V" ? "Verbal" : "Motor"}:
                        </span>{" "}
                        {isCorrect ? (
                          <>Correct — {correctOpt?.label}.</>
                        ) : (
                          <>
                            Answer is <span className="font-semibold">{correctOpt?.label}</span>.{" "}
                          </>
                        )}
                        <span className="text-sand-500">{s.explanation[c]}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer: submit / result */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white p-5">
        {submitted ? (
          <>
            <p className="text-sm text-sand-700">
              You got{" "}
              <span className="font-mono font-semibold text-sand-900">
                {totalCorrect}/{totalPossible}
              </span>{" "}
              individual scores correct.
            </p>
            <button
              onClick={handleReset}
              className="rounded-lg bg-sand-900 px-4 py-2 text-sm font-medium text-sand-50 transition-colors hover:bg-sand-800"
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-sand-500">
              {allAnswered
                ? "All set — submit when you're ready."
                : "Fill out every E / V / M field before submitting."}
            </p>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="rounded-lg bg-terracotta-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:bg-sand-200 disabled:text-sand-400"
            >
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
