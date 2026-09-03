"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Copy, Crown, Link2, LogOut, Play, UserX, Wifi, WifiOff } from "lucide-react";
import { getSocket, request } from "@/lib/client/socket";
import { useRoom } from "@/lib/client/useRoom";
import { NicknameGate } from "@/components/nickname/NicknameGate";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { DifficultyBadge } from "@/components/difficulty-badge/DifficultyBadge";
import { toast } from "@/components/toast/Toaster";
import type { PlayerIdentity } from "@/lib/rooms/types";
import { cn } from "@/lib/utils";

export default function LobbyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = use(params);
  const code = rawCode.toUpperCase();
  return (
    <NicknameGate title="Before you join">
      {(identity) => <Lobby code={code} identity={identity} />}
    </NicknameGate>
  );
}

function Lobby({ code, identity }: { code: string; identity: PlayerIdentity }) {
  const router = useRouter();
  const { room, error, me, isHost } = useRoom(code, identity);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    const socket = getSocket();
    const onStarted = () => router.push(`/battle/${code}`);
    const onKicked = () => {
      toast("The host removed you from the room.", "error");
      router.push("/");
    };
    const onEvent = (e: { type: string; nickname?: string }) => {
      if (e.type === "player_joined" && e.nickname !== identity.nickname) toast(`${e.nickname} joined`, "info");
      if (e.type === "player_left") toast(`${e.nickname} left`, "info");
    };
    socket.on("battle:started", onStarted);
    socket.on("room:kicked", onKicked);
    socket.on("battle:event", onEvent);
    return () => {
      socket.off("battle:started", onStarted);
      socket.off("room:kicked", onKicked);
      socket.off("battle:event", onEvent);
    };
  }, [code, router, identity.nickname]);

  // If the battle is already running (refresh mid-game), go straight to it.
  useEffect(() => {
    if (room?.status === "live") router.replace(`/battle/${code}`);
    if (room?.status === "finished") router.replace(`/results/${code}`);
  }, [room?.status, code, router]);

  const copy = async (what: "code" | "link") => {
    const text = what === "code" ? code : `${window.location.origin}/join?code=${code}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast("Couldn't copy — select the code manually.", "error");
    }
  };

  const start = async () => {
    setStarting(true);
    try {
      await request("room:start", { code });
    } catch (err) {
      toast((err as Error).message, "error");
      setStarting(false);
    }
  };

  const kick = async (playerId: string) => {
    try {
      await request("room:kick", { code, playerId });
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const leave = () => {
    getSocket().emit("room:leave", { code });
    router.push("/");
  };

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Couldn't join room {code}</h1>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/join"><Button variant="secondary">Try another code</Button></Link>
          <Link href="/create"><Button>Create a room</Button></Link>
        </div>
      </div>
    );
  }

  if (!room) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Joining room…</div>;
  }

  const s = room.settings;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Waiting lobby</p>
          <h1 className="text-2xl font-bold tracking-tight">{s.name}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={leave}>
          <LogOut className="size-3.5" /> Leave
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="animate-rise">
            <CardBody className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="text-xs uppercase tracking-[0.14em] text-muted">Room code</span>
              <div className="font-mono text-5xl font-bold tracking-[0.35em] text-accent-strong">
                {code}
              </div>
              <p className="text-sm text-muted">Share this code with your friends.</p>
              <div className="mt-1 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => copy("code")}>
                  {copied === "code" ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  Copy code
                </Button>
                <Button variant="secondary" size="sm" onClick={() => copy("link")}>
                  {copied === "link" ? <Check className="size-3.5 text-success" /> : <Link2 className="size-3.5" />}
                  Copy invite link
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Players · {room.players.length}</CardTitle>
              {isHost ? <span className="text-[11px] text-muted">You are the host</span> : null}
            </CardHeader>
            <CardBody className="p-2">
              <ul className="divide-y divide-border/60">
                {room.players.map((p) => (
                  <li key={p.id} className={cn("flex items-center gap-3 px-2 py-2.5", !p.connected && "opacity-50")}>
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-full text-sm font-semibold",
                        p.id === identity.id ? "bg-accent/20 text-accent-strong" : "bg-surface-3 text-muted",
                      )}
                    >
                      {p.nickname.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="flex-1 truncate font-medium">
                      {p.nickname}
                      {p.id === identity.id ? <span className="ml-1.5 text-xs text-muted">(you)</span> : null}
                    </span>
                    {p.isHost ? (
                      <span className="inline-flex items-center gap-1 text-xs text-medium">
                        <Crown className="size-3.5" /> Host
                      </span>
                    ) : null}
                    {p.connected ? (
                      <Wifi className="size-3.5 text-success" />
                    ) : (
                      <WifiOff className="size-3.5 text-faint" />
                    )}
                    {isHost && p.id !== identity.id ? (
                      <button
                        type="button"
                        title="Remove player"
                        onClick={() => kick(p.id)}
                        className="rounded p-1 text-faint hover:bg-danger/10 hover:text-danger"
                      >
                        <UserX className="size-4" />
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              {room.round > 0 ? <span className="text-[11px] text-muted">Round {room.round + 1}</span> : null}
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <Row label="Difficulty"><DifficultyBadge difficulty={s.difficulty} /></Row>
              <Row label="Questions">{s.questionCount}</Row>
              <Row label="Duration">{s.durationMinutes} min</Row>
              <Row label="Order">{s.questionOrder === "same" ? "Same for everyone" : "Shuffled per player"}</Row>
              <Row label="Scoring">{s.penalty ? "Competitive (−2 wrong)" : "Normal"}</Row>
            </CardBody>
          </Card>

          {isHost ? (
            <Button size="lg" className="w-full" onClick={start} loading={starting}>
              <Play className="size-4" /> Start battle
            </Button>
          ) : (
            <div className="rounded-md border border-dashed border-border px-4 py-3 text-center text-sm text-muted">
              Waiting for {room.players.find((p) => p.isHost)?.nickname ?? "the host"} to start…
            </div>
          )}
          {me && !me.connected ? (
            <p className="text-center text-xs text-danger">Reconnecting…</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-text">{children}</span>
    </div>
  );
}
