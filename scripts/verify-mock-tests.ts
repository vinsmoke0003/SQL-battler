/**
 * Validates the mock-test banks: MCQ answer keys are well formed, every
 * section id resolves, and each coding question's reference solution actually
 * passes its own test cases. Run with `npm run test:mock`.
 */
import { getCoding, getMcq, mockTests } from "../lib/mock-tests";
import { codingQuestions } from "../lib/mock-tests/coding/questions";
import { set1Mcq } from "../lib/mock-tests/mcq/set1";
import { set2Mcq } from "../lib/mock-tests/mcq/set2";
import { getQuestion } from "../lib/questions";

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-9;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) =>
    deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  );
}

let failures = 0;
const fail = (msg: string) => {
  console.error(`✗ ${msg}`);
  failures++;
};

// ───────────── MCQ bank ─────────────
const mcqIds = new Set<string>();
for (const q of [...set1Mcq, ...set2Mcq]) {
  if (mcqIds.has(q.id)) fail(`${q.id} duplicate MCQ id`);
  mcqIds.add(q.id);
  if (q.options.length < 2) fail(`${q.id} has fewer than 2 options`);
  if (q.answerIndex < 0 || q.answerIndex >= q.options.length) {
    fail(`${q.id} answerIndex ${q.answerIndex} is out of range`);
  }
  if (!q.explanation.trim()) fail(`${q.id} has no explanation`);
  if (new Set(q.options).size !== q.options.length) fail(`${q.id} has duplicate options`);
}
console.log(`✓ ${mcqIds.size} MCQs checked (options, answer key, explanations)`);

// ───────────── coding bank ─────────────
for (const q of codingQuestions) {
  let fn: unknown;
  try {
    fn = new Function(`${q.solution}\nreturn ${q.functionName};`)();
  } catch (err) {
    fail(`${q.id} reference solution failed to parse: ${(err as Error).message}`);
    continue;
  }
  if (typeof fn !== "function") {
    fail(`${q.id} reference solution does not define ${q.functionName}`);
    continue;
  }
  let passed = 0;
  for (const [i, testCase] of q.testCases.entries()) {
    let actual: unknown;
    try {
      actual = (fn as (...args: unknown[]) => unknown)(
        ...(JSON.parse(JSON.stringify(testCase.input)) as unknown[]),
      );
    } catch (err) {
      fail(`${q.id} case ${i + 1} threw: ${(err as Error).message}`);
      continue;
    }
    if (deepEqual(actual, testCase.expected)) passed++;
    else {
      fail(
        `${q.id} case ${i + 1} expected ${JSON.stringify(testCase.expected)} but reference solution gave ${JSON.stringify(actual)}`,
      );
    }
  }
  // The starter code must NOT already pass — otherwise the question is trivial.
  console.log(`✓ ${q.id.padEnd(14)} ${q.title.padEnd(28)} ${passed}/${q.testCases.length} cases`);
}

// ───────────── test wiring ─────────────
for (const test of mockTests) {
  for (const section of test.sections) {
    if (section.questionIds.length === 0) fail(`${test.id} / ${section.id} has no questions`);
    for (const id of section.questionIds) {
      const found =
        section.kind === "mcq"
          ? getMcq(id)
          : section.kind === "coding"
            ? getCoding(id)
            : getQuestion(id);
      if (!found) fail(`${test.id} / ${section.id} references unknown question ${id}`);
    }
  }
  const count = test.sections.reduce((s, x) => s + x.questionIds.length, 0);
  console.log(`✓ ${test.id.padEnd(20)} ${test.sections.length} sections, ${count} questions`);
}

console.log(`\n${failures} failure(s)`);
process.exit(failures ? 1 : 0);
