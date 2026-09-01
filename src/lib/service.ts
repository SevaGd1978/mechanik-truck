export type WorkOrderStatus = "open" | "in_progress" | "done" | "overdue";

export type WorkOrderPart = {
  warehouseItemId: string;
  name: string;
  sku: string;
  qty: number;
  unit: string;
  price: number;
  sum: number;
};

export type WorkOrder = {
  id: string;
  number: string;
  vehicle: string;
  title: string;
  due: string;
  status: WorkOrderStatus;
  laborHours: number;
  hourlyRate: number;
  laborCost: number;
  parts: WorkOrderPart[];
  partsCost: number;
  totalCost: number;
  createdAt: string;
  mechanic: string;
};

export type WorkOrderInput = {
  vehicle: string;
  title: string;
  due: string;
  status: WorkOrderStatus;
  laborHours: number;
  hourlyRate: number;
  parts: { warehouseItemId: string; qty: number }[];
  mechanic: string;
};

export const SERVICE_ORDERS_STORAGE_KEY = "mechanik-service-orders-v1";

export const DEFAULT_WORK_ORDERS: WorkOrder[] = [
  {
    id: "s1",
    number: "ЗН-1001",
    vehicle: "К450МН 50",
    title: "Замена масла и фильтров",
    due: "2026-08-18",
    status: "overdue",
    laborHours: 2.5,
    hourlyRate: 1800,
    laborCost: 4500,
    parts: [
      {
        warehouseItemId: "w1",
        name: "Масло моторное 10W-40",
        sku: "OIL-1040",
        qty: 20,
        unit: "л",
        price: 450,
        sum: 9000,
      },
      {
        warehouseItemId: "w2",
        name: "Фильтр масляный КамАЗ",
        sku: "FLT-KAM",
        qty: 1,
        unit: "шт",
        price: 1200,
        sum: 1200,
      },
    ],
    partsCost: 10200,
    totalCost: 14700,
    createdAt: "2026-08-15",
    mechanic: "Игорь Механиков",
  },
  {
    id: "s2",
    number: "ЗН-1002",
    vehicle: "Н220КУ 16",
    title: "Диагностика КПП",
    due: "2026-08-19",
    status: "in_progress",
    laborHours: 4,
    hourlyRate: 2000,
    laborCost: 8000,
    parts: [],
    partsCost: 0,
    totalCost: 8000,
    createdAt: "2026-08-17",
    mechanic: "Игорь Механиков",
  },
  {
    id: "s3",
    number: "ЗН-1003",
    vehicle: "А123ВС 77",
    title: "ТО-2 по пробегу",
    due: "2026-08-22",
    status: "open",
    laborHours: 6,
    hourlyRate: 1800,
    laborCost: 10800,
    parts: [],
    partsCost: 0,
    totalCost: 10800,
    createdAt: "2026-08-18",
    mechanic: "",
  },
];

export function canManageService(role: string) {
  return role === "admin" || role === "manager" || role === "mechanic";
}

export function calcLaborCost(hours: number, rate: number) {
  return Math.round(hours * rate * 100) / 100;
}
