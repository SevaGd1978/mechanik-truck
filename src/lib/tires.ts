export type TireStatus = "registered" | "warehouse" | "mounted" | "written_off";

export type TireMountTarget = {
  kind: "vehicle" | "trailer";
  id: string;
  plate: string;
  label: string;
};

export type Tire = {
  id: string;
  serial: string;
  brand: string;
  size: string;
  season: "summer" | "winter" | "allseason";
  status: TireStatus;
  warehouseItemId: string | null;
  mountedOn: TireMountTarget | null;
  price: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type TireInput = {
  serial: string;
  brand: string;
  size: string;
  season: Tire["season"];
  price: number;
  note: string;
};

export const TIRES_STORAGE_KEY = "mechanik-tires-v1";

export const tireSeasonLabels: Record<Tire["season"], string> = {
  summer: "Летняя",
  winter: "Зимняя",
  allseason: "Всесезонная",
};

export const tireStatusLabels: Record<TireStatus, string> = {
  registered: "На учёте",
  warehouse: "На складе",
  mounted: "Установлена",
  written_off: "Списана",
};

export const tireStatusTone: Record<
  TireStatus,
  "accent" | "success" | "warning" | "danger"
> = {
  registered: "accent",
  warehouse: "success",
  mounted: "warning",
  written_off: "danger",
};

export const DEFAULT_TIRES: Tire[] = [
  {
    id: "tire-1",
    serial: "DOT-4819-A1",
    brand: "Michelin",
    size: "315/70 R22.5",
    season: "allseason",
    status: "warehouse",
    warehouseItemId: "w-tire-1",
    mountedOn: null,
    price: 28500,
    note: "",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-10",
  },
  {
    id: "tire-2",
    serial: "DOT-4820-B2",
    brand: "Continental",
    size: "315/70 R22.5",
    season: "winter",
    status: "mounted",
    warehouseItemId: null,
    mountedOn: {
      kind: "vehicle",
      id: "v1",
      plate: "А123ВС 77",
      label: "КамАЗ 5490",
    },
    price: 31200,
    note: "Передняя левая",
    createdAt: "2026-07-12",
    updatedAt: "2026-08-05",
  },
  {
    id: "tire-3",
    serial: "DOT-5011-C3",
    brand: "Bridgestone",
    size: "385/65 R22.5",
    season: "summer",
    status: "registered",
    warehouseItemId: null,
    mountedOn: null,
    price: 26800,
    note: "Новая, ещё не на складе",
    createdAt: "2026-08-18",
    updatedAt: "2026-08-18",
  },
  {
    id: "tire-4",
    serial: "DOT-4777-D4",
    brand: "Goodyear",
    size: "215/75 R17.5",
    season: "allseason",
    status: "mounted",
    warehouseItemId: null,
    mountedOn: {
      kind: "trailer",
      id: "t1",
      plate: "АА1234 77",
      label: "Schmitz Cargobull",
    },
    price: 18900,
    note: "Ось 2",
    createdAt: "2026-06-20",
    updatedAt: "2026-07-30",
  },
];

export { canManageTires } from "@/lib/auth";

export function tireWarehouseSku(serial: string) {
  return `TIRE-${serial.trim().toUpperCase().replace(/\s+/g, "-")}`;
}

export function tireWarehouseName(tire: Pick<Tire, "brand" | "size" | "serial">) {
  return `Шина ${tire.brand} ${tire.size} · ${tire.serial}`;
}
