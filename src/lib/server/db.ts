import { Pool, type QueryResultRow } from "pg";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_USERS, normalizeUser, type AppUser } from "@/lib/auth";
import { DEFAULT_VEHICLES } from "@/lib/fleet";
import { DEFAULT_DRIVERS, type Driver } from "@/lib/drivers";
import type { Vehicle } from "@/lib/data";

export type SyncSnapshot = {
  vehicles: Vehicle[];
  drivers: Driver[];
  users: Omit<AppUser, "password">[];
  updatedAt: string;
  store: "postgres" | "file";
};

type FileDb = {
  users: AppUser[];
  vehicles: Vehicle[];
  drivers: Driver[];
  tokens: Record<string, { userId: string; createdAt: string }>;
  updatedAt: string;
};

const DATA_DIR =
  process.env.DATA_DIR ||
  (process.env.AMVERA === "1" ? "/data" : path.join(process.cwd(), ".data"));

const FILE_DB_PATH = path.join(DATA_DIR, "mechanik-db.json");

let pool: Pool | null = null;
let initPromise: Promise<void> | null = null;

function databaseUrl() {
  return process.env.DATABASE_URL?.trim() || "";
}

function usePostgres() {
  return Boolean(databaseUrl());
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl(),
      ssl:
        process.env.DATABASE_SSL === "0"
          ? false
          : process.env.AMVERA === "1" || databaseUrl().includes("amvera")
            ? { rejectUnauthorized: false }
            : undefined,
    });
  }
  return pool;
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function publicUser(u: AppUser): Omit<AppUser, "password"> {
  const { password: _password, ...rest } = u;
  return rest;
}

function asUser(raw: Partial<AppUser> & { id?: string; login?: string; created_at?: string }): AppUser {
  return normalizeUser({
    id: raw.id || `u-${Date.now()}`,
    login: raw.login || "",
    password: raw.password,
    name: raw.name,
    role: raw.role,
    active: raw.active,
    createdAt: raw.createdAt || raw.created_at,
    responsibilities: raw.responsibilities,
  });
}

function parsePgUser(row: Record<string, unknown>) {
  let responsibilities: unknown = row.responsibilities;
  if (typeof responsibilities === "string") {
    try {
      responsibilities = JSON.parse(responsibilities);
    } catch {
      responsibilities = undefined;
    }
  }
  return {
    id: String(row.id ?? ""),
    login: String(row.login ?? ""),
    password: String(row.password ?? ""),
    name: String(row.name ?? ""),
    role: row.role as AppUser["role"],
    active: Boolean(row.active),
    createdAt: String(row.createdAt ?? row.created_at ?? ""),
    responsibilities: Array.isArray(responsibilities)
      ? (responsibilities as AppUser["responsibilities"])
      : undefined,
  };
}

function seedFileDb(): FileDb {
  const now = new Date().toISOString();
  return {
    users: DEFAULT_USERS.map((u) => asUser(u)),
    vehicles: DEFAULT_VEHICLES.map((v) => ({ ...v })),
    drivers: DEFAULT_DRIVERS.map((d) => ({ ...d })),
    tokens: {},
    updatedAt: now,
  };
}

async function readFileDb(): Promise<FileDb> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(FILE_DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as FileDb;
    if (!parsed.users || !parsed.vehicles || !parsed.drivers) {
      const seeded = seedFileDb();
      await writeFileDb(seeded);
      return seeded;
    }
    parsed.tokens = parsed.tokens || {};
    parsed.users = parsed.users.map((u) => asUser(u));
    return parsed;
  } catch {
    const seeded = seedFileDb();
    await writeFileDb(seeded);
    return seeded;
  }
}

