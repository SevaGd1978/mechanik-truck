import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--bg-app)] p-4">
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
            Облачный FMS для управления автопарком
          </p>
          <form className="mt-6 space-y-3">
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Email
              <input
                type="email"
                defaultValue="manager@mechanik.truck"
                className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Пароль
              <input
                type="password"
                defaultValue="••••••••"
                className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <Link href="/" className="block pt-1">
              <Button className="w-full" type="button">
                Войти
              </Button>
            </Link>
          </form>
          <p className="mt-4 text-center text-[12px] text-[var(--fg-tertiary)]">
            Демо-режим · данные на клиенте
          </p>
        </div>
      </div>
    </div>
  );
}
