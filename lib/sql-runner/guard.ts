/**
 * Static checks applied to contestant SQL before it touches the sandbox.
 * The sandbox is also opened in query_only mode, so this is defence in depth,
 * not the only barrier.
 */

export const MAX_QUERY_LENGTH = 5000;

const FORBIDDEN = [
  "DROP",
  "DELETE",
  "UPDATE",
  "INSERT",
  "ALTER",
  "TRUNCATE",
  "CREATE",
  "GRANT",
  "REVOKE",
  "ATTACH",
  "DETACH",
  "PRAGMA",
  "VACUUM",
  "REPLACE",
  "REINDEX",
];

// Remove line comments, block comments, and blank out string literals.
function stripCommentsAndStrings(sql: string): string {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (ch === "-" && next === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      i++;
      while (i < sql.length) {
        if (sql[i] === quote) {
          if (sql[i + 1] === quote) {
            i += 2;
            continue;
          }
          break;
        }
        i++;
      }
      i++;
      out += quote + quote;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export type GuardResult = { ok: true; sql: string } | { ok: false; error: string };

export function guardQuery(raw: string): GuardResult {
  if (typeof raw !== "string") return { ok: false, error: "Query must be a string." };
  if (raw.length > MAX_QUERY_LENGTH) {
    return { ok: false, error: `Query is too long (max ${MAX_QUERY_LENGTH} characters).` };
  }

  const stripped = stripCommentsAndStrings(raw).trim();
  // Allow a single trailing semicolon, nothing after it.
  const body = stripped.replace(/;\s*$/, "").trim();
  if (!body) return { ok: false, error: "Write a query first." };
  if (body.includes(";")) {
    return { ok: false, error: "Only a single statement is allowed." };
  }

  const firstWord = body.split(/\s+/)[0]?.toUpperCase();
  if (firstWord !== "SELECT" && firstWord !== "WITH") {
    return { ok: false, error: "Only SELECT (or WITH ... SELECT) queries are allowed." };
  }

  for (const word of FORBIDDEN) {
    if (new RegExp(`\\b${word}\\b`, "i").test(body)) {
      return { ok: false, error: `${word} is not allowed in the sandbox.` };
    }
  }

  return { ok: true, sql: raw.trim().replace(/;\s*$/, "") };
}
