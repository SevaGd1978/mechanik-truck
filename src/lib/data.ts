export type VehicleStatus = "active" | "service" | "idle" | "alert";

export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  type: string;
  driver: string;
  odometer: number;
  costPerKm: number;
  fuelNorm: number;
  fuelFact: number;
  nextService: string;
  status: VehicleStatus;
};

export type FuelEvent = {
  id: string;
  vehicle: string;
  date: string;
  liters: number;
  amount: number;
  station: string;
  anomaly?: boolean;
};

export type ServiceOrder = {
  id: string;
  vehicle: string;
  title: string;
  due: string;
  status: "open" | "in_progress" | "done" | "overdue";
  cost: number;
};

export type Inspection = {
  id: string;
  vehicle: string;
  date: string;
  inspector: string;
  result: "ok" | "issues";
  notes: string;
};

export type Trip = {
  id: string;
  vehicle: string;
  driver: string;
  from: string;
  to: string;
  date: string;
  status: "planned" | "active" | "done";
  km: number;
};

export const kpis = [
  {
    id: "cost",
    label: "Средняя стоимость 1 км",
    value: "28,4 ₽",
    delta: "−6,2% за месяц",
    tone: "success" as const,
  },
  {
    id: "service",
    label: "Просроченное ТО",
    value: "3",
    delta: "2 требуют внимания",
    tone: "danger" as const,
  },
  {
    id: "fuel",
    label: "Аномалии топлива",
    value: "5",
    delta: "за последние 7 дней",
    tone: "warning" as const,
  },
  {
    id: "repairs",
    label: "Активные ремонты",
    value: "7",
    delta: "4 в работе",
    tone: "accent" as const,
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "v1",
    plate: "А123ВС 77",
    model: "КамАЗ 5490",
    type: "Грузовой",
    driver: "Иванов П.",
    odometer: 186420,
    costPerKm: 31.2,
    fuelNorm: 28.5,
    fuelFact: 29.1,
    nextService: "2026-08-22",
    status: "active",
  },
  {
    id: "v2",
    plate: "К450МН 50",
    model: "Volvo FH",
    type: "Грузовой",
    driver: "Смирнов А.",
    odometer: 241880,
    costPerKm: 34.8,
    fuelNorm: 27.0,
    fuelFact: 31.4,
    nextService: "2026-08-18",
    status: "alert",
  },
  {
    id: "v3",
    plate: "Е901ОР 777",
    model: "Mercedes Sprinter",
    type: "Легковой",
    driver: "Козлова М.",
    odometer: 92450,
    costPerKm: 18.6,
    fuelNorm: 11.2,
    fuelFact: 10.9,
    nextService: "2026-09-02",
    status: "active",
  },
  {
    id: "v4",
    plate: "Н220КУ 16",
    model: "МАЗ 5440",
    type: "Грузовой",
    driver: "Петров Д.",
    odometer: 310220,
    costPerKm: 36.1,
    fuelNorm: 30.0,
    fuelFact: 30.2,
    nextService: "2026-08-19",
    status: "service",
  },
  {
    id: "v5",
    plate: "Р778СТ 123",
    model: "CAT 320D",
    type: "Спецтехника",
    driver: "Орлов С.",
    odometer: 12400,
    costPerKm: 88.4,
    fuelNorm: 18.0,
    fuelFact: 17.6,
    nextService: "2026-08-28",
    status: "idle",
  },
  {
    id: "v6",
    plate: "Т015ХХ 77",
    model: "Газель Next",
    type: "Легковой",
    driver: "Никитин В.",
    odometer: 67890,
    costPerKm: 16.9,
    fuelNorm: 12.5,
    fuelFact: 13.8,
    nextService: "2026-09-10",
    status: "active",
  },
];

export const fuelEvents: FuelEvent[] = [
  {
    id: "f1",
    vehicle: "К450МН 50",
    date: "19.08.2026 09:14",
    liters: 420,
    amount: 23100,
    station: "Лукойл №214",
    anomaly: true,
  },
  {
    id: "f2",
    vehicle: "А123ВС 77",
    date: "18.08.2026 18:40",
    liters: 280,
    amount: 15400,
    station: "Роснефть МКАД",
  },
  {
    id: "f3",
    vehicle: "Т015ХХ 77",
    date: "18.08.2026 12:05",
    liters: 48,
    amount: 2640,
    station: "Газпромнефть",
    anomaly: true,
  },
  {
    id: "f4",
    vehicle: "Е901ОР 777",
    date: "17.08.2026 21:20",
    liters: 55,
    amount: 3025,
    station: "Shell",
  },
  {
    id: "f5",
    vehicle: "Н220КУ 16",
    date: "17.08.2026 08:55",
    liters: 350,
    amount: 19250,
    station: "Татнефть",
  },
];

