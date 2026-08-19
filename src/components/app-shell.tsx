"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Toolbar } from "@/components/toolbar";
import { CommandPalette } from "@/components/command-palette";
import { navItems } from "@/lib/data";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Обзор автопарка",
    subtitle: "Ключевые показатели и события за сегодня",
  },
  "/fleet": {
    title: "Автопарк",
    subtitle: "Транспортные средства, водители и статусы",
  },
  "/fuel": {
    title: "Топливо",
    subtitle: "Заправки, нормы расхода и аномалии",
  },
  "/service": {
    title: "Сервис и ТО",
    subtitle: "Расписания, заказ-наряды и ремонты",
  },
  "/inspections": {
    title: "Осмотры",
    subtitle: "Ежедневные проверки и замечания",
  },
  "/trips": {
    title: "Поездки",
    subtitle: "Путевые листы и маршруты",
  },
  "/warehouse": {
    title: "Склад",
    subtitle: "Запчасти, остатки и минимальные запасы",
  },
  "/reports": {
    title: "Отчёты",
    subtitle: "Готовые шаблоны и аналитика",
  },
  "/settings": {
    title: "Настройки",
    subtitle: "Организация, пользователи и тариф",
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
        <main className="animate-fade-in flex-1 p-3 md:p-5">{children}</main>
      </div>
      {paletteOpen ? (
        <CommandPalette onClose={() => setPaletteOpen(false)} />
      ) : null}
    </div>
  );
}
