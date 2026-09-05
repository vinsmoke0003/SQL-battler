import { accentureQuestions } from "@/lib/questions/accenture";
import { getQuestion, toPublicQuestion } from "@/lib/questions";
import type { PublicQuestion } from "@/lib/questions/types";
import { set1Mcq } from "./mcq/set1";
import { set2Mcq } from "./mcq/set2";
import { codingQuestions } from "./coding/questions";
import type { CodingQuestion, McqQuestion, MockSection, MockTest } from "./types";

export * from "./types";

const mcqBank = new Map<string, McqQuestion>(
  [...set1Mcq, ...set2Mcq].map((q) => [q.id, q]),
);
const codingBank = new Map<string, CodingQuestion>(codingQuestions.map((q) => [q.id, q]));

export function getMcq(id: string): McqQuestion | undefined {
  return mcqBank.get(id);
}
export function getCoding(id: string): CodingQuestion | undefined {
  return codingBank.get(id);
}

const ids = (prefix: string, bank: McqQuestion[]) =>
  bank.filter((q) => q.id.startsWith(prefix)).map((q) => q.id);

/** The six MCQ areas of Accenture's Stage 1 paper, in the order they appear. */
function cognitiveAndTechnicalSections(bank: McqQuestion[], set: "S1" | "S2"): MockSection[] {
  return [
    {
      id: "english",
      name: "English Ability",
      blurb:
        "Grammar, vocabulary, error spotting and reading comprehension. Part of the Cognitive assessment.",
      kind: "mcq",
      questionIds: ids(`${set}-ENG`, bank),
      realCount: 20,
      realMinutes: 15,
    },
    {
      id: "reasoning",
      name: "Critical Reasoning & Problem Solving",
      blurb:
        "Quantitative reasoning, syllogisms, series and puzzles. Accenture treats this as an elimination area.",
      kind: "mcq",
      questionIds: ids(`${set}-CR`, bank),
      realCount: 20,
      realMinutes: 25,
    },
    {
      id: "abstract",
      name: "Abstract Reasoning",
      blurb: "Coding–decoding, odd one out, direction sense and spatial questions.",
      kind: "mcq",
      questionIds: ids(`${set}-AR`, bank),
      realCount: 10,
      realMinutes: 10,
    },
    {
      id: "msoffice",
      name: "Common Applications & MS Office",
      blurb:
        "Excel formulas, Word shortcuts, email conventions and everyday desktop applications.",
      kind: "mcq",
      questionIds: ids(`${set}-OFF`, bank),
      realCount: 12,
      realMinutes: 12,
    },
    {
      id: "pseudocode",
      name: "Pseudo Code",
      blurb:
        "Short snippets where you predict the output. Recursion, loops, arrays, operators and static variables dominate.",
      kind: "mcq",
      questionIds: ids(`${set}-PSE`, bank),
      realCount: 15,
      realMinutes: 18,
    },
    {
      id: "networking",
      name: "Networking, Security & Cloud",
      blurb:
        "Cloud service and deployment models, encryption, OSI layers and common attacks. Two-statement questions are common.",
      kind: "mcq",
      questionIds: ids(`${set}-NSC`, bank),
      realCount: 10,
      realMinutes: 12,
    },
  ];
}

export const mockTests: MockTest[] = [
  {
    id: "accenture-pyq-1",
    company: "Accenture",
    title: "Accenture Full Mock Test — PYQ Set 1",
    summary:
      "The complete paper: English, reasoning, abstract reasoning, MS Office, pseudocode, networking/security/cloud, SQL and the coding round.",
    format: [
      "Accenture's Stage 1 is a 90-minute Cognitive + Technical paper with sectional cut-offs — English Ability, Critical Reasoning & Problem Solving, Abstract Reasoning, Common Applications & MS Office, Pseudo Code, and Fundamentals of Networking, Security & Cloud.",
      "Clearing Stage 1 unlocks the coding round: 3 problems in 60 minutes, where the working target is two complete solutions plus one partial.",
      "There is no negative marking and inter-sectional navigation is allowed, so attempting everything is always worth it.",
      "Pseudocode questions almost always print a short snippet and ask for the output; recursion, increment operators and array mutation inside loops are the usual traps.",
    ],
    sections: [
      ...cognitiveAndTechnicalSections(set1Mcq, "S1"),
      {
        id: "sql",
        name: "SQL",
        blurb:
          "Query writing against a client-delivery schema. Accenture favours business scenarios over abstract puzzles.",
        kind: "sql",
        questionIds: ["ACN02", "ACN04", "ACN08"],
        realCount: 2,
        realMinutes: 15,
      },
      {
        id: "coding",
        name: "Coding Round",
        blurb:
          "Write and run real code against test cases. Accenture gives 3 problems in 60 minutes across C/C++/Java/Python/JS.",
        kind: "coding",
        questionIds: ["COD-RATS", "COD-BINOPS"],
        realCount: 3,
        realMinutes: 60,
      },
    ],
    timed: false,
  },
  {
    id: "accenture-pyq-2",
    company: "Accenture",
    title: "Accenture Full Mock Test — PYQ Set 2",
    summary:
      "A second full paper with fresh questions across every section, with the pseudocode and cloud areas pitched slightly harder.",
    format: [
      "Same structure as Set 1 — the six Stage 1 MCQ areas, then SQL and the coding round.",
      "Set 2 leans harder on the technical half: type promotion and static variables in pseudocode, and the shared responsibility model in cloud.",
      "Accenture's technical cut-off sits around 55%, so aim to clear that comfortably in every section rather than perfecting one.",
      "Aptitude here is standard placement fare — percentages, time and work, averages, sets and series — solved under time pressure rather than with deep tricks.",
    ],
    sections: [
      ...cognitiveAndTechnicalSections(set2Mcq, "S2"),
      {
        id: "sql",
        name: "SQL",
        blurb: "Query writing: aggregation by year, anti-joins and window functions.",
        kind: "sql",
        questionIds: ["ACN05", "ACN06", "ACN10"],
        realCount: 2,
        realMinutes: 15,
      },
      {
        id: "coding",
        name: "Coding Round",
        blurb: "String validation and digit manipulation — both recur in Accenture papers.",
        kind: "coding",
        questionIds: ["COD-PASSWORD", "COD-CARRIES"],
        realCount: 3,
        realMinutes: 60,
      },
    ],
    timed: false,
  },
  {
    id: "accenture-sql-1",
    company: "Accenture",
    title: "Accenture SQL Deep Dive",
    summary:
      "Twelve SQL-only questions in Accenture's house style, ramping from filtering to window functions.",
    format: [
      "A focused SQL paper for when you want to drill queries rather than sit the full assessment.",
      "Accenture frames SQL around client delivery — projects, clients, consultants and billing.",
      "Its recurring favourites are subject matter experts, filling missing client data, average project duration, average project cost per year, ratio metrics, and second highest salary both overall and per group.",
    ],
    sections: [
      {
        id: "sql",
        name: "SQL",
        blurb: "Every question runs against the Consulting Firm schema.",
        kind: "sql",
        questionIds: accentureQuestions.map((q) => q.id),
      },
    ],
    timed: false,
  },
];

