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
  /** Дата прошедшего ТО (ISO yyyy-mm-dd) */
  lastService: string;
  /** Описание выполненного ТО */
  lastServiceNote: string;
  /** Дата планового ТО (ISO yyyy-mm-dd) */
  nextService: string;
  /** Описание планового ТО */
  nextServiceNote: string;
  status: VehicleStatus;
};

export type ServiceOrder = {
  id: string;
  vehicle: string;
  title: string;
  due: string;
  status: "open" | "in_progress" | "done" | "overdue";
  cost: number;
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
    id: "orders",
    label: "Заказ-наряды",
    value: "7",
    delta: "4 в работе",
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
    lastService: "2026-05-14",
    lastServiceNote: "ТО-1: замена масла, масляного и воздушного фильтров",
    nextService: "2026-08-22",
    nextServiceNote: "ТО-2 по пробегу: тормоза, ремни, диагностика",
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
    lastService: "2026-02-10",
    lastServiceNote: "Сезонное ТО: АКБ, антифриз, проверка ходовой",
    nextService: "2026-08-18",
    nextServiceNote: "Замена масла и фильтров (просрочено)",
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
    lastService: "2026-06-20",
    lastServiceNote: "Замена тормозных колодок и тормозной жидкости",
    nextService: "2026-09-02",
    nextServiceNote: "Плановое ТО: масло, свечи, осмотр подвески",
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
    lastService: "2026-04-03",
    lastServiceNote: "ТО-2: сцепление, регулировка клапанов",
    nextService: "2026-08-19",
    nextServiceNote: "Диагностика КПП и замена трансмиссионного масла",
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
    lastService: "2026-07-01",
    lastServiceNote: "Замена гидравлического шланга и фильтров гидравлики",
    nextService: "2026-08-28",
    nextServiceNote: "Плановый осмотр навесного оборудования",
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
    lastService: "2026-03-28",
    lastServiceNote: "ТО-1: масло, фильтры, проверка ГРМ",
    nextService: "2026-09-10",
    nextServiceNote: "Плановое ТО: свечи, ремень генератора",
    status: "active",
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
    title: "Пробег ТС",
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
    title: "Заказ-наряды и склад",
    description: "Работы, нормо-часы и списанные запчасти",
    updated: "сегодня",
  },
];

export const activity = [
  {
    id: "a1",
    title: "Заказ-наряд создан",
    detail: "ЗН-1004 · КамАЗ 5490 · замена колодок",
    time: "9 мин назад",
    tone: "accent" as const,
  },
  {
    id: "a2",
    title: "Списание со склада",
    detail: "Фильтр масляный · 2 шт",
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
    title: "ТС добавлено",
    detail: "Газель Next · Т015ХХ 77",
    time: "2 ч назад",
    tone: "warning" as const,
  },
];

export const navItems = [
  { href: "/", label: "Обзор", icon: "LayoutDashboard" },
  { href: "/fleet", label: "Автопарк", icon: "Truck" },
  { href: "/drivers", label: "Водители", icon: "IdCard" },
  { href: "/waybills", label: "Путевые листы", icon: "ClipboardList" },
  { href: "/service", label: "Сервис", icon: "Wrench" },
  { href: "/tires", label: "Шины", icon: "CircleDot" },
  { href: "/warehouse", label: "Склад", icon: "Package" },
  { href: "/reports", label: "Отчёты", icon: "BarChart3" },
  { href: "/users", label: "Пользователи", icon: "Users" },
  { href: "/settings", label: "Настройки", icon: "Settings" },
] as const;
