import type { Vehicle, VehicleStatus } from "@/lib/data";
import { vehicles as seedVehicles } from "@/lib/data";
import {
  seedServiceHistory,
  SERVICE_INTERVAL_KM,
} from "@/lib/maintenance";

export type TrailerStatus = "free" | "coupled" | "service" | "repair";

export type Trailer = {
  id: string;
  plate: string;
  model: string;
  type: string;
  capacityTons: number;
  coupledTo: string;
  nextService: string;
  status: TrailerStatus;
};

export const VEHICLES_STORAGE_KEY = "mechanik-vehicles-v4";
export const TRAILERS_STORAGE_KEY = "mechanik-trailers-v1";
export const LEGACY_VEHICLES_STORAGE_KEY = "mechanik-vehicles-v1";
export const LEGACY_VEHICLES_STORAGE_KEY_V2 = "mechanik-vehicles-v2";
export const LEGACY_VEHICLES_STORAGE_KEY_V3 = "mechanik-vehicles-v3";

export const vehicleTypes = [
  "Грузовой",
  "Легковой",
  "Спецтехника",
  "Автобус",
  "Тягач",
] as const;

export const trailerTypes = [
  "Тент",
  "Рефрижератор",
  "Бортовой",
  "Цистерна",
  "Контейнеровоз",
  "Низкорамный",
] as const;

export const DEFAULT_TRAILERS: Trailer[] = [
  {
    id: "t1",
    plate: "АА1234 77",
    model: "Schmitz Cargobull",
    type: "Тент",
    capacityTons: 20,
    coupledTo: "А123ВС 77",
    nextService: "2026-09-01",
    status: "coupled",
  },
  {
    id: "t2",
    plate: "ВВ5678 50",
    model: "Krone Cool Liner",
    type: "Рефрижератор",
    capacityTons: 22,
    coupledTo: "К450МН 50",
    nextService: "2026-08-25",
    status: "coupled",
  },
  {
    id: "t3",
    plate: "СС9012 16",
    model: "МАЗ 9758",
    type: "Бортовой",
    capacityTons: 18,
    coupledTo: "",
    nextService: "2026-10-12",
    status: "free",
  },
];

export type VehicleInput = {
  plate: string;
  model: string;
  type: string;
  driver: string;
  odometer: number;
  costPerKm: number;
  fuelNorm: number;
  lastService: string;
  lastServiceOdometer: number;
  lastServiceNote: string;
  nextService: string;
  nextServiceOdometer: number;
  nextServiceNote: string;
  status: VehicleStatus;
};

/** Нормализация ТС из старого localStorage без полей ТО. */
export function normalizeVehicle(raw: Partial<Vehicle> & { id: string }): Vehicle {
  const today = new Date().toISOString().slice(0, 10);
  const odometer = Number.isFinite(raw.odometer) ? Number(raw.odometer) : 0;
  const lastOdo = Number.isFinite(raw.lastServiceOdometer)
    ? Number(raw.lastServiceOdometer)
    : Math.max(0, odometer - SERVICE_INTERVAL_KM);
  const nextOdo = Number.isFinite(raw.nextServiceOdometer)
    ? Number(raw.nextServiceOdometer)
    : lastOdo + SERVICE_INTERVAL_KM;
  const serviceHistory = seedServiceHistory({
    ...raw,
    lastServiceOdometer: lastOdo,
    nextServiceOdometer: nextOdo,
  });
  const latest = serviceHistory.length
    ? serviceHistory[serviceHistory.length - 1]
    : null;
  return {
    id: raw.id,
    plate: raw.plate ?? "",
    model: raw.model ?? "",
    type: raw.type ?? "Грузовой",
    driver: raw.driver ?? "Не назначен",
    odometer,
    costPerKm: Number.isFinite(raw.costPerKm) ? Number(raw.costPerKm) : 0,
    fuelNorm: Number.isFinite(raw.fuelNorm) ? Number(raw.fuelNorm) : 0,
    fuelFact: Number.isFinite(raw.fuelFact)
      ? Number(raw.fuelFact)
      : Number.isFinite(raw.fuelNorm)
        ? Number(raw.fuelNorm)
        : 0,
    lastService: raw.lastService || latest?.date || "",
    lastServiceOdometer: lastOdo,
    lastServiceNote: raw.lastServiceNote || latest?.note || "",
    nextService: raw.nextService || latest?.nextDate || today,
    nextServiceOdometer: nextOdo,
    nextServiceNote: raw.nextServiceNote || latest?.nextNote || "",
    serviceHistory,
    status: (raw.status as VehicleStatus) || "active",
  };
}

export type TrailerInput = {
  plate: string;
  model: string;
  type: string;
  capacityTons: number;
  coupledTo: string;
  nextService: string;
  status: TrailerStatus;
};

export function canManageFleet(role: string) {
  return role === "admin" || role === "manager";
}

export const DEFAULT_VEHICLES: Vehicle[] = seedVehicles.map((v) =>
  normalizeVehicle(v),
);
