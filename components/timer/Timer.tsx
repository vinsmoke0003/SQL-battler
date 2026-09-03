"use client";

import { useEffect, useRef, useState } from "react";
import { TimerIcon } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

/**
 * Counts down to `endsAt` (server epoch millis). `serverOffset` is
 * serverNow - clientNow, so the countdown stays honest across machines.
 */
export function Timer({
  endsAt,
  serverOffset = 0,
  onExpire,
  className,
}: {
  endsAt: number | null;
  serverOffset?: number;
  onExpire?: () => void;
  className?: string;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    if (!endsAt) {
      setRemaining(null);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.round((endsAt - (Date.now() + serverOffset)) / 1000));
      setRemaining(left);
      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endsAt, serverOffset, onExpire]);

  const urgent = remaining !== null && remaining <= 60;
  const warning = remaining !== null && remaining <= 300 && !urgent;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-sm tabular-nums",
        urgent
          ? "border-hard/50 bg-hard/10 text-hard"
          : warning
            ? "border-medium/40 bg-medium/10 text-medium"
            : "border-border bg-surface-2 text-text",
        className,
      )}
    >
      <TimerIcon className="size-3.5 opacity-80" />
      {remaining === null ? "--:--" : formatDuration(remaining)}
    </div>
  );
}
