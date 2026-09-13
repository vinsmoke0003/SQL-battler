"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Brain,
  Calculator,
  Check,
  Clock,
  Layers,
  Play,
  RotateCcw,
  Route,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type GameMode = "memory" | "math" | "path" | "full";
type GameResult = { score: number; maxScore: number };

const modes: Array<{
  id: GameMode;
  title: string;
  eyebrow: string;
  description: string;
  meta: string;
  icon: typeof Brain;
}> = [
  {
    id: "memory",
    title: "Memory Maze",
    eyebrow: "Spatial memory",
    description: "Memorise a route, then reproduce it after the highlighted tiles disappear.",
    meta: "4 rounds · 60 seconds",
    icon: Brain,
  },
  {
    id: "math",
    title: "Quick-Fire Math",
    eyebrow: "Numerical speed",
    description: "Evaluate four expressions and tap them from the smallest value to the largest.",
    meta: "8 rounds · 60 seconds",
    icon: Calculator,
  },
  {
    id: "path",
    title: "Path Finder",
    eyebrow: "Logical navigation",
    description: "Build a valid route from start to finish while avoiding blocked grid cells.",
    meta: "3 grids · 75 seconds",
    icon: Route,
  },
  {
    id: "full",
    title: "Full Mock Simulation",
    eyebrow: "Complete practice",
    description: "Play all three activities back to back and receive one combined score.",
    meta: "3 games · one sitting",
    icon: Layers,
  },
];

function isMode(value: string | null): value is GameMode {
  return modes.some((mode) => mode.id === value);
}

export function GamifiedAssessment() {
  const params = useSearchParams();
  const requested = params.get("game");
  const [mode, setMode] = useState<GameMode | null>(isMode(requested) ? requested : null);
  const [run, setRun] = useState(0);

  const open = (next: GameMode) => {
    setMode(next);
    setRun((value) => value + 1);
  };

  if (!mode) return <GameMenu onOpen={open} />;

  const common = {
    onExit: () => setMode(null),
    onReplay: () => setRun((value) => value + 1),
  };

  if (mode === "memory") return <MemoryMaze key={`${mode}-${run}`} {...common} />;
  if (mode === "math") return <QuickFireMath key={`${mode}-${run}`} {...common} />;
  if (mode === "path") return <PathFinder key={`${mode}-${run}`} {...common} />;
  return <FullSimulation key={`${mode}-${run}`} {...common} />;
}

function GameMenu({ onOpen }: { onOpen: (mode: GameMode) => void }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
      <Link
        href="/practice"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
      >
        <ArrowLeft className="size-3.5" /> Practice
      </Link>

      <header className="animate-rise mt-8 max-w-3xl">
        <p className="eyebrow">Accenture assessment practice</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Gamified Assessment Simulator
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">
          Practise the memory, numerical-speed and path-finding game styles commonly reported in
          campus assessments. No signup, login or payment—start immediately.
        </p>
      </header>

      <section className="mt-10 grid gap-px overflow-hidden rounded-panel border border-border bg-border md:grid-cols-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onOpen(mode.id)}
              className="group bg-surface p-5 text-left transition-colors hover:bg-surface-2 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-control bg-accent/10 text-accent-strong">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="eyebrow">{mode.eyebrow}</span>
                  <span className="mt-2 block text-base font-semibold text-text">{mode.title}</span>
                  <span className="mt-1.5 block text-[13px] leading-relaxed text-muted">
                    {mode.description}
                  </span>
                  <span className="mt-3 block font-mono text-[11px] text-faint">{mode.meta}</span>
                </span>
                <Play className="mt-1 size-4 shrink-0 text-faint transition-colors group-hover:text-accent" />
              </div>
            </button>
          );
        })}
      </section>

      <aside className="mt-8 border-l-2 border-warn/60 pl-4">
        <p className="text-[13px] leading-relaxed text-muted">
          Assessment formats can vary by role, college and hiring drive. Use this as pattern
          practice, and follow the instructions in your official test invitation on exam day.
        </p>
        <p className="mt-2 text-[13px] font-medium text-text">
          Never pay anyone for recruitment, placement or mandatory training. Accenture states that
          it does not charge candidates fees during recruitment.
        </p>
        <a
          href="https://www.accenture.com/in-en/careers/explore-careers/area-of-interest/journey-to-accenture"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-muted underline decoration-border underline-offset-4 hover:text-text"
        >
          Accenture recruitment guidance
        </a>
      </aside>
    </div>
  );
}

