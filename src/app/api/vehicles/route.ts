import {
  bearerToken,
  getSnapshot,
  json,
  optionsOk,
  userFromToken,
  upsertVehicles,
  deleteVehicle,
} from "@/lib/server/db";
import type { Vehicle } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return optionsOk();
}

async function requireUser(req: Request) {
  const user = await userFromToken(bearerToken(req));
  if (!user) return null;
  return user;
}

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const snap = await getSnapshot();
  return json({ vehicles: snap.vehicles, updatedAt: snap.updatedAt });
}

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.role === "mechanic") {
    return json({ error: "Недостаточно прав" }, 403);
  }
  try {
    const vehicle = (await req.json()) as Vehicle;
    if (!vehicle?.id || !vehicle.plate || !vehicle.model) {
      return json({ error: "Нужны id, plate, model" }, 400);
    }
    await upsertVehicles([vehicle]);
    return json({ ok: true, vehicle });
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
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return json({ error: "Укажите id" }, 400);
  await deleteVehicle(id);
  return json({ ok: true });
}
