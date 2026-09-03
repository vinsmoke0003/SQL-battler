"use client";

import { useEffect, useRef, useState } from "react";
import type { PlayerIdentity, PlayerPublic, RoomPublic } from "@/lib/rooms/types";
import { getSocket, request } from "./socket";

/**
 * Joins (or re-joins) a room and mirrors its public state. Re-joins after a
 * socket reconnect so a flaky connection doesn't drop the player's seat.
 */
export function useRoom(code: string, identity: PlayerIdentity | null) {
  const [room, setRoom] = useState<RoomPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serverOffset, setServerOffset] = useState(0);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!identity) return;
    const socket = getSocket();
    let cancelled = false;

    const apply = (r: RoomPublic) => {
      if (cancelled) return;
      setRoom(r);
      setServerOffset(r.serverNow - Date.now());
    };

    const join = async () => {
      try {
        const { room: r } = await request("room:join", { code, player: identity });
        joinedRef.current = true;
        setError(null);
        apply(r);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    };

    socket.on("room:state", apply);
    socket.on("connect", join);
    if (socket.connected) join();

    return () => {
      cancelled = true;
      socket.off("room:state", apply);
      socket.off("connect", join);
    };
  }, [code, identity]);

  const me: PlayerPublic | undefined = room?.players.find((p) => p.id === identity?.id);
  return { room, error, serverOffset, me, isHost: Boolean(me?.isHost) };
}
