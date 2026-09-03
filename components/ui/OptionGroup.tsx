"use client";

import { cn } from "@/lib/utils";

export interface Option<T extends string | number> {
  value: T;
  label: string;
  hint?: string;
  accent?: string;
}

export function OptionGroup<T extends string | number>({
  options,
  value,
  onChange,
  columns = 4,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="radiogroup"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md border px-3 py-2.5 text-left transition-colors",
              active
                ? "border-accent bg-accent/10 text-text"
                : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-text",
            )}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {opt.accent ? (
                <span className="size-2 rounded-full" style={{ background: opt.accent }} />
              ) : null}
              {opt.label}
            </div>
            {opt.hint ? <div className="mt-0.5 text-[11px] text-faint">{opt.hint}</div> : null}
          </button>
        );
      })}
    </div>
  );
}
