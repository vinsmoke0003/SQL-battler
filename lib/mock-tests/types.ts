import type { Difficulty } from "@/lib/questions/types";

/** A single-answer multiple choice question (cognitive + technical sections). */
export interface McqQuestion {
  id: string;
  /** Optional code / passage block rendered above the options in monospace. */
  code?: string;
  prompt: string;
  options: string[];
  /** Index into `options`. */
  answerIndex: number;
  explanation: string;
  topic: string;
  difficulty: Difficulty;
}

export interface CodingTestCase {
  /** Arguments passed to the candidate's function, in order. */
  input: unknown[];
  expected: unknown;
  /** Hidden cases still run, but their inputs are not shown before submitting. */
  hidden?: boolean;
}

/** A coding-round question. Solutions run as JavaScript in a sandboxed worker. */
export interface CodingQuestion {
  id: string;
  title: string;
  statement: string;
  /** e.g. "function minHouses(r, unit, arr)" — the shape the tests call. */
  functionName: string;
  signature: string;
  constraints: string[];
  starterCode: string;
  testCases: CodingTestCase[];
  solution: string;
  explanation: string;
  topic: string;
  difficulty: Difficulty;
}

export type SectionKind = "mcq" | "sql" | "coding";

export interface MockSection {
  id: string;
  name: string;
  /** What this section covers and how it appears in the real assessment. */
  blurb: string;
  kind: SectionKind;
  /** Ids resolved against the MCQ bank, the SQL question bank, or the coding bank. */
  questionIds: string[];
  /** Questions / minutes in the real Accenture paper, shown for context. */
  realCount?: number;
  realMinutes?: number;
}

export interface MockTest {
  id: string;
  company: string;
  title: string;
  summary: string;
  /** Notes on how the company frames this paper. */
  format: string[];
  sections: MockSection[];
  /** Every mock test is untimed for now. */
  timed: false;
}

/** Points awarded per question kind. MCQs are quick, coding is worth most. */
export const MCQ_POINTS = 4;
export const CODING_POINTS = 25;
