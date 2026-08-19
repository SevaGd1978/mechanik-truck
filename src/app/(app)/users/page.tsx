"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import {
  canAssignRole,
  canManageUsers,
  roleDescriptions,
  roleLabels,
  UserRole,
} from "@/lib/auth";

const tones: Record<UserRole, "danger" | "accent" | "success"> = {
  admin: "danger",
  manager: "accent",
  mechanic: "success",
};

export default function UsersPage() {
  const { users, currentUser, addUser, updateUser, deleteUser } = useAuth();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("mechanic");
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const assignableRoles = useMemo(() => {
    if (!currentUser) return [] as UserRole[];
    return (["admin", "manager", "mechanic"] as UserRole[]).filter((r) =>
      canAssignRole(currentUser.role, r),
    );
  }, [currentUser]);

  if (!currentUser || !canManageUsers(currentUser.role)) {
    return (
      <Panel className="p-6 text-center">
        <p className="text-[15px] font-semibold">Нет доступа</p>
        <p className="mt-1 text-[13px] text-[var(--fg-secondary)]">
          Управлять пользователями могут администратор и менеджер.
        </p>
      </Panel>
    );
  }

  function onCreate(e: FormEvent) {
    e.preventDefault();
    const result = addUser({ login, password, name, role });
    if (!result.ok) {
      setMessage({ type: "err", text: result.error });
      return;
    }
    setMessage({
      type: "ok",
      text: `Пользователь «${result.user.login}» создан`,
    });
    setLogin("");
    setPassword("");
    setName("");
    setRole(
      assignableRoles.includes("mechanic") ? "mechanic" : assignableRoles[0],
    );
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Пользователи"
          subtitle="Логины, пароли и роли доступа"
          action={
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Скрыть форму" : "Добавить пользователя"}
            </Button>
          }
        />

        {message ? (
          <div
            className={`mx-4 mt-4 rounded-[10px] px-3 py-2 text-[12px] ${
              message.type === "ok"
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        {showForm ? (
          <form
            onSubmit={onCreate}
            className="m-4 grid gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--bg-window)] p-4 md:grid-cols-2"
          >
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Имя
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Петров"
                className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]"
                required
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Логин
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="ivan"
                className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]"
                required
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="минимум 4 символа"
                className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]"
                required
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Роль
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]"
              >
                {assignableRoles.map((r) => (
                  <option key={r} value={r}>
                    {roleLabels[r]}
                  </option>
                ))}
              </select>
            </label>
            <p className="md:col-span-2 text-[12px] text-[var(--fg-secondary)]">
              {roleDescriptions[role]}
            </p>
            <div className="md:col-span-2">
              <Button type="submit" size="sm">
                Создать пользователя
              </Button>
            </div>
          </form>
        ) : null}

        <DataTable
          headers={["Имя", "Логин", "Роль", "Статус", "Создан", "Действия"]}
        >
          {users.map((user) => {
            const canEdit =
              currentUser.role === "admin" ||
              (currentUser.role === "manager" && user.role !== "admin");
            return (
              <Tr key={user.id}>
                <Td className="font-medium">{user.name}</Td>
                <Td className="font-mono text-[12px]">{user.login}</Td>
                <Td>
                  <Badge tone={tones[user.role]}>{roleLabels[user.role]}</Badge>
                </Td>
                <Td>
                  <Badge tone={user.active ? "success" : "neutral"}>
                    {user.active ? "Активен" : "Отключён"}
                  </Badge>
                </Td>
                <Td className="text-[var(--fg-secondary)]">{user.createdAt}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {canEdit ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const next = window.prompt(
                              "Новый пароль",
                              user.password,
                            );
                            if (!next) return;
                            const res = updateUser(user.id, { password: next });
                            setMessage(
                              res.ok
                                ? { type: "ok", text: "Пароль обновлён" }
                                : { type: "err", text: res.error },
                            );
                          }}
                        >
                          Пароль
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const res = updateUser(user.id, {
                              active: !user.active,
                            });
                            setMessage(
                              res.ok
                                ? {
                                    type: "ok",
                                    text: user.active
                                      ? "Пользователь отключён"
                                      : "Пользователь включён",
                                  }
                                : { type: "err", text: res.error },
                            );
                          }}
                        >
                          {user.active ? "Отключить" : "Включить"}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (!window.confirm(`Удалить ${user.login}?`)) return;
                            const res = deleteUser(user.id);
                            setMessage(
                              res.ok
                                ? { type: "ok", text: "Удалён" }
                                : { type: "err", text: res.error },
                            );
                          }}
                        >
                          Удалить
                        </Button>
                      </>
                    ) : (
                      <span className="text-[12px] text-[var(--fg-tertiary)]">
                        —
                      </span>
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </DataTable>
      </Panel>

      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(roleLabels) as UserRole[]).map((r) => (
          <Panel key={r} className="p-4">
            <Badge tone={tones[r]}>{roleLabels[r]}</Badge>
            <p className="mt-2 text-[13px] text-[var(--fg-secondary)]">
              {roleDescriptions[r]}
            </p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
