"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Truck,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { canAccessRoute } from "@/lib/auth";
import { cn } from "@/lib/utils";

const primaryItems = [
  { href: "/", label: "Обзор", icon: LayoutDashboard },
  { href: "/fleet", label: "Автопарк", icon: Truck },
  { href: "/maintenance", label: "ТО", icon: CalendarClock },
  { href: "/waybills", label: "ПЛ", icon: ClipboardList },
] as const;

export function MobileBottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const items = primaryItems.filter((item) =>
    currentUser ? canAccessRoute(currentUser, item.href) : false,
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--bg-window)]/92 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Мобильная навигация"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 px-1 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-[12px] px-1 text-[10px] font-medium transition-colors",
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--fg-tertiary)] active:bg-[var(--bg-hover)]",
              )}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.25 : 1.75}
                className={active ? "drop-shadow-sm" : undefined}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-[12px] px-1 text-[10px] font-medium text-[var(--fg-tertiary)] active:bg-[var(--bg-hover)]"
        >
          <Menu size={20} strokeWidth={1.75} />
          <span>Ещё</span>
        </button>
      </div>
    </nav>
  );
}
