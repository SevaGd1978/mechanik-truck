export type UserRole = "admin" | "manager" | "mechanic";

export type AppUser = {
  id: string;
  login: string;
  password: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  mechanic: "Механик",
};

export const roleDescriptions: Record<UserRole, string> = {
  admin: "Полный доступ, управление пользователями и настройками",
  manager: "Управление автопарком, отчёты и создание сотрудников",
  mechanic: "Сервис, заказ-наряды, шины и склад",
};

export const DEFAULT_USERS: AppUser[] = [
  {
    id: "u-admin",
    login: "admin",
    password: "admin123",
    name: "Алексей Админов",
    role: "admin",
    active: true,
    createdAt: "2026-01-10",
  },
  {
    id: "u-manager",
    login: "manager",
    password: "manager123",
    name: "Мария Менеджерова",
    role: "manager",
    active: true,
    createdAt: "2026-02-15",
  },
  {
    id: "u-mechanic",
    login: "mechanic",
    password: "mechanic123",
    name: "Игорь Механиков",
    role: "mechanic",
    active: true,
    createdAt: "2026-03-01",
  },
];

/** Какие разделы доступны роли */
export const roleRoutes: Record<UserRole, string[]> = {
  admin: [
    "/",
    "/fleet",
    "/maintenance",
    "/drivers",
    "/waybills",
    "/service",
    "/tires",
    "/warehouse",
    "/reports",
    "/users",
    "/settings",
  ],
  manager: [
    "/",
    "/fleet",
    "/maintenance",
    "/drivers",
    "/waybills",
    "/service",
    "/tires",
    "/warehouse",
    "/reports",
    "/users",
    "/settings",
  ],
  mechanic: [
    "/",
    "/fleet",
    "/maintenance",
    "/drivers",
    "/waybills",
    "/service",
    "/tires",
    "/warehouse",
  ],
};

export function canAccessRoute(role: UserRole, pathname: string) {
  const allowed = roleRoutes[role];
  if (pathname === "/") return allowed.includes("/");
  return allowed.some((route) => route !== "/" && pathname.startsWith(route));
}

export function canManageUsers(role: UserRole) {
  return role === "admin" || role === "manager";
}

export function canAssignRole(actor: UserRole, target: UserRole) {
  if (actor === "admin") return true;
  if (actor === "manager") return target === "manager" || target === "mechanic";
  return false;
}

export const USERS_STORAGE_KEY = "mechanik-users-v1";
export const SESSION_STORAGE_KEY = "mechanik-session-v1";
