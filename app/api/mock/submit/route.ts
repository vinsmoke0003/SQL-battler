import { NextResponse } from "next/server";
import { getExpectedOutput, getQuestion } from "@/lib/questions";
import { runQuery } from "@/lib/sql-runner/sandbox";
import { compareResults } from "@/lib/validation/compare";
import { BASE_POINTS } from "@/lib/scoring/scoring";

export const runtime = "nodejs";

/**
 * Mock tests are untimed, so a solve is worth its base points flat — no speed
 * or streak bonuses, which would only reward rushing.
 */
export async function POST(req: Request) {
  let body: { questionId?: string; sql?: string; hintsUsed?: number };
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

  const base = BASE_POINTS[question.difficulty];
  return NextResponse.json({
    correct: true,
    feedback: "",
    breakdown: {
      base,
      speedBonus: 0,
      firstTryBonus: 0,
      streakBonus: 0,
      hintPenalty: 0,
      total: base,
    },
  });
}