export function getMockTest(id: string): MockTest | undefined {
  return mockTests.find((t) => t.id === id);
}

// ───────────── payloads sent to the client ─────────────

/** MCQ without the answer, so the paper can't be solved from the network tab. */
export interface PublicMcq {
  id: string;
  code?: string;
  prompt: string;
  options: string[];
  topic: string;
  difficulty: string;
  points: number;
}

export interface PublicCoding {
  id: string;
  title: string;
  statement: string;
  functionName: string;
  signature: string;
  constraints: string[];
  starterCode: string;
  /** Only the visible cases; hidden ones run server-side style in the worker on submit. */
  sampleCases: { input: unknown[]; expected: unknown }[];
  topic: string;
  difficulty: string;
  points: number;
}

export interface PublicSection {
  id: string;
  name: string;
  blurb: string;
  kind: MockSection["kind"];
  realCount?: number;
  realMinutes?: number;
  mcq?: PublicMcq[];
  sql?: PublicQuestion[];
  coding?: PublicCoding[];
}

export interface MockTestPayload {
  id: string;
  company: string;
  title: string;
  summary: string;
  format: string[];
  timed: boolean;
  sections: PublicSection[];
  totalQuestions: number;
  totalPoints: number;
}

import { CODING_POINTS, MCQ_POINTS } from "./types";

export async function toMockTestPayload(test: MockTest): Promise<MockTestPayload> {
  const sections: PublicSection[] = [];
  let totalQuestions = 0;
  let totalPoints = 0;

  for (const section of test.sections) {
    const base = {
      id: section.id,
      name: section.name,
      blurb: section.blurb,
      kind: section.kind,
      realCount: section.realCount,
      realMinutes: section.realMinutes,
    };

    if (section.kind === "mcq") {
      const mcq = section.questionIds
        .map((id) => getMcq(id))
        .filter((q): q is McqQuestion => Boolean(q))
        .map((q) => ({
          id: q.id,
          code: q.code,
          prompt: q.prompt,
          options: q.options,
          topic: q.topic,
          difficulty: q.difficulty,
          points: MCQ_POINTS,
        }));
      totalQuestions += mcq.length;
      totalPoints += mcq.length * MCQ_POINTS;
      sections.push({ ...base, mcq });
    } else if (section.kind === "sql") {
      const sql = await Promise.all(
        section.questionIds
          .map((id) => getQuestion(id))
          .filter((q): q is NonNullable<typeof q> => Boolean(q))
          .map((q) => toPublicQuestion(q)),
      );
      totalQuestions += sql.length;
      totalPoints += sql.reduce((sum, q) => sum + q.points, 0);
      sections.push({ ...base, sql });
    } else {
      const coding = section.questionIds
        .map((id) => getCoding(id))
        .filter((q): q is CodingQuestion => Boolean(q))
        .map((q) => ({
          id: q.id,
          title: q.title,
          statement: q.statement,
          functionName: q.functionName,
          signature: q.signature,
          constraints: q.constraints,
          starterCode: q.starterCode,
          sampleCases: q.testCases
            .filter((c) => !c.hidden)
            .map((c) => ({ input: c.input, expected: c.expected })),
          topic: q.topic,
          difficulty: q.difficulty,
          points: CODING_POINTS,
        }));
      totalQuestions += coding.length;
      totalPoints += coding.length * CODING_POINTS;
      sections.push({ ...base, coding });
    }
  }

  return {
    id: test.id,
    company: test.company,
    title: test.title,
    summary: test.summary,
    format: test.format,
    timed: test.timed,
    sections,
    totalQuestions,
    totalPoints,
  };
}
