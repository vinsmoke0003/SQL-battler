import { NextResponse } from "next/server";
import { getDataset } from "@/lib/datasets";
import { getDatasetSchema } from "@/lib/sql-runner/sandbox";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!getDataset(id)) {
    return NextResponse.json({ error: "Unknown dataset." }, { status: 404 });
  }
  const schema = await getDatasetSchema(id);
  return NextResponse.json(schema, {
    headers: { "cache-control": "public, max-age=3600" },
  });
}
