import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { activity, kpis, serviceOrders, vehicles } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import { formatCurrency, formatNumber } from "@/lib/utils";

const statusMap = {
  active: { label: "В работе", tone: "success" as const },
  service: { label: "Сервис", tone: "accent" as const },
  idle: { label: "Простой", tone: "neutral" as const },
  alert: { label: "Внимание", tone: "danger" as const },
};

export default function DashboardPage() {
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
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            Импорт Excel
          </Button>
          <Button size="sm">
            <Plus size={14} />
            Добавить ТС
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
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
          <DataTable
            headers={["ТС", "Водитель", "1 км", "Расход", "Статус"]}
          >
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
                  href="/service"
                  className="text-[12px] font-medium text-[var(--accent)]"
                >
                  Сервис
                </Link>
              }
            />
            <ul className="divide-y divide-[var(--border)]">
              {serviceOrders.slice(0, 3).map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-[13px] font-medium">{order.vehicle}</p>
                    <p className="text-[12px] text-[var(--fg-secondary)]">
                      {order.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-[var(--fg-tertiary)]">
                      {order.due}
                    </p>
                    <p className="text-[12px] font-medium">
                      {formatCurrency(order.cost)}
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
