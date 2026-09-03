import { NextResponse } from "next/server";
import { getQuestion } from "@/lib/questions";

export const runtime = "nodejs";

/** Solo practice only: reveals the reference solution for a question. */
export async function POST(req: Request) {
  let body: { questionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const question = getQuestion(String(body.questionId ?? ""));
  if (!question) return NextResponse.json({ error: "Unknown question." }, { status: 404 });
  return NextResponse.json({ solution: question.solution });
}
