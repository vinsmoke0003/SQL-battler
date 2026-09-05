import { NextResponse } from "next/server";
import { getMockTest, toMockTestPayload } from "@/lib/mock-tests";

export const runtime = "nodejs";

/** Returns the whole paper up front — mock tests are untimed and navigable. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const test = getMockTest(id);
  if (!test) return NextResponse.json({ error: "Unknown mock test." }, { status: 404 });
  return NextResponse.json(await toMockTestPayload(test));
}
