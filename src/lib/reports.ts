import type { Vehicle, VehicleStatus } from "@/lib/data";
import type { Trailer, TrailerStatus } from "@/lib/fleet";
import type { WorkOrder, WorkOrderStatus } from "@/lib/service";
import type { WarehouseItem } from "@/lib/warehouse";

export type ReportId =
  | "fleet"
  | "service"
  | "warehouse"
  | "parts-writeoff"
  | "summary";

export type ReportColumn = { key: string; label: string; align?: "left" | "right" };

export type ReportDefinition = {
  id: ReportId;
  title: string;
  description: string;
  columns: ReportColumn[];
};

export type ReportRow = Record<string, string | number>;

export type BuiltReport = {
  id: ReportId;
  title: string;
  description: string;
  generatedAt: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  totals?: { label: string; value: string }[];
};

const vehicleStatusRu: Record<VehicleStatus, string> = {
  active: "В работе",
  service: "На сервисе",
  idle: "Простой",
  alert: "Внимание",
};

const trailerStatusRu: Record<TrailerStatus, string> = {
  free: "Свободен",
  coupled: "Сцеплен",
  service: "На сервисе",
  repair: "Ремонт",
};

const orderStatusRu: Record<WorkOrderStatus, string> = {
  open: "Открыт",
  in_progress: "В работе",
  done: "Готово",
  overdue: "Просрочен",
};

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    id: "fleet",
    title: "Автопарк",
    description: "Машины и прицепы: пробег, статус, следующее ТО",
    columns: [
      { key: "kind", label: "Тип" },
      { key: "plate", label: "Госномер" },
      { key: "model", label: "Модель" },
      { key: "driver", label: "Водитель / сцепка" },
      { key: "odometer", label: "Пробег / грузоподъёмн.", align: "right" },
      { key: "nextService", label: "След. ТО" },
      { key: "status", label: "Статус" },
    ],
  },
  {
    id: "service",
    title: "Заказ-наряды",
    description: "Работы, нормо-часы, запчасти и итоговая стоимость",
    columns: [
      { key: "number", label: "№" },
      { key: "vehicle", label: "ТС" },
      { key: "title", label: "Работы" },
      { key: "mechanic", label: "Механик" },
      { key: "laborHours", label: "Н/ч", align: "right" },
      { key: "laborCost", label: "Работа, ₽", align: "right" },
      { key: "partsCost", label: "Запчасти, ₽", align: "right" },
      { key: "totalCost", label: "Итого, ₽", align: "right" },
      { key: "status", label: "Статус" },
      { key: "due", label: "Срок" },
    ],
  },
  {
    id: "warehouse",
    title: "Склад",
    description: "Номенклатура, остатки, цена и стоимость запасов",
    columns: [
      { key: "sku", label: "Артикул" },
      { key: "name", label: "Номенклатура" },
      { key: "qty", label: "Остаток", align: "right" },
      { key: "unit", label: "Ед." },
      { key: "min", label: "Мин.", align: "right" },
      { key: "price", label: "Цена, ₽", align: "right" },
      { key: "sum", label: "Сумма, ₽", align: "right" },
      { key: "stock", label: "Запас" },
    ],
  },
  {
    id: "parts-writeoff",
    title: "Списание запчастей",
    description: "Номенклатура, списанная в заказ-наряды",
    columns: [
      { key: "order", label: "Заказ-наряд" },
      { key: "vehicle", label: "ТС" },
      { key: "sku", label: "Артикул" },
      { key: "name", label: "Номенклатура" },
      { key: "qty", label: "Кол-во", align: "right" },
      { key: "unit", label: "Ед." },
      { key: "price", label: "Цена, ₽", align: "right" },
      { key: "sum", label: "Сумма, ₽", align: "right" },
    ],
  },
  {
    id: "summary",
    title: "Сводка затрат",
    description: "KPI по автопарку, сервису и складу",
    columns: [
      { key: "metric", label: "Показатель" },
      { key: "value", label: "Значение", align: "right" },
      { key: "note", label: "Комментарий" },
    ],
  },
];

function nowLabel() {
  return new Date().toLocaleString("ru-RU");
}

export function buildFleetReport(
  vehicles: Vehicle[],
  trailers: Trailer[],
): BuiltReport {
  const def = REPORT_DEFINITIONS.find((r) => r.id === "fleet")!;
  const rows: ReportRow[] = [
    ...vehicles.map((v) => ({
      kind: "ТС",
      plate: v.plate,
      model: `${v.model} (${v.type})`,
      driver: v.driver || "—",
      odometer: `${v.odometer} км`,
      nextService: v.nextService,
      status: vehicleStatusRu[v.status],
    })),
    ...trailers.map((t) => ({
      kind: "Прицеп",
      plate: t.plate,
      model: `${t.model} (${t.type})`,
      driver: t.coupledTo || "—",
      odometer: `${t.capacityTons} т`,
      nextService: t.nextService,
      status: trailerStatusRu[t.status],
    })),
  ];
  return {
    id: "fleet",
    title: def.title,
    description: def.description,
    generatedAt: nowLabel(),
    columns: def.columns,
    rows,
    totals: [
      { label: "ТС", value: String(vehicles.length) },
      { label: "Прицепы", value: String(trailers.length) },
    ],
  };
}

