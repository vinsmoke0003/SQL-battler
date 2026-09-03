import type { Cell } from "@/lib/sql-runner/sandbox";

export type Difficulty = "easy" | "medium" | "hard";
export type RoomDifficulty = Difficulty | "mixed";

export type Tag =
  | "SELECT"
  | "WHERE"
  | "DISTINCT"
  | "ORDER BY"
  | "LIMIT"
  | "LIKE"
  | "IN"
  | "BETWEEN"
  | "NULL"
  | "AGGREGATION"
  | "GROUP BY"
  | "HAVING"
  | "JOIN"
  | "LEFT JOIN"
  | "SELF JOIN"
  | "SUBQUERY"
  | "CASE"
  | "DATE FUNCTION"
  | "STRING FUNCTION"
  | "WINDOW FUNCTION"
  | "CTE"
  | "SET OPERATION";

/** Authored question definition. Expected output is derived from `solution`. */
export interface QuestionDef {
  id: string;
  datasetId: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: Tag[];
  /** Reference solution, run once at startup to produce the expected output. */
  solution: string;
  /** When true the row order must match the expected output exactly. */
  orderMatters: boolean;
  hints: string[];
}

export interface ExpectedOutput {
  columns: string[];
  rows: Cell[][];
}

/** What the client is allowed to see while a question is live. */
export interface PublicQuestion {
  id: string;
  datasetId: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: Tag[];
  orderMatters: boolean;
  hintCount: number;
  points: number;
  expected: ExpectedOutput;
}
