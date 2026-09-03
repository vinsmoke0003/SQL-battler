"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Database, Swords, Timer, Trophy, Users, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const features = [
  {
    icon: Users,
    title: "Private rooms",
    body: "Create a room, share a 5-letter code, and your friends are in. No accounts.",
  },
  {
    icon: Database,
    title: "Prebuilt databases",
    body: "Company, E-Commerce and University datasets are ready to query. Nothing to set up.",
  },
  {
    icon: Zap,
    title: "Instant execution",
    body: "Run SQL in a sandboxed SQLite engine and see results in milliseconds.",
  },
  {
    icon: Trophy,
    title: "Live leaderboard",
    body: "Points for correct answers, speed bonuses, streaks and first-solver bragging rights.",
  },
  {
    icon: Timer,
    title: "Timed contests",
    body: "5 to 20 questions, 15 to 45 minutes. Easy, Medium, Hard or Mixed.",
  },
  {
    icon: BookOpen,
    title: "Solo practice",
    body: "Warm up alone with the same question bank and replay the ones you missed.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const join = (e: FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length >= 4) router.push(`/join?code=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="grid-bg flex-1">
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 md:pt-28">
        <div className="animate-rise mx-auto max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
            <Swords className="size-3.5 text-accent" />
            Multiplayer SQL practice for friends
          </div>
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Compete.{" "}
            <span className="text-accent-strong">Query.</span>{" "}
            Conquer.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted md:text-lg">
            Create a room, invite your friends, and race to solve SQL challenges against the same
            database in real time. Practice for placements without practising alone.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-3">
            <Button size="lg" onClick={() => router.push("/create")}>
              <Swords className="size-4" /> Create battle
            </Button>
            <form onSubmit={join} className="flex gap-2">
              <Input
                aria-label="Room code"
                placeholder="Room code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="h-12 text-center font-mono text-base uppercase tracking-[0.3em]"
              />
              <Button type="submit" variant="secondary" size="lg" disabled={code.trim().length < 4}>
                Join <ArrowRight className="size-4" />
              </Button>
            </form>
            <Link href="/practice" className="text-sm text-muted hover:text-text">
              or practice solo →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-surface/80 p-5 backdrop-blur"
            >
              <f.icon className="mb-3 size-5 text-accent" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
