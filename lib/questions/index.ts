import { easyQuestions } from "./easy";
import { mediumQuestions } from "./medium";
import { hardQuestions } from "./hard";
import type { Difficulty, ExpectedOutput, PublicQuestion, QuestionDef } from "./types";
import { execTrusted, getDatabase } from "@/lib/sql-runner/sandbox";
import { BASE_POINTS } from "@/lib/scoring/scoring";

export type { Difficulty, RoomDifficulty, ExpectedOutput, PublicQuestion, QuestionDef, Tag } from "./types";

export const allQuestions: QuestionDef[] = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

const byId = new Map(allQuestions.map((q) => [q.id, q]));

export function getQuestion(id: string): QuestionDef | undefined {
  return byId.get(id);
}

export function questionsByDifficulty(difficulty: Difficulty): QuestionDef[] {
  return allQuestions.filter((q) => q.difficulty === difficulty);
}

export const questionCounts: Record<Difficulty, number> = {
  easy: easyQuestions.length,
  medium: mediumQuestions.length,
  hard: hardQuestions.length,
};

const expectedCache = new Map<string, ExpectedOutput>();

/** Run the reference solution once and cache the result as the expected output. */
export async function getExpectedOutput(question: QuestionDef): Promise<ExpectedOutput> {
  const cached = expectedCache.get(question.id);
  if (cached) return cached;
  const db = await getDatabase(question.datasetId);
  const result = execTrusted(db, question.solution);
  const expected: ExpectedOutput = { columns: result.columns, rows: result.rows };
  expectedCache.set(question.id, expected);
  return expected;
}

export async function toPublicQuestion(question: QuestionDef): Promise<PublicQuestion> {
  const expected = await getExpectedOutput(question);
  return {
    id: question.id,
    datasetId: question.datasetId,
    title: question.title,
    description: question.description,
    difficulty: question.difficulty,
    tags: question.tags,
    orderMatters: question.orderMatters,
    hintCount: question.hints.length,
    points: BASE_POINTS[question.difficulty],
    expected,
  };
}
