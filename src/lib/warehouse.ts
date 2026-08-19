export type WarehouseUnit = "шт" | "л" | "кг" | "компл." | "м";

export type WarehouseItem = {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unit: WarehouseUnit;
  min: number;
  price: number;
};

export type WarehouseItemInput = {
  name: string;
  sku: string;
  qty: number;
  unit: WarehouseUnit;
  min: number;
  price: number;
};

export const WAREHOUSE_STORAGE_KEY = "mechanik-warehouse-v1";

export const warehouseUnits: WarehouseUnit[] = ["шт", "л", "кг", "компл.", "м"];

export const DEFAULT_WAREHOUSE_ITEMS: WarehouseItem[] = [
  {
    id: "w1",
    name: "Масло моторное 10W-40",
    sku: "OIL-1040",
    qty: 48,
    unit: "л",
    min: 20,
    price: 450,
  },
  {
    id: "w2",
    name: "Фильтр масляный КамАЗ",
    sku: "FLT-KAM",
    qty: 12,
    unit: "шт",
    min: 8,
    price: 1200,
  },
  {
    id: "w3",
    name: "Колодки тормозные Sprinter",
    sku: "BRK-SPR",
    qty: 3,
    unit: "компл.",
    min: 4,
    price: 6800,
  },
  {
    id: "w4",
    name: "Шина 315/70 R22.5",
    sku: "TIR-315",
    qty: 16,
    unit: "шт",
    min: 10,
    price: 28500,
  },
  {
    id: "w5",
    name: "Аккумулятор 190Ah",
    sku: "BAT-190",
    qty: 6,
    unit: "шт",
    min: 2,
    price: 15200,
  },
];

export function canManageWarehouse(role: string) {
  return role === "admin" || role === "manager" || role === "mechanic";
}
