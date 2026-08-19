"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useWarehouse } from "@/components/warehouse-provider";
import {
  DEFAULT_TIRES,
  Tire,
  TireInput,
  TireMountTarget,
  TIRES_STORAGE_KEY,
  tireWarehouseName,
  tireWarehouseSku,
} from "@/lib/tires";

type TiresContextValue = {
  tires: Tire[];
  ready: boolean;
  addTire: (
    input: TireInput,
  ) => { ok: true; tire: Tire } | { ok: false; error: string };
  deleteTire: (id: string) => { ok: true } | { ok: false; error: string };
  moveToWarehouse: (
    id: string,
  ) => { ok: true; tire: Tire } | { ok: false; error: string };
  issueToUnit: (
    id: string,
    target: TireMountTarget,
    note?: string,
  ) => { ok: true; tire: Tire } | { ok: false; error: string };
  returnToWarehouse: (
    id: string,
  ) => { ok: true; tire: Tire } | { ok: false; error: string };
};

const TiresContext = createContext<TiresContextValue | null>(null);

function loadTires(): Tire[] {
  try {
    const raw = window.localStorage.getItem(TIRES_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        TIRES_STORAGE_KEY,
        JSON.stringify(DEFAULT_TIRES),
      );
      return [...DEFAULT_TIRES];
    }
    const parsed = JSON.parse(raw) as Tire[];
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(
        TIRES_STORAGE_KEY,
        JSON.stringify(DEFAULT_TIRES),
      );
      return [...DEFAULT_TIRES];
    }
    return parsed;
  } catch {
    return [...DEFAULT_TIRES];
  }
}

