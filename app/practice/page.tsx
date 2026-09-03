"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Check, Flame, Play, RotateCcw, Trophy, Swords } from "lucide-react";
import type { PublicQuestion, RoomDifficulty } from "@/lib/questions/types";
import {
  fetchPracticeHint,
  fetchPracticeQuestion,
  fetchSolution,
  submitPractice,
} from "@/lib/client/api";
import { loadHistory, loadMistakes, recordAttempt, recordSeen } from "@/lib/client/history";
import { BattleWorkspace, type SubmitOutcome } from "@/components/battle/BattleWorkspace";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { OptionGroup } from "@/components/ui/OptionGroup";
import { DifficultyBadge, difficultyColor } from "@/components/difficulty-badge/DifficultyBadge";
import { toast } from "@/components/toast/Toaster";

interface SessionStats {
  answered: number;
  solved: number;
  score: number;
  streak: number;
  bestStreak: number;
}

const emptyStats: SessionStats = { answered: 0, solved: 0, score: 0, streak: 0, bestStreak: 0 };

function PracticeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const mistakesMode = params.get("mode") === "mistakes";

  const [difficulty, setDifficulty] = useState<RoomDifficulty>("easy");
  const [phase, setPhase] = useState<"pick" | "play" | "done">("pick");
  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [stats, setStats] = useState<SessionStats>(emptyStats);
  const [loading, setLoading] = useState(false);
  const attemptsRef = useRef(0);
  const shownAtRef = useRef(Date.now());
  const usedRef = useRef<string[]>([]);
  const onlyRef = useRef<string[] | null>(null);

  const loadNext = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchPracticeQuestion({
        difficulty,
        history: loadHistory(),
        exclude: usedRef.current,
        only: onlyRef.current ?? undefined,
      });
      if (!r.question) {
        setPhase("done");
        return;
      }
      usedRef.current = [...usedRef.current, r.question.id];
      recordSeen(r.question.id);
      setQuestion(r.question);
      setRemaining(r.remaining);
      setHints([]);
      attemptsRef.current = 0;
      shownAtRef.current = Date.now();
      setPhase("play");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  // "Practice my mistakes" from the results screen.
  useEffect(() => {
    if (!mistakesMode) return;
    const ids = loadMistakes();
    if (!ids.length) {
      toast("No mistakes saved — pick a difficulty instead.", "info");
      router.replace("/practice");
      return;
    }
    onlyRef.current = ids;
    setDifficulty("mixed");
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mistakesMode]);

  const start = () => {
    usedRef.current = [];
    onlyRef.current = null;
    setStats(emptyStats);
    setIndex(0);
    loadNext();
  };

  const submit = useCallback(
    async (sql: string): Promise<SubmitOutcome> => {
      if (!question) throw new Error("No question loaded.");
      attemptsRef.current += 1;
      const solveSeconds = Math.round((Date.now() - shownAtRef.current) / 1000);
      const r = await submitPractice({
        questionId: question.id,
        sql,
        solveSeconds,
        attempts: attemptsRef.current,
        hintsUsed: hints.length,
        streak: stats.streak + 1,
      });
      recordAttempt(question.id, r.correct, r.correct ? solveSeconds : null);
      if (r.correct) {
        setStats((s) => {
          const streak = s.streak + 1;
          return {
            answered: s.answered + 1,
            solved: s.solved + 1,
            score: s.score + (r.breakdown?.total ?? 0),
            streak,
            bestStreak: Math.max(s.bestStreak, streak),
          };
        });
      } else {
        setStats((s) => ({ ...s, streak: 0 }));
      }
      return r;
    },
    [question, hints.length, stats.streak],
  );

  const hint = useCallback(async () => {
    if (!question) return;
    try {
      const r = await fetchPracticeHint(question.id, hints.length);
      setHints((h) => [...h, r.hint]);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }, [question, hints.length]);

  const skip = useCallback(() => {
    if (!question) return;
    recordAttempt(question.id, false, null);
    setStats((s) => ({ ...s, answered: s.answered + 1, streak: 0 }));
    setIndex((i) => i + 1);
    loadNext();
  }, [question, loadNext]);

  const next = useCallback(() => {
    setIndex((i) => i + 1);
    loadNext();
  }, [loadNext]);

  const reveal = useCallback(async () => {
    if (!question) return "";
    const r = await fetchSolution(question.id);
    return r.solution;
  }, [question]);

  if (phase === "pick") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Practice SQL</h1>
          <p className="mt-1 text-sm text-muted">
            Same question bank as the battles, no timer, no friends watching. Questions you haven't
            seen come first; once you've seen them all, the ones you missed come back around.
          </p>
        </div>
        <Card className="animate-rise">
          <CardBody className="space-y-5 p-6">
            <div>
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">Difficulty</div>
              <OptionGroup
                value={difficulty}
                onChange={setDifficulty}
                options={[
                  { value: "easy", label: "Easy", hint: "SELECT, WHERE, ORDER BY", accent: difficultyColor.easy },
                  { value: "medium", label: "Medium", hint: "JOIN, GROUP BY, subqueries", accent: difficultyColor.medium },
                  { value: "hard", label: "Hard", hint: "Window functions, CTEs", accent: difficultyColor.hard },
                  { value: "mixed", label: "Mixed", hint: "A bit of everything", accent: difficultyColor.mixed },
                ]}
              />
            </div>
            <Button size="lg" className="w-full" onClick={start} loading={loading}>
              <Play className="size-4" /> Start practice
            </Button>
            <p className="text-center text-xs text-faint">
              Want company?{" "}
              <Link href="/create" className="text-accent hover:underline">Create a battle room</Link> instead.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-success/15 text-success">
          <Trophy className="size-7" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Session complete</h1>
        <p className="mt-1 text-sm text-muted">
          {mistakesMode ? "You've been through every question you missed." : "You've seen every question at this level. Start again to cycle through the ones you missed."}
        </p>
        <SessionSummary stats={stats} />
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => { onlyRef.current = null; setPhase("pick"); }}>
            <RotateCcw className="size-4" /> Practice again
          </Button>
          <Link href="/create"><Button variant="secondary"><Swords className="size-4" /> Create a battle</Button></Link>
        </div>
      </div>
    );
  }

  const topBar = (
    <div className="flex h-11 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 text-sm">
      <BookOpen className="size-4 text-accent" />
      <span className="font-medium">{mistakesMode ? "Practising mistakes" : "Solo practice"}</span>
      <DifficultyBadge difficulty={difficulty} />
      <span className="text-faint">·</span>
      <span className="text-muted">{remaining} more in this cycle</span>
      <div className="ml-auto flex items-center gap-4">
        {stats.streak >= 2 ? (
          <span className="inline-flex items-center gap-1 text-xs text-hard">
            <Flame className="size-3.5" /> {stats.streak}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Check className="size-3.5 text-success" /> {stats.solved}/{stats.answered}
        </span>
        <span>
          <span className="text-muted">Score </span>
          <span className="font-mono font-semibold tabular-nums">{stats.score}</span>
        </span>
        <Button variant="ghost" size="sm" onClick={() => setPhase("done")}>End session</Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      <BattleWorkspace
        question={question}
        index={index}
        total={0}
        hints={hints}
        onHint={hint}
        onSubmit={submit}
        onSkip={skip}
        onNext={next}
        onReveal={reveal}
        topBar={topBar}
        disabled={loading}
        emptyState={<p className="text-sm text-muted">Loading question…</p>}
      />
    </div>
  );
}

function SessionSummary({ stats }: { stats: SessionStats }) {
  const items = [
    { label: "Score", value: stats.score },
    { label: "Solved", value: `${stats.solved}/${stats.answered}` },
    { label: "Best streak", value: stats.bestStreak },
  ];
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.label} className="rounded-md border border-border bg-surface px-2 py-3">
          <div className="font-mono text-xl font-bold tabular-nums">{it.value}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeInner />
    </Suspense>
  );
}
