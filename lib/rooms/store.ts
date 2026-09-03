/**
 * In-memory room engine. Lives in the custom server process; all mutations go
 * through Socket.IO handlers in server.ts.
 */
import { getQuestion, getExpectedOutput, toPublicQuestion } from "@/lib/questions";
import type { Difficulty, QuestionDef } from "@/lib/questions/types";
import { selectQuestions } from "@/lib/questions/select";
import { runQuery } from "@/lib/sql-runner/sandbox";
import { compareResults } from "@/lib/validation/compare";
import { HINT_PENALTIES, WRONG_SUBMISSION_PENALTY, scoreSolve } from "@/lib/scoring/scoring";
import type {
  BattleEvent,
  BattleResults,
  CurrentQuestion,
  PlayerIdentity,
  PlayerPublic,
  PlayerResult,
  QuestionRecord,
  RoomPublic,
  RoomSettings,
  RoomStatus,
  SubmitResponse,
} from "./types";

interface Player {
  id: string;
  nickname: string;
  connected: boolean;
  score: number;
  questionIndex: number;
  streak: number;
  finished: boolean;
  /** This player's question order for the current round. */
  order: string[];
  records: QuestionRecord[];
  currentShownAt: number;
  currentAttempts: number;
  currentHints: string[];
  disconnectTimer: NodeJS.Timeout | null;
}

export interface Room {
  code: string;
  settings: RoomSettings;
  status: RoomStatus;
  hostId: string;
  players: Map<string, Player>;
  round: number;
  questionIds: string[];
  /** Questions used in any round of this room, so rematches get fresh ones. */
  usedQuestionIds: Set<string>;
  firstSolvers: Map<string, string>;
  startedAt: number | null;
  endsAt: number | null;
  finishedAt: number | null;
  endTimer: NodeJS.Timeout | null;
  lastActivity: number;
}

