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
  DEFAULT_WAREHOUSE_ITEMS,
  WarehouseItem,
  WarehouseItemInput,
  WAREHOUSE_STORAGE_KEY,
} from "@/lib/warehouse";

export type StockIssueLine = {
  warehouseItemId: string;
  qty: number;
};

export type IssuedPart = {
  warehouseItemId: string;
  name: string;
  sku: string;
  qty: number;
  unit: string;
  price: number;
  sum: number;
};

type WarehouseContextValue = {
  items: WarehouseItem[];
  ready: boolean;
  addItem: (
    input: WarehouseItemInput,
  ) => { ok: true; item: WarehouseItem } | { ok: false; error: string };
  updateItem: (
    id: string,
    patch: Partial<WarehouseItem>,
  ) => { ok: true } | { ok: false; error: string };
  deleteItem: (id: string) => { ok: true } | { ok: false; error: string };
  issueParts: (
    lines: StockIssueLine[],
  ) => { ok: true; parts: IssuedPart[] } | { ok: false; error: string };
};

const WarehouseContext = createContext<WarehouseContextValue | null>(null);

function loadItems(): WarehouseItem[] {
  try {
    const raw = window.localStorage.getItem(WAREHOUSE_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        WAREHOUSE_STORAGE_KEY,
        JSON.stringify(DEFAULT_WAREHOUSE_ITEMS),
      );
      return [...DEFAULT_WAREHOUSE_ITEMS];
    }
    const parsed = JSON.parse(raw) as WarehouseItem[];
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(
        WAREHOUSE_STORAGE_KEY,
        JSON.stringify(DEFAULT_WAREHOUSE_ITEMS),
      );
      return [...DEFAULT_WAREHOUSE_ITEMS];
    }
    return parsed.map((item) => ({
      ...item,
      price: typeof item.price === "number" ? item.price : 0,
    }));
  } catch {
    return [...DEFAULT_WAREHOUSE_ITEMS];
  }
}

function saveItems(items: WarehouseItem[]) {
  window.localStorage.setItem(WAREHOUSE_STORAGE_KEY, JSON.stringify(items));
}

export function WarehouseProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WarehouseItem[]>(DEFAULT_WAREHOUSE_ITEMS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setItems(loadItems());
      setReady(true);
    });
  }, []);

  const addItem = useCallback((input: WarehouseItemInput) => {
    const name = input.name.trim();
    const sku = input.sku.trim().toUpperCase();
    if (!name || !sku) {
      return { ok: false as const, error: "Укажите название и артикул" };
    }
    if (!(input.price >= 0) || Number.isNaN(input.price)) {
      return { ok: false as const, error: "Укажите корректную цену" };
    }
    const list = loadItems();
    if (list.some((i) => i.sku.toUpperCase() === sku)) {
      return { ok: false as const, error: "Позиция с таким артикулом уже есть" };
    }
    const item: WarehouseItem = {
      id: `w-${Date.now()}`,
      name,
      sku,
      qty: Number.isFinite(input.qty) ? Math.max(0, input.qty) : 0,
      unit: input.unit || "шт",
      min: Number.isFinite(input.min) ? Math.max(0, input.min) : 0,
      price: Math.max(0, input.price),
    };
    const next = [item, ...list];
    saveItems(next);
    setItems(next);
    return { ok: true as const, item };
  }, []);

  const updateItem = useCallback(
    (id: string, patch: Partial<WarehouseItem>) => {
      const list = loadItems();
      if (!list.some((i) => i.id === id)) {
        return { ok: false as const, error: "Позиция не найдена" };
      }
      const next = list.map((i) => (i.id === id ? { ...i, ...patch } : i));
      saveItems(next);
      setItems(next);
      return { ok: true as const };
    },
    [],
  );

  const deleteItem = useCallback((id: string) => {
    const list = loadItems();
    if (!list.some((i) => i.id === id)) {
      return { ok: false as const, error: "Позиция не найдена" };
    }
    const next = list.filter((i) => i.id !== id);
    saveItems(next);
    setItems(next);
    return { ok: true as const };
  }, []);

  const issueParts = useCallback((lines: StockIssueLine[]) => {
    if (!lines.length) {
      return { ok: true as const, parts: [] as IssuedPart[] };
    }
    const list = loadItems();
    const issued: IssuedPart[] = [];
    const next = list.map((item) => ({ ...item }));

    for (const line of lines) {
      if (!(line.qty > 0)) {
        return { ok: false as const, error: "Количество запчасти должно быть больше 0" };
      }
      const idx = next.findIndex((i) => i.id === line.warehouseItemId);
      if (idx < 0) {
        return { ok: false as const, error: "Запчасть не найдена на складе" };
      }
      const item = next[idx];
      if (item.qty < line.qty) {
        return {
          ok: false as const,
          error: `Недостаточно «${item.name}» на складе (есть ${item.qty} ${item.unit})`,
        };
      }
      item.qty -= line.qty;
      issued.push({
        warehouseItemId: item.id,
        name: item.name,
        sku: item.sku,
        qty: line.qty,
        unit: item.unit,
        price: item.price,
        sum: Math.round(item.price * line.qty * 100) / 100,
      });
    }

    saveItems(next);
    setItems(next);
    return { ok: true as const, parts: issued };
  }, []);

  const value = useMemo(
    () => ({ items, ready, addItem, updateItem, deleteItem, issueParts }),
    [items, ready, addItem, updateItem, deleteItem, issueParts],
  );

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouse() {
  const ctx = useContext(WarehouseContext);
  if (!ctx) {
    throw new Error("useWarehouse must be used within WarehouseProvider");
  }
  return ctx;
}
