import type { UserRole } from "@/lib/auth";

export type DriverStatus = "active" | "vacation" | "sick" | "fired";

export type Driver = {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  tabNumber: string;
  snils: string;
  status: DriverStatus;
  hiredAt: string;

  /** Паспорт РФ */
  passportSeries: string;
  passportNumber: string;
  passportIssuedBy: string;
  passportIssuedAt: string;
  passportDeptCode: string;
  birthDate: string;
  birthPlace: string;
  registrationAddress: string;

  /** Водительское удостоверение */
  licenseSeries: string;
  licenseNumber: string;
  licenseCategories: string;
  licenseIssuedAt: string;
  licenseExpiresAt: string;
  licenseIssuedBy: string;

  vehicleId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type DriverInput = Omit<Driver, "id" | "createdAt" | "updatedAt">;

export const DRIVERS_STORAGE_KEY = "mechanik-drivers-v1";

export const driverStatusLabels: Record<DriverStatus, string> = {
  active: "Работает",
  vacation: "Отпуск",
  sick: "Больничный",
  fired: "Уволен",
};

export const driverStatusTone: Record<
  DriverStatus,
  "success" | "accent" | "warning" | "danger"
> = {
  active: "success",
  vacation: "accent",
  sick: "warning",
  fired: "danger",
};

export const licenseCategoryOptions = [
  "B",
  "C",
  "CE",
  "C1",
  "C1E",
  "D",
  "DE",
] as const;

export function driverFullName(d: Pick<Driver, "lastName" | "firstName" | "middleName">) {
  return [d.lastName, d.firstName, d.middleName].filter(Boolean).join(" ").trim();
}

export function driverShortName(d: Pick<Driver, "lastName" | "firstName" | "middleName">) {
  const fi = d.firstName ? `${d.firstName[0]}.` : "";
  const mi = d.middleName ? `${d.middleName[0]}.` : "";
  return `${d.lastName} ${fi}${mi}`.trim();
}

export function formatPassport(d: Pick<Driver, "passportSeries" | "passportNumber">) {
  const s = d.passportSeries.trim();
  const n = d.passportNumber.trim();
  if (!s && !n) return "—";
  return `${s} ${n}`.trim();
}

export function formatLicense(
  d: Pick<Driver, "licenseSeries" | "licenseNumber" | "licenseCategories">,
) {
  const id = `${d.licenseSeries} ${d.licenseNumber}`.trim();
  if (!id) return "—";
  return d.licenseCategories ? `${id} · кат. ${d.licenseCategories}` : id;
}

export function canManageDrivers(role: UserRole | string) {
  return role === "admin" || role === "manager";
}

export const DEFAULT_DRIVERS: Driver[] = [
  {
    id: "drv-1",
    lastName: "Иванов",
    firstName: "Пётр",
    middleName: "Сергеевич",
    phone: "+7 (916) 111-22-33",
    tabNumber: "1042",
    snils: "112-233-445 95",
    status: "active",
    hiredAt: "2023-04-12",
    passportSeries: "4510",
    passportNumber: "123456",
    passportIssuedBy: "ОВД района Тверской г. Москвы",
    passportIssuedAt: "2015-06-20",
    passportDeptCode: "770-001",
    birthDate: "1988-03-14",
    birthPlace: "г. Москва",
    registrationAddress: "г. Москва, ул. Лесная, д. 5, кв. 12",
    licenseSeries: "77 АА",
    licenseNumber: "123456",
    licenseCategories: "C, CE",
    licenseIssuedAt: "2018-05-10",
    licenseExpiresAt: "2028-05-10",
    licenseIssuedBy: "ГИБДД г. Москвы",
    vehicleId: "v1",
    notes: "",
    createdAt: "2026-01-10",
    updatedAt: "2026-08-01",
  },
  {
    id: "drv-2",
    lastName: "Смирнов",
    firstName: "Алексей",
    middleName: "Игоревич",
    phone: "+7 (903) 555-10-20",
    tabNumber: "1088",
    snils: "145-667-889 01",
    status: "active",
    hiredAt: "2022-11-01",
    passportSeries: "4512",
    passportNumber: "654321",
    passportIssuedBy: "УФМС по г. Москве",
    passportIssuedAt: "2016-09-01",
    passportDeptCode: "770-045",
    birthDate: "1990-11-02",
    birthPlace: "г. Тверь",
    registrationAddress: "МО, г. Химки, ул. Победы, д. 8",
    licenseSeries: "50 АВ",
    licenseNumber: "778899",
    licenseCategories: "C, CE",
    licenseIssuedAt: "2019-02-15",
    licenseExpiresAt: "2029-02-15",
    licenseIssuedBy: "ГИБДД МО",
    vehicleId: "v2",
    notes: "",
    createdAt: "2026-02-01",
    updatedAt: "2026-07-20",
  },
  {
    id: "drv-3",
    lastName: "Козлова",
    firstName: "Мария",
    middleName: "Викторовна",
    phone: "+7 (926) 200-30-40",
    tabNumber: "1101",
    snils: "",
    status: "vacation",
    hiredAt: "2024-01-20",
    passportSeries: "4509",
    passportNumber: "987654",
    passportIssuedBy: "ГУ МВД России по г. Москве",
    passportIssuedAt: "2014-03-11",
    passportDeptCode: "770-112",
    birthDate: "1992-07-25",
    birthPlace: "г. Москва",
    registrationAddress: "г. Москва, пр-т Мира, д. 100, кв. 45",
    licenseSeries: "77 АС",
    licenseNumber: "445566",
    licenseCategories: "B, C",
    licenseIssuedAt: "2020-08-01",
    licenseExpiresAt: "2030-08-01",
    licenseIssuedBy: "ГИБДД г. Москвы",
    vehicleId: "",
    notes: "Отпуск до 01.09",
    createdAt: "2026-03-15",
    updatedAt: "2026-08-10",
  },
];
