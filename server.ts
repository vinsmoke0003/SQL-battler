/**
 * Custom Next.js server that also hosts the Socket.IO room engine.
 * Run with `npm run dev` (development) or `npm run build && npm start`.
 */
import { createServer } from "node:http";
import next from "next";
import { Server, type Socket } from "socket.io";
import { RoomError, RoomManager, sanitizeNickname, sanitizeSettings } from "./lib/rooms/store";
import type {
  Ack,
  ClientToServerEvents,
  PlayerIdentity,
  ServerToClientEvents,
} from "./lib/rooms/types";
import { getDatabase } from "./lib/sql-runner/sandbox";
import { datasetIds } from "./lib/datasets";
import { allQuestions, getExpectedOutput } from "./lib/questions";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "localhost";
const port = Number(process.env.PORT || 3000);

interface SocketData {
  code?: string;
  playerId?: string;
}

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

async function main() {
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  await app.prepare();

  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(
    httpServer,
    { cors: { origin: false } },
  );

  const rooms = new RoomManager({
    onState: (room) => io.to(room.code).emit("room:state", rooms.toPublic(room)),
    onEvent: (room, event) => io.to(room.code).emit("battle:event", event),
    onStarted: (room) => io.to(room.code).emit("battle:started"),
    onFinished: (room) => io.to(room.code).emit("battle:finished"),
    onReset: (room) => io.to(room.code).emit("room:reset"),
    onKicked: (room, playerId) => {
      for (const socket of io.sockets.sockets.values()) {
        if (socket.data.code === room.code && socket.data.playerId === playerId) {
          socket.emit("room:kicked");
          socket.leave(room.code);
          socket.data.code = undefined;
        }
      }
    },
  });

  /** Wrap a handler so thrown RoomErrors become {ok:false} acks instead of crashes. */
  function safe<T extends object>(
    fn: () => Promise<T> | T,
    cb: ((r: Ack<T>) => void) | undefined,
  ): void {
    const reply = typeof cb === "function" ? cb : () => {};
    Promise.resolve()
      .then(fn)
      .then((data) => reply({ ok: true, ...data }))
      .catch((err: unknown) => {
        const message = err instanceof RoomError ? err.message : "Something went wrong.";
        if (!(err instanceof RoomError)) console.error(err);
        reply({ ok: false, error: message });
      });
  }

  function identityFrom(raw: PlayerIdentity): PlayerIdentity {
    const id = String(raw?.id ?? "").slice(0, 64);
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) throw new RoomError("Invalid player id.");
    return { id, nickname: sanitizeNickname(raw?.nickname) };
  }

  function bind(socket: AppSocket, code: string, playerId: string) {
    if (socket.data.code && socket.data.code !== code) socket.leave(socket.data.code);
    socket.data.code = code;
    socket.data.playerId = playerId;
    socket.join(code);
  }

  function requireBound(socket: AppSocket, code: string) {
    const room = rooms.require(code);
    const playerId = socket.data.playerId;
    if (!playerId || socket.data.code !== room.code) {
      throw new RoomError("Join the room first.");
    }
    return { room, playerId };
  }

  io.on("connection", (socket: AppSocket) => {
    socket.on("room:create", ({ player, settings }, cb) =>
      safe(() => {
        const identity = identityFrom(player);
        const room = rooms.create(identity, sanitizeSettings(settings ?? {}));
        bind(socket, room.code, identity.id);
        return { code: room.code };
      }, cb),
    );

    socket.on("room:join", ({ code, player }, cb) =>
      safe(() => {
        const identity = identityFrom(player);
        const room = rooms.require(String(code ?? ""));
        rooms.join(room, identity);
        bind(socket, room.code, identity.id);
        return { room: rooms.toPublic(room) };
      }, cb),
    );

    socket.on("room:leave", ({ code }) => {
      const room = rooms.get(String(code ?? ""));
      if (!room || !socket.data.playerId) return;
      rooms.leave(room, socket.data.playerId);
      socket.leave(room.code);
      socket.data.code = undefined;
    });

    socket.on("room:start", ({ code }, cb) =>
      safe(async () => {
        const { room, playerId } = requireBound(socket, code);
        await rooms.start(room, playerId);
        return {};
      }, cb),
    );

    socket.on("room:kick", ({ code, playerId: target }, cb) =>
      safe(() => {
        const { room, playerId } = requireBound(socket, code);
        rooms.kick(room, playerId, String(target));
        return {};
      }, cb),
    );

    socket.on("room:end", ({ code }, cb) =>
      safe(() => {
        const { room, playerId } = requireBound(socket, code);
        rooms.end(room, playerId);
        return {};
      }, cb),
    );

    socket.on("room:rematch", ({ code }, cb) =>
      safe(() => {
        const { room, playerId } = requireBound(socket, code);
        rooms.rematch(room, playerId);
        return {};
      }, cb),
    );

    socket.on("room:results", ({ code }, cb) =>
      safe(() => {
        const room = rooms.require(String(code ?? ""));
        return { results: rooms.results(room) };
      }, cb),
    );

    socket.on("battle:current", ({ code }, cb) =>
      safe(async () => {
        const { room, playerId } = requireBound(socket, code);
        return rooms.current(room, playerId);
      }, cb),
    );

    socket.on("battle:submit", ({ code, sql }, cb) =>
      safe(async () => {
        const { room, playerId } = requireBound(socket, code);
        return rooms.submit(room, playerId, String(sql ?? ""));
      }, cb),
    );

    socket.on("battle:hint", ({ code }, cb) =>
      safe(() => {
        const { room, playerId } = requireBound(socket, code);
        return rooms.hint(room, playerId);
      }, cb),
    );

    socket.on("battle:skip", ({ code }, cb) =>
      safe(() => {
        const { room, playerId } = requireBound(socket, code);
        return rooms.skip(room, playerId);
      }, cb),
    );

    socket.on("disconnect", () => {
      const { code, playerId } = socket.data;
      if (!code || !playerId) return;
      const room = rooms.get(code);
      if (!room) return;
      // Another socket for the same player may still be open (two tabs).
      for (const other of io.sockets.sockets.values()) {
        if (other.id !== socket.id && other.data.code === code && other.data.playerId === playerId) {
          return;
        }
      }
      rooms.disconnect(room, playerId);
    });
  });

  // Warm the sandboxes and expected outputs so the first battle is snappy.
  await Promise.all(datasetIds.map((id) => getDatabase(id)));
  await Promise.all(allQuestions.map((q) => getExpectedOutput(q)));

  httpServer.listen(port, () => {
    console.log(`> SQL Battle ready on http://${hostname}:${port} (${dev ? "dev" : "prod"})`);
    console.log(`> ${allQuestions.length} questions across ${datasetIds.length} datasets`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
