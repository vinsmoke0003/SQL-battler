"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Brain, Calculator, Check, Code2, Flame, Layers, ListOrdered, Play, RotateCcw, Route } from "lucide-react";
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
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-6">
        <div className="animate-rise">
          <p className="eyebrow">Choose a practice mode</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">Practice for placements</h1>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-muted">
            Build SQL skill or rehearse a gamified campus assessment. Everything is free and starts
            immediately—no account required.
          </p>
        </div>
        <div className="mt-10 space-y-10">
          <div className="space-y-6">
            <div>
              <div className="mb-1 flex items-center gap-2 text-base font-semibold">
                <BookOpen className="size-4 text-accent" /> SQL practice
              </div>
              <p className="mb-5 text-[13px] leading-relaxed text-muted">
                Use the battle question bank without a timer. Unseen questions come first and missed
                questions return later.
              </p>
              <div className="mb-3 text-[13px] font-medium text-text">Difficulty</div>
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
            <div className="border-t border-border pt-6">
              <Button size="lg" className="w-full sm:w-auto sm:min-w-44" onClick={start} loading={loading}>
                Start practice
              </Button>
              <p className="mt-4 text-[13px] text-faint">
                Want company?{" "}
                <Link
                  href="/create"
                  className="text-muted underline decoration-border underline-offset-4 transition-colors hover:text-text hover:decoration-accent"
                >
                  Create a battle room
                </Link>{" "}
                instead.
              </p>
            </div>
          </div>
          <section className="border-t border-border pt-8">
            <p className="eyebrow">New for campus preparation</p>
            <h2 className="mt-2 text-base font-semibold">Accenture Gamified Assessment</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
              Practise three commonly reported game styles individually or play them back to back.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Brain, label: "Memory Maze", detail: "Spatial recall" },
                { icon: Calculator, label: "Quick-Fire Math", detail: "Expression ordering" },
                { icon: Route, label: "Path Finder", detail: "Logical navigation" },
                { icon: Layers, label: "Full Simulation", detail: "All three games" },
              ].map(({ icon: Icon, label, detail }) => (
                <li key={label} className="flex items-center gap-3 rounded-control border border-border bg-surface-2 px-3 py-3">
                  <span className="grid size-8 place-items-center rounded-control bg-surface-2 text-accent-strong">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium">{label}</span>
                    <span className="block text-xs text-faint">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/practice/gamified" className="mt-6 inline-block w-full sm:w-auto">
              <Button size="lg" className="w-full sm:min-w-52"><Play /> Open free simulator</Button>
            </Link>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-faint">
              Formats can vary by role and hiring drive. Never pay anyone for recruitment or mandatory training.
            </p>
          </section>

          <CodingPracticeOption
            title="Strings"
            description="Build confidence with character counting, two pointers, sliding windows, stacks and careful text manipulation."
            meta="20 original interview-style questions · Easy to Hard"
            topics={["Palindrome", "Anagrams", "Two pointers", "Sliding window", "Brackets", "Parsing"]}
            href="/practice/coding?topic=strings"
            icon={Code2}
          />

          <CodingPracticeOption
            title="Arrays"
            description="Practise the array patterns that appear repeatedly in placement coding rounds, from simple scans to prefix products."
            meta="20 original interview-style questions · Easy to Hard"
            topics={["Two pointers", "Prefix sums", "Hash sets", "Matrices", "Intervals", "Dynamic patterns"]}
            href="/practice/coding?topic=arrays"
            icon={ListOrdered}
          />
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 sm:px-6">
        <p className="eyebrow">Solo practice</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">Session complete</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          {mistakesMode ? "You've been through every question you missed." : "You've seen every question at this level. Start again to cycle through the ones you missed."}
        </p>
        <SessionSummary stats={stats} />
        <div className="mt-8 flex flex-wrap gap-2">
          <Button onClick={() => { onlyRef.current = null; setPhase("pick"); }}>
            <RotateCcw /> Practice again
          </Button>
          <Link href="/create"><Button variant="secondary">Create a battle</Button></Link>
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
      <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
        {stats.streak >= 2 ? (
          <span className="inline-flex items-center gap-1 text-xs text-hard">
            <Flame className="size-3.5" /> {stats.streak}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Check className="size-3.5 text-success" /> {stats.solved}/{stats.answered}
        </span>
        <span className="whitespace-nowrap">
          <span className="text-faint">Score </span>
          <span className="nums font-mono font-semibold">{stats.score}</span>
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

function CodingPracticeOption({
  title,
  description,
  meta,
  topics,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  meta: string;
  topics: string[];
  href: string;
  icon: typeof Code2;
}) {
  return (
    <section className="border-t border-border pt-8">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-control bg-accent/10 text-accent-strong">
          <Icon className="size-4.5" />
        </span>
        <div>
          <p className="eyebrow">DSA coding practice</p>
          <h2 className="mt-2 text-base font-semibold">{title}</h2>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted">{description}</p>
      <p className="mt-2 font-mono text-[11px] text-faint">{meta}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <li key={topic} className="rounded-control border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-muted">
            {topic}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href={href} className="block w-full sm:w-auto">
          <Button size="lg" className="w-full sm:min-w-48"><Play /> Practise {title.toLowerCase()}</Button>
        </Link>
        <p className="text-xs text-faint">Choose JavaScript or Python inside the practice workspace.</p>
      </div>
    </section>
  );
}

function SessionSummary({ stats }: { stats: SessionStats }) {
  const items = [
    { label: "Score", value: stats.score },
    { label: "Solved", value: `${stats.solved}/${stats.answered}` },
    { label: "Best streak", value: stats.bestStreak },
  ];
  return (
    <dl className="mt-8 grid grid-cols-3 border-y border-border">
      {items.map((it, i) => (
        <div key={it.label} className={i > 0 ? "border-l border-border py-4 pl-4" : "py-4"}>
          <dd className="nums font-mono text-2xl font-semibold leading-none">{it.value}</dd>
          <dt className="mt-2 text-xs text-faint">{it.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeInner />
    </Suspense>
  );
}
