"use client";

import { useEffect, useState } from "react";
import { Zap, Flame, Trophy, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastKind = "info" | "success" | "error" | "first" | "streak" | "trophy";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

type Listener = (toast: Toast) => void;
const listeners = new Set<Listener>();
let counter = 0;

/** Fire-and-forget notification; the <Toaster /> in the header renders it. */
export function toast(message: string, kind: ToastKind = "info") {
  const t: Toast = { id: ++counter, kind, message };
  for (const l of listeners) l(t);
}

const icons: Record<ToastKind, React.ReactNode> = {
  info: <Info className="size-4 text-accent" />,
  success: <CheckCircle2 className="size-4 text-success" />,
  error: <AlertTriangle className="size-4 text-danger" />,
  first: <Zap className="size-4 text-medium" />,
  streak: <Flame className="size-4 text-hard" />,
  trophy: <Trophy className="size-4 text-medium" />,
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener: Listener = (t) => {
      setToasts((prev) => [...prev.slice(-4), t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 4000);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-rise flex items-start gap-2.5 rounded-md border border-border bg-surface-2/95 px-3 py-2.5 text-sm shadow-xl backdrop-blur",
            t.kind === "error" && "border-danger/40",
            t.kind === "success" && "border-success/40",
          )}
        >
          <span className="mt-0.5 shrink-0">{icons[t.kind]}</span>
          <span className="text-text">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
