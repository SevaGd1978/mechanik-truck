import { trips } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import { formatNumber } from "@/lib/utils";

const statusMap = {
  planned: { label: "План", tone: "neutral" as const },
  active: { label: "В пути", tone: "accent" as const },
  done: { label: "Завершён", tone: "success" as const },
};

export default function TripsPage() {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Путевые листы"
          subtitle="Маршруты, цели поездок и контроль пробега"
          action={<Button size="sm">Создать путевой лист</Button>}
        />
        <DataTable
          headers={[
            "Дата",
            "ТС",
            "Водитель",
            "Маршрут",
            "Км",
            "Статус",
          ]}
        >
          {trips.map((trip) => (
            <Tr key={trip.id}>
              <Td className="text-[var(--fg-secondary)]">{trip.date}</Td>
              <Td className="font-medium">{trip.vehicle}</Td>
              <Td>{trip.driver}</Td>
              <Td>
                {trip.from} → {trip.to}
              </Td>
              <Td>{formatNumber(trip.km, 0)}</Td>
              <Td>
                <Badge tone={statusMap[trip.status].tone}>
                  {statusMap[trip.status].label}
                </Badge>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
