"use client";

import { Crown, Flame, WifiOff, Check } from "lucide-react";
import type { PlayerPublic } from "@/lib/rooms/types";
import { cn } from "@/lib/utils";

const medals = ["🥇", "🥈", "🥉"];

export function Leaderboard({
  players,
  meId,
  total,
  className,
}: {
  players: PlayerPublic[];
  meId?: string;
  /** Total questions, for the progress column. */
  total?: number;
  className?: string;
}) {
  const sorted = [...players].sort(
    (a, b) => b.score - a.score || b.solvedCount - a.solvedCount || a.nickname.localeCompare(b.nickname),
  );

  return (
    <ol className={cn("flex flex-col gap-1", className)}>
      {sorted.map((p, i) => {
        const me = p.id === meId;
        return (
          <li
            key={p.id}
            className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
              me ? "bg-accent/10 ring-1 ring-accent/30" : "bg-surface-2/60",
              !p.connected && "opacity-50",
            )}
          >
            <span className="w-6 text-center text-base leading-none">
              {medals[i] ?? <span className="text-xs text-faint">{i + 1}</span>}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className={cn("truncate font-medium", me && "text-accent-strong")}>
                  {p.nickname}
                </span>
                {p.isHost ? <Crown className="size-3 shrink-0 text-medium" /> : null}
                {!p.connected ? <WifiOff className="size-3 shrink-0 text-faint" /> : null}
                {p.streak >= 3 ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-hard">
                    <Flame className="size-3" />
                    {p.streak}
                  </span>
                ) : null}
              </div>
              {total ? (
                <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-faint">
                  {p.finished ? (
                    <span className="inline-flex items-center gap-0.5 text-success">
                      <Check className="size-3" /> Done
                    </span>
                  ) : (
                    <span>
                      Q{Math.min(p.questionIndex + 1, total)}/{total}
                    </span>
                  )}
                  <span>·</span>
                  <span>{p.solvedCount} solved</span>
                </div>
              ) : null}
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums">{p.score}</span>
          </li>
        );
      })}
    </ol>
  );
}