function useCountdown(seconds: number, stopped: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (stopped) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          window.setTimeout(() => expireRef.current(), 0);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stopped]);

  return remaining;
}

function GameTopBar({
  label,
  score,
  remaining,
  onExit,
}: {
  label: string;
  score: number;
  remaining: number;
  onExit: () => void;
}) {
  return (
    <header className="flex min-h-12 items-center gap-3 border-b border-border bg-surface px-3 sm:px-5">
      <button
        type="button"
        onClick={onExit}
        className="grid size-8 shrink-0 place-items-center rounded-control text-muted hover:bg-surface-2 hover:text-text"
        aria-label="Leave game"
      >
        <ArrowLeft className="size-4" />
      </button>
      <span className="truncate text-[13px] font-medium">{label}</span>
      <div className="ml-auto flex shrink-0 items-center gap-3 font-mono text-xs">
        <span className="text-faint">
          Score <strong className="text-text">{score}</strong>
        </span>
        <span className={cn("inline-flex items-center gap-1.5", remaining <= 10 ? "text-danger" : "text-muted")}>
          <Clock className="size-3.5" /> {remaining}s
        </span>
      </div>
    </header>
  );
}

function ResultScreen({
  title,
  result,
  onReplay,
  onExit,
}: {
  title: string;
  result: GameResult;
  onReplay: () => void;
  onExit: () => void;
}) {
  const pct = result.maxScore ? Math.round((result.score / result.maxScore) * 100) : 0;
  return (
    <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-md flex-col justify-center px-5 py-12 text-center">
      <Trophy className="mx-auto size-8 text-medium" />
      <p className="eyebrow mt-5">Practice complete</p>
      <h1 className="mt-2 text-xl font-semibold">{title}</h1>
      <div className="mt-7 border-y border-border py-6">
        <p className="font-mono text-4xl font-semibold">
          {result.score}<span className="text-xl text-faint">/{result.maxScore}</span>
        </p>
        <p className="mt-2 text-sm text-muted">{pct}% of the available score</p>
      </div>
      <div className="mt-7 flex justify-center gap-2">
        <Button onClick={onReplay}><RotateCcw /> Try again</Button>
        <Button variant="secondary" onClick={onExit}>All games</Button>
      </div>
    </div>
  );
}

const memoryRoutes = [
  [0, 1, 6, 11, 12],
  [20, 15, 16, 11, 6, 7],
  [4, 9, 8, 13, 18, 17, 22],
  [24, 19, 14, 13, 8, 3, 2, 1],
];

