import { NextResponse } from "next/server";
import { getCoding, getMcq } from "@/lib/mock-tests";
import { getQuestion } from "@/lib/questions";

export const runtime = "nodejs";

/** Reference answers, released for the review screen once a paper is finished. */
export async function POST(req: Request) {
  let body: { questionId?: string; kind?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const id = String(body.questionId ?? "");

  if (body.kind === "mcq") {
    const q = getMcq(id);
    if (!q) return NextResponse.json({ error: "Unknown question." }, { status: 404 });
    return NextResponse.json({ correctIndex: q.answerIndex, explanation: q.explanation });
  }
  if (body.kind === "coding") {
    const q = getCoding(id);
    if (!q) return NextResponse.json({ error: "Unknown question." }, { status: 404 });
    return NextResponse.json({ solution: q.solution, explanation: q.explanation });
  }
  const q = getQuestion(id);
  if (!q) return NextResponse.json({ error: "Unknown question." }, { status: 404 });
  return NextResponse.json({ solution: q.solution });
}
