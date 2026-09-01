import {
  applySyncPush,
  bearerToken,
  getSnapshot,
  json,
  optionsOk,
  userFromToken,
} from "@/lib/server/db";
import type { Vehicle } from "@/lib/data";
import type { Driver } from "@/lib/drivers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return optionsOk();
}

export async function GET(req: Request) {
  const user = await userFromToken(bearerToken(req));
  if (!user) return json({ error: "Unauthorized" }, 401);
  const snap = await getSnapshot();
  return json({
    vehicles: snap.vehicles,
    drivers: snap.drivers,
    users: snap.users,
    updatedAt: snap.updatedAt,
    store: snap.store,
  });
}

export async function POST(req: Request) {
  const user = await userFromToken(bearerToken(req));
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (user.role === "mechanic") {
    return json({ error: "Недостаточно прав для записи" }, 403);
  }
  try {
    const body = (await req.json()) as {
      vehicles?: Vehicle[];
      drivers?: Driver[];
      deletedVehicleIds?: string[];
      deletedDriverIds?: string[];
    };
    const snap = await applySyncPush(body);
    return json({
      ok: true,
      vehicles: snap.vehicles,
      drivers: snap.drivers,
      users: snap.users,
      updatedAt: snap.updatedAt,
      store: snap.store,
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Ошибка синхронизации" },
      500,
    );
  }
}
