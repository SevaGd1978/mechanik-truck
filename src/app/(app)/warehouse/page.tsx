import { warehouseItems } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";

export default function WarehousePage() {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Склад запчастей"
          subtitle="Остатки, минимальные запасы и списания"
          action={<Button size="sm">Приход</Button>}
        />
        <DataTable
          headers={["Номенклатура", "Артикул", "Остаток", "Мин.", "Статус"]}
        >
          {warehouseItems.map((item) => {
            const low = item.qty < item.min;
            return (
              <Tr key={item.id}>
                <Td className="font-medium">{item.name}</Td>
                <Td className="font-mono text-[12px] text-[var(--fg-secondary)]">
                  {item.sku}
                </Td>
                <Td>
                  {item.qty} {item.unit}
                </Td>
                <Td className="text-[var(--fg-secondary)]">
                  {item.min} {item.unit}
                </Td>
                <Td>
                  <Badge tone={low ? "danger" : "success"}>
                    {low ? "Ниже минимума" : "В норме"}
                  </Badge>
                </Td>
              </Tr>
            );
          })}
        </DataTable>
      </Panel>
    </div>
  );
}
