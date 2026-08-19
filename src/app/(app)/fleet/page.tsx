"use client";

import { useMemo, useState } from "react";
import { vehicles } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import { formatNumber } from "@/lib/utils";

const statusMap = {
  active: { label: "В работе", tone: "success" as const },
  service: { label: "Сервис", tone: "accent" as const },
  idle: { label: "Простой", tone: "neutral" as const },
  alert: { label: "Внимание", tone: "danger" as const },
};

export default function FleetPage() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return vehicles.filter((v) => {
      const matchFilter = filter === "all" || v.status === filter;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        v.plate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [filter, query]);

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Транспортные средства"
          subtitle={`${rows.length} из ${vehicles.length}`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск…"
                className="h-8 w-40 rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[12px] outline-none focus:border-[var(--accent)]"
              />
              <Segmented
                value={filter}
                onChange={setFilter}
                options={[
                  { label: "Все", value: "all" },
                  { label: "В работе", value: "active" },
                  { label: "Сервис", value: "service" },
                  { label: "Алерты", value: "alert" },
                ]}
              />
              <Button size="sm">Добавить ТС</Button>
            </div>
          }
        />
        <DataTable
          headers={[
            "Госномер",
            "Модель",
            "Тип",
            "Водитель",
            "Пробег",
            "1 км",
            "ТО",
            "Статус",
          ]}
        >
          {rows.map((v) => (
            <Tr key={v.id}>
              <Td className="font-medium">{v.plate}</Td>
              <Td>{v.model}</Td>
              <Td className="text-[var(--fg-secondary)]">{v.type}</Td>
              <Td>{v.driver}</Td>
              <Td className="font-mono text-[12px]">
                {formatNumber(v.odometer, 0)} км
              </Td>
              <Td>{formatNumber(v.costPerKm)} ₽</Td>
              <Td className="text-[var(--fg-secondary)]">{v.nextService}</Td>
              <Td>
                <Badge tone={statusMap[v.status].tone}>
                  {statusMap[v.status].label}
                </Badge>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
