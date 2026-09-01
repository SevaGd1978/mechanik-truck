import type { Vehicle } from "@/lib/data";

export const SERVICE_INTERVAL_KM = 15_000;
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
