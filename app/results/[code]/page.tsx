"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronDown, Crown, Plus, RotateCcw, Trophy } from "lucide-react";
import type { BattleResults, PlayerIdentity, PlayerResult } from "@/lib/rooms/types";
import type { Difficulty } from "@/lib/questions/types";
import { getSocket, request } from "@/lib/client/socket";
import { useRoom } from "@/lib/client/useRoom";
import { saveMistakes } from "@/lib/client/history";
import { NicknameGate } from "@/components/nickname/NicknameGate";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { DifficultyBadge } from "@/components/difficulty-badge/DifficultyBadge";
import { toast } from "@/components/toast/Toaster";
import { cn, formatDuration } from "@/lib/utils";

export default function ResultsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = use(params);
  const code = rawCode.toUpperCase();
  return (
    <NicknameGate title="Before you continue">
      {(identity) => <Results code={code} identity={identity} />}
    </NicknameGate>
  );
}

const medals = ["🥇", "🥈", "🥉"];

function Results({ code, identity }: { code: string; identity: PlayerIdentity }) {
  const router = useRouter();
  const { room, error, isHost } = useRoom(code, identity);
  const [results, setResults] = useState<BattleResults | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rematching, setRematching] = useState(false);

  useEffect(() => {
    if (room?.status !== "finished") return;
    request("room:results", { code })
      .then((r) => setResults(r.results))
      .catch((err: Error) => setLoadError(err.message));
  }, [room?.status, code]);

  useEffect(() => {
    if (room?.status === "lobby") router.replace(`/room/${code}`);
    if (room?.status === "live") router.replace(`/battle/${code}`);
  }, [room?.status, code, router]);

  useEffect(() => {
    const socket = getSocket();
    const onReset = () => router.push(`/room/${code}`);
    socket.on("room:reset", onReset);
    return () => {
      socket.off("room:reset", onReset);
    };
  }, [code, router]);

  const rematch = async () => {
    setRematching(true);
    try {
      await request("room:rematch", { code });
    } catch (err) {
      toast((err as Error).message, "error");
      setRematching(false);
    }
  };

  const practiceMistakes = (me: PlayerResult) => {
    const ids = me.records.filter((r) => !r.solved).map((r) => r.questionId);
    saveMistakes(ids);
    router.push("/practice?mode=mistakes");
  };

  if (error || loadError) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Results unavailable</h1>
        <p className="mt-2 text-sm text-muted">{error ?? loadError}</p>
        <Link href="/" className="mt-6 inline-block"><Button variant="secondary">Home</Button></Link>
      </div>
    );
  }
  if (!results) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Tallying scores…</div>;
  }

  const me = results.players.find((p) => p.id === identity.id);
  const winner = results.players[0];
  const mistakes = me?.records.filter((r) => !r.solved).length ?? 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="animate-rise mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Battle complete</p>
        <h1 className="mt-1 flex items-center justify-center gap-2 text-3xl font-bold tracking-tight">
          <Trophy className="size-7 text-medium" />
          {winner ? `${winner.nickname} wins` : results.settings.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {results.settings.name} · Round {results.round} · {results.settings.questionCount} questions
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Final leaderboard</CardTitle></CardHeader>
            <CardBody className="p-2">
              <ol className="divide-y divide-border/60">
                {results.players.map((p, i) => (
                  <li
                    key={p.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3",
                      p.id === identity.id && "rounded-md bg-accent/10",
                    )}
                  >
                    <span className="w-8 text-center text-xl">{medals[i] ?? <span className="text-sm text-faint">{i + 1}</span>}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-medium">
                        {p.nickname}
                        {p.isHost ? <Crown className="size-3.5 text-medium" /> : null}
                      </div>
                      <div className="text-xs text-muted">
                        {p.solvedCount}/{results.settings.questionCount} solved · {p.accuracy}% accuracy
                        {p.avgSolveTime !== null ? ` · ${formatDuration(p.avgSolveTime)} avg` : ""}
                      </div>
                    </div>
                    <span className="font-mono text-xl font-bold tabular-nums">{p.score}</span>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Questions & solutions</CardTitle></CardHeader>
            <CardBody className="space-y-2 p-3">
              {results.questions.map((q, i) => {
                const record = me?.records.find((r) => r.questionId === q.id);
                return (
                  <details key={q.id} className="group rounded-md border border-border bg-surface-2/50">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5">
                      <span className="w-6 font-mono text-xs text-faint">{i + 1}</span>
                      <DifficultyBadge difficulty={q.difficulty} />
                      <span className="flex-1 truncate text-sm font-medium">{q.title}</span>
                      {record ? (
                        <span
                          className={cn(
                            "text-xs",
                            record.solved ? "text-success" : record.skipped ? "text-muted" : "text-danger",
                          )}
                        >
                          {record.solved
                            ? `+${record.points} · ${formatDuration(record.timeSec ?? 0)}`
                            : record.skipped
                              ? "skipped"
                              : record.attempts
                                ? `unsolved · ${record.attempts} tries`
                                : "not reached"}
                        </span>
                      ) : null}
                      <ChevronDown className="size-4 text-faint transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="space-y-3 border-t border-border px-3 py-3">
                      <p className="text-sm text-text/80">{q.description}</p>
                      <div className={cn("grid gap-3", record?.lastSql && "md:grid-cols-2")}>
                        {record?.lastSql ? (
                          <div>
                            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Your query</div>
                            <pre className="overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-xs leading-relaxed">{record.lastSql}</pre>
                          </div>
                        ) : null}
                        <div>
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-medium">Reference solution</div>
                          <pre className="overflow-auto rounded-md border border-medium/30 bg-medium/5 p-3 font-mono text-xs leading-relaxed">{q.solution}</pre>
                        </div>
                      </div>
                    </div>
                  </details>
                );
              })}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          {me ? <YourStats me={me} total={results.settings.questionCount} /> : null}

          <div className="space-y-2">
            {isHost ? (
              <Button size="lg" className="w-full" onClick={rematch} loading={rematching}>
                <RotateCcw className="size-4" /> Rematch
              </Button>
            ) : (
              <div className="rounded-md border border-dashed border-border px-4 py-3 text-center text-sm text-muted">
                Waiting for the host to start a rematch…
              </div>
            )}
            {me && mistakes > 0 ? (
              <Button variant="secondary" size="lg" className="w-full" onClick={() => practiceMistakes(me)}>
                <BookOpen className="size-4" /> Practice my {mistakes} mistake{mistakes === 1 ? "" : "s"}
              </Button>
            ) : null}
            <Link href="/create" className="block">
              <Button variant="ghost" size="lg" className="w-full">
                <Plus className="size-4" /> New room
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function YourStats({ me, total }: { me: PlayerResult; total: number }) {
  const rows: { key: Difficulty; label: string; color: string }[] = [
    { key: "easy", label: "Easy", color: "bg-easy" },
    { key: "medium", label: "Medium", color: "bg-medium" },
    { key: "hard", label: "Hard", color: "bg-hard" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your performance</CardTitle>
        <span className="text-xs text-muted">#{me.rank}</span>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Score" value={String(me.score)} />
          <Stat label="Solved" value={`${me.solvedCount}/${total}`} />
          <Stat label="Accuracy" value={`${me.accuracy}%`} />
        </div>
        <div className="space-y-2">
          {rows
            .filter((r) => me.byDifficulty[r.key].total > 0)
            .map((r) => {
              const d = me.byDifficulty[r.key];
              const pct = d.total ? Math.round((d.solved / d.total) * 100) : 0;
              return (
                <div key={r.key}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted">{r.label}</span>
                    <span className="font-mono">{d.solved}/{d.total}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className={cn("h-full rounded-full", r.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
        </div>
        {me.weakTags.length ? (
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Needs practice</div>
            <div className="flex flex-wrap gap-1.5">
              {me.weakTags.map((t) => (
                <span key={t} className="rounded bg-hard/10 px-2 py-0.5 font-mono text-[11px] text-hard">{t}</span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-success">No weak spots this round. Clean sweep!</p>
        )}
        {me.avgSolveTime !== null ? (
          <p className="text-xs text-muted">Average solve time {formatDuration(me.avgSolveTime)}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-2 px-2 py-2.5">
      <div className="font-mono text-lg font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}
