"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Vehicle } from "@/lib/data";
import {
  DEFAULT_TRAILERS,
  DEFAULT_VEHICLES,
  LEGACY_VEHICLES_STORAGE_KEY,
  normalizeVehicle,
  Trailer,
  TrailerInput,
  TRAILERS_STORAGE_KEY,
  VehicleInput,
  VEHICLES_STORAGE_KEY,
} from "@/lib/fleet";

type FleetContextValue = {
  vehicles: Vehicle[];
  trailers: Trailer[];
  ready: boolean;
  addVehicle: (
    input: VehicleInput,
  ) => { ok: true; vehicle: Vehicle } | { ok: false; error: string };
  updateVehicle: (
    id: string,
    patch: Partial<Vehicle>,
  ) => { ok: true } | { ok: false; error: string };
  deleteVehicle: (id: string) => { ok: true } | { ok: false; error: string };
  addTrailer: (
    input: TrailerInput,
  ) => { ok: true; trailer: Trailer } | { ok: false; error: string };
  updateTrailer: (
    id: string,
    patch: Partial<Trailer>,
  ) => { ok: true } | { ok: false; error: string };
  deleteTrailer: (id: string) => { ok: true } | { ok: false; error: string };
};

const FleetContext = createContext<FleetContextValue | null>(null);

function loadList<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return [...fallback];
    }
    const parsed = JSON.parse(raw) as T[];
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return [...fallback];
    }
    return parsed;
  } catch {
    return [...fallback];
  }
}

function saveList<T>(key: string, list: T[]) {
  window.localStorage.setItem(key, JSON.stringify(list));
}

