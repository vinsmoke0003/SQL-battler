import { NextResponse } from "next/server";
import { getQuestion, questionsByDifficulty, toPublicQuestion } from "@/lib/questions";
import { selectQuestions, type QuestionHistory } from "@/lib/questions/select";
import type { RoomDifficulty } from "@/lib/questions/types";

export const runtime = "nodejs";

const DIFFICULTIES: RoomDifficulty[] = ["easy", "medium", "hard", "mixed"];

/**
 * Solo practice has no server-side session: the client sends its own history
 * (from localStorage) and the ids already used in this session, and we pick
 * the next question with the same cycle logic battles use.
 */
export async function POST(req: Request) {
  let body: {
    difficulty?: RoomDifficulty;
    history?: QuestionHistory;
    exclude?: string[];
    only?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const exclude = new Set(Array.isArray(body.exclude) ? body.exclude.map(String) : []);
  const history = body.history && typeof body.history === "object" ? body.history : {};

  // "Practice mistakes" mode: cycle through a fixed list of ids.
  if (Array.isArray(body.only)) {
    const pool = body.only.map((id) => getQuestion(String(id))).filter((q) => q && !exclude.has(q.id));
    const next = pool[0];
    return NextResponse.json({
      question: next ? await toPublicQuestion(next) : null,
      remaining: Math.max(0, pool.length - 1),
    });
  }

  const difficulty = DIFFICULTIES.includes(body.difficulty as RoomDifficulty)
    ? (body.difficulty as RoomDifficulty)
    : "easy";
  const [next] = selectQuestions(difficulty, 1, history, exclude);
  const total =
    difficulty === "mixed"
      ? questionsByDifficulty("easy").length +
        questionsByDifficulty("medium").length +
        questionsByDifficulty("hard").length
      : questionsByDifficulty(difficulty).length;

  return NextResponse.json({
    question: next ? await toPublicQuestion(next) : null,
    remaining: Math.max(0, total - exclude.size - 1),
  });
}
