"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useWarehouse } from "@/components/warehouse-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import {
  canManageWarehouse,
  WarehouseUnit,
  warehouseUnits,
} from "@/lib/warehouse";
import { formatCurrency, formatNumber } from "@/lib/utils";

const inputClass =
  "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]";

export default function WarehousePage() {
  const { currentUser } = useAuth();
  const { items, addItem, updateItem, deleteItem } = useWarehouse();
  const canEdit = currentUser ? canManageWarehouse(currentUser.role) : false;

  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState<WarehouseUnit>("шт");
  const [min, setMin] = useState("1");
  const [price, setPrice] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q),
    );
  }, [items, query]);

  const totalValue = useMemo(
    () => items.reduce((sum, item) => sum + item.qty * item.price, 0),
    [items],
  );

  function onAdd(e: FormEvent) {
    e.preventDefault();
    const result = addItem({
      name,
      sku,
      qty: Number(qty) || 0,
      unit,
      min: Number(min) || 0,
      price: Number(price),
    });
    if (!result.ok) {
      setMessage({ type: "err", text: result.error });
      return;
    }
    setMessage({
      type: "ok",
      text: `Номенклатура «${result.item.name}» добавлена на склад`,
    });
    setName("");
    setSku("");
    setQty("1");
    setMin("1");
    setPrice("");
    setUnit("шт");
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">Позиций</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {items.length}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">
            Ниже минимума
          </p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight text-[var(--danger)]">
            {items.filter((i) => i.qty < i.min).length}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">
            Сумма на складе
          </p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {formatCurrency(totalValue)}
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
          title="Склад запчастей"
          subtitle="Номенклатура с ценой, остатками и минимумами"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск…"
                className="h-8 w-40 rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[12px] outline-none focus:border-[var(--accent)]"
              />
              {canEdit ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setShowForm((v) => !v);
                    setMessage(null);
                  }}
                >
                  {showForm ? "Скрыть форму" : "Добавить номенклатуру"}
                </Button>
              ) : null}
            </div>
          }
        />

        {showForm && canEdit ? (
          <form
            onSubmit={onAdd}
            className="m-4 grid gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--bg-window)] p-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2">
              Наименование *
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Фильтр воздушный"
                required
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Артикул *
              <input
                className={inputClass}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="FLT-AIR-01"
                required
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Цена, ₽ *
              <input
                className={inputClass}
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500"
                required
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Количество
              <input
                className={inputClass}
                type="number"
                min={0}
                step={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Ед. изм.
              <select
                className={inputClass}
                value={unit}
                onChange={(e) => setUnit(e.target.value as WarehouseUnit)}
              >
                {warehouseUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Мин. остаток
              <input
                className={inputClass}
                type="number"
                min={0}
                step={1}
                value={min}
                onChange={(e) => setMin(e.target.value)}
              />
            </label>
            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
              <Button type="submit" size="sm">
                Сохранить на склад
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
            "Номенклатура",
            "Артикул",
            "Цена",
            "Остаток",
            "Сумма",
            "Мин.",
            "Статус",
            ...(canEdit ? ["Действия"] : []),
          ]}
        >
          {rows.map((item) => {
            const low = item.qty < item.min;
            return (
              <Tr key={item.id}>
                <Td className="font-medium">{item.name}</Td>
                <Td className="font-mono text-[12px] text-[var(--fg-secondary)]">
                  {item.sku}
                </Td>
                <Td>{formatCurrency(item.price)}</Td>
                <Td>
                  {formatNumber(item.qty, 0)} {item.unit}
                </Td>
                <Td className="font-medium">
                  {formatCurrency(item.qty * item.price)}
                </Td>
                <Td className="text-[var(--fg-secondary)]">
                  {formatNumber(item.min, 0)} {item.unit}
                </Td>
                <Td>
                  <Badge tone={low ? "danger" : "success"}>
                    {low ? "Ниже минимума" : "В норме"}
                  </Badge>
                </Td>
                {canEdit ? (
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const next = window.prompt(
                            "Новая цена, ₽",
                            String(item.price),
                          );
                          if (next === null) return;
                          const value = Number(next);
                          if (Number.isNaN(value) || value < 0) {
                            setMessage({
                              type: "err",
                              text: "Некорректная цена",
                            });
                            return;
                          }
                          const res = updateItem(item.id, { price: value });
                          setMessage(
                            res.ok
                              ? { type: "ok", text: "Цена обновлена" }
                              : { type: "err", text: res.error },
                          );
                        }}
                      >
                        Цена
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const next = window.prompt(
                            "Новый остаток",
                            String(item.qty),
                          );
                          if (next === null) return;
                          const value = Number(next);
                          if (Number.isNaN(value) || value < 0) {
                            setMessage({
                              type: "err",
                              text: "Некорректное количество",
                            });
                            return;
                          }
                          const res = updateItem(item.id, { qty: value });
                          setMessage(
                            res.ok
                              ? { type: "ok", text: "Остаток обновлён" }
                              : { type: "err", text: res.error },
                          );
                        }}
                      >
                        Остаток
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (!window.confirm(`Удалить «${item.name}»?`))
                            return;
                          const res = deleteItem(item.id);
                          setMessage(
                            res.ok
                              ? { type: "ok", text: "Позиция удалена" }
                              : { type: "err", text: res.error },
                          );
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  </Td>
                ) : null}
              </Tr>
            );
          })}
        </DataTable>
      </Panel>
    </div>
  );
}