function loadVehicles(): Vehicle[] {
  try {
    const raw = window.localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Vehicle>[];
      if (Array.isArray(parsed)) {
        const list = parsed
          .filter((v): v is Partial<Vehicle> & { id: string } => Boolean(v?.id))
          .map(normalizeVehicle);
        saveList(VEHICLES_STORAGE_KEY, list);
        return list;
      }
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_VEHICLES_STORAGE_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw) as Partial<Vehicle>[];
      if (Array.isArray(parsed)) {
        const list = parsed
          .filter((v): v is Partial<Vehicle> & { id: string } => Boolean(v?.id))
          .map(normalizeVehicle);
        saveList(VEHICLES_STORAGE_KEY, list);
        return list;
      }
    }
  } catch {
    /* fall through */
  }

  const fallback = DEFAULT_VEHICLES.map((v) => normalizeVehicle(v));
  saveList(VEHICLES_STORAGE_KEY, fallback);
  return fallback;
}

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEFAULT_VEHICLES);
  const [trailers, setTrailers] = useState<Trailer[]>(DEFAULT_TRAILERS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setVehicles(loadVehicles());
      setTrailers(loadList(TRAILERS_STORAGE_KEY, DEFAULT_TRAILERS));
      setReady(true);
    });
  }, []);

  const addVehicle = useCallback((input: VehicleInput) => {
    const plate = input.plate.trim().toUpperCase();
    const model = input.model.trim();
    if (!plate || !model) {
      return { ok: false as const, error: "Укажите госномер и модель" };
    }
    const list = loadVehicles();
    if (list.some((v) => v.plate.toUpperCase() === plate)) {
      return { ok: false as const, error: "ТС с таким госномером уже есть" };
    }
    const today = new Date().toISOString().slice(0, 10);
    const vehicle = normalizeVehicle({
      id: `v-${Date.now()}`,
      plate,
      model,
      type: input.type || "Грузовой",
      driver: input.driver.trim() || "Не назначен",
      odometer: Number.isFinite(input.odometer) ? input.odometer : 0,
      costPerKm: Number.isFinite(input.costPerKm) ? input.costPerKm : 0,
      fuelNorm: Number.isFinite(input.fuelNorm) ? input.fuelNorm : 0,
      fuelFact: Number.isFinite(input.fuelNorm) ? input.fuelNorm : 0,
      lastService: input.lastService || "",
      lastServiceNote: input.lastServiceNote.trim(),
      nextService: input.nextService || today,
      nextServiceNote: input.nextServiceNote.trim(),
      status: input.status || "active",
    });
    const next = [vehicle, ...list];
    saveList(VEHICLES_STORAGE_KEY, next);
    setVehicles(next);
    return { ok: true as const, vehicle };
  }, []);

  const updateVehicle = useCallback((id: string, patch: Partial<Vehicle>) => {
    const list = loadVehicles();
    if (!list.some((v) => v.id === id)) {
      return { ok: false as const, error: "ТС не найдено" };
    }
    const next = list.map((v) =>
      v.id === id ? normalizeVehicle({ ...v, ...patch, id }) : v,
    );
    saveList(VEHICLES_STORAGE_KEY, next);
    setVehicles(next);
    return { ok: true as const };
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    const list = loadVehicles();
    if (!list.some((v) => v.id === id)) {
      return { ok: false as const, error: "ТС не найдено" };
    }
    const next = list.filter((v) => v.id !== id);
    saveList(VEHICLES_STORAGE_KEY, next);
    setVehicles(next);
    return { ok: true as const };
  }, []);

  const addTrailer = useCallback((input: TrailerInput) => {
    const plate = input.plate.trim().toUpperCase();
    const model = input.model.trim();
    if (!plate || !model) {
      return { ok: false as const, error: "Укажите госномер и модель прицепа" };
    }
    const list = loadList<Trailer>(TRAILERS_STORAGE_KEY, DEFAULT_TRAILERS);
    if (list.some((t) => t.plate.toUpperCase() === plate)) {
      return { ok: false as const, error: "Прицеп с таким госномером уже есть" };
    }
    const trailer: Trailer = {
      id: `tr-${Date.now()}`,
      plate,
      model,
      type: input.type || "Тент",
      capacityTons: Number.isFinite(input.capacityTons) ? input.capacityTons : 0,
      coupledTo: input.coupledTo.trim(),
      nextService: input.nextService || new Date().toISOString().slice(0, 10),
      status: input.status || (input.coupledTo.trim() ? "coupled" : "free"),
    };
    const next = [trailer, ...list];
    saveList(TRAILERS_STORAGE_KEY, next);
    setTrailers(next);
    return { ok: true as const, trailer };
  }, []);

  const updateTrailer = useCallback((id: string, patch: Partial<Trailer>) => {
    const list = loadList<Trailer>(TRAILERS_STORAGE_KEY, DEFAULT_TRAILERS);
    if (!list.some((t) => t.id === id)) {
      return { ok: false as const, error: "Прицеп не найден" };
    }
    const next = list.map((t) => (t.id === id ? { ...t, ...patch } : t));
    saveList(TRAILERS_STORAGE_KEY, next);
    setTrailers(next);
    return { ok: true as const };
  }, []);

  const deleteTrailer = useCallback((id: string) => {
    const list = loadList<Trailer>(TRAILERS_STORAGE_KEY, DEFAULT_TRAILERS);
    if (!list.some((t) => t.id === id)) {
      return { ok: false as const, error: "Прицеп не найден" };
    }
    const next = list.filter((t) => t.id !== id);
    saveList(TRAILERS_STORAGE_KEY, next);
    setTrailers(next);
    return { ok: true as const };
  }, []);

  const value = useMemo(
    () => ({
      vehicles,
      trailers,
      ready,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addTrailer,
      updateTrailer,
      deleteTrailer,
    }),
    [
      vehicles,
      trailers,
      ready,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addTrailer,
      updateTrailer,
      deleteTrailer,
    ],
  );

  return (
    <FleetContext.Provider value={value}>{children}</FleetContext.Provider>
  );
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used within FleetProvider");
  return ctx;
}
