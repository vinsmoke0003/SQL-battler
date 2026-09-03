import type { Cell } from "@/lib/sql-runner/sandbox";
import { cn } from "@/lib/utils";

export function ResultTable({
  columns,
  rows,
  compact = false,
  maxHeight,
  className,
}: {
  columns: string[];
  rows: Cell[][];
  compact?: boolean;
  maxHeight?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("overflow-auto rounded-md border border-border", className)}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className={cn("w-full border-collapse font-mono", compact ? "text-[11.5px]" : "text-xs")}>
        <thead className="sticky top-0 bg-surface-3 text-left">
          <tr>
            {columns.map((c, i) => (
              <th
                key={`${c}-${i}`}
                className="whitespace-nowrap border-b border-border px-3 py-1.5 font-semibold text-muted"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={Math.max(1, columns.length)} className="px-3 py-3 text-faint">
                (no rows)
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr key={ri} className="odd:bg-surface even:bg-surface-2/60">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      "whitespace-nowrap border-b border-border/60 px-3 py-1",
                      cell === null && "italic text-faint",
                      typeof cell === "number" && "text-right tabular-nums",
                    )}
                  >
                    {cell === null ? "NULL" : String(cell)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
