"use client";

import { useEffect, useRef } from "react";
import Editor, { type OnMount, type BeforeMount } from "@monaco-editor/react";
import type { languages as MonacoLanguages, editor as MonacoEditor, IDisposable, Position } from "monaco-editor";
import { Loader2 } from "lucide-react";
import type { DatasetSchema } from "@/lib/datasets";
import { fetchSchema } from "@/lib/client/api";

export interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  datasetId?: string;
  height?: number | string;
  readOnly?: boolean;
}

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "JOIN", "LEFT JOIN",
  "INNER JOIN", "ON", "AS", "AND", "OR", "NOT", "IN", "IS NULL", "IS NOT NULL", "DISTINCT",
  "COUNT", "SUM", "AVG", "MIN", "MAX", "ROUND", "CASE", "WHEN", "THEN", "ELSE", "END", "WITH",
  "OVER", "PARTITION BY", "ROW_NUMBER()", "RANK()", "DENSE_RANK()", "LAG", "LEAD", "BETWEEN",
  "LIKE", "UNION", "INTERSECT", "EXCEPT", "EXISTS", "strftime", "julianday", "COALESCE",
];

const defineTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("sqlbattle", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "7aa2ff", fontStyle: "bold" },
      { token: "string", foreground: "9ece6a" },
      { token: "number", foreground: "ff9e64" },
      { token: "comment", foreground: "5b6478", fontStyle: "italic" },
      { token: "operator", foreground: "89ddff" },
      { token: "predefined", foreground: "c0caf5" },
    ],
    colors: {
      "editor.background": "#0f1218",
      "editor.foreground": "#e6e9ef",
      "editorLineNumber.foreground": "#3b4356",
      "editorLineNumber.activeForeground": "#8b93a7",
      "editor.lineHighlightBackground": "#161a23",
      "editor.selectionBackground": "#2b3b66",
      "editorCursor.foreground": "#7aa2ff",
      "editorIndentGuide.background": "#1e2330",
      "editorWidget.background": "#12151c",
      "editorSuggestWidget.background": "#12151c",
      "editorSuggestWidget.border": "#232938",
      "editorSuggestWidget.selectedBackground": "#1e2330",
    },
  });
};

export function SqlEditor({
  value,
  onChange,
  onRun,
  onSubmit,
  datasetId,
  height = 260,
  readOnly = false,
}: SqlEditorProps) {
  // Keep the latest callbacks in refs so the Monaco commands never go stale.
  const runRef = useRef(onRun);
  const submitRef = useRef(onSubmit);
  runRef.current = onRun;
  submitRef.current = onSubmit;

  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const completionRef = useRef<IDisposable | null>(null);
  const schemaRef = useRef<DatasetSchema | null>(null);

  useEffect(() => {
    if (!datasetId) return;
    let cancelled = false;
    fetchSchema(datasetId).then((s) => {
      if (!cancelled) schemaRef.current = s;
    });
    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  useEffect(() => () => completionRef.current?.dispose(), []);

  const handleMount: OnMount = (editor, monaco) => {
    monacoRef.current = monaco;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => submitRef.current(),
    );
    editor.focus();

    completionRef.current?.dispose();
    completionRef.current = monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model: MonacoEditor.ITextModel, position: Position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions: MonacoLanguages.CompletionItem[] = [];
        const schema = schemaRef.current;
        if (schema) {
          for (const table of schema.tables) {
            suggestions.push({
              label: table.name,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: table.name,
              detail: "table",
              range,
            });
            for (const col of table.columns) {
              suggestions.push({
                label: col.name,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: col.name,
                detail: `${table.name}.${col.name} · ${col.type}`,
                range,
              });
            }
          }
        }
        for (const kw of SQL_KEYWORDS) {
          suggestions.push({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range,
          });
        }
        return { suggestions };
      },
    });
  };

  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#0f1218]">
      <Editor
        height={height}
        language="sql"
        theme="sqlbattle"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        beforeMount={defineTheme}
        onMount={handleMount}
        loading={
          <div className="flex h-full items-center justify-center gap-2 text-xs text-muted">
            <Loader2 className="size-4 animate-spin" /> Loading editor…
          </div>
        }
        options={{
          readOnly,
          fontFamily: "var(--font-jetbrains), ui-monospace, Menlo, monospace",
          fontSize: 13.5,
          lineHeight: 21,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "line",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          suggestOnTriggerCharacters: true,
          quickSuggestions: { other: true, comments: false, strings: false },
          automaticLayout: true,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        }}
      />
    </div>
  );
}