export function buildServiceReport(orders: WorkOrder[]): BuiltReport {
  const def = REPORT_DEFINITIONS.find((r) => r.id === "service")!;
  const rows: ReportRow[] = orders.map((o) => ({
    number: o.number,
    vehicle: o.vehicle,
    title: o.title,
    mechanic: o.mechanic || "—",
    laborHours: o.laborHours,
    laborCost: o.laborCost,
    partsCost: o.partsCost,
    totalCost: o.totalCost,
    status: orderStatusRu[o.status],
    due: o.due,
  }));
  const total = orders.reduce((s, o) => s + o.totalCost, 0);
  const hours = orders.reduce((s, o) => s + o.laborHours, 0);
  return {
    id: "service",
    title: def.title,
    description: def.description,
    generatedAt: nowLabel(),
    columns: def.columns,
    rows,
    totals: [
      { label: "Заказ-нарядов", value: String(orders.length) },
      { label: "Нормо-часы", value: String(hours) },
      { label: "Сумма", value: `${Math.round(total)} ₽` },
    ],
  };
}

export function buildWarehouseReport(items: WarehouseItem[]): BuiltReport {
  const def = REPORT_DEFINITIONS.find((r) => r.id === "warehouse")!;
  const rows: ReportRow[] = items.map((i) => ({
    sku: i.sku,
    name: i.name,
    qty: i.qty,
    unit: i.unit,
    min: i.min,
    price: i.price,
    sum: Math.round(i.price * i.qty * 100) / 100,
    stock: i.qty < i.min ? "Ниже минимума" : "Норма",
  }));
  const stockValue = items.reduce((s, i) => s + i.price * i.qty, 0);
  const low = items.filter((i) => i.qty < i.min).length;
  return {
    id: "warehouse",
    title: def.title,
    description: def.description,
    generatedAt: nowLabel(),
    columns: def.columns,
    rows,
    totals: [
      { label: "Позиций", value: String(items.length) },
      { label: "Ниже минимума", value: String(low) },
      { label: "Стоимость запасов", value: `${Math.round(stockValue)} ₽` },
    ],
  };
}

export function buildPartsWriteoffReport(orders: WorkOrder[]): BuiltReport {
  const def = REPORT_DEFINITIONS.find((r) => r.id === "parts-writeoff")!;
  const rows: ReportRow[] = [];
  for (const o of orders) {
    for (const p of o.parts) {
      rows.push({
        order: o.number,
        vehicle: o.vehicle,
        sku: p.sku,
        name: p.name,
        qty: p.qty,
        unit: p.unit,
        price: p.price,
        sum: p.sum,
      });
    }
  }
  const total = rows.reduce((s, r) => s + Number(r.sum || 0), 0);
  return {
    id: "parts-writeoff",
    title: def.title,
    description: def.description,
    generatedAt: nowLabel(),
    columns: def.columns,
    rows,
    totals: [
      { label: "Строк списания", value: String(rows.length) },
      { label: "Сумма списания", value: `${Math.round(total)} ₽` },
    ],
  };
}

export function buildSummaryReport(
  vehicles: Vehicle[],
  trailers: Trailer[],
  orders: WorkOrder[],
  items: WarehouseItem[],
): BuiltReport {
  const def = REPORT_DEFINITIONS.find((r) => r.id === "summary")!;
  const openOrders = orders.filter((o) => o.status !== "done");
  const serviceCost = orders.reduce((s, o) => s + o.totalCost, 0);
  const partsCost = orders.reduce((s, o) => s + o.partsCost, 0);
  const laborCost = orders.reduce((s, o) => s + o.laborCost, 0);
  const stockValue = items.reduce((s, i) => s + i.price * i.qty, 0);
  const lowStock = items.filter((i) => i.qty < i.min).length;
  const avgCostPerKm =
    vehicles.length > 0
      ? vehicles.reduce((s, v) => s + v.costPerKm, 0) / vehicles.length
      : 0;

  const rows: ReportRow[] = [
    { metric: "ТС в автопарке", value: vehicles.length, note: "" },
    { metric: "Прицепы", value: trailers.length, note: "" },
    {
      metric: "Средняя стоимость 1 км",
      value: `${avgCostPerKm.toFixed(1)} ₽`,
      note: "по карточкам ТС",
    },
    {
      metric: "Заказ-наряды всего",
      value: orders.length,
      note: `открытых/в работе: ${openOrders.length}`,
    },
    {
      metric: "Стоимость работ",
      value: `${Math.round(laborCost)} ₽`,
      note: "нормо-часы",
    },
    {
      metric: "Стоимость запчастей в ЗН",
      value: `${Math.round(partsCost)} ₽`,
      note: "списания",
    },
    {
      metric: "Итого сервис",
      value: `${Math.round(serviceCost)} ₽`,
      note: "работа + запчасти",
    },
    {
      metric: "Стоимость склада",
      value: `${Math.round(stockValue)} ₽`,
      note: `ниже минимума: ${lowStock}`,
    },
  ];

  return {
    id: "summary",
    title: def.title,
    description: def.description,
    generatedAt: nowLabel(),
    columns: def.columns,
    rows,
  };
}

export function buildReport(
  id: ReportId,
  data: {
    vehicles: Vehicle[];
    trailers: Trailer[];
    orders: WorkOrder[];
    items: WarehouseItem[];
  },
): BuiltReport {
  switch (id) {
    case "fleet":
      return buildFleetReport(data.vehicles, data.trailers);
    case "service":
      return buildServiceReport(data.orders);
    case "warehouse":
      return buildWarehouseReport(data.items);
    case "parts-writeoff":
      return buildPartsWriteoffReport(data.orders);
    case "summary":
      return buildSummaryReport(
        data.vehicles,
        data.trailers,
        data.orders,
        data.items,
      );
  }
}
