import type { ServiceRecord, Vehicle } from "@/lib/data";

export const SERVICE_INTERVAL_KM = 15_000;
export const SERVICE_INTERVAL_DAYS = 90;
export const DUE_SOON_KM = 2_000;

export type MaintenanceTone = "danger" | "warning" | "success" | "neutral";

export type MaintenanceStatus = {
  key: "overdue" | "soon" | "ok";
  label: string;
  tone: MaintenanceTone;
  kmLeft: number | null;
  overdueByDate: boolean;
  overdueByKm: boolean;
};

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateRu(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function kmUntilService(v: Vehicle): number | null {
  if (!v.nextServiceOdometer) return null;
  return v.nextServiceOdometer - v.odometer;
}

export function getMaintenanceStatus(v: Vehicle, today = todayIso()): MaintenanceStatus {
  const kmLeft = kmUntilService(v);
  const overdueByKm = kmLeft !== null && kmLeft <= 0;
  const overdueByDate = Boolean(v.nextService && v.nextService < today);
  const soonByKm = kmLeft !== null && kmLeft > 0 && kmLeft <= DUE_SOON_KM;

  if (overdueByDate || overdueByKm) {
    const parts: string[] = [];
    if (overdueByDate) parts.push("по дате");
    if (overdueByKm) parts.push("по пробегу");
    return {
      key: "overdue",
      label: `Просрочено ${parts.join(" и ")}`,
      tone: "danger",
      kmLeft,
      overdueByDate,
      overdueByKm,
    };
  }

  if (soonByKm) {
    return {
      key: "soon",
      label: `Скоро · осталось ${kmLeft} км`,
      tone: "warning",
      kmLeft,
      overdueByDate,
      overdueByKm,
    };
  }

  return {
    key: "ok",
    label: kmLeft !== null ? `В норме · ещё ${kmLeft} км` : "В норме",
    tone: "success",
    kmLeft,
    overdueByDate,
    overdueByKm,
  };
}

export function summarizeMaintenance(vehicles: Vehicle[], today = todayIso()) {
  const rows = vehicles.map((v) => ({ vehicle: v, status: getMaintenanceStatus(v, today) }));
  return {
    overdue: rows.filter((r) => r.status.key === "overdue").length,
    soon: rows.filter((r) => r.status.key === "soon").length,
    ok: rows.filter((r) => r.status.key === "ok").length,
    rows,
  };
}

export function addDaysIso(iso: string, days: number) {
  const base = iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : todayIso();
  const d = new Date(`${base}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function defaultNextServiceDate(conductedDate: string) {
  return addDaysIso(conductedDate, SERVICE_INTERVAL_DAYS);
}

export function defaultNextServiceOdometer(conductedOdometer: number) {
  const km = Number.isFinite(conductedOdometer) ? conductedOdometer : 0;
  return km + SERVICE_INTERVAL_KM;
}

function newRecordId() {
  return `to-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeServiceRecord(
  raw: Partial<ServiceRecord> & { id?: string },
): ServiceRecord | null {
  const date = typeof raw.date === "string" ? raw.date.trim() : "";
  if (!date) return null;
  return {
    id: raw.id || newRecordId(),
    date,
    odometer: Number.isFinite(Number(raw.odometer)) ? Number(raw.odometer) : 0,
    note: typeof raw.note === "string" ? raw.note : "",
    nextDate: typeof raw.nextDate === "string" ? raw.nextDate : "",
    nextOdometer: Number.isFinite(Number(raw.nextOdometer))
      ? Number(raw.nextOdometer)
      : 0,
    nextNote: typeof raw.nextNote === "string" ? raw.nextNote : "",
  };
}

export function seedServiceHistory(
  raw: Partial<Vehicle> & { id?: string },
): ServiceRecord[] {
  const fromPayload = Array.isArray(raw.serviceHistory)
    ? raw.serviceHistory
        .map((item) => normalizeServiceRecord(item))
        .filter((item): item is ServiceRecord => Boolean(item))
    : [];
  if (fromPayload.length) {
    return [...fromPayload].sort((a, b) => a.date.localeCompare(b.date));
  }
  if (raw.lastService) {
    const seeded = normalizeServiceRecord({
      id: raw.id ? `seed-${raw.id}` : newRecordId(),
      date: raw.lastService,
      odometer: raw.lastServiceOdometer,
      note: raw.lastServiceNote,
      nextDate: raw.nextService,
      nextOdometer: raw.nextServiceOdometer,
      nextNote: raw.nextServiceNote,
    });
    return seeded ? [seeded] : [];
  }
  return [];
}

export type ConductedServiceInput = {
  date: string;
  odometer: number;
  note: string;
  nextDate: string;
  nextOdometer: number;
  nextNote: string;
};

export function applyConductedService(
  vehicle: Vehicle,
  input: ConductedServiceInput,
): Vehicle {
  const date = input.date.trim();
  const record = normalizeServiceRecord({
    id: newRecordId(),
    date,
    odometer: input.odometer,
    note: input.note.trim(),
    nextDate: input.nextDate.trim(),
    nextOdometer: input.nextOdometer,
    nextNote: input.nextNote.trim(),
  });
  if (!record) return vehicle;

  const history = [
    ...(vehicle.serviceHistory || []).filter(
      (r) => r.id !== record.id && r.date !== record.date,
    ),
    record,
  ].sort((a, b) => a.date.localeCompare(b.date));
  const latest = history.reduce((acc, item) =>
    item.date >= acc.date ? item : acc,
  );

  return {
    ...vehicle,
    lastService: latest.date,
    lastServiceOdometer: latest.odometer,
    lastServiceNote: latest.note,
    nextService: latest.nextDate || defaultNextServiceDate(latest.date),
    nextServiceOdometer:
      latest.nextOdometer || defaultNextServiceOdometer(latest.odometer),
    nextServiceNote: latest.nextNote,
    odometer: Math.max(vehicle.odometer || 0, latest.odometer || 0),
    serviceHistory: history,
  };
}

export function historyNewestFirst(history: ServiceRecord[] = []) {
  return [...history].sort((a, b) => b.date.localeCompare(a.date));
}
