"use client";

import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/rooms/types";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

/** One socket per browser tab, shared across client-side navigations. */
export function getSocket(): AppSocket {
  if (!socket) {
    socket = io({ transports: ["websocket", "polling"], autoConnect: true });
  }
  return socket;
}

type AckOf<K extends keyof ClientToServerEvents> = Parameters<ClientToServerEvents[K]>[1] extends (
  r: infer R,
) => void
  ? Extract<R, { ok: true }>
  : never;

/** Promisified emit-with-ack. Resolves with the ack payload, rejects on {ok:false}. */
export function request<K extends keyof ClientToServerEvents>(
  event: K,
  payload: Parameters<ClientToServerEvents[K]>[0],
): Promise<AckOf<K>> {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    const timer = setTimeout(() => reject(new Error("The server took too long to respond.")), 10_000);
    // Socket.IO's typed emit can't express the generic ack, so we go through `any` once.
    (s.emit as unknown as (e: string, p: unknown, cb: (r: { ok: boolean; error?: string }) => void) => void)(
      event,
      payload,
      (r) => {
        clearTimeout(timer);
        if (r && r.ok) resolve(r as never);
        else reject(new Error(r?.error ?? "Request failed."));
      },
    );
  });
}
