import { NextResponse } from "next/server";
import { db } from "@/db";
import { feedback } from "@/db/schema";

const feedbackTypes = new Set([
  "content_issue",
  "quiz_issue",
  "bug",
  "suggestion",
  "other",
]);

interface FeedbackBody {
  type?: string;
  message?: string;
  pageUrl?: string;
  contactEmail?: string;
}

function isFeedbackBody(value: unknown): value is FeedbackBody {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendFeedbackAlert({
  id,
  type,
  message,
  pageUrl,
  contactEmail,
  userId,
}: {
  id: number;
  type: string;
  message: string;
  pageUrl: string | null;
  contactEmail: string | null;
  userId: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const alertTo = process.env.FEEDBACK_ALERT_TO ?? process.env.RESEND_ALERT_TO;
  const from = process.env.FEEDBACK_ALERT_FROM ?? "RT Course <onboarding@resend.dev>";

  if (!apiKey || !alertTo) {
    console.warn("Feedback alert skipped: missing RESEND_API_KEY or FEEDBACK_ALERT_TO");
    return false;
  }

  const details = [
    `Type: ${type}`,
    pageUrl ? `Page: ${pageUrl}` : null,
    contactEmail ? `Contact: ${contactEmail}` : null,
    userId ? `Clerk user: ${userId}` : null,
  ].filter(Boolean);

  const htmlDetails = details
    .map((detail) => `<li>${escapeHtml(detail!)}</li>`)
    .join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [alertTo],
      subject: `New RT Course feedback #${id}`,
      text: [`New RT Course feedback #${id}`, "", ...details, "", message].join("\n"),
      html: `
        <h2>New RT Course feedback #${id}</h2>
        <ul>${htmlDetails}</ul>
        <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Feedback alert failed:", errorText);
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isFeedbackBody(body)) {
    return NextResponse.json({ error: "Invalid feedback payload" }, { status: 400 });
  }

  const type = feedbackTypes.has(body.type ?? "") ? body.type! : "other";
  const message = cleanString(body.message, 4000);
  const pageUrl = cleanString(body.pageUrl, 500);
  const contactEmail = cleanString(body.contactEmail, 254);
  const userAgent = cleanString(request.headers.get("user-agent"), 500);

  if (!message || message.length < 5) {
    return NextResponse.json(
      { error: "Feedback must be at least 5 characters." },
      { status: 400 }
    );
  }

  const [row] = await db
    .insert(feedback)
    .values({
      userId: null,
      type,
      message,
      pageUrl,
      contactEmail,
      userAgent,
    })
    .returning({ id: feedback.id });

  let alertSent = false;
  try {
    alertSent = await sendFeedbackAlert({
      id: row.id,
      type,
      message,
      pageUrl,
      contactEmail,
      userId: null,
    });
  } catch (error) {
    console.error("Feedback alert failed:", error);
  }

  return NextResponse.json({ ok: true, id: row.id, alertSent });
}