export interface RoomEvents {
  onState(room: Room): void;
  onEvent(room: Room, event: BattleEvent): void;
  onStarted(room: Room): void;
  onFinished(room: Room): void;
  onReset(room: Room): void;
  onKicked(room: Room, playerId: string): void;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const LOBBY_DISCONNECT_GRACE_MS = 20_000;
const ROOM_TTL_MS = 3 * 60 * 60 * 1000;
export const MAX_PLAYERS = 12;

export class RoomError extends Error {}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function sanitizeSettings(input: Partial<RoomSettings>): RoomSettings {
  const difficulty = (["easy", "medium", "hard", "mixed"] as const).includes(
    input.difficulty as never,
  )
    ? input.difficulty!
    : "easy";
  const questionCount = Math.min(20, Math.max(1, Math.round(Number(input.questionCount) || 5)));
  const durationMinutes = Math.min(180, Math.max(1, Math.round(Number(input.durationMinutes) || 15)));
  return {
    name: String(input.name ?? "").trim().slice(0, 40) || "SQL Battle",
    difficulty,
    questionCount,
    durationMinutes,
    questionOrder: input.questionOrder === "random" ? "random" : "same",
    penalty: Boolean(input.penalty),
  };
}

export function sanitizeNickname(name: string): string {
  return String(name ?? "").trim().replace(/\s+/g, " ").slice(0, 20) || "Player";
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  constructor(private events: RoomEvents) {
    setInterval(() => this.sweep(), 10 * 60 * 1000).unref();
  }

  // ───────────── lookup ─────────────

  get(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  require(code: string): Room {
    const room = this.get(code);
    if (!room) throw new RoomError("Room not found. Check the code and try again.");
    room.lastActivity = Date.now();
    return room;
  }

  requirePlayer(room: Room, playerId: string): Player {
    const player = room.players.get(playerId);
    if (!player) throw new RoomError("You are not in this room.");
    return player;
  }

  requireHost(room: Room, playerId: string): void {
    if (room.hostId !== playerId) throw new RoomError("Only the host can do that.");
  }

  private generateCode(): string {
    for (;;) {
      let code = "";
      for (let i = 0; i < 5; i++) {
        code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
      }
      if (!this.rooms.has(code)) return code;
    }
  }

  // ───────────── lobby ─────────────

  create(identity: PlayerIdentity, settings: RoomSettings): Room {
    const code = this.generateCode();
    const room: Room = {
      code,
      settings,
      status: "lobby",
      hostId: identity.id,
      players: new Map(),
      round: 0,
      questionIds: [],
      usedQuestionIds: new Set(),
      firstSolvers: new Map(),
      startedAt: null,
      endsAt: null,
      finishedAt: null,
      endTimer: null,
      lastActivity: Date.now(),
    };
    this.rooms.set(code, room);
    this.join(room, identity);
    return room;
  }

  join(room: Room, identity: PlayerIdentity): Player {
    const existing = room.players.get(identity.id);
    if (existing) {
      // Reconnect (page refresh, navigation between lobby and battle).
      existing.connected = true;
      existing.nickname = identity.nickname || existing.nickname;
      if (existing.disconnectTimer) {
        clearTimeout(existing.disconnectTimer);
        existing.disconnectTimer = null;
      }
      this.events.onState(room);
      return existing;
    }
    if (room.status !== "lobby") {
      throw new RoomError("This battle has already started.");
    }
    if (room.players.size >= MAX_PLAYERS) {
      throw new RoomError("This room is full.");
    }
    const player: Player = {
      id: identity.id,
      nickname: identity.nickname,
      connected: true,
      score: 0,
      questionIndex: 0,
      streak: 0,
      finished: false,
      order: [],
      records: [],
      currentShownAt: 0,
      currentAttempts: 0,
      currentHints: [],
      disconnectTimer: null,
    };
    room.players.set(player.id, player);
    this.events.onEvent(room, { type: "player_joined", nickname: player.nickname });
    this.events.onState(room);
    return player;
  }

  /** Socket dropped. In the lobby we give a grace period, then remove. */
  disconnect(room: Room, playerId: string): void {
    const player = room.players.get(playerId);
    if (!player) return;
    player.connected = false;
    this.events.onState(room);
    if (room.status === "lobby") {
      player.disconnectTimer = setTimeout(() => {
        if (!player.connected) this.leave(room, playerId);
      }, LOBBY_DISCONNECT_GRACE_MS);
    }
  }

  leave(room: Room, playerId: string): void {
    const player = room.players.get(playerId);
    if (!player) return;
    if (player.disconnectTimer) clearTimeout(player.disconnectTimer);
    room.players.delete(playerId);
    this.events.onEvent(room, { type: "player_left", nickname: player.nickname });

    if (room.players.size === 0) {
      this.destroy(room);
      return;
    }
    if (room.hostId === playerId) {
      // Hand the crown to whoever has been here longest.
      room.hostId = room.players.keys().next().value as string;
    }
    this.events.onState(room);
    if (room.status === "live") this.finishIfEveryoneDone(room);
  }

  kick(room: Room, hostId: string, playerId: string): void {
    this.requireHost(room, hostId);
    if (playerId === hostId) throw new RoomError("You can't remove yourself.");
    if (!room.players.has(playerId)) throw new RoomError("Player not found.");
    this.events.onKicked(room, playerId);
    this.leave(room, playerId);
  }

  private destroy(room: Room): void {
    if (room.endTimer) clearTimeout(room.endTimer);
    for (const p of room.players.values()) {
      if (p.disconnectTimer) clearTimeout(p.disconnectTimer);
    }
    this.rooms.delete(room.code);
  }

  private sweep(): void {
    const cutoff = Date.now() - ROOM_TTL_MS;
    for (const room of this.rooms.values()) {
      if (room.lastActivity < cutoff) this.destroy(room);
    }
  }

  // ───────────── battle ─────────────

  async start(room: Room, hostId: string): Promise<void> {
    this.requireHost(room, hostId);
    if (room.status === "live") throw new RoomError("The battle is already running.");

    const questions = selectQuestions(
      room.settings.difficulty,
      room.settings.questionCount,
      {},
      room.usedQuestionIds,
    );
    if (questions.length === 0) throw new RoomError("No questions available for these settings.");
    // Warm the expected-output cache so first submissions are instant.
    await Promise.all(questions.map((q) => getExpectedOutput(q)));

    room.round += 1;
    room.status = "live";
    room.questionIds = questions.map((q) => q.id);
    for (const id of room.questionIds) room.usedQuestionIds.add(id);
    room.firstSolvers.clear();
    room.startedAt = Date.now();
    room.endsAt = room.startedAt + room.settings.durationMinutes * 60 * 1000;
    room.finishedAt = null;

    for (const player of room.players.values()) {
      player.score = 0;
      player.questionIndex = 0;
      player.streak = 0;
      player.finished = false;
      player.records = [];
      player.currentShownAt = room.startedAt;
      player.currentAttempts = 0;
      player.currentHints = [];
      player.order =
        room.settings.questionOrder === "random" ? shuffle(room.questionIds) : [...room.questionIds];
    }

    if (room.endTimer) clearTimeout(room.endTimer);
    room.endTimer = setTimeout(() => this.finish(room), room.endsAt - room.startedAt);

    this.events.onStarted(room);
    this.events.onState(room);
  }

  private currentDef(room: Room, player: Player): QuestionDef | null {
    if (room.status !== "live" || player.finished) return null;
    const id = player.order[player.questionIndex];
    return id ? getQuestion(id) ?? null : null;
  }

  async current(room: Room, playerId: string): Promise<CurrentQuestion> {
    const player = this.requirePlayer(room, playerId);
    const def = this.currentDef(room, player);
    if (!def) {
      return {
        question: null,
        index: player.questionIndex,
        total: player.order.length,
        shownAt: player.currentShownAt,
        attempts: player.currentAttempts,
        hintsUsed: player.currentHints.length,
        revealedHints: player.currentHints,
      };
    }
    return {
      question: await toPublicQuestion(def),
      index: player.questionIndex,
      total: player.order.length,
      shownAt: player.currentShownAt,
      attempts: player.currentAttempts,
      hintsUsed: player.currentHints.length,
      revealedHints: player.currentHints,
    };
  }

  hint(room: Room, playerId: string): { hint: string; penalty: number; hintsUsed: number } {
    const player = this.requirePlayer(room, playerId);
    const def = this.currentDef(room, player);
    if (!def) throw new RoomError("No active question.");
    const index = player.currentHints.length;
    if (index >= def.hints.length) throw new RoomError("No more hints for this question.");
    player.currentHints.push(def.hints[index]);
    return {
      hint: def.hints[index],
      penalty: HINT_PENALTIES[index] ?? 0,
      hintsUsed: player.currentHints.length,
    };
  }

  async submit(room: Room, playerId: string, sql: string): Promise<SubmitResponse> {
    const player = this.requirePlayer(room, playerId);
    const def = this.currentDef(room, player);
    if (!def) throw new RoomError("No active question.");
    if (room.endsAt && Date.now() > room.endsAt) throw new RoomError("Time is up.");

    player.currentAttempts += 1;
    const outcome = await runQuery(def.datasetId, sql);
    if (!outcome.ok) {
      return this.wrongSubmission(room, player, outcome.error);
    }
    const expected = await getExpectedOutput(def);
    const cmp = compareResults(outcome.result, expected, def.orderMatters);
    if (!cmp.correct) {
      return this.wrongSubmission(room, player, cmp.feedback);
    }

    const solveSeconds = Math.max(0, Math.round((Date.now() - player.currentShownAt) / 1000));
    player.streak += 1;
    const breakdown = scoreSolve({
      difficulty: def.difficulty,
      solveSeconds,
      attempts: player.currentAttempts,
      streak: player.streak,
      hintsUsed: player.currentHints.length,
    });
    player.score += breakdown.total;
    player.records.push({
      questionId: def.id,
      title: def.title,
      difficulty: def.difficulty,
      solved: true,
      skipped: false,
      attempts: player.currentAttempts,
      hintsUsed: player.currentHints.length,
      timeSec: solveSeconds,
      points: breakdown.total,
      lastSql: sql,
    });

    if (!room.firstSolvers.has(def.id)) {
      room.firstSolvers.set(def.id, player.id);
      if (room.players.size > 1) {
        this.events.onEvent(room, {
          type: "first_solve",
          nickname: player.nickname,
          questionIndex: room.questionIds.indexOf(def.id),
        });
      }
    }
    if (breakdown.streakBonus > 0) {
      this.events.onEvent(room, { type: "streak", nickname: player.nickname, streak: player.streak });
    }

    const finished = this.advance(room, player);
    this.events.onState(room);
    return {
      correct: true,
      feedback: "",
      breakdown,
      score: player.score,
      streak: player.streak,
      finished,
    };
  }

  private wrongSubmission(room: Room, player: Player, feedback: string): SubmitResponse {
    let penalty = 0;
    if (room.settings.penalty) {
      penalty = Math.min(WRONG_SUBMISSION_PENALTY, player.score);
      player.score -= penalty;
    }
    player.streak = 0;
    this.events.onState(room);
    return {
      correct: false,
      feedback,
      penalty,
      score: player.score,
      streak: 0,
      finished: false,
    };
  }

  skip(room: Room, playerId: string): { finished: boolean } {
    const player = this.requirePlayer(room, playerId);
    const def = this.currentDef(room, player);
    if (!def) throw new RoomError("No active question.");
    player.streak = 0;
    player.records.push({
      questionId: def.id,
      title: def.title,
      difficulty: def.difficulty,
      solved: false,
      skipped: true,
      attempts: player.currentAttempts,
      hintsUsed: player.currentHints.length,
      timeSec: null,
      points: 0,
      lastSql: "",
    });
    const finished = this.advance(room, player);
    this.events.onState(room);
    return { finished };
  }

  /** Move to the next question; returns true when the player has run out. */
  private advance(room: Room, player: Player): boolean {
    player.questionIndex += 1;
    player.currentShownAt = Date.now();
    player.currentAttempts = 0;
    player.currentHints = [];
    if (player.questionIndex >= player.order.length) {
      player.finished = true;
      if (room.players.size > 1) {
        this.events.onEvent(room, { type: "finished_all", nickname: player.nickname });
      }
      this.finishIfEveryoneDone(room);
      return true;
    }
    return false;
  }

  private finishIfEveryoneDone(room: Room): void {
    if (room.status !== "live") return;
    const everyoneDone = [...room.players.values()].every((p) => p.finished || !p.connected);
    if (everyoneDone) this.finish(room);
  }

  end(room: Room, hostId: string): void {
    this.requireHost(room, hostId);
    if (room.status !== "live") throw new RoomError("The battle is not running.");
    this.finish(room);
  }

  finish(room: Room): void {
    if (room.status !== "live") return;
    // Anything still open counts as unsolved (read before flipping status,
    // since currentDef only answers for live rooms).
    for (const player of room.players.values()) {
      const def = this.currentDef(room, player);
      if (def && !player.finished) {
        player.records.push({
          questionId: def.id,
          title: def.title,
          difficulty: def.difficulty,
          solved: false,
          skipped: false,
          attempts: player.currentAttempts,
          hintsUsed: player.currentHints.length,
          timeSec: null,
          points: 0,
          lastSql: "",
        });
      }
    }
    room.status = "finished";
    room.finishedAt = Date.now();
    if (room.endTimer) {
      clearTimeout(room.endTimer);
      room.endTimer = null;
    }
    this.events.onFinished(room);
    this.events.onState(room);
  }

  rematch(room: Room, hostId: string): void {
    this.requireHost(room, hostId);
    if (room.status === "live") throw new RoomError("Finish the current battle first.");
    room.status = "lobby";
    room.startedAt = null;
    room.endsAt = null;
    room.finishedAt = null;
    room.questionIds = [];
    for (const player of room.players.values()) {
      player.score = 0;
      player.questionIndex = 0;
      player.streak = 0;
      player.finished = false;
      player.records = [];
      player.order = [];
    }
    this.events.onReset(room);
    this.events.onState(room);
  }

  // ───────────── views ─────────────

  toPublic(room: Room): RoomPublic {
    return {
      code: room.code,
      settings: room.settings,
      status: room.status,
      hostId: room.hostId,
      round: room.round,
      players: [...room.players.values()].map((p) => this.playerPublic(room, p)),
      startedAt: room.startedAt,
      endsAt: room.endsAt,
      serverNow: Date.now(),
    };
  }

  private playerPublic(room: Room, p: Player): PlayerPublic {
    return {
      id: p.id,
      nickname: p.nickname,
      isHost: room.hostId === p.id,
      connected: p.connected,
      score: p.score,
      questionIndex: p.questionIndex,
      solvedCount: p.records.filter((r) => r.solved).length,
      streak: p.streak,
      finished: p.finished,
    };
  }

  results(room: Room): BattleResults {
    if (room.status !== "finished") throw new RoomError("The battle hasn't finished yet.");
    const players: PlayerResult[] = [...room.players.values()]
      .map((p) => {
        const solved = p.records.filter((r) => r.solved);
        const attempted = p.records.filter((r) => r.attempts > 0);
        const byDifficulty: Record<Difficulty, { solved: number; total: number }> = {
          easy: { solved: 0, total: 0 },
          medium: { solved: 0, total: 0 },
          hard: { solved: 0, total: 0 },
        };
        const tagMisses = new Map<string, number>();
        for (const id of p.order) {
          const def = getQuestion(id);
          if (!def) continue;
          byDifficulty[def.difficulty].total += 1;
          const record = p.records.find((r) => r.questionId === id);
          if (record?.solved) {
            byDifficulty[def.difficulty].solved += 1;
          } else {
            for (const tag of def.tags) tagMisses.set(tag, (tagMisses.get(tag) ?? 0) + 1);
          }
        }
        const totalAttempts = attempted.reduce((a, r) => a + r.attempts, 0);
        return {
          ...this.playerPublic(room, p),
          rank: 0,
          accuracy: totalAttempts ? Math.round((solved.length / totalAttempts) * 100) : 0,
          avgSolveTime: solved.length
            ? Math.round(solved.reduce((a, r) => a + (r.timeSec ?? 0), 0) / solved.length)
            : null,
          records: p.records,
          byDifficulty,
          weakTags: [...tagMisses.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([tag]) => tag),
        };
      })
      .sort((a, b) => b.score - a.score || b.solvedCount - a.solvedCount || a.nickname.localeCompare(b.nickname));
    players.forEach((p, i) => (p.rank = i + 1));

    return {
      code: room.code,
      settings: room.settings,
      round: room.round,
      players,
      questions: room.questionIds
        .map((id) => getQuestion(id))
        .filter((q): q is QuestionDef => Boolean(q))
        .map((q) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          datasetId: q.datasetId,
          solution: q.solution,
        })),
      finishedAt: room.finishedAt ?? Date.now(),
    };
  }
}
