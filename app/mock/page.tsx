import Link from "next/link";
import { ArrowRight, Code2, Database, FileText, Infinity as InfinityIcon, ListChecks } from "lucide-react";
import { mockTests } from "@/lib/mock-tests";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata = { title: "Mock Tests · SQL Battle" };

const SECTION_ICON = { mcq: ListChecks, sql: Database, coding: Code2 } as const;

export default function MockTestsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Company mock tests</h1>
        <p className="mt-1 text-sm text-muted">
          Full papers built from previous-year questions in a company&apos;s own style. Untimed, so you
          can work through the reasoning instead of racing a clock.
        </p>
      </div>

      <div className="space-y-3">
        {mockTests.map((test) => {
          const questionCount = test.sections.reduce((sum, s) => sum + s.questionIds.length, 0);
          return (
            <Card key={test.id} className="animate-rise transition-colors hover:border-border-strong">
              <CardBody className="p-5">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {test.company}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-faint">
                    <InfinityIcon className="size-3" /> No timer
                  </span>
                  <span className="ml-auto text-xs text-muted">{questionCount} questions</span>
                </div>
                <h2 className="text-lg font-semibold">{test.title}</h2>
                <p className="mt-1 text-sm text-muted">{test.summary}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {test.sections.map((s) => {
                    const Icon = SECTION_ICON[s.kind];
                    return (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1.5 rounded border border-border bg-surface-2 px-2 py-1 text-[11px] text-muted"
                      >
                        <Icon className="size-3 text-accent" />
                        {s.name}
                        <span className="font-mono text-faint">{s.questionIds.length}</span>
                      </span>
                    );
                  })}
                </div>

                <Link
                  href={`/mock/${test.id}`}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
                >
                  <FileText className="size-4" /> Open test <ArrowRight className="size-4" />
                </Link>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
