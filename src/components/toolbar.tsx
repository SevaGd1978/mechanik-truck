"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Moon, Search, Sun, Bell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth-provider";
import { canManageUsers, roleLabels } from "@/lib/auth";

export function Toolbar({
  title,
  subtitle,
  onMenu,
  onSearch,
}: {
  title: string;
  subtitle?: string;
  onMenu: () => void;
  onSearch: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header
      className="sticky top-0 z-20 flex h-[var(--toolbar-h)] items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-window)]/85 px-3 backdrop-blur-xl md:gap-3 md:px-5"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <button
        type="button"
        onClick={onMenu}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] md:hidden"
        aria-label="Открыть меню"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="hidden truncate text-[12px] text-[var(--fg-secondary)] sm:block">
            {subtitle}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onSearch}
        className="hidden h-8 items-center gap-2 rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[12px] text-[var(--fg-tertiary)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--bg-hover)] sm:inline-flex"
      >
        <Search size={14} />
        Поиск
        <kbd className="rounded bg-[var(--bg-active)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--fg-secondary)]">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={onSearch}
        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] sm:hidden"
        aria-label="Поиск"
      >
        <Search size={18} />
      </button>

      <button
        type="button"
        className="relative hidden h-8 w-8 items-center justify-center rounded-[8px] text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] sm:inline-flex"
        aria-label="Уведомления"
      >
        <Bell size={16} />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] md:h-8 md:w-8 md:rounded-[8px]"
        aria-label="Переключить тему"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {currentUser && canManageUsers(currentUser.role) ? (
        <Link href="/users" className="hidden lg:inline-flex">
          <Button size="sm" variant="secondary">
            <Users size={14} />
            Пользователи
          </Button>
        </Link>
      ) : null}

      <div className="hidden items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 sm:flex">
        <div className="min-w-0">
          <p className="truncate text-[12px] font-medium leading-tight">
            {currentUser?.name}
          </p>
          <p className="truncate text-[10px] text-[var(--fg-tertiary)]">
            {currentUser ? roleLabels[currentUser.role] : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--danger)]"
          aria-label="Выйти"
          title="Выйти"
        >
          <LogOut size={14} />
        </button>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--danger)] sm:hidden"
        aria-label="Выйти"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}
