import { NextResponse } from "next/server";
import { getCoding } from "@/lib/mock-tests";

export const runtime = "nodejs";

/**
 * Returns the full test suite, hidden cases included, so the browser worker can
 * grade a submission. Hidden cases are withheld until submit so the candidate
 * can't reverse-engineer them from the visible samples.
 */
export async function POST(req: Request) {
  let body: { questionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const question = getCoding(String(body.questionId ?? ""));
  if (!question) return NextResponse.json({ error: "Unknown question." }, { status: 404 });
  return NextResponse.json({ testCases: question.testCases });
}
