"use client";

import type { CodingTestCase } from "@/lib/mock-tests/types";
import type { PracticeLanguage } from "@/lib/dsa-practice/questions";
import { runCode, type RunReport } from "@/lib/client/code-runner";

const PYODIDE_VERSION = "0.29.4";
const PYODIDE_ROOT = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const PYTHON_TIMEOUT_MS = 30_000;

const PYTHON_WORKER_SOURCE = `
const root = ${JSON.stringify(PYODIDE_ROOT)};
let runtimePromise;

async function runtime() {
  if (!runtimePromise) {
    runtimePromise = import(root + "pyodide.mjs").then(({ loadPyodide }) => loadPyodide({ indexURL: root }));
  }
  return runtimePromise;
}

self.onmessage = async ({ data }) => {
  try {
    const pyodide = await runtime();
    const source = JSON.stringify(data.code);
    const functionName = JSON.stringify(data.functionName);
    const cases = JSON.stringify(JSON.stringify(data.testCases));
    const script = [
      "import json, math, traceback",
      "namespace = {}",
      "exec(" + source + ", namespace)",
      "fn = namespace.get(" + functionName + ")",
      "if not callable(fn): raise TypeError('Could not find the required function. Keep the given function name.')",
      "cases = json.loads(" + cases + ")",
      "results = []",
      "for index, case in enumerate(cases):",
      "    try:",
      "        actual = fn(*case['input'])",
      "        expected = case['expected']",
      "        passed = (abs(actual - expected) < 1e-9) if isinstance(actual, float) and isinstance(expected, (int, float)) else actual == expected",
      "        results.append({'index': index, 'passed': passed, 'input': case['input'], 'expected': expected, 'actual': actual, 'hidden': bool(case.get('hidden'))})",
      "    except Exception as error:",
      "        results.append({'index': index, 'passed': False, 'input': case['input'], 'expected': case['expected'], 'actual': None, 'error': str(error), 'hidden': bool(case.get('hidden'))})",
      "json.dumps({'ok': True, 'results': results})",
    ].join("\\n");
    const output = await pyodide.runPythonAsync(script);
    self.postMessage(JSON.parse(output));
  } catch (error) {
    self.postMessage({ ok: false, error: error && error.message ? error.message : String(error), results: [] });
  }
};
`;

export function runPracticeCode(
  language: PracticeLanguage,
  code: string,
  functionName: string,
  testCases: CodingTestCase[],
): Promise<RunReport> {
  if (language === "javascript") return runCode(code, functionName, testCases);

  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([PYTHON_WORKER_SOURCE], { type: "text/javascript" }));
    const worker = new Worker(url, { type: "module" });
    let settled = false;

    const finish = (report: RunReport) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(report);
    };

    const timer = window.setTimeout(() => {
      finish({
        ok: false,
        error: "Python took too long to start or finish. Check your connection and look for an infinite loop.",
        results: [],
        passed: 0,
        total: testCases.length,
      });
    }, PYTHON_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as { ok: boolean; error?: string; results?: RunReport["results"] };
      const results = data.results ?? [];
      finish({
        ok: data.ok,
        error: data.error,
        results,
        passed: results.filter((result) => result.passed).length,
        total: testCases.length,
      });
    };

    worker.onerror = (event) => {
      finish({
        ok: false,
        error: event.message || "Could not start the Python runner.",
        results: [],
        passed: 0,
        total: testCases.length,
      });
    };

    worker.postMessage({ code, functionName, testCases });
  });
}
