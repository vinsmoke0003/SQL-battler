"use client";

import { Lightbulb, ListOrdered } from "lucide-react";
import type { PublicQuestion } from "@/lib/questions/types";
import { DifficultyBadge } from "@/components/difficulty-badge/DifficultyBadge";
import { ResultTable } from "@/components/result-table/ResultTable";
import { Button } from "@/components/ui/Button";
import { HINT_PENALTIES } from "@/lib/scoring/scoring";

export function ChallengePanel({
  question,
  index,
  total,
  hints,
  onHint,
  hintLoading,
}: {
  question: PublicQuestion;
  index: number;
  total: number;
  hints: string[];
  onHint?: () => void;
  hintLoading?: boolean;
}) {
  const canHint = onHint && hints.length < question.hintCount;
  const nextPenalty = HINT_PENALTIES[hints.length] ?? 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="font-medium text-text">
            Question {index + 1}
            {total ? ` / ${total}` : ""}
          </span>
          <DifficultyBadge difficulty={question.difficulty} />
          <span className="text-faint">·</span>
          <span>{question.points} pts</span>
          <span className="ml-auto flex flex-wrap gap-1">
            {question.tags.map((t) => (
              <span
                key={t}
                className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-muted"
              >
                {t}
              </span>
            ))}
          </span>
        </div>
        <h2 className="text-lg font-semibold tracking-tight">{question.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-text/85">{question.description}</p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Expected output
          {question.orderMatters ? (
            <span className="inline-flex items-center gap-1 rounded bg-surface-3 px-1.5 py-0.5 font-medium normal-case tracking-normal text-faint">
              <ListOrdered className="size-3" /> order matters
            </span>
          ) : null}
          <span className="ml-auto font-medium normal-case tracking-normal text-faint">
            {question.expected.rows.length} row{question.expected.rows.length === 1 ? "" : "s"}
          </span>
        </div>
        <ResultTable
          columns={question.expected.columns}
          rows={question.expected.rows}
          compact
          maxHeight="220px"
        />
      </div>

      {question.hintCount > 0 ? (
        <div className="rounded-md border border-dashed border-border p-3">
          {hints.length ? (
            <ol className="mb-2 space-y-1.5">
              {hints.map((h, i) => (
                <li key={i} className="flex gap-2 text-sm text-text/85">
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-medium" />
                  <span>{h}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {canHint ? (
            <Button variant="ghost" size="sm" onClick={onHint} loading={hintLoading}>
              <Lightbulb className="size-3.5" />
              {hints.length ? "Another hint" : "Need a hint?"}
              <span className="text-faint">−{nextPenalty} pts</span>
            </Button>
          ) : hints.length === 0 ? null : (
            <p className="text-xs text-faint">No more hints.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
