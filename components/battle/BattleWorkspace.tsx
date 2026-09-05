"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  History,
  Play,
  Send,
  SkipForward,
  X,
  Clock,
  Zap,
  Target,
  Flame,
  Lightbulb,
} from "lucide-react";
import type { PublicQuestion } from "@/lib/questions/types";
import type { QueryResult } from "@/lib/sql-runner/sandbox";
import type { ScoreBreakdown } from "@/lib/scoring/scoring";
import { runQuery } from "@/lib/client/api";
import { cn, formatDuration } from "@/lib/utils";
import { SchemaViewer } from "@/components/schema-viewer/SchemaViewer";
import { ChallengePanel } from "@/components/challenge-panel/ChallengePanel";
import { SqlEditor } from "@/components/sql-editor/SqlEditor";
import { ResultTable } from "@/components/result-table/ResultTable";
import { Button } from "@/components/ui/Button";

export interface SubmitOutcome {
  correct: boolean;
  feedback: string;
  breakdown?: ScoreBreakdown;
  penalty?: number;
}

interface HistoryEntry {
  id: number;
  sql: string;
  kind: "run" | "submit";
  ok: boolean;
  at: number;
}

export interface BattleWorkspaceProps {
  question: PublicQuestion | null;
  index: number;
  total: number;
  hints: string[];
  onHint?: () => Promise<void>;
  onSubmit: (sql: string) => Promise<SubmitOutcome>;
  onSkip?: () => void;
  /** Called when the player moves on after a correct answer. */
  onNext?: () => void;
  /** Practice only: reveal the reference solution. */
  onReveal?: () => Promise<string>;
  topBar: ReactNode;
  sidebar?: ReactNode;
  emptyState?: ReactNode;
  disabled?: boolean;
  /** Seeds the editor when a question is (re)opened, e.g. revisiting one in a mock test. */
  initialSql?: string;
}

const STARTER = "-- Write your query here\nSELECT \n";
const AUTO_ADVANCE_MS = 3500;

