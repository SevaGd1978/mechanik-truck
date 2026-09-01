export type UserRole = "admin" | "manager" | "mechanic";

export const RESPONSIBILITIES = [
  { key: "warehouse", label: "Склад", href: "/warehouse" },
  { key: "tires", label: "Шины", href: "/tires" },
  { key: "maintenance", label: "Техобслуживание", href: "/maintenance" },
] as const;

export type Responsibility = (typeof RESPONSIBILITIES)[number]["key"];

export const ALL_RESPONSIBILITIES: Responsibility[] = RESPONSIBILITIES.map(
  (r) => r.key,
);

export type AppUser = {
  id: string;
  login: string;
  password: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  /** Зоны ответственности, которые выдаёт администратор */
  responsibilities: Responsibility[];
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  mechanic: "Механик",
};

export const roleDescriptions: Record<UserRole, string> = {
  admin: "Полный доступ. Назначает менеджерам и механикам ответственность за склад, шины и ТО",
  manager: "Автопарк, отчёты, сотрудники. Склад / шины / ТО — только по назначению админа",
  mechanic: "Сервис и заказ-наряды. Склад / шины / ТО — только по назначению админа",
};

function withAllResponsibilities(): Responsibility[] {
  return [...ALL_RESPONSIBILITIES];
}

export const DEFAULT_USERS: AppUser[] = [
  {
    id: "u-admin",
    login: "admin",
    password: "admin123",
    name: "Алексей Админов",
    role: "admin",
    active: true,
    createdAt: "2026-01-10",
    responsibilities: withAllResponsibilities(),
  },
  {
    id: "u-manager",
    login: "manager",
    password: "manager123",
    name: "Мария Менеджерова",
    role: "manager",
    active: true,
    createdAt: "2026-02-15",
    responsibilities: withAllResponsibilities(),
  },
  {
    id: "u-mechanic",
    login: "mechanic",
    password: "mechanic123",
    name: "Игорь Механиков",
    role: "mechanic",
    active: true,
    createdAt: "2026-03-01",
    responsibilities: withAllResponsibilities(),
  },
];

const gatedRoutes: Record<Responsibility, string> = {
  warehouse: "/warehouse",
  tires: "/tires",
  maintenance: "/maintenance",
};

/** Базовые разделы без зон ответственности */
export const roleRoutes: Record<UserRole, string[]> = {
  admin: [
    "/",
    "/fleet",
    "/drivers",
    "/waybills",
    "/service",
    "/reports",
    "/users",
    "/settings",
    "/warehouse",
    "/tires",
    "/maintenance",
  ],
  manager: [
    "/",
    "/fleet",
    "/drivers",
    "/waybills",
    "/service",
    "/reports",
    "/users",
    "/settings",
  ],
  mechanic: ["/", "/fleet", "/drivers", "/waybills", "/service"],
};

export function isResponsibility(value: string): value is Responsibility {
  return ALL_RESPONSIBILITIES.includes(value as Responsibility);
}

export function normalizeUser(
  raw: Partial<AppUser> & { id: string; login: string },
): AppUser {
  const role: UserRole =
    raw.role === "admin" || raw.role === "manager" || raw.role === "mechanic"
      ? raw.role
      : "mechanic";
  let responsibilities: Responsibility[];
  if (role === "admin") {
    responsibilities = withAllResponsibilities();
  } else if (Array.isArray(raw.responsibilities)) {
    responsibilities = raw.responsibilities.filter(isResponsibility);
  } else {
    responsibilities = withAllResponsibilities();
  }
  return {
    id: raw.id,
    login: raw.login,
    password: raw.password ?? "",
    name: raw.name ?? raw.login,
    role,
    active: raw.active !== false,
    createdAt: raw.createdAt ?? new Date().toISOString().slice(0, 10),
    responsibilities,
  };
}

export function effectiveResponsibilities(
  user: Pick<AppUser, "role" | "responsibilities">,
): Responsibility[] {
  if (user.role === "admin") return withAllResponsibilities();
  return user.responsibilities.filter(isResponsibility);
}

export function hasResponsibility(
  user: Pick<AppUser, "role" | "responsibilities"> | null | undefined,
  key: Responsibility,
) {
  if (!user) return false;
  return effectiveResponsibilities(user).includes(key);
}

export function canAccessRoute(
  user: Pick<AppUser, "role" | "responsibilities">,
  pathname: string,
) {
  const allowed = [...roleRoutes[user.role]];
  for (const key of effectiveResponsibilities(user)) {
    const href = gatedRoutes[key];
    if (!allowed.includes(href)) allowed.push(href);
  }
  if (pathname === "/") return allowed.includes("/");
  return allowed.some((route) => route !== "/" && pathname.startsWith(route));
}

export function canManageUsers(role: UserRole) {
  return role === "admin" || role === "manager";
}

export function canAssignResponsibilities(role: UserRole) {
  return role === "admin";
}

export function canAssignRole(actor: UserRole, target: UserRole) {
  if (actor === "admin") return true;
  if (actor === "manager") return target === "manager" || target === "mechanic";
  return false;
}

export function canManageWarehouse(
  user: Pick<AppUser, "role" | "responsibilities"> | string | null,
) {
  if (!user || typeof user === "string") return false;
  return hasResponsibility(user, "warehouse");
}

export function canManageTires(
  user: Pick<AppUser, "role" | "responsibilities"> | string | null,
) {
  if (!user || typeof user === "string") return false;
  return hasResponsibility(user, "tires");
}

export function canManageMaintenance(
  user: Pick<AppUser, "role" | "responsibilities"> | string | null,
) {
  if (!user || typeof user === "string") return false;
  return hasResponsibility(user, "maintenance");
}

export const USERS_STORAGE_KEY = "mechanik-users-v2";
export const LEGACY_USERS_STORAGE_KEY = "mechanik-users-v1";
export const SESSION_STORAGE_KEY = "mechanik-session-v1";