function saveTires(tires: Tire[]) {
  window.localStorage.setItem(TIRES_STORAGE_KEY, JSON.stringify(tires));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function TiresProvider({ children }: { children: React.ReactNode }) {
  const { addItem, deleteItem, issueParts, items } = useWarehouse();
  const [tires, setTires] = useState<Tire[]>(DEFAULT_TIRES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setTires(loadTires());
      setReady(true);
    });
  }, []);

  const addTire = useCallback((input: TireInput) => {
    const serial = input.serial.trim().toUpperCase();
    const brand = input.brand.trim();
    const size = input.size.trim();
    if (!serial || !brand) {
      return { ok: false as const, error: "Укажите номер и марку шины" };
    }
    const list = loadTires();
    if (list.some((t) => t.serial.toUpperCase() === serial)) {
      return {
        ok: false as const,
        error: `Шина с номером ${serial} уже есть в учёте`,
      };
    }
    const tire: Tire = {
      id: `tire-${Date.now()}`,
      serial,
      brand,
      size: size || "—",
      season: input.season,
      status: "registered",
      warehouseItemId: null,
      mountedOn: null,
      price: Number.isFinite(input.price) && input.price >= 0 ? input.price : 0,
      note: input.note.trim(),
      createdAt: today(),
      updatedAt: today(),
    };
    const next = [tire, ...list];
    saveTires(next);
    setTires(next);
    return { ok: true as const, tire };
  }, []);

  const moveToWarehouse = useCallback(
    (id: string) => {
      const list = loadTires();
      const tire = list.find((t) => t.id === id);
      if (!tire) return { ok: false as const, error: "Шина не найдена" };
      if (tire.status === "warehouse") {
        return { ok: false as const, error: "Шина уже на складе" };
      }
      if (tire.status === "mounted") {
        return {
          ok: false as const,
          error: "Сначала снимите шину с ТС/прицепа",
        };
      }
      if (tire.status === "written_off") {
        return { ok: false as const, error: "Списанную шину нельзя вернуть" };
      }

      const sku = tireWarehouseSku(tire.serial);
      const existing = items.find(
        (i) => i.sku.toUpperCase() === sku.toUpperCase(),
      );
      let warehouseItemId = existing?.id ?? tire.warehouseItemId;

      if (!existing) {
        const created = addItem({
          name: tireWarehouseName(tire),
          sku,
          qty: 1,
          unit: "шт",
          min: 0,
          price: tire.price,
        });
        if (!created.ok) {
          // артикул уже есть — привяжем к существующей позиции
          const bySku = items.find(
            (i) => i.sku.toUpperCase() === sku.toUpperCase(),
          );
          if (!bySku) return created;
          warehouseItemId = bySku.id;
        } else {
          warehouseItemId = created.item.id;
        }
      }

      const updated: Tire = {
        ...tire,
        status: "warehouse",
        warehouseItemId,
        mountedOn: null,
        updatedAt: today(),
      };
      const next = list.map((t) => (t.id === id ? updated : t));
      saveTires(next);
      setTires(next);
      return { ok: true as const, tire: updated };
    },
    [addItem, items],
  );

  const issueToUnit = useCallback(
    (id: string, target: TireMountTarget, note?: string) => {
      const list = loadTires();
      const tire = list.find((t) => t.id === id);
      if (!tire) return { ok: false as const, error: "Шина не найдена" };
      if (tire.status === "mounted") {
        return { ok: false as const, error: "Шина уже установлена" };
      }
      if (tire.status === "written_off") {
        return { ok: false as const, error: "Списанную шину нельзя выдать" };
      }
      if (tire.status !== "warehouse") {
        return {
          ok: false as const,
          error: "Сначала переместите шину на склад",
        };
      }
      if (!target.id || !target.plate) {
        return { ok: false as const, error: "Выберите ТС или прицеп" };
      }

      if (tire.warehouseItemId) {
        const stock = items.find((i) => i.id === tire.warehouseItemId);
        if (stock && stock.qty > 0) {
          const issued = issueParts([
            { warehouseItemId: tire.warehouseItemId, qty: 1 },
          ]);
          if (!issued.ok) return issued;
        }
        // серийная шина: убираем карточку со склада после выдачи
        deleteItem(tire.warehouseItemId);
      }

      const updated: Tire = {
        ...tire,
        status: "mounted",
        warehouseItemId: null,
        mountedOn: target,
        note: note?.trim() ? note.trim() : tire.note,
        updatedAt: today(),
      };
      const next = list.map((t) => (t.id === id ? updated : t));
      saveTires(next);
      setTires(next);
      return { ok: true as const, tire: updated };
    },
    [deleteItem, issueParts, items],
  );

  const returnToWarehouse = useCallback(
    (id: string) => {
      const list = loadTires();
      const tire = list.find((t) => t.id === id);
      if (!tire) return { ok: false as const, error: "Шина не найдена" };
      if (tire.status !== "mounted") {
        return { ok: false as const, error: "Шина не установлена на технику" };
      }

      const sku = tireWarehouseSku(tire.serial);
      const created = addItem({
        name: tireWarehouseName(tire),
        sku,
        qty: 1,
        unit: "шт",
        min: 0,
        price: tire.price,
      });
      if (!created.ok) return created;

      const updated: Tire = {
        ...tire,
        status: "warehouse",
        warehouseItemId: created.item.id,
        mountedOn: null,
        updatedAt: today(),
      };
      const next = list.map((t) => (t.id === id ? updated : t));
      saveTires(next);
      setTires(next);
      return { ok: true as const, tire: updated };
    },
    [addItem],
  );

  const deleteTire = useCallback(
    (id: string) => {
      const list = loadTires();
      const tire = list.find((t) => t.id === id);
      if (!tire) return { ok: false as const, error: "Шина не найдена" };
      if (tire.status === "mounted") {
        return {
          ok: false as const,
          error: "Снимите шину с техники перед удалением",
        };
      }
      if (tire.warehouseItemId) {
        const stock = items.find((i) => i.id === tire.warehouseItemId);
        if (stock) deleteItem(tire.warehouseItemId);
      }
      const next = list.filter((t) => t.id !== id);
      saveTires(next);
      setTires(next);
      return { ok: true as const };
    },
    [deleteItem, items],
  );

  const value = useMemo(
    () => ({
      tires,
      ready,
      addTire,
      deleteTire,
      moveToWarehouse,
      issueToUnit,
      returnToWarehouse,
    }),
    [
      tires,
      ready,
      addTire,
      deleteTire,
      moveToWarehouse,
      issueToUnit,
      returnToWarehouse,
    ],
  );

  return (
    <TiresContext.Provider value={value}>{children}</TiresContext.Provider>
  );
}

export function useTires() {
  const ctx = useContext(TiresContext);
  if (!ctx) throw new Error("useTires must be used within TiresProvider");
  return ctx;
}
