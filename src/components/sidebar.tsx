"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  Route,
  Settings,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { canAccessRoute, roleLabels } from "@/lib/auth";
import { navItems } from "@/lib/data";
import { cn } from "@/lib/utils";

const icons = {
  LayoutDashboard,
  Truck,
  Wrench,
  Route,
  Package,
  BarChart3,
  Users,
  Settings,
};

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const visibleNav = navItems.filter((item) =>
    currentUser ? canAccessRoute(currentUser.role, item.href) : false,
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "glass-sidebar fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-w)] flex-col border-r border-[var(--border)] transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[var(--toolbar-h)] items-center gap-3 border-b border-[var(--border)] px-4">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-tight">
              Mechanik Truck
            </p>
            <p className="truncate text-[11px] text-[var(--fg-tertiary)]">
              FMS · macOS
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
          <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Управление
          </p>
          {visibleNav.map((item) => {
            const Icon = icons[item.icon];
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]"
                    : "text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]",
                )}
              >
                <Icon size={16} strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] p-3">
          <div className="rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] p-3 shadow-[var(--shadow-sm)]">
            <p className="truncate text-[12px] font-semibold">
              {currentUser?.name ?? "—"}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--fg-secondary)]">
              {currentUser ? roleLabels[currentUser.role] : ""} · @
              {currentUser?.login}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
