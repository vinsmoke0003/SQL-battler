"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleDashed,
  Code2,
  Database,
  FileText,
  Infinity as InfinityIcon,
  ListChecks,
  RotateCcw,
  X,
} from "lucide-react";
import type { MockTestPayload, PublicCoding, PublicMcq, PublicSection } from "@/lib/mock-tests";
import type { PublicQuestion } from "@/lib/questions/types";
import type { McqResult } from "@/lib/client/api";
import { fetchMockTest, revealAnswer, submitMcq, submitMockSql } from "@/lib/client/api";
import type { RunReport } from "@/lib/client/code-runner";
import { BattleWorkspace, type SubmitOutcome } from "@/components/battle/BattleWorkspace";
import { McqPanel } from "@/components/mock/McqPanel";
import { CodingPanel } from "@/components/mock/CodingPanel";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { DifficultyBadge } from "@/components/difficulty-badge/DifficultyBadge";
import { toast } from "@/components/toast/Toaster";
import { cn } from "@/lib/utils";

type Item =
  | { kind: "mcq"; section: PublicSection; q: PublicMcq }
  | { kind: "sql"; section: PublicSection; q: PublicQuestion }
  | { kind: "coding"; section: PublicSection; q: PublicCoding };

interface McqAnswer {
  selected: number;
  result: McqResult;
}
interface SqlAnswer {
  sql: string;
  solved: boolean;
  attempts: number;
  points: number;
}
interface CodingAnswer {
  code: string;
  report: RunReport;
  points: number;
}

const SECTION_ICON = { mcq: ListChecks, sql: Database, coding: Code2 } as const;

