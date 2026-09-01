"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { activity, kpis } from "@/lib/data";
import { useFleet } from "@/components/fleet-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import { formatDateRu, getMaintenanceStatus, summarizeMaintenance } from "@/lib/maintenance";
import { formatNumber } from "@/lib/utils";

const statusMap = {
  active: { label: "В работе", tone: "success" as const },
  service: { label: "Сервис", tone: "accent" as const },
  idle: { label: "Простой", tone: "neutral" as const },
  alert: { label: "Внимание", tone: "danger" as const },
};

export default function DashboardPage() {
  const { vehicles, trailers } = useFleet();
  const toSummary = summarizeMaintenance(vehicles);
  const upcoming = [...vehicles]
    .map((v) => ({ v, status: getMaintenanceStatus(v) }))
    .sort((a, b) => (a.status.kmLeft ?? 9e9) - (b.status.kmLeft ?? 9e9))
    .slice(0, 3);

  const liveKpis = kpis.map((kpi) =>
    kpi.id === "service"
      ? {
          ...kpi,
          value: String(toSummary.overdue),
          delta: `${toSummary.soon} скоро по пробегу`,
          tone: toSummary.overdue > 0 ? ("danger" as const) : ("success" as const),
        }
      : kpi,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[var(--fg-secondary)]">
            Сегодня · 19 августа 2026
          </p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-tight">
            Автопарк под контролем
          </h2>
          <p className="mt-1 text-[12px] text-[var(--fg-secondary)]">
            {vehicles.length} машин · {trailers.length} прицепов
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            Импорт Excel
          </Button>
          <Link href="/fleet">
            <Button size="sm">
              <Plus size={14} />
              Добавить ТС
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {liveKpis.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <Panel>
          <PanelHeader
            title="Автопарк"
            subtitle="Состояние техники и стоимость километра"
            action={
              <Link
                href="/fleet"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent)]"
              >
                Все ТС
                <ArrowUpRight size={14} />
              </Link>
            }
          />
          <DataTable headers={["ТС", "Водитель", "1 км", "Расход", "Статус"]}>
            {vehicles.slice(0, 5).map((v) => (
              <Tr key={v.id}>
                <Td>
                  <div className="font-medium">{v.plate}</div>
                  <div className="text-[12px] text-[var(--fg-secondary)]">
                    {v.model}
                  </div>
                </Td>
                <Td className="text-[var(--fg-secondary)]">{v.driver}</Td>
                <Td>{formatNumber(v.costPerKm)} ₽</Td>
                <Td>
                  <span
                    className={
                      v.fuelFact > v.fuelNorm + 1
                        ? "text-[var(--warning)]"
                        : "text-[var(--fg-secondary)]"
                    }
                  >
                    {formatNumber(v.fuelFact)} / {formatNumber(v.fuelNorm)}
                  </span>
                </Td>
                <Td>
                  <Badge tone={statusMap[v.status].tone}>
                    {statusMap[v.status].label}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </DataTable>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Лента событий" subtitle="Живые уведомления" />
            <ul className="divide-y divide-[var(--border)]">
              {activity.map((item) => (
                <li key={item.id} className="flex gap-3 px-4 py-3">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background:
                        item.tone === "success"
                          ? "var(--success)"
                          : item.tone === "warning"
                            ? "var(--warning)"
                            : item.tone === "danger"
                              ? "var(--danger)"
                              : "var(--accent)",
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{item.title}</p>
                    <p className="text-[12px] text-[var(--fg-secondary)]">
                      {item.detail}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--fg-tertiary)]">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader
              title="Ближайшее ТО"
              action={
                <Link
                  href="/maintenance"
                  className="text-[12px] font-medium text-[var(--accent)]"
                >
                  График ТО
                </Link>
              }
            />
            <ul className="divide-y divide-[var(--border)]">
              {upcoming.map(({ v, status }) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-[13px] font-medium">{v.plate}</p>
                    <p className="text-[12px] text-[var(--fg-secondary)]">
                      {v.nextServiceNote || v.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-[var(--fg-tertiary)]">
                      {formatDateRu(v.nextService)}
                    </p>
                    <p className="text-[12px] font-medium">
                      {status.kmLeft === null
                        ? "—"
                        : status.kmLeft <= 0
                          ? `просрочено ${formatNumber(Math.abs(status.kmLeft), 0)} км`
                          : `${formatNumber(status.kmLeft, 0)} км`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
