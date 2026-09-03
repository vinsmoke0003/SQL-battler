import type { Difficulty, PublicQuestion, RoomDifficulty } from "@/lib/questions/types";
import type { ScoreBreakdown } from "@/lib/scoring/scoring";

export type RoomStatus = "lobby" | "live" | "finished";
export type QuestionOrder = "same" | "random";

export interface RoomSettings {
  name: string;
  difficulty: RoomDifficulty;
  questionCount: number;
  durationMinutes: number;
  questionOrder: QuestionOrder;
  /** Deduct points for incorrect submissions. */
  penalty: boolean;
}

export interface PlayerIdentity {
  id: string;
  nickname: string;
}

/** What every client can see about every player. Never includes SQL. */
export interface PlayerPublic {
  id: string;
  nickname: string;
  isHost: boolean;
  connected: boolean;
  score: number;
  /** 0-based index of the question the player is currently on. */
  questionIndex: number;
  solvedCount: number;
  streak: number;
  finished: boolean;
}

export interface RoomPublic {
  code: string;
  settings: RoomSettings;
  status: RoomStatus;
  hostId: string;
  players: PlayerPublic[];
  round: number;
  startedAt: number | null;
  endsAt: number | null;
  /** Server clock at send time, so clients can correct their timer drift. */
  serverNow: number;
}

export interface QuestionRecord {
  questionId: string;
  title: string;
  difficulty: Difficulty;
  solved: boolean;
  skipped: boolean;
  attempts: number;
  hintsUsed: number;
  /** Seconds from question shown to correct submission. */
  timeSec: number | null;
  points: number;
  lastSql: string;
}

export interface DifficultyStat {
  solved: number;
  total: number;
}

export interface PlayerResult extends PlayerPublic {
  rank: number;
  accuracy: number;
  avgSolveTime: number | null;
  records: QuestionRecord[];
  byDifficulty: Record<Difficulty, DifficultyStat>;
  weakTags: string[];
}

export interface SolutionReveal {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  datasetId: string;
  solution: string;
}

export interface BattleResults {
  code: string;
  settings: RoomSettings;
  round: number;
  players: PlayerResult[];
  questions: SolutionReveal[];
  finishedAt: number;
}

export interface CurrentQuestion {
  question: PublicQuestion | null;
  index: number;
  total: number;
  /** Epoch millis when this question was first shown to the player. */
  shownAt: number;
  attempts: number;
  hintsUsed: number;
  revealedHints: string[];
}

export interface SubmitResponse {
  correct: boolean;
  feedback: string;
  breakdown?: ScoreBreakdown;
  penalty?: number;
  score: number;
  streak: number;
  /** True when the player has no more questions. */
  finished: boolean;
}

export type BattleEvent =
  | { type: "first_solve"; nickname: string; questionIndex: number }
  | { type: "streak"; nickname: string; streak: number }
  | { type: "finished_all"; nickname: string }
  | { type: "player_joined"; nickname: string }
  | { type: "player_left"; nickname: string };

export type Ack<T> = ({ ok: true } & T) | { ok: false; error: string };

export interface ClientToServerEvents {
  "room:create": (
    payload: { player: PlayerIdentity; settings: RoomSettings },
    cb: (r: Ack<{ code: string }>) => void,
  ) => void;
  "room:join": (
    payload: { code: string; player: PlayerIdentity },
    cb: (r: Ack<{ room: RoomPublic }>) => void,
  ) => void;
  "room:leave": (payload: { code: string }) => void;
  "room:start": (payload: { code: string }, cb: (r: Ack<object>) => void) => void;
  "room:kick": (payload: { code: string; playerId: string }, cb: (r: Ack<object>) => void) => void;
  "room:end": (payload: { code: string }, cb: (r: Ack<object>) => void) => void;
  "room:rematch": (payload: { code: string }, cb: (r: Ack<object>) => void) => void;
  "room:results": (payload: { code: string }, cb: (r: Ack<{ results: BattleResults }>) => void) => void;
  "battle:current": (payload: { code: string }, cb: (r: Ack<CurrentQuestion>) => void) => void;
  "battle:submit": (payload: { code: string; sql: string }, cb: (r: Ack<SubmitResponse>) => void) => void;
  "battle:hint": (
    payload: { code: string },
    cb: (r: Ack<{ hint: string; penalty: number; hintsUsed: number }>) => void,
  ) => void;
  "battle:skip": (payload: { code: string }, cb: (r: Ack<{ finished: boolean }>) => void) => void;
}

export interface ServerToClientEvents {
  "room:state": (room: RoomPublic) => void;
  "room:reset": () => void;
  "room:kicked": () => void;
  "battle:started": () => void;
  "battle:event": (event: BattleEvent) => void;
  "battle:finished": () => void;
}
