/* Simulated second player for multiplayer verification. */
import { io } from "socket.io-client";
import { getQuestion } from "../lib/questions";

const [, , url, code, nickname = "Rahul", id = "botrahul00000001"] = process.argv;
const socket = io(url, { transports: ["websocket"] });
const log = (...a: unknown[]) => console.log(new Date().toISOString().slice(11, 19), ...a);

function req<T = any>(event: string, payload: unknown): Promise<T> {
  return new Promise((resolve, reject) =>
    socket.emit(event, payload, (r: any) => (r?.ok ? resolve(r) : reject(new Error(r?.error ?? "fail")))),
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function play() {
  for (;;) {
    const cur = await req("battle:current", { code });
    if (!cur.question) {
      log("no more questions; finished");
      return;
    }
    const def = getQuestion(cur.question.id)!;
    log(`Q${cur.index + 1}/${cur.total} ${def.id} "${def.title}"`);
    await sleep(1500);
    // First a deliberately wrong submission on question 1 to exercise feedback.
    if (cur.index === 0) {
      const wrong = await req("battle:submit", { code, sql: "SELECT 1 AS nope" });
      log("  wrong submit ->", wrong.correct, "|", wrong.feedback);
    }
    const r = await req("battle:submit", { code, sql: def.solution });
    log(`  correct=${r.correct} +${r.breakdown?.total ?? 0} score=${r.score} finished=${r.finished}`);
    if (r.finished) return;
  }
}

socket.on("connect", async () => {
  log("connected", socket.id);
  const { room } = await req("room:join", { code, player: { id, nickname } });
  log("joined room", room.code, "status", room.status, "players", room.players.map((p: any) => p.nickname));
  if (room.status === "live") play().catch((e) => log("play error", e.message));
});
socket.on("battle:started", () => {
  log("battle started");
  play().catch((e) => log("play error", e.message));
});
socket.on("battle:event", (e) => log("event", JSON.stringify(e)));
socket.on("battle:finished", () => log("battle finished"));
socket.on("room:reset", () => log("room reset (rematch)"));
socket.on("room:kicked", () => log("kicked"));
socket.on("room:state", (r) =>
  log("state", r.status, r.players.map((p: any) => `${p.nickname}:${p.score}/q${p.questionIndex}`).join(" ")),
);
socket.on("disconnect", (why) => log("disconnected", why));
