import { serviceOrders } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";

const statusMap = {
  open: { label: "Открыт", tone: "accent" as const },
  in_progress: { label: "В работе", tone: "warning" as const },
  done: { label: "Готово", tone: "success" as const },
  overdue: { label: "Просрочен", tone: "danger" as const },
};

export default function ServicePage() {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Заказ-наряды"
          subtitle="Напоминания о сервисе и контроль ремонтов"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                Расписание
              </Button>
              <Button size="sm">Новый заказ-наряд</Button>
            </div>
          }
        />
        <DataTable
          headers={["ТС", "Работы", "Срок", "Стоимость", "Статус"]}
        >
          {serviceOrders.map((order) => (
            <Tr key={order.id}>
              <Td className="font-medium">{order.vehicle}</Td>
              <Td>{order.title}</Td>
              <Td className="text-[var(--fg-secondary)]">{order.due}</Td>
              <Td>{formatCurrency(order.cost)}</Td>
              <Td>
                <Badge tone={statusMap[order.status].tone}>
                  {statusMap[order.status].label}
                </Badge>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="p-4">
          <h3 className="text-[15px] font-semibold">Электронная сервисная книга</h3>
          <p className="mt-1 text-[13px] text-[var(--fg-secondary)]">
            История ТО, запчастей и неисправностей хранится по каждому ТС.
            Механики получают push при приближении регламентных работ.
          </p>
        </Panel>
        <Panel className="p-4">
          <h3 className="text-[15px] font-semibold">Фиксация неисправностей</h3>
          <p className="mt-1 text-[13px] text-[var(--fg-secondary)]">
            Водитель сообщает о проблеме из мобильного приложения — менеджер
            сразу видит статус и стоимость ремонта.
          </p>
        </Panel>
      </div>
    </div>
  );
}
