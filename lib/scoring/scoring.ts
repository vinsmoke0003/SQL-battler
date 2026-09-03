import type { Difficulty } from "@/lib/questions/types";

export const BASE_POINTS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

export const WRONG_SUBMISSION_PENALTY = 2;
export const HINT_PENALTIES = [2, 3];

export interface ScoreBreakdown {
  base: number;
  speedBonus: number;
  firstTryBonus: number;
  streakBonus: number;
  hintPenalty: number;
  total: number;
}

export function speedBonus(solveSeconds: number): number {
  if (solveSeconds < 60) return 5;
  if (solveSeconds < 120) return 3;
  if (solveSeconds < 180) return 1;
  return 0;
}

/** Bonus awarded when the streak *reaches* the given length. */
export function streakBonus(streak: number): number {
  if (streak === 10) return 20;
  if (streak === 5) return 10;
  if (streak === 3) return 5;
  return 0;
}

export function hintPenalty(hintsUsed: number): number {
  return HINT_PENALTIES.slice(0, hintsUsed).reduce((a, b) => a + b, 0);
}

export function scoreSolve(input: {
  difficulty: Difficulty;
  solveSeconds: number;
  attempts: number; // including the successful one
  streak: number; // streak length after this solve
  hintsUsed: number;
}): ScoreBreakdown {
  const base = BASE_POINTS[input.difficulty];
  const speed = speedBonus(input.solveSeconds);
  const firstTry = input.attempts === 1 ? 3 : 0;
  const streak = streakBonus(input.streak);
  const hints = hintPenalty(input.hintsUsed);
  return {
    base,
    speedBonus: speed,
    firstTryBonus: firstTry,
    streakBonus: streak,
    hintPenalty: hints,
    total: Math.max(0, base + speed + firstTry + streak - hints),
  };
}