async function writeFileDb(db: FileDb) {
  await ensureDataDir();
  db.updatedAt = new Date().toISOString();
  await fs.writeFile(FILE_DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

async function initPostgres() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  await p.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS responsibilities TEXT
      NOT NULL DEFAULT '["warehouse","tires","maintenance"]'
  `);

  const usersCount = await p.query<{ c: string }>("SELECT COUNT(*)::text AS c FROM users");
  if (Number(usersCount.rows[0]?.c || 0) === 0) {
    for (const u of DEFAULT_USERS) {
      await p.query(
        `INSERT INTO users (id, login, password, name, role, active, created_at, responsibilities)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [
          u.id,
          u.login,
          u.password,
          u.name,
          u.role,
          u.active,
          u.createdAt,
          JSON.stringify(u.responsibilities),
        ],
      );
    }
  }

  const vehiclesCount = await p.query<{ c: string }>(
    "SELECT COUNT(*)::text AS c FROM vehicles",
  );
  if (Number(vehiclesCount.rows[0]?.c || 0) === 0) {
    for (const v of DEFAULT_VEHICLES) {
      await p.query(
        `INSERT INTO vehicles (id, payload, updated_at) VALUES ($1,$2::jsonb,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [v.id, JSON.stringify(v)],
      );
    }
  }

  const driversCount = await p.query<{ c: string }>(
    "SELECT COUNT(*)::text AS c FROM drivers",
  );
  if (Number(driversCount.rows[0]?.c || 0) === 0) {
    for (const d of DEFAULT_DRIVERS) {
      await p.query(
        `INSERT INTO drivers (id, payload, updated_at) VALUES ($1,$2::jsonb,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [d.id, JSON.stringify(d)],
      );
    }
  }

  await p.query(
    `INSERT INTO meta (key, value) VALUES ('updated_at', $1)
     ON CONFLICT (key) DO NOTHING`,
    [new Date().toISOString()],
  );
}

