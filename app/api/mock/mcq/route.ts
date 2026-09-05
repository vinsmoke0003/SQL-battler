import { NextResponse } from "next/server";
import { getMcq, MCQ_POINTS } from "@/lib/mock-tests";

export const runtime = "nodejs";

/** Grades one MCQ. The answer key never reaches the client until an answer is sent. */
export async function POST(req: Request) {
  let body: { questionId?: string; answerIndex?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const question = getMcq(String(body.questionId ?? ""));
  if (!question) return NextResponse.json({ error: "Unknown question." }, { status: 404 });

  const chosen = Number(body.answerIndex);
  const correct = chosen === question.answerIndex;
  return NextResponse.json({
    correct,
    correctIndex: question.answerIndex,
    explanation: question.explanation,
    points: correct ? MCQ_POINTS : 0,
  });
}
