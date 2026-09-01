"use client";

import { FormEvent, Fragment, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleet } from "@/components/fleet-provider";
import { useWarehouse } from "@/components/warehouse-provider";
import { useService } from "@/components/service-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import { calcLaborCost, canManageService, WorkOrderStatus } from "@/lib/service";
import { formatCurrency, formatNumber } from "@/lib/utils";

const statusMap = {
  open: { label: "Открыт", tone: "accent" as const },
  in_progress: { label: "В работе", tone: "warning" as const },
  done: { label: "Готово", tone: "success" as const },
  overdue: { label: "Просрочен", tone: "danger" as const },
};

const inputClass =
  "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]";

type PartLineDraft = { warehouseItemId: string; qty: string };

export default function ServicePage() {
  const { currentUser } = useAuth();
  const { vehicles } = useFleet();
  const { items } = useWarehouse();
  const { orders, addOrder, addPartsToOrder, updateOrderStatus, deleteOrder } =
    useService();
  const canEdit = currentUser ? canManageService(currentUser.role) : false;

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [vehicle, setVehicle] = useState("");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<WorkOrderStatus>("open");
  const [laborHours, setLaborHours] = useState("2");
  const [hourlyRate, setHourlyRate] = useState("1800");
  const [mechanic, setMechanic] = useState(currentUser?.name ?? "");
  const [partLines, setPartLines] = useState<PartLineDraft[]>([
    { warehouseItemId: "", qty: "1" },
  ]);

  const [issueItemId, setIssueItemId] = useState("");
  const [issueQty, setIssueQty] = useState("1");

  const laborPreview = useMemo(() => {
    const hours = Number(laborHours) || 0;
    const rate = Number(hourlyRate) || 0;
    return calcLaborCost(hours, rate);
  }, [laborHours, hourlyRate]);

  const partsPreview = useMemo(() => {
    return partLines.reduce((sum, line) => {
      const item = items.find((i) => i.id === line.warehouseItemId);
      if (!item) return sum;
      const qty = Number(line.qty) || 0;
      return sum + item.price * qty;
    }, 0);
  }, [partLines, items]);

  const availableParts = useMemo(
    () => items.filter((i) => i.qty > 0),
    [items],
  );

  const expanded = orders.find((o) => o.id === expandedId) ?? null;

  function onCreate(e: FormEvent) {
    e.preventDefault();
    const parts = partLines
      .filter((l) => l.warehouseItemId)
      .map((l) => ({
        warehouseItemId: l.warehouseItemId,
        qty: Number(l.qty) || 0,
      }));

    const result = addOrder({
      vehicle,
      title,
      due,
      status,
      laborHours: Number(laborHours) || 0,
      hourlyRate: Number(hourlyRate) || 0,
      parts,
      mechanic,
    });

    if (!result.ok) {
      setMessage({ type: "err", text: result.error });
      return;
    }

    setMessage({
      type: "ok",
      text: `Заказ-наряд ${result.order.number} создан. Запчасти списаны со склада.`,
    });
    setTitle("");
    setLaborHours("2");
    setPartLines([{ warehouseItemId: "", qty: "1" }]);
    setShowForm(false);
    setExpandedId(result.order.id);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">Заказ-нарядов</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {orders.length}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">В работе</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight text-[var(--warning)]">
            {orders.filter((o) => o.status === "in_progress").length}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">Сумма открытых</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {formatCurrency(
              orders
                .filter((o) => o.status !== "done")
                .reduce((s, o) => s + o.totalCost, 0),
            )}
          </p>
        </Panel>
      </div>

      {message ? (
        <div
          className={`rounded-[10px] px-3 py-2 text-[12px] ${
            message.type === "ok"
              ? "bg-[var(--success-soft)] text-[var(--success)]"
              : "bg-[var(--danger-soft)] text-[var(--danger)]"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <Panel>
        <PanelHeader
          title="Заказ-наряды"
          subtitle="Нормо-часы, ставка и списание запчастей со склада"
          action={
            canEdit ? (
              <Button
                size="sm"
                onClick={() => {
                  setShowForm((v) => !v);
                  setMessage(null);
                  if (!vehicle && vehicles[0]) setVehicle(vehicles[0].plate);
                }}
              >
                {showForm ? "Скрыть форму" : "Новый заказ-наряд"}
              </Button>
            ) : null
          }
        />

        {showForm && canEdit ? (
          <form
            onSubmit={onCreate}
            className="m-4 space-y-4 rounded-[14px] border border-[var(--border)] bg-[var(--bg-window)] p-4"
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                ТС *
                <select
                  className={inputClass}
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  required
                >
                  <option value="">Выберите ТС</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plate}>
                      {v.plate} · {v.model}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2">
                Работы *
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Замена тормозных колодок"
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Срок
                <input
                  className={inputClass}
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Статус
                <select
                  className={inputClass}
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as WorkOrderStatus)
                  }
                >
                  <option value="open">Открыт</option>
                  <option value="in_progress">В работе</option>
                  <option value="done">Готово</option>
                  <option value="overdue">Просрочен</option>
                </select>
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Механик
                <input
                  className={inputClass}
                  value={mechanic}
                  onChange={(e) => setMechanic(e.target.value)}
                  placeholder="ФИО"
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Нормо-часы *
                <input
                  className={inputClass}
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={laborHours}
                  onChange={(e) => setLaborHours(e.target.value)}
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Стоимость нормо-часа, ₽ *
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  step={1}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  required
                />
              </label>
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                <p className="text-[11px] text-[var(--fg-tertiary)]">Работа</p>
                <p className="text-[18px] font-semibold">
                  {formatCurrency(laborPreview)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-semibold">
                  Списание номенклатуры со склада
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setPartLines((prev) => [
                      ...prev,
                      { warehouseItemId: "", qty: "1" },
                    ])
                  }
                >
                  + позиция
                </Button>
              </div>

              {partLines.map((line, index) => {
                const selected = items.find(
                  (i) => i.id === line.warehouseItemId,
                );
                return (
                  <div
                    key={index}
                    className="grid gap-2 rounded-[12px] border border-[var(--border)] p-3 md:grid-cols-[1.4fr_0.5fr_0.7fr_auto]"
                  >
                    <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                      Номенклатура
                      <select
                        className={inputClass}
                        value={line.warehouseItemId}
                        onChange={(e) =>
                          setPartLines((prev) =>
                            prev.map((p, i) =>
                              i === index
                                ? { ...p, warehouseItemId: e.target.value }
                                : p,
                            ),
                          )
                        }
                      >
                        <option value="">Не выбрано</option>
                        {availableParts.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} · {item.sku} (ост. {item.qty}{" "}
                            {item.unit})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                      Кол-во
                      <input
                        className={inputClass}
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={line.qty}
                        onChange={(e) =>
                          setPartLines((prev) =>
                            prev.map((p, i) =>
                              i === index ? { ...p, qty: e.target.value } : p,
                            ),
                          )
                        }
                      />
                    </label>
                    <div className="flex flex-col justify-end pb-1 text-[12px] text-[var(--fg-secondary)]">
                      {selected ? (
                        <>
                          {formatCurrency(selected.price)} / {selected.unit}
                          <span className="font-medium text-[var(--fg-primary)]">
                            ={" "}
                            {formatCurrency(
                              selected.price * (Number(line.qty) || 0),
                            )}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setPartLines((prev) =>
                            prev.length === 1
                              ? [{ warehouseItemId: "", qty: "1" }]
                              : prev.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Убрать
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-4 rounded-[12px] bg-[var(--bg-elevated)] px-3 py-2 text-[13px]">
                <span>
                  Работа: <strong>{formatCurrency(laborPreview)}</strong>
                </span>
                <span>
                  Запчасти: <strong>{formatCurrency(partsPreview)}</strong>
                </span>
                <span>
                  Итого:{" "}
                  <strong>{formatCurrency(laborPreview + partsPreview)}</strong>
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Создать заказ-наряд и списать номенклатуру
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Отмена
              </Button>
            </div>
          </form>
        ) : null}

        <DataTable
          headers={[
            "№",
            "ТС",
            "Работы",
            "Н/ч",
            "Работа",
            "Запчасти",
            "Итого",
            "Статус",
            "Действия",
          ]}
        >
          {orders.map((order) => (
            <Fragment key={order.id}>
              <Tr>
                <Td className="font-mono text-[12px]">{order.number}</Td>
                <Td className="font-medium">{order.vehicle}</Td>
                <Td>
                  <div>{order.title}</div>
                  <div className="text-[11px] text-[var(--fg-tertiary)]">
                    срок {order.due}
                    {order.mechanic ? ` · ${order.mechanic}` : ""}
                  </div>
                </Td>
                <Td>
                  {formatNumber(order.laborHours, 1)} ×{" "}
                  {formatCurrency(order.hourlyRate)}
                </Td>
                <Td>{formatCurrency(order.laborCost)}</Td>
                <Td>{formatCurrency(order.partsCost)}</Td>
                <Td className="font-medium">
                  {formatCurrency(order.totalCost)}
                </Td>
                <Td>
                  <Badge tone={statusMap[order.status].tone}>
                    {statusMap[order.status].label}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setExpandedId((id) =>
                          id === order.id ? null : order.id,
                        );
                        setIssueItemId("");
                        setIssueQty("1");
                      }}
                    >
                      {expandedId === order.id ? "Скрыть" : "Списать / состав"}
                    </Button>
                    {canEdit ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const next =
                              order.status === "open"
                                ? "in_progress"
                                : order.status === "in_progress"
                                  ? "done"
                                  : "open";
                            const res = updateOrderStatus(order.id, next);
                            setMessage(
                              res.ok
                                ? {
                                    type: "ok",
                                    text: `Статус → ${statusMap[next].label}`,
                                  }
                                : { type: "err", text: res.error },
                            );
                          }}
                        >
                          Статус
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Удалить заказ-наряд ${order.number}? Запчасти на склад не вернутся.`,
                              )
                            )
                              return;
                            const res = deleteOrder(order.id);
                            setMessage(
                              res.ok
                                ? { type: "ok", text: "Удалён" }
                                : { type: "err", text: res.error },
                            );
                          }}
                        >
                          Удалить
                        </Button>
                      </>
                    ) : null}
                  </div>
                </Td>
              </Tr>
            </Fragment>
          ))}
        </DataTable>
      </Panel>

      {expanded ? (
        <Panel>
          <PanelHeader
            title={`Состав ${expanded.number}`}
            subtitle={`${expanded.vehicle} · ${expanded.title}`}
          />
          <div className="grid gap-3 p-4 md:grid-cols-3">
            <div className="rounded-[12px] border border-[var(--border)] p-3">
              <p className="text-[11px] text-[var(--fg-tertiary)]">Нормо-часы</p>
              <p className="mt-1 text-[16px] font-semibold">
                {formatNumber(expanded.laborHours, 1)} н/ч ×{" "}
                {formatCurrency(expanded.hourlyRate)}
              </p>
              <p className="mt-1 text-[13px] text-[var(--fg-secondary)]">
                Работа: {formatCurrency(expanded.laborCost)}
              </p>
            </div>
            <div className="rounded-[12px] border border-[var(--border)] p-3">
              <p className="text-[11px] text-[var(--fg-tertiary)]">Запчасти</p>
              <p className="mt-1 text-[16px] font-semibold">
                {formatCurrency(expanded.partsCost)}
              </p>
              <p className="mt-1 text-[13px] text-[var(--fg-secondary)]">
                {expanded.parts.length} позиций со склада
              </p>
            </div>
            <div className="rounded-[12px] border border-[var(--border)] p-3">
              <p className="text-[11px] text-[var(--fg-tertiary)]">Итого</p>
              <p className="mt-1 text-[16px] font-semibold">
                {formatCurrency(expanded.totalCost)}
              </p>
            </div>
          </div>

          {canEdit && expanded.status !== "done" ? (
            <form
              className="mx-4 mb-4 grid gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--bg-window)] p-4 md:grid-cols-[1.4fr_0.5fr_auto]"
              onSubmit={(e) => {
                e.preventDefault();
                const result = addPartsToOrder(expanded.id, [
                  {
                    warehouseItemId: issueItemId,
                    qty: Number(issueQty) || 0,
                  },
                ]);
                if (!result.ok) {
                  setMessage({ type: "err", text: result.error });
                  return;
                }
                setMessage({
                  type: "ok",
                  text: `Номенклатура списана в ${result.order.number}. Остаток на складе обновлён.`,
                });
                setIssueItemId("");
                setIssueQty("1");
              }}
            >
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Списать номенклатуру со склада
                <select
                  className={inputClass}
                  value={issueItemId}
                  onChange={(e) => setIssueItemId(e.target.value)}
                  required
                >
                  <option value="">Выберите позицию</option>
                  {availableParts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.sku} · {formatCurrency(item.price)} /
                      {item.unit} (ост. {item.qty})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Количество
                <input
                  className={inputClass}
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={issueQty}
                  onChange={(e) => setIssueQty(e.target.value)}
                  required
                />
              </label>
              <div className="flex items-end">
                <Button type="submit" size="sm" className="w-full md:w-auto">
                  Списать в заказ-наряд
                </Button>
              </div>
            </form>
          ) : null}

          {expanded.parts.length > 0 ? (
            <DataTable
              headers={["Запчасть", "Артикул", "Кол-во", "Цена", "Сумма"]}
            >
              {expanded.parts.map((part) => (
                <Tr key={`${expanded.id}-${part.warehouseItemId}-${part.sku}`}>
                  <Td className="font-medium">{part.name}</Td>
                  <Td className="font-mono text-[12px] text-[var(--fg-secondary)]">
                    {part.sku}
                  </Td>
                  <Td>
                    {formatNumber(part.qty, 1)} {part.unit}
                  </Td>
                  <Td>{formatCurrency(part.price)}</Td>
                  <Td className="font-medium">{formatCurrency(part.sum)}</Td>
                </Tr>
              ))}
            </DataTable>
          ) : (
            <p className="px-4 pb-4 text-[13px] text-[var(--fg-secondary)]">
              В этом заказ-наряде ещё нет списанной номенклатуры. Добавьте
              позицию выше.
            </p>
          )}
        </Panel>
      ) : null}
    </div>
  );
}
