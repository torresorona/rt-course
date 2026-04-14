"use client";

import { useEffect, useState } from "react";

interface Answer {
  id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

interface QuizData {
  id: number;
  title: string;
  questions: Question[];
}

interface ScoreResult {
  score: number;
  correct: number;
  total: number;
  results: { questionId: number; correct: boolean }[];
}

export default function Quiz({ slug }: { slug: string }) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/quiz/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load quiz");
        return res.json();
      })
      .then(setQuiz)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quiz) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleSlug: slug, responses }),
      });

      if (!res.ok) throw new Error("Failed to submit quiz");
      const data: ScoreResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="not-prose my-10 flex items-center justify-center rounded-2xl border border-sand-200 bg-sand-50 p-12">
        <div className="flex items-center gap-3 text-sand-500">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading quiz...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="not-prose my-10 rounded-2xl border border-clay-200 bg-clay-100 p-6 text-center text-sm text-terracotta-600">
        {error}
      </div>
    );
  }

  if (!quiz) return null;

  const answered = Object.keys(responses).length;
  const total = quiz.questions.length;

  // Results view
  if (result) {
    const passed = result.score >= 80;
    return (
      <div className="not-prose my-10">
        {/* Score card */}
        <div
          className={`mb-6 rounded-2xl p-8 text-center ${
            passed
              ? "bg-sage-100 text-sage-700"
              : "bg-clay-100 text-terracotta-600"
          }`}
        >
          <p className="mb-1 text-4xl font-bold">{result.score}%</p>
          <p className="text-sm font-medium opacity-80">
            {result.correct} of {result.total} correct
          </p>
          {passed && (
            <p className="mt-2 text-sm font-medium">
              Great work! Module complete.
            </p>
          )}
        </div>

        {/* Question results */}
        <div className="space-y-3">
          {quiz.questions.map((q) => {
            const r = result.results.find((r) => r.questionId === q.id);
            return (
              <div
                key={q.id}
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  r?.correct
                    ? "border-sage-200 bg-white"
                    : "border-clay-200 bg-white"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    r?.correct
                      ? "bg-sage-100 text-sage-700"
                      : "bg-clay-100 text-terracotta-600"
                  }`}
                >
                  {r?.correct ? "\u2713" : "\u2717"}
                </span>
                <p className="text-sm text-sand-800">{q.text}</p>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setResult(null);
            setResponses({});
          }}
          className="mt-6 w-full rounded-xl bg-sand-900 px-5 py-3 text-sm font-semibold text-sand-50 transition-colors hover:bg-sand-800"
        >
          Try again
        </button>
      </div>
    );
  }

  // Quiz form
  return (
    <div className="not-prose my-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-sand-900">{quiz.title}</h3>
        <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-sand-600">
          {answered} / {total}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {quiz.questions.map((q, qi) => (
            <div key={q.id} className="rounded-2xl border border-sand-200 bg-white p-6">
              <p className="mb-4 text-sm font-semibold text-sand-800">
                <span className="mr-2 text-sand-400">{qi + 1}.</span>
                {q.text}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.answers.map((a) => {
                  const selected = responses[String(q.id)] === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() =>
                        setResponses((prev) => ({
                          ...prev,
                          [String(q.id)]: a.id,
                        }))
                      }
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        selected
                          ? "border-terracotta-500 bg-clay-100 font-medium text-sand-900 shadow-sm"
                          : "border-sand-200 bg-sand-50 text-sand-700 hover:border-sand-300 hover:bg-sand-100"
                      }`}
                    >
                      {a.text}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting || answered < total}
          className="mt-6 w-full rounded-xl bg-sand-900 px-5 py-3.5 text-sm font-semibold text-sand-50 transition-all hover:bg-sand-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Checking answers..." : "Submit answers"}
        </button>
      </form>
    </div>
  );
}
