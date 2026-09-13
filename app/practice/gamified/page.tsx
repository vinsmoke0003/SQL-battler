import { Suspense } from "react";
import { GamifiedAssessment } from "@/components/gamified/GamifiedAssessment";

export default function GamifiedPracticePage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-muted">Loading simulator…</div>}>
      <GamifiedAssessment />
    </Suspense>
  );
}
