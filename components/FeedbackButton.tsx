"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type FeedbackState = "idle" | "submitting" | "success" | "error";

const feedbackOptions = [
  { value: "content_issue", label: "Content issue" },
  { value: "quiz_issue", label: "Quiz issue" },
  { value: "bug", label: "Site bug" },
  { value: "suggestion", label: "Suggestion" },
  { value: "other", label: "Other" },
];

export default function FeedbackButton() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<FeedbackState>("idle");
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    messageRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const formData = new FormData(event.currentTarget);
    const body = {
      type: String(formData.get("type") ?? "other"),
      message: String(formData.get("message") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      pageUrl: `${window.location.pathname}${window.location.search}`,
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Feedback could not be submitted.");
      }

      formRef.current?.reset();
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Feedback could not be submitted.");
    }
  }

  function closeModal() {
    setOpen(false);
    setStatus("idle");
    setError(null);
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-y-auto bg-sand-900/40 px-4 py-8 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="my-auto w-full max-w-md rounded-2xl border border-sand-200 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="feedback-title" className="text-base font-semibold text-sand-900">
              Send feedback
            </h2>
            <p className="mt-1 text-sm text-sand-500">
              Reports are saved with the current page.
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close feedback form"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sand-500 transition-colors hover:bg-sand-100 hover:text-sand-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {status === "success" ? (
          <div className="rounded-xl border border-sage-200 bg-sage-100 px-4 py-5 text-sm text-sage-700">
            Feedback submitted. Thank you.
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-sand-700">Type</span>
              <select
                name="type"
                defaultValue="content_issue"
                className="mt-1 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-sand-800 outline-none transition focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/15"
              >
                {feedbackOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-sand-700">Message</span>
              <textarea
                ref={messageRef}
                name="message"
                required
                minLength={5}
                maxLength={4000}
                rows={5}
                className="mt-1 w-full resize-y rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-sand-800 outline-none transition placeholder:text-sand-400 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/15"
                placeholder="What should be fixed or improved?"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-sand-700">Contact email</span>
              <input
                name="contactEmail"
                type="email"
                maxLength={254}
                className="mt-1 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-sand-800 outline-none transition placeholder:text-sand-400 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/15"
                placeholder="Optional"
              />
            </label>

            {status === "error" && (
              <div className="rounded-xl border border-clay-200 bg-clay-100 px-3 py-2 text-sm text-terracotta-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-sand-600 transition-all hover:border-sand-300 hover:text-sand-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-xl bg-sand-900 px-4 py-2 text-sm font-semibold text-sand-50 transition-colors hover:bg-sand-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-xs font-medium text-sand-600 transition-all hover:border-sand-300 hover:text-sand-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
        </svg>
        Feedback
      </button>

      {mounted && open ? createPortal(modal, document.body) : null}
    </>
  );
}
