import { fuelEvents } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function FuelPage() {
  const anomalies = fuelEvents.filter((f) => f.anomaly).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Заправок за 7 дней"
          value={String(fuelEvents.length)}
          delta="интеграция топливных карт"
          tone="accent"
        />
        <KpiCard
          label="Аномалии"
          value={String(anomalies)}
          delta="недоливы и перерасход"
          tone="warning"
        />
        <KpiCard
          label="Сумма заправок"
          value={formatCurrency(
            fuelEvents.reduce((sum, f) => sum + f.amount, 0),
          )}
          delta="включая сомнительные"
          tone="success"
        />
      </div>

      <Panel>
        <PanelHeader
          title="Журнал заправок"
          subtitle="Сравнение купленного топлива с фактом в баке"
          action={<Button size="sm">Синхронизировать</Button>}
        />
        <DataTable
          headers={[
            "Дата",
            "ТС",
            "АЗС",
            "Литры",
            "Сумма",
            "Статус",
          ]}
        >
          {fuelEvents.map((event) => (
            <Tr key={event.id}>
              <Td className="text-[var(--fg-secondary)]">{event.date}</Td>
              <Td className="font-medium">{event.vehicle}</Td>
              <Td>{event.station}</Td>
              <Td>{formatNumber(event.liters, 0)} л</Td>
              <Td>{formatCurrency(event.amount)}</Td>
              <Td>
                {event.anomaly ? (
                  <Badge tone="warning">Аномалия</Badge>
                ) : (
                  <Badge tone="success">Норма</Badge>
                )}
              </Td>
            </Tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
