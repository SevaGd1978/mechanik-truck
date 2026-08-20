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
  DEFAULT_WAYBILLS,
  Waybill,
  WaybillInput,
  WaybillStatus,
  WAYBILLS_STORAGE_KEY,
} from "@/lib/waybills";

type WaybillsContextValue = {
  waybills: Waybill[];
  ready: boolean;
  addWaybill: (
    input: WaybillInput,
  ) => { ok: true; waybill: Waybill } | { ok: false; error: string };
  updateWaybill: (
    id: string,
    patch: Partial<WaybillInput> & { status?: WaybillStatus },
  ) => { ok: true; waybill: Waybill } | { ok: false; error: string };
  deleteWaybill: (id: string) => { ok: true } | { ok: false; error: string };
};

const WaybillsContext = createContext<WaybillsContextValue | null>(null);

function loadWaybills(): Waybill[] {
  try {
    const raw = window.localStorage.getItem(WAYBILLS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        WAYBILLS_STORAGE_KEY,
        JSON.stringify(DEFAULT_WAYBILLS),
      );
      return [...DEFAULT_WAYBILLS];
    }
    const parsed = JSON.parse(raw) as Waybill[];
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(
        WAYBILLS_STORAGE_KEY,
        JSON.stringify(DEFAULT_WAYBILLS),
      );
      return [...DEFAULT_WAYBILLS];
    }
    return parsed;
  } catch {
    return [...DEFAULT_WAYBILLS];
  }
}

function saveWaybills(list: Waybill[]) {
  window.localStorage.setItem(WAYBILLS_STORAGE_KEY, JSON.stringify(list));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nextNumber(list: Waybill[]) {
  const nums = list
    .map((w) => Number(String(w.number).replace(/\D/g, "")))
    .filter((n) => Number.isFinite(n));
  const max = nums.length ? Math.max(...nums) : 100;
  return String(max + 1).padStart(6, "0");
}

function validate(input: WaybillInput) {
  if (!input.date.trim()) return "Укажите дату путевого листа";
  if (!input.vehiclePlate.trim() || !input.vehicleModel.trim()) {
    return "Укажите автомобиль (госномер и модель)";
  }
  if (!input.driverName.trim()) return "Укажите водителя";
  if (!input.organization.trim()) return "Укажите организацию";
  return null;
}

export function WaybillsProvider({ children }: { children: React.ReactNode }) {
  const [waybills, setWaybills] = useState<Waybill[]>(DEFAULT_WAYBILLS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setWaybills(loadWaybills());
      setReady(true);
    });
  }, []);

  const addWaybill = useCallback((input: WaybillInput) => {
    const error = validate(input);
    if (error) return { ok: false as const, error };

    const list = loadWaybills();
    const now = today();
    const waybill: Waybill = {
      ...input,
      id: `wb-${Date.now()}`,
      formCode: "4-с",
      number: (input.number || "").trim() || nextNumber(list),
      series: (input.series || "АА").trim() || "АА",
      trips: input.trips ?? [],
      createdAt: now,
      updatedAt: now,
    };
    const next = [waybill, ...list];
    saveWaybills(next);
    setWaybills(next);
    return { ok: true as const, waybill };
  }, []);

  const updateWaybill = useCallback(
    (id: string, patch: Partial<WaybillInput> & { status?: WaybillStatus }) => {
      const list = loadWaybills();
      const current = list.find((w) => w.id === id);
      if (!current) return { ok: false as const, error: "Путевой лист не найден" };

      const merged: Waybill = {
        ...current,
        ...patch,
        formCode: "4-с",
        id: current.id,
        createdAt: current.createdAt,
        updatedAt: today(),
        trips: patch.trips ?? current.trips,
      };
      const error = validate(merged);
      if (error) return { ok: false as const, error };

      const next = list.map((w) => (w.id === id ? merged : w));
      saveWaybills(next);
      setWaybills(next);
      return { ok: true as const, waybill: merged };
    },
    [],
  );

  const deleteWaybill = useCallback((id: string) => {
    const list = loadWaybills();
    if (!list.some((w) => w.id === id)) {
      return { ok: false as const, error: "Путевой лист не найден" };
    }
    const next = list.filter((w) => w.id !== id);
    saveWaybills(next);
    setWaybills(next);
    return { ok: true as const };
  }, []);

  const value = useMemo(
    () => ({ waybills, ready, addWaybill, updateWaybill, deleteWaybill }),
    [waybills, ready, addWaybill, updateWaybill, deleteWaybill],
  );

  return (
    <WaybillsContext.Provider value={value}>{children}</WaybillsContext.Provider>
  );
}

export function useWaybills() {
  const ctx = useContext(WaybillsContext);
  if (!ctx) throw new Error("useWaybills must be used within WaybillsProvider");
  return ctx;
}
