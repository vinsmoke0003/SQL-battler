/**
 * Runs every reference solution against its dataset and reports questions that
 * error, return no rows, or have duplicate ids. Run with `npm run test:questions`.
 */
import { allQuestions, getExpectedOutput, questionCounts } from "../lib/questions";
import { guardQuery } from "../lib/sql-runner/guard";
import { runQuery } from "../lib/sql-runner/sandbox";
import { compareResults } from "../lib/validation/compare";

async function main() {
  const seen = new Set<string>();
  let failures = 0;

  for (const q of allQuestions) {
    if (seen.has(q.id)) {
      console.error(`✗ ${q.id} duplicate id`);
      failures++;
    }
    seen.add(q.id);

    const guard = guardQuery(q.solution);
    if (!guard.ok) {
      console.error(`✗ ${q.id} solution rejected by guard: ${guard.error}`);
      failures++;
      continue;
    }

    try {
      const expected = await getExpectedOutput(q);
      if (expected.rows.length === 0) {
        console.error(`✗ ${q.id} "${q.title}" returned no rows`);
        failures++;
        continue;
      }
      // The solution must validate against itself through the contestant path.
      const rerun = await runQuery(q.datasetId, q.solution);
      if (!rerun.ok) {
        console.error(`✗ ${q.id} contestant path failed: ${rerun.error}`);
        failures++;
        continue;
      }
      const cmp = compareResults(rerun.result, expected, q.orderMatters);
      if (!cmp.correct) {
        console.error(`✗ ${q.id} self-comparison failed: ${cmp.feedback}`);
        failures++;
        continue;
      }
      console.log(
        `✓ ${q.id} ${q.difficulty.padEnd(6)} ${q.title.padEnd(40)} ${expected.rows.length} rows × ${expected.columns.length} cols  [${expected.columns.join(", ")}]`,
      );
    } catch (err) {
      console.error(`✗ ${q.id} "${q.title}": ${(err as Error).message}`);
      failures++;
    }
  }

  console.log(
    `\n${allQuestions.length} questions (easy ${questionCounts.easy}, medium ${questionCounts.medium}, hard ${questionCounts.hard}), ${failures} failure(s)`,
  );
  process.exit(failures ? 1 : 0);
}

main();
