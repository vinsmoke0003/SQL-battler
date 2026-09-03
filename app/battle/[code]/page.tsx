"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Flame, Square, Swords, Trophy } from "lucide-react";
import type { BattleEvent, CurrentQuestion, PlayerIdentity } from "@/lib/rooms/types";
import { getSocket, request } from "@/lib/client/socket";
import { useRoom } from "@/lib/client/useRoom";
import { NicknameGate } from "@/components/nickname/NicknameGate";
import { BattleWorkspace, type SubmitOutcome } from "@/components/battle/BattleWorkspace";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { Timer } from "@/components/timer/Timer";
import { Button } from "@/components/ui/Button";
import { DifficultyBadge } from "@/components/difficulty-badge/DifficultyBadge";
import { toast } from "@/components/toast/Toaster";

export default function BattlePage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = use(params);
  const code = rawCode.toUpperCase();
  return (
    <NicknameGate title="Before you join">
      {(identity) => <Battle code={code} identity={identity} />}
    </NicknameGate>
  );
}

function Battle({ code, identity }: { code: string; identity: PlayerIdentity }) {
  const router = useRouter();
  const { room, error, me, isHost, serverOffset } = useRoom(code, identity);
  const [current, setCurrent] = useState<CurrentQuestion | null>(null);
  const [ending, setEnding] = useState(false);

  const loadCurrent = useCallback(async () => {
    try {
      const c = await request("battle:current", { code });
      setCurrent(c);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }, [code]);

  // Once we're joined and the battle is live, fetch our question.
  useEffect(() => {
    if (room?.status === "live" && me && !current) loadCurrent();
  }, [room?.status, me, current, loadCurrent]);

  useEffect(() => {
    if (room?.status === "finished") router.replace(`/results/${code}`);
    if (room?.status === "lobby") router.replace(`/room/${code}`);
  }, [room?.status, code, router]);

  useEffect(() => {
    const socket = getSocket();
    const onFinished = () => router.push(`/results/${code}`);
    const onEvent = (e: BattleEvent) => {
      if (e.type === "first_solve" && e.nickname !== identity.nickname) {
        toast(`⚡ ${e.nickname} solved question ${e.questionIndex + 1} first!`, "first");
      }
      if (e.type === "streak" && e.nickname !== identity.nickname) {
        toast(`${e.nickname} is on a ${e.streak} question streak`, "streak");
      }
      if (e.type === "finished_all" && e.nickname !== identity.nickname) {
        toast(`${e.nickname} finished all questions`, "trophy");
      }
      if (e.type === "player_left") toast(`${e.nickname} left the battle`, "info");
    };
    socket.on("battle:finished", onFinished);
    socket.on("battle:event", onEvent);
    return () => {
      socket.off("battle:finished", onFinished);
      socket.off("battle:event", onEvent);
    };
  }, [code, router, identity.nickname]);

  const submit = useCallback(
    async (sql: string): Promise<SubmitOutcome> => {
      const r = await request("battle:submit", { code, sql });
      if (r.correct) {
        toast(`Correct! +${r.breakdown?.total ?? 0} points`, "success");
        if (r.finished) toast("You've finished every question 🎉", "trophy");
      }
      return { correct: r.correct, feedback: r.feedback, breakdown: r.breakdown, penalty: r.penalty };
    },
    [code],
  );

  const hint = useCallback(async () => {
    try {
      const r = await request("battle:hint", { code });
      setCurrent((c) => (c ? { ...c, revealedHints: [...c.revealedHints, r.hint], hintsUsed: r.hintsUsed } : c));
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }, [code]);

  const skip = useCallback(async () => {
    if (!window.confirm("Skip this question? It will count as unsolved.")) return;
    try {
      await request("battle:skip", { code });
      await loadCurrent();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }, [code, loadCurrent]);

  const endBattle = async () => {
    if (!window.confirm("End the battle for everyone now?")) return;
    setEnding(true);
    try {
      await request("room:end", { code });
    } catch (err) {
      toast((err as Error).message, "error");
      setEnding(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Couldn't open battle {code}</h1>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <Link href="/" className="mt-6 inline-block"><Button variant="secondary">Home</Button></Link>
      </div>
    );
  }

  if (!room || !me) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Connecting to battle…</div>;
  }

  const total = room.settings.questionCount;

  const topBar = (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="grid size-6 place-items-center rounded bg-accent/15 text-accent">
          <Swords className="size-3.5" />
        </span>
        <span className="hidden sm:inline">SQL Battle</span>
      </Link>
      <span className="text-faint">·</span>
      <span className="truncate text-sm text-muted">{room.settings.name}</span>
      <span className="rounded bg-surface-3 px-2 py-0.5 font-mono text-xs tracking-[0.2em] text-text">{code}</span>
      <DifficultyBadge difficulty={room.settings.difficulty} className="hidden sm:inline-flex" />
      <div className="ml-auto flex items-center gap-3">
        {me.streak >= 3 ? (
          <span className="inline-flex items-center gap-1 text-xs text-hard">
            <Flame className="size-3.5" /> {me.streak} streak
          </span>
        ) : null}
        <span className="text-sm">
          <span className="text-muted">Score </span>
          <span className="font-mono font-semibold tabular-nums">{me.score}</span>
        </span>
        <Timer endsAt={room.endsAt} serverOffset={serverOffset} />
        {isHost ? (
          <Button variant="danger" size="sm" onClick={endBattle} loading={ending} title="End the battle for everyone">
            <Square className="size-3" /> End
          </Button>
        ) : null}
      </div>
    </header>
  );

  const sidebar = (
    <div className="p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        <Trophy className="size-3.5 text-medium" /> Live leaderboard
      </div>
      <Leaderboard players={room.players} meId={identity.id} total={total} />
    </div>
  );

  return (
    <div className="flex h-screen flex-col">
      <BattleWorkspace
        question={current?.question ?? null}
        index={current?.index ?? 0}
        total={total}
        hints={current?.revealedHints ?? []}
        onHint={hint}
        onSubmit={submit}
        onSkip={skip}
        onNext={loadCurrent}
        topBar={topBar}
        sidebar={sidebar}
        emptyState={
          current ? (
            <div className="max-w-sm text-center">
              <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-success/15 text-success">
                <Check className="size-6" />
              </span>
              <h2 className="text-lg font-semibold">You're done!</h2>
              <p className="mt-1 text-sm text-muted">
                You finished all {total} questions with {me.score} points. The results will appear when
                everyone finishes or the timer runs out.
              </p>
              <div className="mt-5 xl:hidden">{sidebar}</div>
            </div>
          ) : (
            <p className="text-sm text-muted">Loading your question…</p>
          )
        }
      />
    </div>
  );
}
