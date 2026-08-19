import { inspections } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";

export default function InspectionsPage() {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Ежедневные осмотры"
          subtitle="Шаблоны чек-листов и результаты проверок"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                Шаблоны
              </Button>
              <Button size="sm">Новый осмотр</Button>
            </div>
          }
        />
        <DataTable
          headers={["Дата", "ТС", "Инспектор", "Результат", "Заметки"]}
        >
          {inspections.map((item) => (
            <Tr key={item.id}>
              <Td className="text-[var(--fg-secondary)]">{item.date}</Td>
              <Td className="font-medium">{item.vehicle}</Td>
              <Td>{item.inspector}</Td>
              <Td>
                <Badge tone={item.result === "ok" ? "success" : "warning"}>
                  {item.result === "ok" ? "Без замечаний" : "Есть замечания"}
                </Badge>
              </Td>
              <Td className="max-w-[280px] text-[var(--fg-secondary)]">
                {item.notes}
              </Td>
            </Tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
