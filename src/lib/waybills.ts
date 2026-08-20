import type { UserRole } from "@/lib/auth";

export type WaybillStatus = "draft" | "issued" | "closed";

export type WaybillTrip = {
  id: string;
  customer: string;
  loadAddress: string;
  unloadAddress: string;
  cargo: string;
  distanceKm: number;
  weightTons: number;
  departTime: string;
  arriveTime: string;
};

export type Waybill = {
  id: string;
  /** Серия бланка */
  series: string;
  number: string;
  formCode: "4-с";
  status: WaybillStatus;
  date: string;
  validFrom: string;
  validTo: string;

  organization: string;
  organizationAddress: string;
  organizationPhone: string;
  okpo: string;

  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  garageNumber: string;

  trailerId: string;
  trailerPlate: string;
  trailerModel: string;

  driverName: string;
  driverLicense: string;
  driverTabNumber: string;
  column: string;
  brigade: string;

  fuelBrand: string;
  fuelIssued: number;
  fuelDeparture: number;
  fuelReturn: number;
  fuelNorm: number;
  fuelFact: number;

  odometerDeparture: number;
  odometerReturn: number;

  timeDeparture: string;
  timeReturn: string;
  dispatcherOut: string;
  mechanicOut: string;
  medicOut: string;
  medicOutAt: string;
  techCheckAt: string;

  taskCustomer: string;
  taskAddress: string;
  taskCargo: string;
  taskDistanceKm: number;
  taskTons: number;

  trips: WaybillTrip[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type WaybillInput = Omit<
  Waybill,
  "id" | "formCode" | "createdAt" | "updatedAt" | "number"
> & { number?: string };

export const WAYBILLS_STORAGE_KEY = "mechanik-waybills-v1";

export const waybillStatusLabels: Record<WaybillStatus, string> = {
  draft: "Черновик",
  issued: "Выдан",
  closed: "Закрыт",
};

export const waybillStatusTone: Record<
  WaybillStatus,
  "accent" | "warning" | "success"
> = {
  draft: "accent",
  issued: "warning",
  closed: "success",
};

export function canManageWaybills(role: UserRole | string) {
  return role === "admin" || role === "manager";
}

export function canViewWaybills(role: UserRole | string) {
  return (
    role === "admin" || role === "manager" || role === "mechanic"
  );
}

export function calcMileage(wb: Pick<Waybill, "odometerDeparture" | "odometerReturn">) {
  const d = Number(wb.odometerDeparture) || 0;
  const r = Number(wb.odometerReturn) || 0;
  return Math.max(0, r - d);
}

export function calcFuelUsed(wb: Pick<Waybill, "fuelDeparture" | "fuelIssued" | "fuelReturn">) {
  return Math.max(
    0,
    (Number(wb.fuelDeparture) || 0) +
      (Number(wb.fuelIssued) || 0) -
      (Number(wb.fuelReturn) || 0),
  );
}

export const DEFAULT_WAYBILLS: Waybill[] = [
  {
    id: "wb-1",
    series: "АА",
    number: "000145",
    formCode: "4-с",
    status: "issued",
    date: "2026-08-19",
    validFrom: "2026-08-19",
    validTo: "2026-08-19",
    organization: "ООО «Механик Трак»",
    organizationAddress: "г. Москва, ул. Складская, 12",
    organizationPhone: "+7 (495) 000-00-00",
    okpo: "12345678",
    vehicleId: "v1",
    vehiclePlate: "А123ВС 77",
    vehicleModel: "КамАЗ 5490",
    garageNumber: "12",
    trailerId: "t1",
    trailerPlate: "АА1234 77",
    trailerModel: "Schmitz Cargobull",
    driverName: "Иванов Пётр Сергеевич",
    driverLicense: "77 АА 123456",
    driverTabNumber: "1042",
    column: "1",
    brigade: "А",
    fuelBrand: "ДТ",
    fuelIssued: 120,
    fuelDeparture: 80,
    fuelReturn: 95,
    fuelNorm: 28.5,
    fuelFact: 105,
    odometerDeparture: 186420,
    odometerReturn: 186612,
    timeDeparture: "07:30",
    timeReturn: "18:40",
    dispatcherOut: "Сидорова Н.А.",
    mechanicOut: "Игорь Механиков",
    medicOut: "Козлова Е.В.",
    medicOutAt: "2026-08-19T07:10",
    techCheckAt: "2026-08-19T07:20",
    taskCustomer: "ООО «СтройСнаб»",
    taskAddress: "МО, г. Подольск, промзона",
    taskCargo: "Песок строительный",
    taskDistanceKm: 96,
    taskTons: 20,
    trips: [
      {
        id: "tr-1",
        customer: "ООО «СтройСнаб»",
        loadAddress: "Карьер «Южный»",
        unloadAddress: "Подольск, склад №3",
        cargo: "Песок",
        distanceKm: 48,
        weightTons: 20,
        departTime: "08:00",
        arriveTime: "10:30",
      },
      {
        id: "tr-2",
        customer: "ООО «СтройСнаб»",
        loadAddress: "Карьер «Южный»",
        unloadAddress: "Подольск, склад №3",
        cargo: "Песок",
        distanceKm: 48,
        weightTons: 20,
        departTime: "12:00",
        arriveTime: "14:40",
      },
    ],
    notes: "Сдельная оплата, форма № 4-с",
    createdAt: "2026-08-19",
    updatedAt: "2026-08-19",
  },
];
