"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Toolbar } from "@/components/toolbar";
import { CommandPalette } from "@/components/command-palette";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { navItems } from "@/lib/data";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Обзор автопарка",
    subtitle: "Ключевые показатели и события за сегодня",
  },
  "/fleet": {
    title: "Автопарк",
    subtitle: "Машины, прицепы, водители и статусы",
  },
  "/drivers": {
    title: "Водители",
    subtitle: "Паспорт, ВУ, контакты и назначение на ТС",
  },
  "/waybills": {
    title: "Путевые листы",
    subtitle: "Форма № 4-с: учёт, заполнение и печать",
  },
  "/service": {
    title: "Сервис и ТО",
    subtitle: "Заказ-наряды: нормо-часы, ставка и запчасти со склада",
  },
  "/tires": {
    title: "Шины",
    subtitle: "Номера, марки, склад и выдача на ТС и прицепы",
  },
  "/warehouse": {
    title: "Склад",
    subtitle: "Номенклатура запчастей с ценой и остатками",
  },
  "/reports": {
    title: "Отчёты",
    subtitle: "Готовые шаблоны и аналитика",
  },
  "/users": {
    title: "Пользователи",
    subtitle: "Логины, пароли и роли: админ, менеджер, механик",
  },
  "/settings": {
    title: "Настройки",
    subtitle: "Организация и тариф",
  },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const open = () => setPaletteOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener("open-command-palette", open);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("open-command-palette", open);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const meta =
    titles[pathname] ??
    navItems.find((n) => n.href === pathname) ??
    titles["/"];

  const title =
    "title" in meta ? meta.title : (meta as { label: string }).label;
  const subtitle =
    "subtitle" in meta
      ? meta.subtitle
      : "Управление корпоративным автопарком";

  return (
    <div className="flex min-h-full">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <Toolbar
          title={title}
          subtitle={subtitle}
          onMenu={() => setSidebarOpen(true)}
          onSearch={() => setPaletteOpen(true)}
        />
        <main className="animate-fade-in flex-1 px-3 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-3 md:p-5 md:pb-5">
          {children}
        </main>
        <MobileBottomNav onMore={() => setSidebarOpen(true)} />
      </div>
      {paletteOpen ? (
        <CommandPalette onClose={() => setPaletteOpen(false)} />
      ) : null}
    </div>
  );
}
