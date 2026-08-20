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
  DEFAULT_DRIVERS,
  Driver,
  DriverInput,
  DRIVERS_STORAGE_KEY,
  driverFullName,
} from "@/lib/drivers";

type DriversContextValue = {
  drivers: Driver[];
  ready: boolean;
  addDriver: (
    input: DriverInput,
  ) => { ok: true; driver: Driver } | { ok: false; error: string };
  updateDriver: (
    id: string,
    patch: Partial<DriverInput>,
  ) => { ok: true; driver: Driver } | { ok: false; error: string };
  deleteDriver: (id: string) => { ok: true } | { ok: false; error: string };
};

const DriversContext = createContext<DriversContextValue | null>(null);

function loadDrivers(): Driver[] {
  try {
    const raw = window.localStorage.getItem(DRIVERS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        DRIVERS_STORAGE_KEY,
        JSON.stringify(DEFAULT_DRIVERS),
      );
      return [...DEFAULT_DRIVERS];
    }
    const parsed = JSON.parse(raw) as Driver[];
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(
        DRIVERS_STORAGE_KEY,
        JSON.stringify(DEFAULT_DRIVERS),
      );
      return [...DEFAULT_DRIVERS];
    }
    return parsed;
  } catch {
    return [...DEFAULT_DRIVERS];
  }
}

function saveDrivers(list: Driver[]) {
  window.localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(list));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function validate(input: DriverInput) {
  if (!input.lastName.trim() || !input.firstName.trim()) {
    return "Укажите фамилию и имя водителя";
  }
  if (!input.passportSeries.trim() || !input.passportNumber.trim()) {
    return "Укажите серию и номер паспорта";
  }
  if (!input.licenseSeries.trim() || !input.licenseNumber.trim()) {
    return "Укажите серию и номер водительского удостоверения";
  }
  if (!input.licenseCategories.trim()) {
    return "Укажите категории ВУ";
  }
  return null;
}

export function DriversProvider({ children }: { children: React.ReactNode }) {
  const [drivers, setDrivers] = useState<Driver[]>(DEFAULT_DRIVERS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setDrivers(loadDrivers());
      setReady(true);
    });
  }, []);

  const addDriver = useCallback((input: DriverInput) => {
    const error = validate(input);
    if (error) return { ok: false as const, error };

    const list = loadDrivers();
    const passportKey = `${input.passportSeries.trim()} ${input.passportNumber.trim()}`.toUpperCase();
    if (
      list.some(
        (d) =>
          `${d.passportSeries} ${d.passportNumber}`.toUpperCase() ===
          passportKey,
      )
    ) {
      return {
        ok: false as const,
        error: "Водитель с таким паспортом уже есть",
      };
    }

    const now = today();
    const driver: Driver = {
      ...input,
      id: `drv-${Date.now()}`,
      lastName: input.lastName.trim(),
      firstName: input.firstName.trim(),
      middleName: input.middleName.trim(),
      phone: input.phone.trim(),
      tabNumber: input.tabNumber.trim(),
      snils: input.snils.trim(),
      passportSeries: input.passportSeries.trim(),
      passportNumber: input.passportNumber.trim(),
      passportIssuedBy: input.passportIssuedBy.trim(),
      passportDeptCode: input.passportDeptCode.trim(),
      birthPlace: input.birthPlace.trim(),
      registrationAddress: input.registrationAddress.trim(),
      licenseSeries: input.licenseSeries.trim(),
      licenseNumber: input.licenseNumber.trim(),
      licenseCategories: input.licenseCategories.trim(),
      licenseIssuedBy: input.licenseIssuedBy.trim(),
      notes: input.notes.trim(),
      createdAt: now,
      updatedAt: now,
    };
    const next = [driver, ...list];
    saveDrivers(next);
    setDrivers(next);
    return { ok: true as const, driver };
  }, []);

  const updateDriver = useCallback((id: string, patch: Partial<DriverInput>) => {
    const list = loadDrivers();
    const current = list.find((d) => d.id === id);
    if (!current) return { ok: false as const, error: "Водитель не найден" };

    const merged: Driver = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: today(),
    };
    const error = validate(merged);
    if (error) return { ok: false as const, error };

    const next = list.map((d) => (d.id === id ? merged : d));
    saveDrivers(next);
    setDrivers(next);
    return { ok: true as const, driver: merged };
  }, []);

  const deleteDriver = useCallback((id: string) => {
    const list = loadDrivers();
    const current = list.find((d) => d.id === id);
    if (!current) return { ok: false as const, error: "Водитель не найден" };
    const next = list.filter((d) => d.id !== id);
    saveDrivers(next);
    setDrivers(next);
    return { ok: true as const };
  }, []);

  const value = useMemo(
    () => ({ drivers, ready, addDriver, updateDriver, deleteDriver }),
    [drivers, ready, addDriver, updateDriver, deleteDriver],
  );

  return (
    <DriversContext.Provider value={value}>{children}</DriversContext.Provider>
  );
}

export function useDrivers() {
  const ctx = useContext(DriversContext);
  if (!ctx) throw new Error("useDrivers must be used within DriversProvider");
  return ctx;
}

export function useDriverLabel(id: string) {
  const { drivers } = useDrivers();
  const d = drivers.find((x) => x.id === id);
  return d ? driverFullName(d) : "";
}