function MemoryMaze({
  onExit,
  onReplay,
  onComplete,
}: {
  onExit: () => void;
  onReplay: () => void;
  onComplete?: (result: GameResult) => void;
}) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"memorise" | "input">("memorise");
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [mistake, setMistake] = useState<number | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const route = memoryRoutes[round];
  const maxScore = memoryRoutes.reduce((total, path) => total + path.length * 10, 0);
  const finish = () => setResult((current) => current ?? { score, maxScore });
  const remaining = useCountdown(60, Boolean(result), finish);

  useEffect(() => {
    if (result) return;
    setPhase("memorise");
    setStep(0);
    setMistake(null);
    const timer = window.setTimeout(() => setPhase("input"), 2200);
    return () => window.clearTimeout(timer);
  }, [round, result]);

  useEffect(() => {
    if (result && onComplete) onComplete(result);
  }, [result, onComplete]);

  if (result && !onComplete) {
    return <ResultScreen title="Memory Maze" result={result} onReplay={onReplay} onExit={onExit} />;
  }

  const choose = (cell: number) => {
    if (phase !== "input" || result) return;
    if (cell !== route[step]) {
      setMistake(cell);
      setScore((value) => Math.max(0, value - 5));
      setStep(0);
      window.setTimeout(() => setMistake(null), 350);
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep === route.length) {
      const nextScore = score + route.length * 10;
      setScore(nextScore);
      if (round === memoryRoutes.length - 1) setResult({ score: nextScore, maxScore });
      else window.setTimeout(() => setRound((value) => value + 1), 350);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col">
      <GameTopBar label="Memory Maze" score={score} remaining={remaining} onExit={onExit} />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-5 py-9 text-center sm:py-12">
        <p className="eyebrow">Round {round + 1} of {memoryRoutes.length}</p>
        <h1 className="mt-3 text-xl font-semibold">
          {phase === "memorise" ? "Memorise the highlighted route" : "Reproduce the route from start to finish"}
        </h1>
        <p className="mt-2 text-[13px] text-muted">
          {phase === "memorise" ? "The route disappears in a moment." : `Correct tiles: ${step}/${route.length}`}
        </p>
        <div className="mt-8 grid w-full max-w-[390px] grid-cols-5 gap-2" aria-label="Memory maze grid">
          {Array.from({ length: 25 }, (_, cell) => {
            const routeIndex = route.indexOf(cell);
            const shown = phase === "memorise" && routeIndex >= 0;
            const completed = phase === "input" && routeIndex >= 0 && routeIndex < step;
            return (
              <button
                key={cell}
                type="button"
                onClick={() => choose(cell)}
                disabled={phase !== "input"}
                aria-label={`Tile ${cell + 1}${cell === route[0] ? ", start" : ""}${cell === route.at(-1) ? ", finish" : ""}`}
                className={cn(
                  "relative aspect-square rounded-control border transition-colors",
                  shown ? "border-accent bg-accent/45" : "border-border bg-surface-2",
                  completed && "border-success bg-success/30",
                  mistake === cell && "border-danger bg-danger/35",
                  phase === "input" && "hover:border-border-strong",
                )}
              >
                {shown ? <span className="font-mono text-xs text-white">{routeIndex + 1}</span> : null}
                {phase === "input" && cell === route[0] && step === 0 ? <span className="text-[10px] text-easy">START</span> : null}
                {phase === "input" && cell === route.at(-1) ? <span className="text-[10px] text-medium">END</span> : null}
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-faint">
          A wrong tile resets the current route and removes 5 points. The timer continues across all rounds.
        </p>
      </main>
    </div>
  );
}

const mathRounds = [
  [{ text: "18 ÷ 3", value: 6 }, { text: "3 + 5", value: 8 }, { text: "4 × 3", value: 12 }, { text: "20 − 5", value: 15 }],
  [{ text: "7 − 9", value: -2 }, { text: "12 ÷ 4", value: 3 }, { text: "2³", value: 8 }, { text: "6 + 7", value: 13 }],
  [{ text: "5 × 2 − 7", value: 3 }, { text: "24 ÷ 4", value: 6 }, { text: "3²", value: 9 }, { text: "8 + 6", value: 14 }],
  [{ text: "30 ÷ 6", value: 5 }, { text: "4 + 4", value: 8 }, { text: "21 − 9", value: 12 }, { text: "5 × 3", value: 15 }],
  [{ text: "2 − 8", value: -6 }, { text: "16 ÷ 8", value: 2 }, { text: "11 − 4", value: 7 }, { text: "3 × 4", value: 12 }],
  [{ text: "14 ÷ 2 − 3", value: 4 }, { text: "2 × 4", value: 8 }, { text: "18 − 7", value: 11 }, { text: "4²", value: 16 }],
  [{ text: "9 − 12", value: -3 }, { text: "15 ÷ 3", value: 5 }, { text: "6 + 4", value: 10 }, { text: "7 × 2", value: 14 }],
  [{ text: "20 ÷ 5", value: 4 }, { text: "3 + 6", value: 9 }, { text: "2 × 6", value: 12 }, { text: "25 − 8", value: 17 }],
];

function QuickFireMath({
  onExit,
  onReplay,
  onComplete,
}: {
  onExit: () => void;
  onReplay: () => void;
  onComplete?: (result: GameResult) => void;
}) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const maxScore = mathRounds.length * 40;
  const finish = () => setResult((current) => current ?? { score, maxScore });
  const remaining = useCountdown(60, Boolean(result), finish);
  const expressions = mathRounds[round];
  const order = useMemo(
    () => expressions.map((item, index) => ({ ...item, index })).sort((a, b) => a.value - b.value).map((item) => item.index),
    [expressions],
  );

  useEffect(() => {
    if (result && onComplete) onComplete(result);
  }, [result, onComplete]);

  if (result && !onComplete) {
    return <ResultScreen title="Quick-Fire Math" result={result} onReplay={onReplay} onExit={onExit} />;
  }

  const choose = (index: number) => {
    if (result || picked.includes(index)) return;
    if (index !== order[picked.length]) {
      setWrong(index);
      setPicked([]);
      setScore((value) => Math.max(0, value - 5));
      window.setTimeout(() => setWrong(null), 350);
      return;
    }
    const next = [...picked, index];
    setPicked(next);
    if (next.length === expressions.length) {
      const nextScore = score + 40;
      setScore(nextScore);
      if (round === mathRounds.length - 1) setResult({ score: nextScore, maxScore });
      else window.setTimeout(() => { setRound((value) => value + 1); setPicked([]); }, 300);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col">
      <GameTopBar label="Quick-Fire Math" score={score} remaining={remaining} onExit={onExit} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-5 py-9 text-center sm:py-12">
        <p className="eyebrow">Round {round + 1} of {mathRounds.length}</p>
        <h1 className="mt-3 text-xl font-semibold">Tap from smallest to largest</h1>
        <p className="mt-2 text-[13px] text-muted">Selected {picked.length} of {expressions.length}</p>
        <div className="mt-9 grid w-full grid-cols-2 gap-3">
          {expressions.map((item, index) => {
            const position = picked.indexOf(index);
            return (
              <button
                key={item.text}
                type="button"
                onClick={() => choose(index)}
                disabled={position >= 0}
                className={cn(
                  "relative min-h-24 rounded-panel border bg-surface-2 px-3 font-mono text-xl transition-colors hover:border-accent/60",
                  position >= 0 && "border-success/50 bg-success/10 text-success",
                  wrong === index && "border-danger bg-danger/15 text-danger",
                )}
              >
                {item.text}
                {position >= 0 ? (
                  <span className="absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full bg-success text-[10px] font-bold text-[#04281d]">
                    {position + 1}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-faint">
          An incorrect choice clears the current order and removes 5 points.
        </p>
      </main>
    </div>
  );
}

const pathPuzzles = [
  { start: 0, end: 35, walls: [2, 8, 10, 14, 16, 20, 22, 26, 28] },
  { start: 30, end: 5, walls: [1, 7, 9, 12, 15, 16, 20, 25, 27, 28] },
  { start: 3, end: 32, walls: [6, 8, 12, 13, 15, 19, 22, 24, 26, 30] },
];

function adjacent(a: number, b: number) {
  const ax = a % 6;
  const ay = Math.floor(a / 6);
  const bx = b % 6;
  const by = Math.floor(b / 6);
  return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
}

function PathFinder({
  onExit,
  onReplay,
  onComplete,
}: {
  onExit: () => void;
  onReplay: () => void;
  onComplete?: (result: GameResult) => void;
}) {
  const [round, setRound] = useState(0);
  const [path, setPath] = useState<number[]>([pathPuzzles[0].start]);
  const [score, setScore] = useState(0);
  const [invalid, setInvalid] = useState<number | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const maxScore = pathPuzzles.length * 100;
  const puzzle = pathPuzzles[round];
  const finish = () => setResult((current) => current ?? { score, maxScore });
  const remaining = useCountdown(75, Boolean(result), finish);

  useEffect(() => {
    if (result && onComplete) onComplete(result);
  }, [result, onComplete]);

  if (result && !onComplete) {
    return <ResultScreen title="Path Finder" result={result} onReplay={onReplay} onExit={onExit} />;
  }

  const choose = (cell: number) => {
    if (result || puzzle.walls.includes(cell)) return;
    const current = path.at(-1)!;
    if (cell === current) return;
    if (path.length > 1 && cell === path.at(-2)) {
      setPath((value) => value.slice(0, -1));
      return;
    }
    if (!adjacent(current, cell) || path.includes(cell)) {
      setInvalid(cell);
      window.setTimeout(() => setInvalid(null), 300);
      return;
    }
    const nextPath = [...path, cell];
    setPath(nextPath);
    if (cell === puzzle.end) {
      const roundScore = 100;
      const nextScore = score + roundScore;
      setScore(nextScore);
      if (round === pathPuzzles.length - 1) setResult({ score: nextScore, maxScore });
      else window.setTimeout(() => {
        const nextRound = round + 1;
        setRound(nextRound);
        setPath([pathPuzzles[nextRound].start]);
      }, 450);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col">
      <GameTopBar label="Path Finder" score={score} remaining={remaining} onExit={onExit} />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-5 py-9 text-center sm:py-12">
        <p className="eyebrow">Grid {round + 1} of {pathPuzzles.length}</p>
        <h1 className="mt-3 text-xl font-semibold">Connect start to finish</h1>
        <p className="mt-2 text-[13px] text-muted">Tap an adjacent open tile. Tap the previous tile to undo.</p>
        <div className="mt-8 grid w-full max-w-[420px] grid-cols-6 gap-2" aria-label="Path finder grid">
          {Array.from({ length: 36 }, (_, cell) => {
            const blocked = puzzle.walls.includes(cell);
            const selected = path.includes(cell);
            return (
              <button
                key={cell}
                type="button"
                onClick={() => choose(cell)}
                disabled={blocked}
                aria-label={blocked ? `Blocked tile ${cell + 1}` : cell === puzzle.start ? "Start tile" : cell === puzzle.end ? "Finish tile" : `Open tile ${cell + 1}`}
                className={cn(
                  "aspect-square rounded-control border font-mono text-[10px] transition-colors",
                  blocked ? "border-border bg-bg opacity-35" : "border-border bg-surface-2 hover:border-accent/60",
                  selected && "border-accent bg-accent/35",
                  cell === puzzle.start && "border-success bg-success/25 text-success",
                  cell === puzzle.end && "border-medium bg-medium/20 text-medium",
                  invalid === cell && "border-danger bg-danger/25",
                )}
              >
                {cell === puzzle.start ? "START" : cell === puzzle.end ? "END" : blocked ? "×" : selected ? <Check className="mx-auto size-3.5" /> : ""}
              </button>
            );
          })}
        </div>
        <Button variant="ghost" size="sm" className="mt-5" onClick={() => setPath([puzzle.start])}>
          <RotateCcw /> Reset this grid
        </Button>
      </main>
    </div>
  );
}

function FullSimulation({ onExit, onReplay }: { onExit: () => void; onReplay: () => void }) {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [results, setResults] = useState<GameResult[]>([]);
  const games = ["Memory Maze", "Quick-Fire Math", "Path Finder"];

  const complete = (result: GameResult) => {
    setResults((current) => [...current, result]);
    setStage((current) => (current + 1) as 0 | 1 | 2 | 3);
  };

  if (stage === 3) {
    const total = results.reduce((sum, result) => sum + result.score, 0);
    const max = results.reduce((sum, result) => sum + result.maxScore, 0);
    return <ResultScreen title="Full Mock Simulation" result={{ score: total, maxScore: max }} onReplay={onReplay} onExit={onExit} />;
  }

  return (
    <div>
      <div className="border-b border-accent/20 bg-accent/[0.06] px-4 py-2 text-center font-mono text-[11px] text-accent-strong">
        FULL SIMULATION · GAME {stage + 1}/3 · {games[stage]}
      </div>
      {stage === 0 ? <MemoryMaze onExit={onExit} onReplay={onReplay} onComplete={complete} /> : null}
      {stage === 1 ? <QuickFireMath onExit={onExit} onReplay={onReplay} onComplete={complete} /> : null}
      {stage === 2 ? <PathFinder onExit={onExit} onReplay={onReplay} onComplete={complete} /> : null}
    </div>
  );
}
