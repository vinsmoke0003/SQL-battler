"use client";

import type { QuestionHistory, QuestionHistoryEntry } from "@/lib/questions/select";

const HISTORY_KEY = "sqlbattle:history";
const MISTAKES_KEY = "sqlbattle:mistakes";

export function loadHistory(): QuestionHistory {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "{}") as QuestionHistory;
  } catch {
    return {};
  }
}

function saveHistory(history: QuestionHistory) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function recordSeen(questionId: string) {
  const history = loadHistory();
  const entry: QuestionHistoryEntry = history[questionId] ?? {
    questionId,
    attempts: 0,
    solved: false,
    bestTime: null,
    lastSeen: 0,
  };
  entry.lastSeen = Date.now();
  history[questionId] = entry;
  saveHistory(history);
}

export function recordAttempt(questionId: string, solved: boolean, timeSec: number | null) {
  const history = loadHistory();
  const entry: QuestionHistoryEntry = history[questionId] ?? {
    questionId,
    attempts: 0,
    solved: false,
    bestTime: null,
    lastSeen: Date.now(),
  };
  entry.attempts += 1;
  entry.lastSeen = Date.now();
  if (solved) {
    entry.solved = true;
    if (timeSec !== null && (entry.bestTime === null || timeSec < entry.bestTime)) {
      entry.bestTime = timeSec;
    }
  }
  history[questionId] = entry;
  saveHistory(history);
}

/** Question ids the player failed or skipped in their most recent battle. */
export function saveMistakes(questionIds: string[]) {
  try {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(questionIds));
  } catch {
    // ignore
  }
}

export function loadMistakes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(MISTAKES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
