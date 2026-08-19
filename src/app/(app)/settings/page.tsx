"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [billing, setBilling] = useState("year");

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Организация"
          subtitle="Профиль компании и доступы"
        />
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
            Название
            <input
              defaultValue="ООО «Северный Автопарк»"
              className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
            ИНН
            <input
              defaultValue="7701234567"
              className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2">
            Часовой пояс
            <input
              defaultValue="Europe/Moscow"
              className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
            />
          </label>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Внешний вид" subtitle="Светлая и тёмная тема как в macOS" />
        <div className="flex items-center justify-between gap-3 p-4">
          <p className="text-[13px] text-[var(--fg-secondary)]">Тема интерфейса</p>
          <Segmented
            value={theme}
            onChange={(v) => setTheme(v as "light" | "dark")}
            options={[
              { label: "Светлая", value: "light" },
              { label: "Тёмная", value: "dark" },
            ]}
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Тарифы"
          subtitle="Лайт · Базовый · Оптимальный · Профессиональный"
          action={
            <Segmented
              value={billing}
              onChange={setBilling}
              options={[
                { label: "Помесячно", value: "month" },
                { label: "За год −17%", value: "year" },
              ]}
            />
          }
        />
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              name: "Лайт",
              price: "Бесплатно",
              desc: "50 операций для старта",
            },
            {
              name: "Базовый",
              price: billing === "year" ? "1 000 ₽" : "2 000 ₽",
              desc: "Всё необходимое для МСБ",
            },
            {
              name: "Оптимальный",
              price: billing === "year" ? "1 000 ₽" : "2 000 ₽",
              desc: "FMS + мониторинг в одном окне",
              popular: true,
            },
            {
              name: "Профессиональный",
              price: billing === "year" ? "1 660 ₽" : "2 000 ₽",
              desc: "AI-распознавание документов",
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-window)] p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold">{plan.name}</h3>
                {plan.popular ? (
                  <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                    Популярный
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-[22px] font-semibold tracking-tight">
                {plan.price}
              </p>
              <p className="text-[11px] text-[var(--fg-tertiary)]">за 1 ТС / мес</p>
              <p className="mt-2 text-[12px] text-[var(--fg-secondary)]">
                {plan.desc}
              </p>
              <Button
                className="mt-3 w-full"
                size="sm"
                variant={plan.popular ? "primary" : "secondary"}
              >
                Выбрать
              </Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
