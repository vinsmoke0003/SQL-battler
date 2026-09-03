import { questionsByDifficulty } from "./index";
import type { Difficulty, QuestionDef, RoomDifficulty } from "./types";

/**
 * Per-question history a player carries (stored client-side in practice mode,
 * server-side per room during battles).
 */
export interface QuestionHistoryEntry {
  questionId: string;
  attempts: number;
  solved: boolean;
  /** Seconds taken to solve, or null if never solved. */
  bestTime: number | null;
  /** Epoch millis of the most recent time this question was shown. */
  lastSeen: number;
}

export type QuestionHistory = Record<string, QuestionHistoryEntry>;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick `count` questions of one difficulty.
 *
 * Unseen questions come first, in random order. When those run out a new
 * "cycle" starts: previously-seen questions are recycled, prioritising ones
 * the player failed, then ones solved slowly, then least recently seen.
 * `exclude` is a hard exclusion (e.g. questions already used in this room).
 */
export function selectForDifficulty(
  difficulty: Difficulty,
  count: number,
  history: QuestionHistory = {},
  exclude: Set<string> = new Set(),
): QuestionDef[] {
  const pool = questionsByDifficulty(difficulty).filter((q) => !exclude.has(q.id));
  const unseen = shuffle(pool.filter((q) => !history[q.id]));
  if (unseen.length >= count) return unseen.slice(0, count);

  const seen = pool.filter((q) => history[q.id]);
  const recentCutoff = Date.now() - 10 * 60 * 1000;
  const scored = seen
    .map((q) => {
      const h = history[q.id];
      return {
        q,
        failed: h.solved ? 0 : 1,
        slow: h.bestTime ?? 0,
        recent: h.lastSeen > recentCutoff ? 1 : 0,
        lastSeen: h.lastSeen,
        jitter: Math.random(),
      };
    })
    .sort(
      (a, b) =>
        a.recent - b.recent ||
        b.failed - a.failed ||
        b.slow - a.slow ||
        a.lastSeen - b.lastSeen ||
        a.jitter - b.jitter,
    )
    .map((s) => s.q);

  return [...unseen, ...scored].slice(0, count);
}

/** Split a mixed contest so difficulty ramps up: ~40% easy, 40% medium, 20% hard. */
export function mixedSplit(count: number): Record<Difficulty, number> {
  const hard = Math.max(1, Math.round(count * 0.2));
  const easy = Math.round(count * 0.4);
  const medium = count - easy - hard;
  return { easy, medium, hard };
}

export function selectQuestions(
  difficulty: RoomDifficulty,
  count: number,
  history: QuestionHistory = {},
  exclude: Set<string> = new Set(),
): QuestionDef[] {
  if (difficulty !== "mixed") return selectForDifficulty(difficulty, count, history, exclude);
  const split = mixedSplit(count);
  return [
    ...selectForDifficulty("easy", split.easy, history, exclude),
    ...selectForDifficulty("medium", split.medium, history, exclude),
    ...selectForDifficulty("hard", split.hard, history, exclude),
  ];
}
