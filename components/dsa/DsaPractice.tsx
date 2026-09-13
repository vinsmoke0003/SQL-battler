"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { ArrowLeft, ArrowRight, Check, Code2, Loader2, Play, RotateCcw, Send, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DifficultyBadge } from "@/components/difficulty-badge/DifficultyBadge";
import { runPracticeCode } from "@/lib/client/practice-code-runner";
import type { RunReport } from "@/lib/client/code-runner";
import {
  getDsaQuestions,
  type DsaPracticeQuestion,
  type PracticeLanguage,
  type PracticeTopic,
} from "@/lib/dsa-practice/questions";
import { cn } from "@/lib/utils";

const languages: Array<{ id: PracticeLanguage; label: string; note: string }> = [
  { id: "javascript", label: "JavaScript", note: "Runs instantly" },
  { id: "python", label: "Python", note: "Loads on first run" },
];

function isTopic(value: string | null): value is PracticeTopic {
  return value === "strings" || value === "arrays";
}

function preview(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === null) return "null";
  return JSON.stringify(value) ?? String(value);
}

export function DsaPractice() {
  const params = useSearchParams();
  const requestedTopic = params.get("topic");
  const topic: PracticeTopic = isTopic(requestedTopic) ? requestedTopic : "strings";
  const questions = useMemo(() => getDsaQuestions(topic), [topic]);
  const [language, setLanguage] = useState<PracticeLanguage>("javascript");
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [report, setReport] = useState<RunReport | null>(null);
  const [reportKind, setReportKind] = useState<"samples" | "submit">("samples");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const question = questions[index];
  const draftKey = `${language}:${question.id}`;
  const code = drafts[draftKey] ?? question.starter[language];

  const moveTo = (next: number) => {
    setIndex(Math.max(0, Math.min(questions.length - 1, next)));
    setReport(null);
  };

  const chooseLanguage = (next: PracticeLanguage) => {
    setLanguage(next);
    setReport(null);
  };

  const run = async (submit: boolean) => {
    setRunning(true);
    setReport(null);
    setReportKind(submit ? "submit" : "samples");
    try {
      const result = await runPracticeCode(
        language,
        code,
        question.functionName[language],
        submit ? question.testCases : question.sampleCases,
      );
      setReport(result);
      if (submit && result.total > 0 && result.passed === result.total) {
        setCompleted((current) => new Set(current).add(question.id));
      }
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setDrafts((current) => {
      const next = { ...current };
      delete next[draftKey];
      return next;
    });
    setReport(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <Link href="/practice" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-text">
        <ArrowLeft className="size-3.5" /> Practice
      </Link>

      <header className="mt-7 flex flex-col gap-5 border-b border-border pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">DSA coding practice</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight capitalize">{topic}</h1>
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted">
            Original placement-style exercises inspired by recurring interview patterns. Work through
            them in JavaScript or Python and check your solution against visible and hidden cases.
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Programming language</p>
          <div className="flex gap-2" role="radiogroup" aria-label="Programming language">
            {languages.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={language === item.id}
                onClick={() => chooseLanguage(item.id)}
                className={cn(
                  "rounded-control border px-3 py-2 text-left transition-colors",
                  language === item.id
                    ? "border-accent bg-accent/10 text-text"
                    : "border-border bg-surface-2 text-muted hover:border-border-strong",
                )}
              >
                <span className="block text-[13px] font-medium">{item.label}</span>
                <span className="block text-[10.5px] text-faint">{item.note}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-7 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <QuestionList
          questions={questions}
          active={index}
          completed={completed}
          onSelect={moveTo}
        />

        <main className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs text-faint">{question.id}</span>
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="text-xs text-muted">{question.pattern}</span>
            <span className="ml-auto font-mono text-xs text-faint">{index + 1}/{questions.length}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">{question.title}</h2>
          <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-text/85">{question.statement}</p>

          <ul className="mt-4 space-y-1.5">
            {question.constraints.map((constraint) => (
              <li key={constraint} className="flex gap-2 text-xs leading-relaxed text-muted">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-border-strong" />
                {constraint}
              </li>
            ))}
          </ul>

          <SampleCases question={question} />

          <section className="mt-7">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Code2 className="size-3.5 text-accent" />
              <span className="eyebrow">Your solution</span>
              <span className="text-xs text-faint">
                Keep the function name <code className="text-muted">{question.functionName[language]}</code>
              </span>
              <button type="button" onClick={reset} className="ml-auto inline-flex items-center gap-1 text-xs text-faint hover:text-text">
                <RotateCcw className="size-3" /> Reset code
              </button>
            </div>
            <div className="overflow-hidden rounded-panel border border-border bg-[#0f1218]">
              <Editor
                height="330px"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setDrafts((current) => ({ ...current, [draftKey]: value ?? "" }))}
                loading={<div className="flex h-full items-center justify-center gap-2 text-xs text-muted"><Loader2 className="size-4 animate-spin" /> Loading editor…</div>}
                options={{
                  fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
                  fontSize: 13.5,
                  lineHeight: 21,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  tabSize: language === "python" ? 4 : 2,
                  padding: { top: 12, bottom: 12 },
                  overviewRulerLanes: 0,
                  wordWrap: "on",
                }}
              />
            </div>
          </section>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => run(false)} loading={running}>
              <Play /> Run samples
            </Button>
            <Button variant="success" onClick={() => run(true)} loading={running}>
              <Send /> Check all tests
            </Button>
            {language === "python" ? (
              <span className="w-full text-xs text-faint sm:ml-2 sm:w-auto">First Python run downloads the browser runtime.</span>
            ) : null}
          </div>

          {report ? <TestReport report={report} kind={reportKind} /> : null}

          <div className="mt-9 flex items-center justify-between border-t border-border pt-5">
            <Button variant="ghost" onClick={() => moveTo(index - 1)} disabled={index === 0}>
              <ArrowLeft /> Previous
            </Button>
            <Button variant="secondary" onClick={() => moveTo(index + 1)} disabled={index === questions.length - 1}>
              Next <ArrowRight />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

function QuestionList({
  questions,
  active,
  completed,
  onSelect,
}: {
  questions: DsaPracticeQuestion[];
  active: number;
  completed: Set<string>;
  onSelect: (index: number) => void;
}) {
  return (
    <aside>
      <div className="mb-2 flex items-center justify-between">
        <p className="eyebrow">Questions</p>
        <span className="font-mono text-[11px] text-faint">{completed.size}/{questions.length} solved</span>
      </div>
      <ol className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
        {questions.map((question, index) => (
          <li key={question.id}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-control border px-3 py-2.5 text-left",
                active === index ? "border-accent/60 bg-accent/[0.08]" : "border-border bg-surface-2 hover:border-border-strong",
              )}
            >
              <span className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[10px]",
                completed.has(question.id) ? "border-success bg-success text-[#04281d]" : "border-border-strong text-faint",
              )}>
                {completed.has(question.id) ? <Check className="size-3" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-medium">{question.title}</span>
                <span className="block text-[10.5px] capitalize text-faint">{question.difficulty}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function SampleCases({ question }: { question: DsaPracticeQuestion }) {
  return (
    <section className="mt-6">
      <p className="mb-2 eyebrow">Sample cases</p>
      <div className="overflow-x-auto rounded-control border border-border">
        <table className="w-full min-w-[420px] border-collapse font-mono text-[11.5px]">
          <thead className="bg-surface-3 text-left text-muted">
            <tr><th className="px-3 py-2 font-medium">Input</th><th className="px-3 py-2 font-medium">Expected</th></tr>
          </thead>
          <tbody>
            {question.sampleCases.map((test, index) => (
              <tr key={index} className="odd:bg-surface even:bg-surface-2/50">
                <td className="border-t border-border/50 px-3 py-2">{test.input.map(preview).join(", ")}</td>
                <td className="border-t border-border/50 px-3 py-2">{preview(test.expected)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TestReport({ report, kind }: { report: RunReport; kind: "samples" | "submit" }) {
  if (report.error) {
    return <div className="mt-4 rounded-control border border-danger/40 bg-danger/[0.06] px-3 py-2.5 font-mono text-xs leading-relaxed text-danger">{report.error}</div>;
  }
  const perfect = report.total > 0 && report.passed === report.total;
  return (
    <section className="mt-4">
      <div className={cn(
        "flex items-center gap-2 rounded-control border px-3 py-2.5 text-[13px] font-medium",
        perfect ? "border-success/40 bg-success/[0.06] text-success" : "border-medium/40 bg-medium/[0.06] text-medium",
      )}>
        {perfect ? <Check className="size-4" /> : <X className="size-4" />}
        {report.passed}/{report.total} tests passed
        <span className="ml-auto text-xs font-normal text-muted">{kind === "samples" ? "sample run" : "full check"}</span>
      </div>
      <ul className="mt-2 space-y-1">
        {report.results.map((result) => (
          <li key={result.index} className={cn("flex flex-wrap items-center gap-2 rounded-control px-3 py-2 font-mono text-[11px]", result.passed ? "bg-surface-2/60" : "bg-danger/[0.06]")}>
            {result.passed ? <Check className="size-3 text-success" /> : <X className="size-3 text-danger" />}
            <span className="text-muted">{result.hidden ? `Hidden case ${result.index + 1}` : result.input.map(preview).join(", ")}</span>
            {!result.passed ? <span className="text-faint">expected {preview(result.expected)} · got {result.error ? `error: ${result.error}` : preview(result.actual)}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
