import { NextResponse } from "next/server";
import { getExpectedOutput, getQuestion } from "@/lib/questions";
import { runQuery } from "@/lib/sql-runner/sandbox";
import { compareResults } from "@/lib/validation/compare";
import { scoreSolve } from "@/lib/scoring/scoring";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: {
    questionId?: string;
    sql?: string;
    solveSeconds?: number;
    attempts?: number;
    hintsUsed?: number;
    streak?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const question = getQuestion(String(body.questionId ?? ""));
  if (!question) return NextResponse.json({ error: "Unknown question." }, { status: 404 });

  const outcome = await runQuery(question.datasetId, String(body.sql ?? ""));
  if (!outcome.ok) return NextResponse.json({ correct: false, feedback: outcome.error });

  const expected = await getExpectedOutput(question);
  const cmp = compareResults(outcome.result, expected, question.orderMatters);
  if (!cmp.correct) return NextResponse.json({ correct: false, feedback: cmp.feedback });

  const breakdown = scoreSolve({
    difficulty: question.difficulty,
    solveSeconds: Math.max(0, Number(body.solveSeconds) || 0),
    attempts: Math.max(1, Number(body.attempts) || 1),
    streak: Math.max(1, Number(body.streak) || 1),
    hintsUsed: Math.max(0, Number(body.hintsUsed) || 0),
  });
  return NextResponse.json({ correct: true, feedback: "", breakdown });
}
