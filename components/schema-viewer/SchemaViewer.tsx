"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Database, Eye, KeyRound, Link2, Loader2 } from "lucide-react";
import type { DatasetSchema, TableInfo } from "@/lib/datasets";
import { fetchSchema } from "@/lib/client/api";
import { ResultTable } from "@/components/result-table/ResultTable";
import { cn } from "@/lib/utils";

export function SchemaViewer({ datasetId, className }: { datasetId: string; className?: string }) {
  const [schema, setSchema] = useState<DatasetSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [preview, setPreview] = useState<TableInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSchema(null);
    setError(null);
    setPreview(null);
    fetchSchema(datasetId)
      .then((s) => {
        if (cancelled) return;
        setSchema(s);
        // Open every table by default; there are only a few per dataset.
        setOpen(Object.fromEntries(s.tables.map((t) => [t.name, true])));
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Database className="size-3.5 text-accent" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Database
        </span>
        {schema ? <span className="ml-auto text-xs text-text">{schema.name}</span> : null}
      </div>

      {error ? (
        <p className="p-3 text-xs text-danger">{error}</p>
      ) : !schema ? (
        <div className="flex items-center gap-2 p-3 text-xs text-muted">
          <Loader2 className="size-3.5 animate-spin" /> Loading schema…
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-2">
          {schema.tables.map((table) => {
            const isOpen = open[table.name];
            return (
              <div key={table.name} className="mb-1">
                <div className="group flex items-center rounded-md hover:bg-surface-2">
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [table.name]: !o[table.name] }))}
                    className="flex flex-1 items-center gap-1.5 px-2 py-1.5 text-left font-mono text-xs text-text"
                  >
                    <ChevronRight
                      className={cn("size-3.5 text-faint transition-transform", isOpen && "rotate-90")}
                    />
                    {table.name}
                    <span className="ml-auto text-[10px] text-faint">{table.rowCount} rows</span>
                  </button>
                  <button
                    type="button"
                    title="View sample data"
                    onClick={() => setPreview(table)}
                    className="mr-1 rounded p-1 text-faint opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                  >
                    <Eye className="size-3.5" />
                  </button>
                </div>
                {isOpen ? (
                  <ul className="mb-1 ml-5 border-l border-border pl-2">
                    {table.columns.map((col) => (
                      <li
                        key={col.name}
                        className="flex items-center gap-1.5 py-[3px] font-mono text-[11.5px]"
                        title={col.references ? `references ${col.references}` : undefined}
                      >
                        {col.primaryKey ? (
                          <KeyRound className="size-3 text-medium" />
                        ) : col.references ? (
                          <Link2 className="size-3 text-accent" />
                        ) : (
                          <span className="size-3" />
                        )}
                        <span className="text-text/90">{col.name}</span>
                        <span className="ml-auto text-[10px] uppercase text-faint">{col.type}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {preview ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="animate-rise w-full max-w-3xl rounded-lg border border-border bg-surface p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-mono text-sm">
                {preview.name}{" "}
                <span className="text-xs text-muted">
                  · first {preview.sample.length} of {preview.rowCount} rows
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-xs text-muted hover:text-text"
              >
                Close
              </button>
            </div>
            <ResultTable columns={preview.columns.map((c) => c.name)} rows={preview.sample} compact />
          </div>
        </div>
      ) : null}
    </div>
  );
}
