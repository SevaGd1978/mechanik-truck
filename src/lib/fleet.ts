import type { Vehicle, VehicleStatus } from "@/lib/data";
import { vehicles as seedVehicles } from "@/lib/data";

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

export const VEHICLES_STORAGE_KEY = "mechanik-vehicles-v1";
export const TRAILERS_STORAGE_KEY = "mechanik-trailers-v1";

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

export const DEFAULT_VEHICLES: Vehicle[] = seedVehicles.map((v) => ({ ...v }));

export type VehicleInput = {
  plate: string;
  model: string;
  type: string;
  driver: string;
  odometer: number;
  costPerKm: number;
  fuelNorm: number;
  nextService: string;
  status: VehicleStatus;
};

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
