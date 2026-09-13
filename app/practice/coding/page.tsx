import { Suspense } from "react";
import { DsaPractice } from "@/components/dsa/DsaPractice";

export default function CodingPracticePage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-muted">Loading coding practice…</div>}>
      <DsaPractice />
    </Suspense>
  );
}
