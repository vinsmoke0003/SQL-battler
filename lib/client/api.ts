"use client";

import type { DatasetSchema } from "@/lib/datasets";
import type { PublicQuestion, RoomDifficulty } from "@/lib/questions/types";
import type { QuestionHistory } from "@/lib/questions/select";
import type { RunOutcome } from "@/lib/sql-runner/sandbox";
import type { ScoreBreakdown } from "@/lib/scoring/scoring";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export function runQuery(datasetId: string, sql: string): Promise<RunOutcome> {
  return post<RunOutcome>("/api/query", { datasetId, sql });
}

const schemaCache = new Map<string, Promise<DatasetSchema>>();

export function fetchSchema(datasetId: string): Promise<DatasetSchema> {
  let cached = schemaCache.get(datasetId);
  if (!cached) {
    cached = fetch(`/api/datasets/${datasetId}`).then(async (res) => {
      if (!res.ok) throw new Error("Could not load the database schema.");
      return (await res.json()) as DatasetSchema;
    });
    schemaCache.set(datasetId, cached);
  }
  return cached;
}

export interface PracticeNextResponse {
  question: PublicQuestion | null;
  remaining: number;
}

export function fetchPracticeQuestion(input: {
  difficulty: RoomDifficulty;
  history: QuestionHistory;
  exclude: string[];
  only?: string[];
}): Promise<PracticeNextResponse> {
  return post<PracticeNextResponse>("/api/practice/next", input);
}

export interface PracticeSubmitResponse {
  correct: boolean;
  feedback: string;
  breakdown?: ScoreBreakdown;
}

export function submitPractice(input: {
  questionId: string;
  sql: string;
  solveSeconds: number;
  attempts: number;
  hintsUsed: number;
  streak: number;
}): Promise<PracticeSubmitResponse> {
  return post<PracticeSubmitResponse>("/api/practice/submit", input);
}

export function fetchPracticeHint(questionId: string, index: number): Promise<{ hint: string; penalty: number }> {
  return post("/api/practice/hint", { questionId, index });
}

export function fetchSolution(questionId: string): Promise<{ solution: string }> {
  return post("/api/practice/solution", { questionId });
}
