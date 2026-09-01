"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  calcLaborCost,
  DEFAULT_WORK_ORDERS,
  SERVICE_ORDERS_STORAGE_KEY,
  WorkOrder,
  WorkOrderInput,
  WorkOrderStatus,
} from "@/lib/service";
import { useWarehouse } from "@/components/warehouse-provider";

type ServiceContextValue = {
  orders: WorkOrder[];
  ready: boolean;
  addOrder: (
    input: WorkOrderInput,
  ) => { ok: true; order: WorkOrder } | { ok: false; error: string };
  addPartsToOrder: (
    orderId: string,
    parts: { warehouseItemId: string; qty: number }[],
  ) => { ok: true; order: WorkOrder } | { ok: false; error: string };
  updateOrderStatus: (
    id: string,
    status: WorkOrderStatus,
  ) => { ok: true } | { ok: false; error: string };
  deleteOrder: (id: string) => { ok: true } | { ok: false; error: string };
};

const ServiceContext = createContext<ServiceContextValue | null>(null);

function loadOrders(): WorkOrder[] {
  try {
    const raw = window.localStorage.getItem(SERVICE_ORDERS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        SERVICE_ORDERS_STORAGE_KEY,
        JSON.stringify(DEFAULT_WORK_ORDERS),
      );
      return [...DEFAULT_WORK_ORDERS];
    }
    const parsed = JSON.parse(raw) as WorkOrder[];
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(
        SERVICE_ORDERS_STORAGE_KEY,
        JSON.stringify(DEFAULT_WORK_ORDERS),
      );
      return [...DEFAULT_WORK_ORDERS];
    }
    return parsed;
  } catch {
    return [...DEFAULT_WORK_ORDERS];
  }
}

function saveOrders(orders: WorkOrder[]) {
  window.localStorage.setItem(
    SERVICE_ORDERS_STORAGE_KEY,
    JSON.stringify(orders),
  );
}

function nextNumber(orders: WorkOrder[]) {
  const nums = orders
    .map((o) => Number(o.number.replace(/\D/g, "")))
    .filter((n) => Number.isFinite(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `ЗН-${max + 1}`;
}

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const { issueParts } = useWarehouse();
  const [orders, setOrders] = useState<WorkOrder[]>(DEFAULT_WORK_ORDERS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setOrders(loadOrders());
      setReady(true);
    });
  }, []);

  const addOrder = useCallback(
    (input: WorkOrderInput) => {
      const vehicle = input.vehicle.trim();
      const title = input.title.trim();
      if (!vehicle || !title) {
        return { ok: false as const, error: "Укажите ТС и описание работ" };
      }
      if (!(input.laborHours > 0)) {
        return { ok: false as const, error: "Укажите нормо-часы больше 0" };
      }
      if (!(input.hourlyRate > 0)) {
        return {
          ok: false as const,
          error: "Укажите стоимость нормо-часа больше 0",
        };
      }

      const issue = issueParts(input.parts);
      if (!issue.ok) return issue;

      const laborCost = calcLaborCost(input.laborHours, input.hourlyRate);
      const partsCost = issue.parts.reduce((sum, p) => sum + p.sum, 0);
      const list = loadOrders();
      const order: WorkOrder = {
        id: `s-${Date.now()}`,
        number: nextNumber(list),
        vehicle,
        title,
        due: input.due || new Date().toISOString().slice(0, 10),
        status: input.status || "open",
        laborHours: input.laborHours,
        hourlyRate: input.hourlyRate,
        laborCost,
        parts: issue.parts,
        partsCost,
        totalCost: Math.round((laborCost + partsCost) * 100) / 100,
        createdAt: new Date().toISOString().slice(0, 10),
        mechanic: input.mechanic.trim(),
      };
      const next = [order, ...list];
      saveOrders(next);
      setOrders(next);
      return { ok: true as const, order };
    },
    [issueParts],
  );

  const addPartsToOrder = useCallback(
    (orderId: string, parts: { warehouseItemId: string; qty: number }[]) => {
      const list = loadOrders();
      const order = list.find((o) => o.id === orderId);
      if (!order) {
        return { ok: false as const, error: "Заказ-наряд не найден" };
      }
      if (order.status === "done") {
        return {
          ok: false as const,
          error: "Нельзя списывать запчасти в закрытый заказ-наряд",
        };
      }
      const lines = parts.filter((p) => p.warehouseItemId && p.qty > 0);
      if (!lines.length) {
        return {
          ok: false as const,
          error: "Выберите номенклатуру и количество",
        };
      }

      const issue = issueParts(lines);
      if (!issue.ok) return issue;

      const mergedParts = [...order.parts];
      for (const part of issue.parts) {
        const existing = mergedParts.find(
          (p) => p.warehouseItemId === part.warehouseItemId,
        );
        if (existing) {
          existing.qty += part.qty;
          existing.sum =
            Math.round(existing.price * existing.qty * 100) / 100;
        } else {
          mergedParts.push(part);
        }
      }
      const partsCost = mergedParts.reduce((sum, p) => sum + p.sum, 0);
      const updated: WorkOrder = {
        ...order,
        parts: mergedParts,
        partsCost,
        totalCost: Math.round((order.laborCost + partsCost) * 100) / 100,
      };
      const next = list.map((o) => (o.id === orderId ? updated : o));
      saveOrders(next);
      setOrders(next);
      return { ok: true as const, order: updated };
    },
    [issueParts],
  );

  const updateOrderStatus = useCallback(
    (id: string, status: WorkOrderStatus) => {
      const list = loadOrders();
      if (!list.some((o) => o.id === id)) {
        return { ok: false as const, error: "Заказ-наряд не найден" };
      }
      const next = list.map((o) => (o.id === id ? { ...o, status } : o));
      saveOrders(next);
      setOrders(next);
      return { ok: true as const };
    },
    [],
  );

  const deleteOrder = useCallback((id: string) => {
    const list = loadOrders();
    if (!list.some((o) => o.id === id)) {
      return { ok: false as const, error: "Заказ-наряд не найден" };
    }
    const next = list.filter((o) => o.id !== id);
    saveOrders(next);
    setOrders(next);
    return { ok: true as const };
  }, []);

  const value = useMemo(
    () => ({
      orders,
      ready,
      addOrder,
      addPartsToOrder,
      updateOrderStatus,
      deleteOrder,
    }),
    [orders, ready, addOrder, addPartsToOrder, updateOrderStatus, deleteOrder],
  );

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
}

export function useService() {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useService must be used within ServiceProvider");
  return ctx;
}
