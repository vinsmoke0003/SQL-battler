"use client";

import type { PlayerIdentity } from "@/lib/rooms/types";

const KEY = "sqlbattle:player";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export function loadIdentity(): PlayerIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlayerIdentity>;
    if (typeof parsed.id === "string" && typeof parsed.nickname === "string") {
      return { id: parsed.id, nickname: parsed.nickname };
    }
  } catch {
    // ignore corrupt storage
  }
  return null;
}

export function saveNickname(nickname: string): PlayerIdentity {
  const existing = loadIdentity();
  const identity: PlayerIdentity = {
    id: existing?.id ?? randomId(),
    nickname: nickname.trim().slice(0, 20),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(identity));
  } catch {
    // storage unavailable; identity lives for this page only
  }
  return identity;
}