export default function MockTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [test, setTest] = useState<MockTestPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"brief" | "test" | "review">("brief");
  const [index, setIndex] = useState(0);

  const [mcqAnswers, setMcqAnswers] = useState<Record<string, McqAnswer>>({});
  const [mcqSelection, setMcqSelection] = useState<Record<string, number>>({});
  const [sqlAnswers, setSqlAnswers] = useState<Record<string, SqlAnswer>>({});
  const [codingAnswers, setCodingAnswers] = useState<Record<string, CodingAnswer>>({});
  const [codingDrafts, setCodingDrafts] = useState<Record<string, string>>({});
  const [mcqSubmitting, setMcqSubmitting] = useState(false);

  useEffect(() => {
    fetchMockTest(id)
      .then(setTest)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  // One flat, ordered list so navigation is uniform across question kinds.
  const items = useMemo<Item[]>(() => {
    if (!test) return [];
    const out: Item[] = [];
    for (const section of test.sections) {
      if (section.kind === "mcq") {
        for (const q of section.mcq ?? []) out.push({ kind: "mcq", section, q });
      } else if (section.kind === "sql") {
        for (const q of section.sql ?? []) out.push({ kind: "sql", section, q });
      } else {
        for (const q of section.coding ?? []) out.push({ kind: "coding", section, q });
      }
    }
    return out;
  }, [test]);

  const current = items[index];

  const totals = useMemo(() => {
    const score =
      Object.values(mcqAnswers).reduce((s, a) => s + a.result.points, 0) +
      Object.values(sqlAnswers).reduce((s, a) => s + a.points, 0) +
      Object.values(codingAnswers).reduce((s, a) => s + a.points, 0);
    const solved =
      Object.values(mcqAnswers).filter((a) => a.result.correct).length +
      Object.values(sqlAnswers).filter((a) => a.solved).length +
      Object.values(codingAnswers).filter((a) => a.report.passed === a.report.total && a.report.total > 0)
        .length;
    const attempted =
      Object.keys(mcqAnswers).length + Object.keys(sqlAnswers).length + Object.keys(codingAnswers).length;
    return { score, solved, attempted };
  }, [mcqAnswers, sqlAnswers, codingAnswers]);

  const statusOf = useCallback(
    (item: Item): "correct" | "wrong" | "none" => {
      if (item.kind === "mcq") {
        const a = mcqAnswers[item.q.id];
        return a ? (a.result.correct ? "correct" : "wrong") : "none";
      }
      if (item.kind === "sql") {
        const a = sqlAnswers[item.q.id];
        return a ? (a.solved ? "correct" : "wrong") : "none";
      }
      const a = codingAnswers[item.q.id];
      if (!a) return "none";
      return a.report.total > 0 && a.report.passed === a.report.total ? "correct" : "wrong";
    },
    [mcqAnswers, sqlAnswers, codingAnswers],
  );

  const goTo = useCallback(
    (next: number) => setIndex(Math.min(Math.max(0, next), Math.max(0, items.length - 1))),
    [items.length],
  );

  const nextOrReview = useCallback(() => {
    if (index >= items.length - 1) setPhase("review");
    else goTo(index + 1);
  }, [index, items.length, goTo]);

  const handleMcqSubmit = useCallback(async () => {
    if (current?.kind !== "mcq") return;
    const selected = mcqSelection[current.q.id];
    if (selected === undefined) return;
    setMcqSubmitting(true);
    try {
      const result = await submitMcq(current.q.id, selected);
      setMcqAnswers((prev) => ({ ...prev, [current.q.id]: { selected, result } }));
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setMcqSubmitting(false);
    }
  }, [current, mcqSelection]);

  const handleSqlSubmit = useCallback(
    async (sql: string): Promise<SubmitOutcome> => {
      if (current?.kind !== "sql") throw new Error("No SQL question active.");
      const res = await submitMockSql({ questionId: current.q.id, sql, hintsUsed: 0 });
      setSqlAnswers((prev) => {
        const existing = prev[current.q.id];
        return {
          ...prev,
          [current.q.id]: {
            sql,
            solved: existing?.solved || res.correct,
            attempts: (existing?.attempts ?? 0) + 1,
            points: existing?.solved ? existing.points : res.correct ? (res.breakdown?.total ?? 0) : 0,
          },
        };
      });
      return res;
    },
    [current],
  );

  const handleCodingSubmitted = useCallback(
    (report: RunReport) => {
      if (current?.kind !== "coding") return;
      const allPassed = report.total > 0 && report.passed === report.total;
      setCodingAnswers((prev) => ({
        ...prev,
        [current.q.id]: {
          code: codingDrafts[current.q.id] ?? current.q.starterCode,
          report,
          points: allPassed ? current.q.points : 0,
        },
      }));
    },
    [current, codingDrafts],
  );

  const restart = () => {
    setMcqAnswers({});
    setMcqSelection({});
    setSqlAnswers({});
    setCodingAnswers({});
    setCodingDrafts({});
    setIndex(0);
    setPhase("brief");
  };

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Mock test unavailable</h1>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <Link href="/mock" className="mt-6 inline-block">
          <Button variant="secondary">Back to mock tests</Button>
        </Link>
      </div>
    );
  }
  if (!test) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Loading test…</div>;
  }

  // ───────────── brief ─────────────
  if (phase === "brief") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <Link href="/mock" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
          <ArrowLeft className="size-3.5" /> All mock tests
        </Link>
        <Card className="animate-rise">
          <CardBody className="p-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                {test.company}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-faint">
                <InfinityIcon className="size-3" /> No timer
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{test.title}</h1>
            <p className="mt-1.5 text-sm text-muted">{test.summary}</p>

            <div className="mt-5 rounded-md border border-border bg-surface-2/50 p-4">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                How the real paper works
              </h2>
              <ul className="space-y-2">
                {test.format.map((line, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text/85">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 space-y-1.5">
              {test.sections.map((s) => {
                const Icon = SECTION_ICON[s.kind];
                const count = (s.mcq ?? s.sql ?? s.coding ?? []).length;
                return (
                  <div
                    key={s.id}
                    className="flex items-start gap-3 rounded-md border border-border bg-surface-2/40 px-3 py-2.5"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{s.name}</span>
                        <span className="text-xs text-faint">{count} here</span>
                        {s.realCount ? (
                          <span className="ml-auto text-[11px] text-faint">
                            real paper: {s.realCount} Q
                            {s.realMinutes ? ` / ${s.realMinutes} min` : ""}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted">{s.blurb}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-4 text-xs text-muted">
              <span>{test.totalQuestions} questions</span>
              <span>{test.totalPoints} points available</span>
            </div>

            <Button size="lg" className="mt-4 w-full" onClick={() => setPhase("test")}>
              <FileText className="size-4" /> Start test
            </Button>
            <p className="mt-2 text-center text-xs text-faint">
              Untimed. Move between sections freely and finish whenever you like.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ───────────── review ─────────────
  if (phase === "review") {
    const pct = test.totalPoints ? Math.round((totals.score / test.totalPoints) * 100) : 0;
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="animate-rise mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{test.company} mock test complete</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {totals.score} / {test.totalPoints}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {pct}% · {totals.solved} of {test.totalQuestions} questions correct
          </p>
          <p className="mt-1 text-xs text-faint">
            Accenture&apos;s technical cut-off sits around 55%.
          </p>
        </div>

        <div className="space-y-4">
          {test.sections.map((section) => {
            const sectionItems = items.filter((it) => it.section.id === section.id);
            const got = sectionItems.filter((it) => statusOf(it) === "correct").length;
            return (
              <Card key={section.id}>
                <CardBody className="p-3">
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="text-sm font-semibold">{section.name}</span>
                    <span className="ml-auto font-mono text-xs text-muted">
                      {got}/{sectionItems.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {sectionItems.map((item) => {
                      const status = statusOf(item);
                      const title =
                        item.kind === "mcq"
                          ? item.q.prompt
                          : item.kind === "sql"
                            ? item.q.title
                            : item.q.title;
                      return (
                        <details
                          key={item.q.id}
                          className="group rounded-md border border-border bg-surface-2/50"
                        >
                          <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5">
                            {status === "correct" ? (
                              <Check className="size-4 shrink-0 text-success" />
                            ) : status === "wrong" ? (
                              <X className="size-4 shrink-0 text-danger" />
                            ) : (
                              <CircleDashed className="size-4 shrink-0 text-faint" />
                            )}
                            <DifficultyBadge difficulty={item.q.difficulty as never} />
                            <span className="flex-1 truncate text-sm">{title}</span>
                            <ChevronDown className="size-4 text-faint transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="border-t border-border px-3 py-3">
                            <ReviewBody
                              item={item}
                              mcqAnswer={item.kind === "mcq" ? mcqAnswers[item.q.id] : undefined}
                              sqlAnswer={item.kind === "sql" ? sqlAnswers[item.q.id] : undefined}
                              codingAnswer={item.kind === "coding" ? codingAnswers[item.q.id] : undefined}
                            />
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={restart}>
            <RotateCcw className="size-4" /> Retake test
          </Button>
          <Button variant="secondary" onClick={() => setPhase("test")}>
            Back to questions
          </Button>
          <Link href="/mock">
            <Button variant="ghost">All mock tests</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ───────────── test ─────────────
  const topBar = (
    <div className="flex h-11 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 text-sm">
      <Link href="/mock" className="text-muted hover:text-text">
        <ArrowLeft className="size-4" />
      </Link>
      <span className="rounded bg-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
        {test.company}
      </span>
      <span className="hidden truncate font-medium md:inline">{current?.section.name}</span>
      <span className="inline-flex items-center gap-1 text-[11px] text-faint">
        <InfinityIcon className="size-3" /> No timer
      </span>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-xs text-muted">
          {totals.attempted}/{test.totalQuestions} attempted
        </span>
        <span>
          <span className="text-muted">Score </span>
          <span className="font-mono font-semibold tabular-nums">{totals.score}</span>
          <span className="text-faint">/{test.totalPoints}</span>
        </span>
        <Button variant="secondary" size="sm" onClick={() => setPhase("review")}>
          Finish &amp; review
        </Button>
      </div>
    </div>
  );

  const nav = (
    <div className="p-3">
      {test.sections.map((section) => {
        const Icon = SECTION_ICON[section.kind];
        const sectionItems = items
          .map((it, i) => ({ it, i }))
          .filter(({ it }) => it.section.id === section.id);
        return (
          <div key={section.id} className="mb-3">
            <div className="mb-1 flex items-center gap-1.5 px-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">
              <Icon className="size-3" />
              {section.name}
            </div>
            <div className="flex flex-wrap gap-1">
              {sectionItems.map(({ it, i }) => {
                const status = statusOf(it);
                return (
                  <button
                    key={it.q.id}
                    type="button"
                    onClick={() => goTo(i)}
                    title={it.kind === "mcq" ? it.q.prompt : it.q.title}
                    className={cn(
                      "grid size-7 place-items-center rounded border font-mono text-[11px] transition-colors",
                      i === index
                        ? "border-accent bg-accent/15 text-accent-strong"
                        : status === "correct"
                          ? "border-success/40 bg-success/10 text-success"
                          : status === "wrong"
                            ? "border-danger/40 bg-danger/10 text-danger"
                            : "border-border bg-surface-2 text-muted hover:border-border-strong",
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => goTo(index - 1)} disabled={index === 0}>
          <ArrowLeft className="size-3.5" /> Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => goTo(index + 1)}
          disabled={index >= items.length - 1}
        >
          Next <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );

  const isLast = index >= items.length - 1;

  if (current?.kind === "sql") {
    return (
      <div className="flex h-[calc(100vh-56px)] flex-col">
        <BattleWorkspace
          question={current.q}
          index={index}
          total={items.length}
          hints={[]}
          onSubmit={handleSqlSubmit}
          onNext={nextOrReview}
          initialSql={sqlAnswers[current.q.id]?.sql}
          topBar={topBar}
          sidebar={nav}
          emptyState={<p className="text-sm text-muted">Loading question…</p>}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      {topBar}
      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_272px]">
        <section className="min-h-0 overflow-y-auto">
          {current?.kind === "mcq" ? (
            <McqPanel
              question={current.q}
              index={index}
              total={items.length}
              sectionName={current.section.name}
              selected={mcqAnswers[current.q.id]?.selected ?? mcqSelection[current.q.id] ?? null}
              result={mcqAnswers[current.q.id]?.result ?? null}
              submitting={mcqSubmitting}
              onSelect={(i) => setMcqSelection((prev) => ({ ...prev, [current.q.id]: i }))}
              onSubmit={handleMcqSubmit}
              onNext={nextOrReview}
              isLast={isLast}
            />
          ) : current?.kind === "coding" ? (
            <CodingPanel
              question={current.q}
              index={index}
              total={items.length}
              sectionName={current.section.name}
              code={codingDrafts[current.q.id] ?? current.q.starterCode}
              onCodeChange={(code) => setCodingDrafts((prev) => ({ ...prev, [current.q.id]: code }))}
              report={codingAnswers[current.q.id]?.report ?? null}
              onSubmitted={handleCodingSubmitted}
              onNext={nextOrReview}
              isLast={isLast}
            />
          ) : (
            <p className="p-8 text-sm text-muted">Loading question…</p>
          )}
        </section>
        <aside className="hidden min-h-0 overflow-y-auto border-l border-border bg-surface xl:block">
          {nav}
        </aside>
      </div>
    </div>
  );
}

/** Per-question detail in the review screen, including the reference answer. */
function ReviewBody({
  item,
  mcqAnswer,
  sqlAnswer,
  codingAnswer,
}: {
  item: Item;
  mcqAnswer?: McqAnswer;
  sqlAnswer?: SqlAnswer;
  codingAnswer?: CodingAnswer;
}) {
  const [reveal, setReveal] = useState<{ solution?: string; explanation?: string; correctIndex?: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setReveal(await revealAnswer(item.q.id, item.kind));
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  };

  const LETTERS = ["A", "B", "C", "D", "E", "F"];

  if (item.kind === "mcq") {
    const correctIndex = mcqAnswer?.result.correctIndex ?? reveal?.correctIndex;
    const explanation = mcqAnswer?.result.explanation ?? reveal?.explanation;
    return (
      <div className="space-y-3">
        {item.q.code ? (
          <pre className="overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-[11.5px] leading-relaxed">
            {item.q.code}
          </pre>
        ) : null}
        <ul className="space-y-1">
          {item.q.options.map((option, i) => (
            <li
              key={i}
              className={cn(
                "rounded px-2.5 py-1.5 text-sm",
                correctIndex === i
                  ? "bg-success/10 text-success"
                  : mcqAnswer?.selected === i
                    ? "bg-danger/10 text-danger"
                    : "text-text/70",
              )}
            >
              <span className="mr-2 font-mono text-xs">{LETTERS[i]}</span>
              {option}
              {mcqAnswer?.selected === i ? (
                <span className="ml-2 text-[11px] text-muted">(your answer)</span>
              ) : null}
            </li>
          ))}
        </ul>
        {explanation ? (
          <p className="rounded-md bg-surface-3/60 px-3 py-2 text-sm text-text/80">{explanation}</p>
        ) : (
          <Button variant="ghost" size="sm" loading={loading} onClick={load}>
            Show answer &amp; explanation
          </Button>
        )}
      </div>
    );
  }

  if (item.kind === "sql") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text/80">{item.q.description}</p>
        {sqlAnswer?.sql ? (
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Your last query
            </div>
            <pre className="overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-xs leading-relaxed">
              {sqlAnswer.sql}
            </pre>
          </div>
        ) : null}
        {reveal?.solution ? (
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-medium">
              Reference solution
            </div>
            <pre className="overflow-auto rounded-md border border-medium/30 bg-medium/5 p-3 font-mono text-xs leading-relaxed">
              {reveal.solution}
            </pre>
          </div>
        ) : (
          <Button variant="ghost" size="sm" loading={loading} onClick={load}>
            Show solution
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-text/80">{item.q.statement}</p>
      {codingAnswer ? (
        <p className="text-xs text-muted">
          {codingAnswer.report.passed}/{codingAnswer.report.total} test cases passed
        </p>
      ) : null}
      {codingAnswer?.code ? (
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Your solution
          </div>
          <pre className="overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-xs leading-relaxed">
            {codingAnswer.code}
          </pre>
        </div>
      ) : null}
      {reveal?.solution ? (
        <div className="space-y-2">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-medium">
              Reference solution
            </div>
            <pre className="overflow-auto rounded-md border border-medium/30 bg-medium/5 p-3 font-mono text-xs leading-relaxed">
              {reveal.solution}
            </pre>
          </div>
          {reveal.explanation ? (
            <p className="rounded-md bg-surface-3/60 px-3 py-2 text-sm text-text/80">{reveal.explanation}</p>
          ) : null}
        </div>
      ) : (
        <Button variant="ghost" size="sm" loading={loading} onClick={load}>
          Show solution &amp; approach
        </Button>
      )}
    </div>
  );
}
