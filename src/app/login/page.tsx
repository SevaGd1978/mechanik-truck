"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { roleLabels } from "@/lib/auth";

export default function LoginPage() {
  const { login, currentUser, ready } = useAuth();
  const router = useRouter();
  const [loginValue, setLoginValue] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && currentUser) {
      router.replace("/");
    }
  }, [ready, currentUser, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = login(loginValue, password);
      if (!result.ok) {
        setError(result.error);
        setPending(false);
        return;
      }
      // Full reload ensures AuthGuard sees the new session reliably
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-full items-center justify-center text-[13px] text-[var(--fg-secondary)]">
        Загрузка…
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="flex min-h-full items-center justify-center text-[13px] text-[var(--fg-secondary)]">
        Вход выполнен, открываем приложение…
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-app)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="glass w-full max-w-md animate-scale-in overflow-hidden rounded-[20px] border border-[var(--border-strong)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[12px] text-[var(--fg-tertiary)]">
            Mechanik Truck
          </span>
        </div>
        <div className="p-6">
          <h1 className="text-[22px] font-semibold tracking-tight">
            Вход в систему
          </h1>
          <p className="mt-1 text-[13px] text-[var(--fg-secondary)]">
            Логин и пароль с ролями: администратор, менеджер, механик
          </p>
          <form className="mt-6 space-y-3" onSubmit={onSubmit}>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Логин
              <input
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                autoComplete="username"
                className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Пароль
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]"
              />
            </label>
            {error ? (
              <p className="rounded-[10px] bg-[var(--danger-soft)] px-3 py-2 text-[12px] text-[var(--danger)]">
                {error}
              </p>
            ) : null}
            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? "Вход…" : "Войти"}
            </Button>
          </form>

          <div className="mt-5 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--fg-tertiary)]">
              Быстрый вход
            </p>
            <div className="grid gap-2">
              {(
                [
                  ["admin", "admin123", "admin"],
                  ["manager", "manager123", "manager"],
                  ["mechanic", "mechanic123", "mechanic"],
                ] as const
              ).map(([user, pass, role]) => (
                <button
                  key={user}
                  type="button"
                  className="flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-left text-[12px] transition hover:border-[var(--accent)] hover:bg-[var(--bg-hover)]"
                  onClick={() => {
                    setLoginValue(user);
                    setPassword(pass);
                    setError("");
                    const result = login(user, pass);
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    window.location.href = "/";
                  }}
                >
                  <span className="font-medium text-[var(--fg-primary)]">
                    {roleLabels[role]}
                  </span>
                  <span className="font-mono text-[var(--fg-tertiary)]">
                    {user} / {pass}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