export async function ensureDb() {
  if (!initPromise) {
    initPromise = (async () => {
      if (usePostgres()) {
        await initPostgres();
      } else {
        await readFileDb();
      }
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
}

async function touchUpdatedAtPg() {
  await getPool().query(
    `INSERT INTO meta (key, value) VALUES ('updated_at', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [new Date().toISOString()],
  );
}

export async function loginUser(login: string, password: string) {
  await ensureDb();
  const normalized = login.trim().toLowerCase();

  if (usePostgres()) {
    const res = await getPool().query(
      `SELECT id, login, password, name, role, active, created_at AS "createdAt",
              responsibilities
       FROM users WHERE lower(login) = $1 LIMIT 1`,
      [normalized],
    );
    const user = res.rows[0] ? asUser(parsePgUser(res.rows[0])) : null;
    if (!user || !user.active || user.password !== password) {
      return null;
    }
    const token = `mt_${crypto.randomUUID().replace(/-/g, "")}`;
    await getPool().query(
      `INSERT INTO tokens (token, user_id, created_at) VALUES ($1,$2,NOW())`,
      [token, user.id],
    );
    return { token, user: publicUser(user) };
  }

  const db = await readFileDb();
  const user = db.users.find(
    (u) => u.login.toLowerCase() === normalized && u.active,
  );
  if (!user || user.password !== password) return null;
  const token = `mt_${crypto.randomUUID().replace(/-/g, "")}`;
  db.tokens[token] = { userId: user.id, createdAt: new Date().toISOString() };
  await writeFileDb(db);
  return { token, user: publicUser(user) };
}

export async function userFromToken(token: string | null) {
  if (!token) return null;
  await ensureDb();

  if (usePostgres()) {
    const res = await getPool().query(
      `SELECT u.id, u.login, u.password, u.name, u.role, u.active,
              u.created_at AS "createdAt", u.responsibilities
       FROM tokens t JOIN users u ON u.id = t.user_id
       WHERE t.token = $1 LIMIT 1`,
      [token],
    );
    const user = res.rows[0] ? asUser(parsePgUser(res.rows[0])) : null;
    if (!user || !user.active) return null;
    return publicUser(user);
  }

  const db = await readFileDb();
  const entry = db.tokens[token];
  if (!entry) return null;
  const user = db.users.find((u) => u.id === entry.userId && u.active);
  return user ? publicUser(user) : null;
}

export async function getSnapshot(): Promise<SyncSnapshot> {
  await ensureDb();

  if (usePostgres()) {
    const p = getPool();
    const [vehicles, drivers, users, meta] = await Promise.all([
      p.query<{ payload: Vehicle }>("SELECT payload FROM vehicles ORDER BY id"),
      p.query<{ payload: Driver }>("SELECT payload FROM drivers ORDER BY id"),
      p.query(
        `SELECT id, login, password, name, role, active, created_at AS "createdAt",
                responsibilities FROM users ORDER BY login`,
      ),
      p.query<{ value: string }>(
        `SELECT value FROM meta WHERE key = 'updated_at' LIMIT 1`,
      ),
    ]);
    return {
      vehicles: vehicles.rows.map((r) => r.payload),
      drivers: drivers.rows.map((r) => r.payload),
      users: users.rows.map((row) =>
        publicUser(asUser(parsePgUser(row as Record<string, unknown>))),
      ),
      updatedAt: meta.rows[0]?.value || new Date().toISOString(),
      store: "postgres",
    };
  }

  const db = await readFileDb();
  return {
    vehicles: db.vehicles,
    drivers: db.drivers,
    users: db.users.map(publicUser),
    updatedAt: db.updatedAt,
    store: "file",
  };
}

export async function replaceVehicles(vehicles: Vehicle[]) {
  await ensureDb();
  if (usePostgres()) {
    const p = getPool();
    const client = await p.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM vehicles");
      for (const v of vehicles) {
        await client.query(
          `INSERT INTO vehicles (id, payload, updated_at) VALUES ($1,$2::jsonb,NOW())`,
          [v.id, JSON.stringify(v)],
        );
      }
      await client.query(
        `INSERT INTO meta (key, value) VALUES ('updated_at', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [new Date().toISOString()],
      );
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
    return;
  }

  const db = await readFileDb();
  db.vehicles = vehicles;
  await writeFileDb(db);
}

export async function upsertVehicles(vehicles: Vehicle[]) {
  await ensureDb();
  if (usePostgres()) {
    const p = getPool();
    for (const v of vehicles) {
      await p.query(
        `INSERT INTO vehicles (id, payload, updated_at) VALUES ($1,$2::jsonb,NOW())
         ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
        [v.id, JSON.stringify(v)],
      );
    }
    await touchUpdatedAtPg();
    return;
  }

  const db = await readFileDb();
  const map = new Map(db.vehicles.map((v) => [v.id, v]));
  for (const v of vehicles) map.set(v.id, v);
  db.vehicles = [...map.values()];
  await writeFileDb(db);
}

export async function deleteVehicle(id: string) {
  await ensureDb();
  if (usePostgres()) {
    await getPool().query("DELETE FROM vehicles WHERE id = $1", [id]);
    await touchUpdatedAtPg();
    return;
  }
  const db = await readFileDb();
  db.vehicles = db.vehicles.filter((v) => v.id !== id);
  await writeFileDb(db);
}

export async function upsertDrivers(drivers: Driver[]) {
  await ensureDb();
  if (usePostgres()) {
    const p = getPool();
    for (const d of drivers) {
      await p.query(
        `INSERT INTO drivers (id, payload, updated_at) VALUES ($1,$2::jsonb,NOW())
         ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
        [d.id, JSON.stringify(d)],
      );
    }
    await touchUpdatedAtPg();
    return;
  }

  const db = await readFileDb();
  const map = new Map(db.drivers.map((d) => [d.id, d]));
  for (const d of drivers) map.set(d.id, d);
  db.drivers = [...map.values()];
  await writeFileDb(db);
}

export async function deleteDriver(id: string) {
  await ensureDb();
  if (usePostgres()) {
    await getPool().query("DELETE FROM drivers WHERE id = $1", [id]);
    await touchUpdatedAtPg();
    return;
  }
  const db = await readFileDb();
  db.drivers = db.drivers.filter((d) => d.id !== id);
  await writeFileDb(db);
}

export async function applySyncPush(body: {
  vehicles?: Vehicle[];
  drivers?: Driver[];
  deletedVehicleIds?: string[];
  deletedDriverIds?: string[];
}) {
  await ensureDb();
  if (body.vehicles?.length) await upsertVehicles(body.vehicles);
  if (body.drivers?.length) await upsertDrivers(body.drivers);
  for (const id of body.deletedVehicleIds || []) await deleteVehicle(id);
  for (const id of body.deletedDriverIds || []) await deleteDriver(id);
  return getSnapshot();
}

export function bearerToken(req: Request) {
  const header = req.headers.get("authorization") || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    },
  });
}

export function optionsOk() {
  return json({ ok: true });
}

/** Soft check used by health endpoint */
export async function healthInfo() {
  try {
    await ensureDb();
    const snap = await getSnapshot();
    return {
      ok: true,
      store: snap.store,
      vehicles: snap.vehicles.length,
      drivers: snap.drivers.length,
      updatedAt: snap.updatedAt,
      postgresConfigured: usePostgres(),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
      postgresConfigured: usePostgres(),
    };
  }
}

export type { QueryResultRow };