export function BattleWorkspace({
  question,
  index,
  total,
  hints,
  onHint,
  onSubmit,
  onSkip,
  onNext,
  onReveal,
  topBar,
  sidebar,
  emptyState,
  disabled,
  initialSql,
}: BattleWorkspaceProps) {
  const [sql, setSql] = useState(STARTER);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [verdict, setVerdict] = useState<SubmitOutcome | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const historyId = useRef(0);
  const shownAt = useRef(Date.now());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fresh slate for every new question.
  useEffect(() => {
    setSql(initialSql ?? STARTER);
    setResult(null);
    setRunError(null);
    setVerdict(null);
    setHistory([]);
    setShowHistory(false);
    setSolution(null);
    shownAt.current = Date.now();
    setElapsed(0);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    // initialSql is intentionally read only when the question changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  useEffect(() => {
    if (!question || verdict?.correct) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - shownAt.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [question, verdict?.correct]);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const pushHistory = useCallback((entry: Omit<HistoryEntry, "id" | "at">) => {
    setHistory((h) => [{ ...entry, id: ++historyId.current, at: Date.now() }, ...h].slice(0, 20));
  }, []);

  const locked = disabled || !question || Boolean(verdict?.correct);

  const handleRun = useCallback(async () => {
    if (!question || running || locked) return;
    setRunning(true);
    setRunError(null);
    try {
      const outcome = await runQuery(question.datasetId, sql);
      if (outcome.ok) {
        setResult(outcome.result);
        pushHistory({ sql, kind: "run", ok: true });
      } else {
        setResult(null);
        setRunError(outcome.error);
        pushHistory({ sql, kind: "run", ok: false });
      }
    } catch (err) {
      setRunError((err as Error).message);
    } finally {
      setRunning(false);
    }
  }, [question, running, locked, sql, pushHistory]);

  const handleSubmit = useCallback(async () => {
    if (!question || submitting || locked) return;
    setSubmitting(true);
    try {
      const outcome = await onSubmit(sql);
      setVerdict(outcome);
      pushHistory({ sql, kind: "submit", ok: outcome.correct });
      if (outcome.correct && onNext) {
        advanceTimer.current = setTimeout(() => onNext(), AUTO_ADVANCE_MS);
      }
    } catch (err) {
      setVerdict({ correct: false, feedback: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }, [question, submitting, locked, sql, onSubmit, onNext, pushHistory]);

  const handleHint = useCallback(async () => {
    if (!onHint) return;
    setHintLoading(true);
    try {
      await onHint();
    } finally {
      setHintLoading(false);
    }
  }, [onHint]);

  const handleNext = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    onNext?.();
  }, [onNext]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {topBar}

      <div
        className={cn(
          "grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[236px_minmax(0,1fr)]",
          sidebar && "xl:grid-cols-[236px_minmax(0,1fr)_272px]",
        )}
      >
        {/* Schema */}
        <aside className="hidden min-h-0 border-r border-border bg-surface lg:flex lg:flex-col">
          {question ? (
            <SchemaViewer datasetId={question.datasetId} className="min-h-0 flex-1" />
          ) : null}
        </aside>

        {/* Challenge + editor + results */}
        <section className="flex min-h-0 flex-col overflow-y-auto">
          {!question ? (
            <div className="flex flex-1 items-center justify-center p-8">{emptyState}</div>
          ) : (
            <>
              <div className="border-b border-border bg-surface/60">
                <ChallengePanel
                  question={question}
                  index={index}
                  total={total}
                  hints={hints}
                  onHint={onHint ? handleHint : undefined}
                  hintLoading={hintLoading}
                />
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    SQL Editor
                    <span className="hidden font-mono text-[10px] font-normal normal-case tracking-normal text-faint md:inline">
                      ⌘/Ctrl+Enter run · ⌘/Ctrl+Shift+Enter submit
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-faint">
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="size-3" /> {formatDuration(elapsed)}
                    </span>
                    {history.length ? (
                      <button
                        type="button"
                        onClick={() => setShowHistory((s) => !s)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:text-text",
                          showHistory && "bg-surface-3 text-text",
                        )}
                      >
                        <History className="size-3" /> {history.length}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                  <SqlEditor
                    value={sql}
                    onChange={setSql}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                    datasetId={question.datasetId}
                    readOnly={locked}
                  />
                  {showHistory ? (
                    <div className="w-full overflow-auto rounded-md border border-border bg-surface md:w-64" style={{ maxHeight: 260 }}>
                      <div className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                        Query history
                      </div>
                      <ul>
                        {history.map((h) => (
                          <li key={h.id}>
                            <button
                              type="button"
                              onClick={() => setSql(h.sql)}
                              className="flex w-full flex-col gap-0.5 border-b border-border/60 px-3 py-2 text-left hover:bg-surface-2"
                            >
                              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-faint">
                                {h.kind}
                                {h.ok ? (
                                  <Check className="size-3 text-success" />
                                ) : (
                                  <X className="size-3 text-danger" />
                                )}
                              </span>
                              <span className="line-clamp-2 font-mono text-[11px] text-text/80">
                                {h.sql.replace(/^--.*$/m, "").trim()}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button variant="secondary" onClick={handleRun} loading={running} disabled={locked}>
                    <Play className="size-4" /> Run query
                  </Button>
                  <Button variant="success" onClick={handleSubmit} loading={submitting} disabled={locked}>
                    <Send className="size-4" /> Submit answer
                  </Button>
                  {onSkip && !verdict?.correct ? (
                    <Button variant="ghost" size="md" onClick={onSkip} disabled={disabled} className="ml-auto">
                      <SkipForward className="size-4" /> Skip
                    </Button>
                  ) : null}
                  {onReveal && !verdict?.correct && !solution ? (
                    <Button
                      variant="ghost"
                      onClick={async () => setSolution(await onReveal())}
                      className={cn(!onSkip && "ml-auto")}
                    >
                      <Lightbulb className="size-4" /> Show solution
                    </Button>
                  ) : null}
                </div>

                {verdict ? (
                  <VerdictBanner verdict={verdict} onNext={onNext ? handleNext : undefined} />
                ) : null}

                {solution ? (
                  <div className="mt-3 rounded-md border border-medium/30 bg-medium/5 p-3">
                    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-medium">
                      Reference solution
                    </div>
                    <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-text/90">
                      {solution}
                    </pre>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-border px-4 py-3">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Query results
                  {result ? (
                    <span className="ml-auto font-mono text-[10.5px] font-normal normal-case tracking-normal text-faint">
                      {result.rowCount} row{result.rowCount === 1 ? "" : "s"}
                      {result.truncated ? " (truncated)" : ""} · {result.executionMs} ms
                    </span>
                  ) : null}
                </div>
                {runError ? (
                  <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 font-mono text-xs text-danger">
                    {runError}
                  </div>
                ) : result ? (
                  <ResultTable columns={result.columns} rows={result.rows} maxHeight="320px" />
                ) : (
                  <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-faint">
                    Run your query to see results here. Running is free — only submissions count.
                  </p>
                )}
              </div>
            </>
          )}
        </section>

        {sidebar ? (
          <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-border bg-surface xl:flex">
            {sidebar}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function VerdictBanner({ verdict, onNext }: { verdict: SubmitOutcome; onNext?: () => void }) {
  if (!verdict.correct) {
    return (
      <div className="animate-rise mt-3 flex items-start gap-3 rounded-md border border-danger/40 bg-danger/5 px-3 py-2.5">
        <X className="mt-0.5 size-4 shrink-0 text-danger" />
        <div className="text-sm">
          <div className="font-semibold text-danger">
            Incorrect answer
            {verdict.penalty ? <span className="ml-2 font-normal text-muted">−{verdict.penalty} pts</span> : null}
          </div>
          <p className="mt-0.5 text-text/80">{verdict.feedback}</p>
        </div>
      </div>
    );
  }
  const b = verdict.breakdown;
  return (
    <div className="animate-rise animate-pulse-ring mt-3 rounded-md border border-success/40 bg-success/5 px-3 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-success text-[#052e22]">
            <Check className="size-4" />
          </span>
          <span className="font-semibold text-success">Correct answer</span>
        </div>
        {b ? (
          <span className="font-mono text-lg font-bold text-success">+{b.total} pts</span>
        ) : null}
        {onNext ? (
          <Button size="sm" onClick={onNext} className="ml-auto">
            Next question <ArrowRight className="size-3.5" />
          </Button>
        ) : null}
      </div>
      {b ? (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>Base +{b.base}</span>
          {b.speedBonus ? (
            <span className="inline-flex items-center gap-1">
              <Zap className="size-3 text-medium" /> Speed +{b.speedBonus}
            </span>
          ) : null}
          {b.firstTryBonus ? (
            <span className="inline-flex items-center gap-1">
              <Target className="size-3 text-accent" /> First try +{b.firstTryBonus}
            </span>
          ) : null}
          {b.streakBonus ? (
            <span className="inline-flex items-center gap-1">
              <Flame className="size-3 text-hard" /> Streak +{b.streakBonus}
            </span>
          ) : null}
          {b.hintPenalty ? <span>Hints −{b.hintPenalty}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
