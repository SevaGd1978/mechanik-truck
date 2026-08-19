"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
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
  login: (login: string, password: string) => { ok: true } | { ok: false; error: string };
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

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readUsers(): AppUser[] {
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw) as AppUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

function writeUsers(users: AppUser[]) {
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  emit();
}

function readSessionId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeSessionId(id: string | null) {
  if (id) window.localStorage.setItem(SESSION_STORAGE_KEY, id);
  else window.localStorage.removeItem(SESSION_STORAGE_KEY);
  emit();
}

type Snapshot = { users: AppUser[]; sessionId: string | null; ready: boolean };

function getSnapshot(): Snapshot {
  return {
    users: readUsers(),
    sessionId: readSessionId(),
    ready: true,
  };
}

function getServerSnapshot(): Snapshot {
  return { users: DEFAULT_USERS, sessionId: null, ready: false };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const currentUser = useMemo(() => {
    if (!snapshot.sessionId) return null;
    return snapshot.users.find((u) => u.id === snapshot.sessionId && u.active) ?? null;
  }, [snapshot.sessionId, snapshot.users]);

  const login = useCallback((loginName: string, password: string) => {
    const users = readUsers();
    const found = users.find(
      (u) =>
        u.login.toLowerCase() === loginName.trim().toLowerCase() &&
        u.password === password,
    );
    if (!found) return { ok: false as const, error: "Неверный логин или пароль" };
    if (!found.active) return { ok: false as const, error: "Пользователь отключён" };
    writeSessionId(found.id);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    writeSessionId(null);
  }, []);

  const addUser = useCallback(
    (input: {
      login: string;
      password: string;
      name: string;
      role: UserRole;
    }) => {
      const actor = currentUser;
      if (!actor) return { ok: false as const, error: "Нет сессии" };
      if (!canAssignRole(actor.role, input.role)) {
        return { ok: false as const, error: "Недостаточно прав для этой роли" };
      }
      const login = input.login.trim().toLowerCase();
      if (!login || !input.password || !input.name.trim()) {
        return { ok: false as const, error: "Заполните все поля" };
      }
      if (input.password.length < 4) {
        return { ok: false as const, error: "Пароль минимум 4 символа" };
      }
      const users = readUsers();
      if (users.some((u) => u.login.toLowerCase() === login)) {
        return { ok: false as const, error: "Такой логин уже существует" };
      }
      const user: AppUser = {
        id: `u-${Date.now()}`,
        login,
        password: input.password,
        name: input.name.trim(),
        role: input.role,
        active: true,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      writeUsers([user, ...users]);
      return { ok: true as const, user };
    },
    [currentUser],
  );

  const updateUser = useCallback(
    (
      id: string,
      patch: Partial<Pick<AppUser, "name" | "password" | "role" | "active">>,
    ) => {
      const actor = currentUser;
      if (!actor) return { ok: false as const, error: "Нет сессии" };
      const users = readUsers();
      const target = users.find((u) => u.id === id);
      if (!target) return { ok: false as const, error: "Пользователь не найден" };
      if (patch.role && !canAssignRole(actor.role, patch.role)) {
        return { ok: false as const, error: "Недостаточно прав для этой роли" };
      }
      if (actor.role === "manager" && target.role === "admin") {
        return { ok: false as const, error: "Нельзя изменять администратора" };
      }
      if (id === actor.id && patch.active === false) {
        return { ok: false as const, error: "Нельзя отключить себя" };
      }
      writeUsers(
        users.map((u) =>
          u.id === id
            ? {
                ...u,
                ...patch,
                password: patch.password?.trim() ? patch.password : u.password,
                name: patch.name?.trim() ? patch.name.trim() : u.name,
              }
            : u,
        ),
      );
      return { ok: true as const };
    },
    [currentUser],
  );

  const deleteUser = useCallback(
    (id: string) => {
      const actor = currentUser;
      if (!actor) return { ok: false as const, error: "Нет сессии" };
      if (id === actor.id) {
        return { ok: false as const, error: "Нельзя удалить себя" };
      }
      const users = readUsers();
      const target = users.find((u) => u.id === id);
      if (!target) return { ok: false as const, error: "Пользователь не найден" };
      if (actor.role === "manager" && target.role === "admin") {
        return { ok: false as const, error: "Нельзя удалить администратора" };
      }
      if (actor.role !== "admin" && actor.role !== "manager") {
        return { ok: false as const, error: "Недостаточно прав" };
      }
      writeUsers(users.filter((u) => u.id !== id));
      return { ok: true as const };
    },
    [currentUser],
  );

  const value = useMemo(
    () => ({
      users: snapshot.users,
      currentUser,
      ready: snapshot.ready,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
    }),
    [
      snapshot.users,
      snapshot.ready,
      currentUser,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
