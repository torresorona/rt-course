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

  if (loading) return <p className="text-gray-500">Loading quiz…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!quiz) return null;

  return (
    <div className="my-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
      <h3 className="mb-4 text-lg font-semibold">{quiz.title}</h3>

      {result ? (
        <div>
          <p className="mb-4 text-lg">
            Score: <strong>{result.score}%</strong> ({result.correct}/
            {result.total})
          </p>
          <ul className="space-y-2">
            {quiz.questions.map((q) => {
              const r = result.results.find((r) => r.questionId === q.id);
              return (
                <li key={q.id} className="flex items-start gap-2">
                  <span className={r?.correct ? "text-green-600" : "text-red-600"}>
                    {r?.correct ? "✓" : "✗"}
                  </span>
                  <span>{q.text}</span>
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => {
              setResult(null);
              setResponses({});
            }}
            className="mt-4 rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <ol className="list-decimal space-y-6 pl-5">
            {quiz.questions.map((q) => (
              <li key={q.id}>
                <p className="mb-2 font-medium">{q.text}</p>
                <div className="space-y-1">
                  {q.answers.map((a) => (
                    <label
                      key={a.id}
                      className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100"
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={a.id}
                        checked={responses[String(q.id)] === a.id}
                        onChange={() =>
                          setResponses((prev) => ({
                            ...prev,
                            [String(q.id)]: a.id,
                          }))
                        }
                      />
                      <span>{a.text}</span>
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <button
            type="submit"
            disabled={
              submitting ||
              Object.keys(responses).length < quiz.questions.length
            }
            className="mt-6 rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Answers"}
          </button>
        </form>
      )}
    </div>
  );
}