export const serviceOrders: ServiceOrder[] = [
  {
    id: "s1",
    vehicle: "К450МН 50",
    title: "Замена масла и фильтров",
    due: "18.08.2026",
    status: "overdue",
    cost: 28600,
  },
  {
    id: "s2",
    vehicle: "Н220КУ 16",
    title: "Диагностика КПП",
    due: "19.08.2026",
    status: "in_progress",
    cost: 15400,
  },
  {
    id: "s3",
    vehicle: "А123ВС 77",
    title: "ТО-2 по пробегу",
    due: "22.08.2026",
    status: "open",
    cost: 42000,
  },
  {
    id: "s4",
    vehicle: "Р778СТ 123",
    title: "Замена гидравлического шланга",
    due: "20.08.2026",
    status: "open",
    cost: 9800,
  },
  {
    id: "s5",
    vehicle: "Е901ОР 777",
    title: "Замена тормозных колодок",
    due: "12.08.2026",
    status: "done",
    cost: 18700,
  },
];

export const inspections: Inspection[] = [
  {
    id: "i1",
    vehicle: "А123ВС 77",
    date: "19.08.2026",
    inspector: "Механик Орлов",
    result: "ok",
    notes: "Замечаний нет",
  },
  {
    id: "i2",
    vehicle: "К450МН 50",
    date: "19.08.2026",
    inspector: "Механик Орлов",
    result: "issues",
    notes: "Утечка масла, повышенный люфт руля",
  },
  {
    id: "i3",
    vehicle: "Е901ОР 777",
    date: "18.08.2026",
    inspector: "Козлова М.",
    result: "ok",
    notes: "Шины в норме",
  },
  {
    id: "i4",
    vehicle: "Т015ХХ 77",
    date: "18.08.2026",
    inspector: "Никитин В.",
    result: "issues",
    notes: "Трещина лобового стекла",
  },
];

export const trips: Trip[] = [
  {
    id: "t1",
    vehicle: "А123ВС 77",
    driver: "Иванов П.",
    from: "Москва",
    to: "Казань",
    date: "19.08.2026",
    status: "active",
    km: 820,
  },
  {
    id: "t2",
    vehicle: "К450МН 50",
    driver: "Смирнов А.",
    from: "Химки",
    to: "Тула",
    date: "19.08.2026",
    status: "planned",
    km: 190,
  },
  {
    id: "t3",
    vehicle: "Е901ОР 777",
    driver: "Козлова М.",
    from: "Офис",
    to: "Клиент ЮАО",
    date: "18.08.2026",
    status: "done",
    km: 42,
  },
  {
    id: "t4",
    vehicle: "Т015ХХ 77",
    driver: "Никитин В.",
    from: "Склад",
    to: "Домодедово",
    date: "18.08.2026",
    status: "done",
    km: 68,
  },
];

export const warehouseItems = [
  { id: "w1", name: "Масло моторное 10W-40", sku: "OIL-1040", qty: 48, unit: "л", min: 20 },
  { id: "w2", name: "Фильтр масляный КамАЗ", sku: "FLT-KAM", qty: 12, unit: "шт", min: 8 },
  { id: "w3", name: "Колодки тормозные Sprinter", sku: "BRK-SPR", qty: 3, unit: "компл.", min: 4 },
  { id: "w4", name: "Шина 315/70 R22.5", sku: "TIR-315", qty: 16, unit: "шт", min: 10 },
  { id: "w5", name: "Аккумулятор 190Ah", sku: "BAT-190", qty: 6, unit: "шт", min: 2 },
];

export const reports = [
  {
    id: "r1",
    title: "Пробег и расход топлива",
    description: "Сводка по ТС за выбранный период",
    updated: "сегодня",
  },
  {
    id: "r2",
    title: "Стоимость 1 км",
    description: "TCO и структура затрат по автопарку",
    updated: "вчера",
  },
  {
    id: "r3",
    title: "Сервис и простои",
    description: "ТО, ремонты, среднее время в сервисе",
    updated: "2 дня назад",
  },
  {
    id: "r4",
    title: "Аномалии топлива",
    description: "Недоливы, перерасход, сомнительные заправки",
    updated: "сегодня",
  },
];

export const activity = [
  {
    id: "a1",
    title: "Аномалия заправки",
    detail: "Volvo FH · +48 л сверх нормы бака",
    time: "9 мин назад",
    tone: "warning" as const,
  },
  {
    id: "a2",
    title: "Осмотр завершён",
    detail: "КамАЗ 5490 · без замечаний",
    time: "24 мин назад",
    tone: "success" as const,
  },
  {
    id: "a3",
    title: "Просрочено ТО",
    detail: "Volvo FH · замена масла",
    time: "1 ч назад",
    tone: "danger" as const,
  },
  {
    id: "a4",
    title: "Путевой лист открыт",
    detail: "Москва → Казань · Иванов П.",
    time: "2 ч назад",
    tone: "accent" as const,
  },
];

export const navItems = [
  { href: "/", label: "Обзор", icon: "LayoutDashboard" },
  { href: "/fleet", label: "Автопарк", icon: "Truck" },
  { href: "/fuel", label: "Топливо", icon: "Fuel" },
  { href: "/service", label: "Сервис", icon: "Wrench" },
  { href: "/inspections", label: "Осмотры", icon: "ClipboardCheck" },
  { href: "/trips", label: "Поездки", icon: "Route" },
  { href: "/warehouse", label: "Склад", icon: "Package" },
  { href: "/reports", label: "Отчёты", icon: "BarChart3" },
  { href: "/users", label: "Пользователи", icon: "Users" },
  { href: "/settings", label: "Настройки", icon: "Settings" },
] as const;
