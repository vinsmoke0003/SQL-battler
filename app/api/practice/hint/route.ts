import { NextResponse } from "next/server";
import { getQuestion } from "@/lib/questions";
import { HINT_PENALTIES } from "@/lib/scoring/scoring";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { questionId?: string; index?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const question = getQuestion(String(body.questionId ?? ""));
  if (!question) return NextResponse.json({ error: "Unknown question." }, { status: 404 });
  const index = Number(body.index) || 0;
  const hint = question.hints[index];
  if (!hint) return NextResponse.json({ error: "No more hints for this question." }, { status: 400 });
  return NextResponse.json({ hint, penalty: HINT_PENALTIES[index] ?? 0 });
}
