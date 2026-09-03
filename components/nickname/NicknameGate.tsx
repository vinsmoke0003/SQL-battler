"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { UserRound } from "lucide-react";
import type { PlayerIdentity } from "@/lib/rooms/types";
import { loadIdentity, saveNickname } from "@/lib/client/identity";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";

/**
 * No accounts in the MVP: players pick a nickname once and we keep a random
 * player id in localStorage so refreshes and rematches keep their seat.
 */
export function NicknameGate({
  title = "Pick a nickname",
  children,
}: {
  title?: string;
  children: (identity: PlayerIdentity, changeName: () => void) => ReactNode;
}) {
  const [identity, setIdentity] = useState<PlayerIdentity | null | undefined>(undefined);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const existing = loadIdentity();
    setIdentity(existing);
    if (existing) setDraft(existing.nickname);
  }, []);

  if (identity === undefined) return null;

  if (identity && identity.nickname) {
    return <>{children(identity, () => setIdentity({ ...identity, nickname: "" }))}</>;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = draft.trim();
    if (name.length < 2) return;
    setIdentity(saveNickname(name));
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full animate-rise">
        <CardBody className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-md bg-accent/15 text-accent">
              <UserRound className="size-4" />
            </span>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <p className="mb-4 text-sm text-muted">
            No sign-up needed. This is the name your friends will see on the leaderboard.
          </p>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                autoFocus
                maxLength={20}
                placeholder="e.g. Vinsmoke"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={draft.trim().length < 2}>
              Continue
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
