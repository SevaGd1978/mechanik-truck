import { healthInfo, json } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const info = await healthInfo();
  return json(info, info.ok ? 200 : 503);
}
