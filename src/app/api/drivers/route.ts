import {
  bearerToken,
  deleteDriver,
  getSnapshot,
  json,
  optionsOk,
  upsertDrivers,
  userFromToken,
} from "@/lib/server/db";
import type { Driver } from "@/lib/drivers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return optionsOk();
}

async function requireUser(req: Request) {
  return userFromToken(bearerToken(req));
}

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const snap = await getSnapshot();
  return json({ drivers: snap.drivers, updatedAt: snap.updatedAt });
}

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.role === "mechanic") {
    return json({ error: "Недостаточно прав" }, 403);
  }
  try {
    const driver = (await req.json()) as Driver;
    if (!driver?.id || !driver.lastName || !driver.firstName) {
      return json({ error: "Нужны id, lastName, firstName" }, 400);
    }
    await upsertDrivers([driver]);
    return json({ ok: true, driver });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Ошибка сохранения" },
      500,
    );
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

export async function DELETE(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.role === "mechanic") {
    return json({ error: "Недостаточно прав" }, 403);
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return json({ error: "Укажите id" }, 400);
  await deleteDriver(id);
  return json({ ok: true });
}
