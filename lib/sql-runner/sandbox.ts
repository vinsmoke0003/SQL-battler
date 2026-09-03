import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { datasets } from "@/lib/datasets";
import type { DatasetSchema, TableInfo, ColumnInfo } from "@/lib/datasets";
import { guardQuery } from "./guard";

export type Cell = string | number | null;

export interface QueryResult {
  columns: string[];
  rows: Cell[][];
  rowCount: number;
  truncated: boolean;
  executionMs: number;
}

export type RunOutcome = { ok: true; result: QueryResult } | { ok: false; error: string };

export const MAX_ROWS = 500;
export const MAX_EXECUTION_MS = 2000;

let sqlJs: Promise<SqlJsStatic> | null = null;
const dbCache = new Map<string, Database>();
const schemaCache = new Map<string, DatasetSchema>();

function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJs) sqlJs = initSqlJs();
  return sqlJs;
}

export async function getDatabase(datasetId: string): Promise<Database> {
  const cached = dbCache.get(datasetId);
  if (cached) return cached;
  const dataset = datasets[datasetId];
  if (!dataset) throw new Error(`Unknown dataset: ${datasetId}`);
  const SQL = await loadSqlJs();
  const db = new SQL.Database();
  db.run(dataset.seed);
  // Belt and braces: even if the guard missed something, writes fail here.
  db.run("PRAGMA query_only = 1");
  dbCache.set(datasetId, db);
  return db;
}

function toCell(value: unknown): Cell {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" || typeof value === "string") return value;
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Uint8Array) return `<blob ${value.length} bytes>`;
  return String(value);
}

/** Execute already-trusted SQL (reference solutions, schema introspection). */
export function execTrusted(db: Database, sql: string, params: Cell[] = []): QueryResult {
  const started = performance.now();
  const stmt = db.prepare(sql);
  try {
    if (params.length) stmt.bind(params);
    const rows: Cell[][] = [];
    let truncated = false;
    while (stmt.step()) {
      if (rows.length >= MAX_ROWS) {
        truncated = true;
        break;
      }
      rows.push(stmt.get().map(toCell));
      if (performance.now() - started > MAX_EXECUTION_MS) {
        throw new Error(`Query exceeded the ${MAX_EXECUTION_MS}ms execution limit.`);
      }
    }
    const columns = stmt.getColumnNames();
    return {
      columns,
      rows,
      rowCount: rows.length,
      truncated,
      executionMs: Math.round((performance.now() - started) * 10) / 10,
    };
  } finally {
    stmt.free();
  }
}

/** Execute contestant SQL with the guard applied. Never throws. */
export async function runQuery(datasetId: string, rawSql: string): Promise<RunOutcome> {
  const guarded = guardQuery(rawSql);
  if (!guarded.ok) return { ok: false, error: guarded.error };
  let db: Database;
  try {
    db = await getDatabase(datasetId);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  try {
    return { ok: true, result: execTrusted(db, guarded.sql) };
  } catch (err) {
    return { ok: false, error: cleanSqliteError((err as Error).message) };
  }
}

function cleanSqliteError(message: string): string {
  return message.replace(/^Error:\s*/i, "").trim();
}

export async function getDatasetSchema(datasetId: string): Promise<DatasetSchema> {
  const cached = schemaCache.get(datasetId);
  if (cached) return cached;
  const dataset = datasets[datasetId];
  if (!dataset) throw new Error(`Unknown dataset: ${datasetId}`);
  const db = await getDatabase(datasetId);

  const tableNames = execTrusted(
    db,
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid",
  ).rows.map((r) => String(r[0]));

  const tables: TableInfo[] = tableNames.map((name) => {
    const fks = new Map<string, string>();
    for (const row of execTrusted(db, `PRAGMA foreign_key_list("${name}")`).rows) {
      // columns: id, seq, table, from, to, ...
      fks.set(String(row[3]), `${row[2]}.${row[4]}`);
    }
    const columns: ColumnInfo[] = execTrusted(db, `PRAGMA table_info("${name}")`).rows.map(
      (row) => ({
        name: String(row[1]),
        type: String(row[2] || "ANY"),
        primaryKey: Number(row[5]) > 0,
        references: fks.get(String(row[1])) ?? null,
      }),
    );
    const rowCount = Number(execTrusted(db, `SELECT COUNT(*) FROM "${name}"`).rows[0][0]);
    const sample = execTrusted(db, `SELECT * FROM "${name}" LIMIT 6`).rows;
    return { name, columns, rowCount, sample };
  });

  const schema: DatasetSchema = {
    id: dataset.id,
    name: dataset.name,
    description: dataset.description,
    tables,
  };
  schemaCache.set(datasetId, schema);
  return schema;
}
