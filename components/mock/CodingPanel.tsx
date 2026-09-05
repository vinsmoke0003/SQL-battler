"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Check, Loader2, Play, Send, X } from "lucide-react";
import type { PublicCoding } from "@/lib/mock-tests";
import { fetchCodingCases } from "@/lib/client/api";
import { runCode, type RunReport } from "@/lib/client/code-runner";
import { DifficultyBadge } from "@/components/difficulty-badge/DifficultyBadge";
import { Button } from "@/components/ui/Button";
import type { Difficulty } from "@/lib/questions/types";
import { cn } from "@/lib/utils";

export interface CodingPanelProps {
  question: PublicCoding;
  index: number;
  total: number;
  sectionName: string;
  code: string;
  onCodeChange: (code: string) => void;
  /** Recorded once the candidate submits against the full suite. */
  report: RunReport | null;
  onSubmitted: (report: RunReport) => void;
  onNext: () => void;
  isLast: boolean;
}

function preview(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  return JSON.stringify(value) ?? String(value);
}

export function CodingPanel({
  question,
  index,
  total,
  sectionName,
  code,
  onCodeChange,
  report,
  onSubmitted,
  onNext,
  isLast,
}: CodingPanelProps) {
  const [sampleReport, setSampleReport] = useState<RunReport | null>(null);
  // Which run to display: a fresh sample run must not be hidden by an older submit.
  const [view, setView] = useState<"sample" | "submit">("submit");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [height, setHeight] = useState(300);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSampleReport(null);
    setView("submit");
  }, [question.id]);

  // Same wheel handling as the SQL editor: Monaco otherwise traps page scroll.
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      const editor = editorRef.current;
      if (editor) {
        const top = editor.getScrollTop();
        const max = editor.getScrollHeight() - editor.getLayoutInfo().height;
        if (event.deltaY < 0 ? top > 0 : top < max - 1) return;
      }
      let scroller: HTMLElement | null = node.parentElement;
      while (scroller) {
        const overflowY = getComputedStyle(scroller).overflowY;
        if (
          (overflowY === "auto" || overflowY === "scroll") &&
          scroller.scrollHeight > scroller.clientHeight + 1
        ) {
          break;
        }
        scroller = scroller.parentElement;
      }
      if (!scroller) return;
      scroller.scrollTop += event.deltaY;
      event.preventDefault();
      event.stopPropagation();
    };
    node.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => node.removeEventListener("wheel", onWheel, { capture: true });
  }, []);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    const sync = () => {
      const model = editor.getModel();
      if (!model) return;
      const bottom = editor.getTopForLineNumber(model.getLineCount() + 1);
      setHeight((prev) => {
        const next = Math.max(300, bottom + 38);
        return Math.abs(prev - next) > 1 ? next : prev;
      });
    };
    editor.onDidContentSizeChange(sync);
    sync();
  };

  const runSamples = useCallback(async () => {
    setRunning(true);
    try {
      const cases = question.sampleCases.map((c) => ({ input: c.input, expected: c.expected }));
      setSampleReport(await runCode(code, question.functionName, cases));
      setView("sample");
    } finally {
      setRunning(false);
    }
  }, [code, question]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      const { testCases } = await fetchCodingCases(question.id);
      onSubmitted(await runCode(code, question.functionName, testCases));
      setView("submit");
    } catch (err) {
      onSubmitted({
        ok: false,
        error: (err as Error).message,
        results: [],
        passed: 0,
        total: 0,
      });
      setView("submit");
    } finally {
      setSubmitting(false);
    }
  }, [code, question, onSubmitted]);

  const showingSubmit = view === "submit" && report !== null;
  const shown = showingSubmit ? report : (sampleReport ?? report);

  return (
    <div className="mx-auto w-full max-w-4xl p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="font-medium text-text">
          Question {index + 1} / {total}
        </span>
        <span className="text-faint">·</span>
        <span>{sectionName}</span>
        <DifficultyBadge difficulty={question.difficulty as Difficulty} />
        <span className="ml-auto rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10px]">
          {question.topic}
        </span>
        <span>{question.points} pts</span>
      </div>

      <h2 className="text-lg font-semibold tracking-tight">{question.title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-text/85">{question.statement}</p>

      <ul className="mt-3 space-y-1">
        {question.constraints.map((c, i) => (
          <li key={i} className="flex gap-2 text-xs text-muted">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-faint" />
            {c}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Sample cases
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full border-collapse font-mono text-[11.5px]">
            <thead className="bg-surface-3 text-left text-muted">
              <tr>
                <th className="px-3 py-1.5 font-semibold">Input</th>
                <th className="px-3 py-1.5 font-semibold">Expected</th>
              </tr>
            </thead>
            <tbody>
              {question.sampleCases.map((c, i) => (
                <tr key={i} className="odd:bg-surface even:bg-surface-2/60">
                  <td className="border-t border-border/60 px-3 py-1.5">
                    {c.input.map(preview).join(", ")}
                  </td>
                  <td className="border-t border-border/60 px-3 py-1.5">{preview(c.expected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Your solution
          <span className="font-mono text-[10px] font-normal normal-case tracking-normal text-faint">
            JavaScript · keep the function name {question.functionName}
          </span>
        </div>
        <div ref={wrapperRef} className="overflow-hidden rounded-md border border-border bg-[#0f1218]">
          <Editor
            height={height}
            language="javascript"
            theme="sqlbattle"
            value={code}
            onChange={(v) => onCodeChange(v ?? "")}
            onMount={handleMount}
            loading={
              <div className="flex h-full items-center justify-center gap-2 text-xs text-muted">
                <Loader2 className="size-4 animate-spin" /> Loading editor…
              </div>
            }
            options={{
              fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
              fontSize: 13.5,
              lineHeight: 21,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              tabSize: 2,
              padding: { top: 12, bottom: 12 },
              automaticLayout: true,
              overviewRulerLanes: 0,
              scrollbar: { verticalScrollbarSize: 8, alwaysConsumeMouseWheel: false },
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={runSamples} loading={running}>
          <Play className="size-4" /> Run samples
        </Button>
        <Button variant="success" onClick={submit} loading={submitting}>
          <Send className="size-4" /> Submit
        </Button>
        <Button variant="ghost" onClick={onNext} className="ml-auto">
          {isLast ? "Finish section" : "Next question"}
        </Button>
      </div>

      {shown ? (
        <div className="animate-rise mt-4">
          {shown.error ? (
            <div className="rounded-md border border-danger/40 bg-danger/5 px-3 py-2.5 font-mono text-xs text-danger">
              {shown.error}
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "mb-2 flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold",
                  shown.passed === shown.total
                    ? "border-success/40 bg-success/5 text-success"
                    : "border-medium/40 bg-medium/5 text-medium",
                )}
              >
                {shown.passed === shown.total ? <Check className="size-4" /> : <X className="size-4" />}
                {shown.passed} / {shown.total} test cases passed
                {showingSubmit ? (
                  <span className="ml-auto font-mono text-xs">
                    {shown.passed === shown.total ? `+${question.points}` : "+0"}
                  </span>
                ) : (
                  <span className="ml-auto text-xs font-normal text-muted">sample run only</span>
                )}
              </div>
              <ul className="space-y-1">
                {shown.results.map((r) => (
                  <li
                    key={r.index}
                    className={cn(
                      "flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-md px-3 py-1.5 font-mono text-[11.5px]",
                      r.passed ? "bg-surface-2/60" : "bg-danger/5",
                    )}
                  >
                    {r.passed ? (
                      <Check className="size-3 shrink-0 text-success" />
                    ) : (
                      <X className="size-3 shrink-0 text-danger" />
                    )}
                    {r.hidden ? (
                      <span className="text-muted">hidden case {r.index + 1}</span>
                    ) : (
                      <span className="text-muted">{r.input.map(preview).join(", ")}</span>
                    )}
                    {!r.passed ? (
                      <span className="text-faint">
                        expected {preview(r.expected)} · got {r.error ? `error: ${r.error}` : preview(r.actual)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
