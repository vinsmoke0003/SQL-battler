"use client";

import type { CodingTestCase } from "@/lib/mock-tests/types";

export interface TestResult {
  index: number;
  passed: boolean;
  input: unknown[];
  expected: unknown;
  actual: unknown;
  error?: string;
  hidden: boolean;
}

export interface RunReport {
  ok: boolean;
  /** Set when the whole run failed (syntax error, timeout, missing function). */
  error?: string;
  results: TestResult[];
  passed: number;
  total: number;
}

const TIMEOUT_MS = 4000;

/**
 * Body of the worker. Kept as a string so it can be turned into a Blob URL —
 * running candidate code off the main thread means an infinite loop can be
 * killed by terminating the worker instead of freezing the page.
 */
const WORKER_SOURCE = `
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return Math.abs(a - b) < 1e-9;
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(function (k) { return deepEqual(a[k], b[k]); });
}

self.onmessage = function (event) {
  const data = event.data;
  const code = data.code;
  const functionName = data.functionName;
  const testCases = data.testCases;
  let fn;
  try {
    // Evaluate the candidate's source, then pull the named function out of it.
    fn = new Function(code + '\\nreturn typeof ' + functionName + ' === "function" ? ' + functionName + ' : null;')();
  } catch (err) {
    self.postMessage({ ok: false, error: 'Syntax error: ' + err.message, results: [] });
    return;
  }
  if (typeof fn !== 'function') {
    self.postMessage({
      ok: false,
      error: 'Could not find a function named ' + functionName + '. Keep the given function name.',
      results: [],
    });
    return;
  }

  const results = [];
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      const actual = fn.apply(null, JSON.parse(JSON.stringify(testCase.input)));
      results.push({
        index: i,
        passed: deepEqual(actual, testCase.expected),
        input: testCase.input,
        expected: testCase.expected,
        actual: actual === undefined ? null : actual,
        hidden: !!testCase.hidden,
      });
    } catch (err) {
      results.push({
        index: i,
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        actual: null,
        error: err && err.message ? err.message : String(err),
        hidden: !!testCase.hidden,
      });
    }
  }
  self.postMessage({ ok: true, results: results });
};
`;

let workerUrl: string | null = null;

function getWorkerUrl(): string {
  if (!workerUrl) {
    workerUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "application/javascript" }));
  }
  return workerUrl;
}

/** Runs candidate JavaScript against a question's test cases. Never throws. */
export function runCode(
  code: string,
  functionName: string,
  testCases: CodingTestCase[],
): Promise<RunReport> {
  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(getWorkerUrl());
    } catch {
      resolve({ ok: false, error: "Could not start the code sandbox.", results: [], passed: 0, total: testCases.length });
      return;
    }

    const finish = (report: RunReport) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(report);
    };

    const timer = setTimeout(() => {
      finish({
        ok: false,
        error: `Your code did not finish within ${TIMEOUT_MS / 1000}s — check for an infinite loop.`,
        results: [],
        passed: 0,
        total: testCases.length,
      });
    }, TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as { ok: boolean; error?: string; results: TestResult[] };
      const results = data.results ?? [];
      finish({
        ok: data.ok,
        error: data.error,
        results,
        passed: results.filter((r) => r.passed).length,
        total: testCases.length,
      });
    };

    worker.onerror = (event) => {
      finish({
        ok: false,
        error: event.message || "Your code threw an error before any test ran.",
        results: [],
        passed: 0,
        total: testCases.length,
      });
    };

    worker.postMessage({ code, functionName, testCases });
  });
}
