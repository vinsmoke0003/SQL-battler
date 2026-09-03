import type { RoomDifficulty } from "@/lib/questions/types";
import { cn } from "@/lib/utils";

const styles: Record<RoomDifficulty, string> = {
  easy: "bg-easy/12 text-easy border-easy/30",
  medium: "bg-medium/12 text-medium border-medium/30",
  hard: "bg-hard/12 text-hard border-hard/30",
  mixed: "bg-accent/12 text-accent border-accent/30",
};

export const difficultyColor: Record<RoomDifficulty, string> = {
  easy: "#34d399",
  medium: "#fbbf24",
  hard: "#f87171",
  mixed: "#5b8cff",
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: RoomDifficulty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]",
        styles[difficulty],
        className,
      )}
    >
      {difficulty}
    </span>
  );
}
