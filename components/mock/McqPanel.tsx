"use client";

import { Check, X } from "lucide-react";
import type { PublicMcq } from "@/lib/mock-tests";
import type { McqResult } from "@/lib/client/api";
import { DifficultyBadge } from "@/components/difficulty-badge/DifficultyBadge";
import { Button } from "@/components/ui/Button";
import type { Difficulty } from "@/lib/questions/types";
import { cn } from "@/lib/utils";

export interface McqPanelProps {
  question: PublicMcq;
  index: number;
  total: number;
  sectionName: string;
  /** Currently selected option, or null when unanswered. */
  selected: number | null;
  /** Set once the answer has been graded. */
  result: McqResult | null;
  submitting: boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  isLast: boolean;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function McqPanel({
  question,
  index,
  total,
  sectionName,
  selected,
  result,
  submitting,
  onSelect,
  onSubmit,
  onNext,
  isLast,
}: McqPanelProps) {
  const locked = result !== null;

  return (
    <div className="mx-auto w-full max-w-3xl p-5">
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

      {question.code ? (
        <pre className="mb-4 overflow-auto rounded-md border border-border bg-[#0f1218] p-4 font-mono text-[12.5px] leading-relaxed text-text/90">
          {question.code}
        </pre>
      ) : null}

      <h2 className="mb-4 text-base font-semibold leading-relaxed">{question.prompt}</h2>

      <div className="space-y-2" role="radiogroup">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = result && result.correctIndex === i;
          const isWrongPick = result && isSelected && !result.correct;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={locked}
              onClick={() => onSelect(i)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md border px-3.5 py-3 text-left text-sm transition-colors",
                "disabled:cursor-default",
                isCorrect
                  ? "border-success/50 bg-success/10"
                  : isWrongPick
                    ? "border-danger/50 bg-danger/10"
                    : isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface-2 hover:border-border-strong",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                  isCorrect
                    ? "border-success bg-success text-[#052e22]"
                    : isWrongPick
                      ? "border-danger bg-danger text-[#3b0a0a]"
                      : isSelected
                        ? "border-accent bg-accent text-white"
                        : "border-border-strong text-muted",
                )}
              >
                {isCorrect ? (
                  <Check className="size-3" />
                ) : isWrongPick ? (
                  <X className="size-3" />
                ) : (
                  LETTERS[i]
                )}
              </span>
              <span className="flex-1 text-text/90">{option}</span>
            </button>
          );
        })}
      </div>

      {result ? (
        <div
          className={cn(
            "animate-rise mt-4 rounded-md border px-3.5 py-3",
            result.correct ? "border-success/40 bg-success/5" : "border-danger/40 bg-danger/5",
          )}
        >
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
            {result.correct ? (
              <>
                <Check className="size-4 text-success" />
                <span className="text-success">Correct</span>
                <span className="font-mono text-success">+{result.points}</span>
              </>
            ) : (
              <>
                <X className="size-4 text-danger" />
                <span className="text-danger">
                  Incorrect — the answer is {LETTERS[result.correctIndex]}
                </span>
              </>
            )}
          </div>
          <p className="text-sm leading-relaxed text-text/80">{result.explanation}</p>
        </div>
      ) : null}

      <div className="mt-5 flex items-center gap-2">
        {!locked ? (
          <Button onClick={onSubmit} loading={submitting} disabled={selected === null}>
            Submit answer
          </Button>
        ) : null}
        <Button variant={locked ? "primary" : "ghost"} onClick={onNext}>
          {isLast ? "Finish section" : "Next question"}
        </Button>
      </div>
    </div>
  );
}
