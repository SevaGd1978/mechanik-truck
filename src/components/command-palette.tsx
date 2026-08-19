"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { navItems, vehicles } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pages = navItems
      .filter((item) => item.label.toLowerCase().includes(q) || !q)
      .map((item) => ({
        type: "Страница" as const,
        label: item.label,
        href: item.href,
      }));
    const fleet = vehicles
      .filter(
        (v) =>
          !q ||
          v.plate.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.driver.toLowerCase().includes(q),
      )
      .slice(0, 5)
      .map((v) => ({
        type: "ТС" as const,
        label: `${v.plate} · ${v.model}`,
        href: "/fleet",
      }));
    return [...pages, ...fleet];
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[12vh] backdrop-blur-[2px]">
      <div
        className="animate-scale-in w-full max-w-xl overflow-hidden rounded-[16px] border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4">
          <Search size={16} className="text-[var(--fg-tertiary)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти страницу, ТС или водителя…"
            className="h-12 w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--fg-tertiary)]"
          />
          <kbd className="rounded bg-[var(--bg-active)] px-1.5 py-0.5 text-[10px] text-[var(--fg-secondary)]">
            Esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-[13px] text-[var(--fg-secondary)]">
              Ничего не найдено
            </li>
          ) : (
            results.map((item) => (
              <li key={`${item.type}-${item.label}`}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left transition hover:bg-[var(--bg-hover)]",
                  )}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                >
                  <span className="text-[13px] font-medium">{item.label}</span>
                  <span className="text-[11px] text-[var(--fg-tertiary)]">
                    {item.type}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      <button
        type="button"
        className="absolute inset-0 -z-10"
        aria-label="Закрыть"
        onClick={onClose}
      />
    </div>
  );
}
