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
  AppUser,
  canAssignRole,
  DEFAULT_USERS,
  SESSION_STORAGE_KEY,
  UserRole,
  USERS_STORAGE_KEY,
} from "@/lib/auth";

type AuthContextValue = {
  users: AppUser[];
  currentUser: AppUser | null;
  ready: boolean;
  login: (
    login: string,
    password: string,
  ) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  addUser: (input: {
    login: string;
    password: string;
    name: string;
    role: UserRole;
  }) => { ok: true; user: AppUser } | { ok: false; error: string };
  updateUser: (
    id: string,
    patch: Partial<Pick<AppUser, "name" | "password" | "role" | "active">>,
  ) => { ok: true } | { ok: false; error: string };
  deleteUser: (id: string) => { ok: true } | { ok: false; error: string };
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUsers(): AppUser[] {
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(DEFAULT_USERS),
      );
      return [...DEFAULT_USERS];
    }
    const parsed = JSON.parse(raw) as AppUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(DEFAULT_USERS),
      );
      return [...DEFAULT_USERS];
    }
    return parsed;
  } catch {
    return [...DEFAULT_USERS];
  }
}

function persistUsers(users: AppUser[]) {
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(DEFAULT_USERS);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage after mount (client-only store).
    queueMicrotask(() => {
      setUsers(loadUsers());
      setSessionId(window.localStorage.getItem(SESSION_STORAGE_KEY));
      setReady(true);
    });
  }, []);

  const currentUser = useMemo(() => {
    if (!sessionId) return null;
    return users.find((u) => u.id === sessionId && u.active) ?? null;
  }, [sessionId, users]);

  const login = useCallback((loginName: string, password: string) => {
    const list = loadUsers();
    setUsers(list);
    const found = list.find(
      (u) =>
        u.login.toLowerCase() === loginName.trim().toLowerCase() &&
        u.password === password,
    );
    if (!found) {
      return { ok: false as const, error: "Неверный логин или пароль" };
    }
    if (!found.active) {
      return { ok: false as const, error: "Пользователь отключён" };
    }
    window.localStorage.setItem(SESSION_STORAGE_KEY, found.id);
    setSessionId(found.id);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSessionId(null);
  }, []);

  const addUser = useCallback(
    (input: {
      login: string;
      password: string;
      name: string;
      role: UserRole;
    }) => {
      if (!currentUser) return { ok: false as const, error: "Нет сессии" };
      if (!canAssignRole(currentUser.role, input.role)) {
        return { ok: false as const, error: "Недостаточно прав для этой роли" };
      }
      const normalizedLogin = input.login.trim().toLowerCase();
      if (!normalizedLogin || !input.password || !input.name.trim()) {
        return { ok: false as const, error: "Заполните все поля" };
      }
      if (input.password.length < 4) {
        return { ok: false as const, error: "Пароль минимум 4 символа" };
      }
      const list = loadUsers();
      if (list.some((u) => u.login.toLowerCase() === normalizedLogin)) {
        return { ok: false as const, error: "Такой логин уже существует" };
      }
      const user: AppUser = {
        id: `u-${Date.now()}`,
        login: normalizedLogin,
        password: input.password,
        name: input.name.trim(),
        role: input.role,
        active: true,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      const next = [user, ...list];
      persistUsers(next);
      setUsers(next);
      return { ok: true as const, user };
    },
    [currentUser],
  );

  const updateUser = useCallback(
    (
      id: string,
      patch: Partial<Pick<AppUser, "name" | "password" | "role" | "active">>,
    ) => {
      if (!currentUser) return { ok: false as const, error: "Нет сессии" };
      const list = loadUsers();
      const target = list.find((u) => u.id === id);
      if (!target) return { ok: false as const, error: "Пользователь не найден" };
      if (patch.role && !canAssignRole(currentUser.role, patch.role)) {
        return { ok: false as const, error: "Недостаточно прав для этой роли" };
      }
      if (currentUser.role === "manager" && target.role === "admin") {
        return { ok: false as const, error: "Нельзя изменять администратора" };
      }
      if (id === currentUser.id && patch.active === false) {
        return { ok: false as const, error: "Нельзя отключить себя" };
      }
      const next = list.map((u) =>
        u.id === id
          ? {
              ...u,
              ...patch,
              password: patch.password?.trim() ? patch.password : u.password,
              name: patch.name?.trim() ? patch.name.trim() : u.name,
            }
          : u,
      );
      persistUsers(next);
      setUsers(next);
      return { ok: true as const };
    },
    [currentUser],
  );

  const deleteUser = useCallback(
    (id: string) => {
      if (!currentUser) return { ok: false as const, error: "Нет сессии" };
      if (id === currentUser.id) {
        return { ok: false as const, error: "Нельзя удалить себя" };
      }
      const list = loadUsers();
      const target = list.find((u) => u.id === id);
      if (!target) return { ok: false as const, error: "Пользователь не найден" };
      if (currentUser.role === "manager" && target.role === "admin") {
        return { ok: false as const, error: "Нельзя удалить администратора" };
      }
      if (currentUser.role !== "admin" && currentUser.role !== "manager") {
        return { ok: false as const, error: "Недостаточно прав" };
      }
      const next = list.filter((u) => u.id !== id);
      persistUsers(next);
      setUsers(next);
      return { ok: true as const };
    },
    [currentUser],
  );

  const value = useMemo(
    () => ({
      users,
      currentUser,
      ready,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
    }),
    [users, currentUser, ready, login, logout, addUser, updateUser, deleteUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
