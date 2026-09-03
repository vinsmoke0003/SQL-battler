import { NextResponse } from "next/server";
import { runQuery } from "@/lib/sql-runner/sandbox";
import { getDataset } from "@/lib/datasets";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { datasetId?: string; sql?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const datasetId = String(body.datasetId ?? "");
  if (!getDataset(datasetId)) {
    return NextResponse.json({ ok: false, error: "Unknown dataset." }, { status: 400 });
  }
  const outcome = await runQuery(datasetId, String(body.sql ?? ""));
  return NextResponse.json(outcome);
}
