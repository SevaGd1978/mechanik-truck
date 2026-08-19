"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleet } from "@/components/fleet-provider";
import { useTires } from "@/components/tires-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import {
  canManageTires,
  tireSeasonLabels,
  tireStatusLabels,
  tireStatusTone,
  type Tire,
  type TireStatus,
} from "@/lib/tires";
import { formatCurrency } from "@/lib/utils";

const inputClass =
  "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]";

type Filter = "all" | TireStatus;

export default function TiresPage() {
  const { currentUser } = useAuth();
  const { vehicles, trailers } = useFleet();
  const {
    tires,
    addTire,
    deleteTire,
    moveToWarehouse,
    issueToUnit,
    returnToWarehouse,
  } = useTires();
  const canEdit = currentUser ? canManageTires(currentUser.role) : false;

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [issueId, setIssueId] = useState<string | null>(null);
  const [issueTarget, setIssueTarget] = useState("");
  const [issueNote, setIssueNote] = useState("");
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [serial, setSerial] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("315/70 R22.5");
  const [season, setSeason] = useState<Tire["season"]>("allseason");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");

  const counts = useMemo(
    () => ({
      all: tires.length,
      registered: tires.filter((t) => t.status === "registered").length,
      warehouse: tires.filter((t) => t.status === "warehouse").length,
      mounted: tires.filter((t) => t.status === "mounted").length,
    }),
    [tires],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tires.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (!q) return true;
      return (
        t.serial.toLowerCase().includes(q) ||
        t.brand.toLowerCase().includes(q) ||
        t.size.toLowerCase().includes(q) ||
        (t.mountedOn?.plate.toLowerCase().includes(q) ?? false)
      );
    });
  }, [tires, filter, query]);

  const targets = useMemo(() => {
    const list = [
      ...vehicles.map((v) => ({
        value: `vehicle:${v.id}`,
        label: `ТС · ${v.plate} · ${v.model}`,
        target: {
          kind: "vehicle" as const,
          id: v.id,
          plate: v.plate,
          label: v.model,
        },
      })),
      ...trailers.map((t) => ({
        value: `trailer:${t.id}`,
        label: `Прицеп · ${t.plate} · ${t.model}`,
        target: {
          kind: "trailer" as const,
          id: t.id,
          plate: t.plate,
          label: t.model,
        },
      })),
    ];
    return list;
  }, [vehicles, trailers]);

  function onAdd(e: FormEvent) {
    e.preventDefault();
    const result = addTire({
      serial,
      brand,
      size,
      season,
      price: Number(price) || 0,
      note,
    });
    if (!result.ok) {
      setMessage({ type: "err", text: result.error });
      return;
    }
    setMessage({
      type: "ok",
      text: `Шина ${result.tire.serial} (${result.tire.brand}) добавлена в учёт`,
    });
    setSerial("");
    setBrand("");
    setPrice("");
    setNote("");
    setShowForm(false);
  }

  function onMove(id: string) {
    const result = moveToWarehouse(id);
    setMessage(
      result.ok
        ? {
            type: "ok",
            text: `Шина ${result.tire.serial} перемещена на склад (как запчасть)`,
          }
        : { type: "err", text: result.error },
    );
  }

  function onReturn(id: string) {
    const result = returnToWarehouse(id);
    setMessage(
      result.ok
        ? {
            type: "ok",
            text: `Шина ${result.tire.serial} снята и возвращена на склад`,
          }
        : { type: "err", text: result.error },
    );
  }

  function onIssue(e: FormEvent) {
    e.preventDefault();
    if (!issueId) return;
    const selected = targets.find((t) => t.value === issueTarget);
    if (!selected) {
      setMessage({ type: "err", text: "Выберите ТС или прицеп" });
      return;
    }
    const result = issueToUnit(issueId, selected.target, issueNote);
    if (!result.ok) {
      setMessage({ type: "err", text: result.error });
      return;
    }
    setMessage({
      type: "ok",
      text: `Шина ${result.tire.serial} выдана на ${selected.target.plate}`,
    });
    setIssueId(null);
    setIssueTarget("");
    setIssueNote("");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">Всего шин</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {counts.all}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">На учёте</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight text-[var(--accent)]">
            {counts.registered}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">На складе</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight text-[var(--success)]">
            {counts.warehouse}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">На технике</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight text-[var(--warning)]">
            {counts.mounted}
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
          title="Шины"
          subtitle="Номер, марка, склад и выдача на ТС / прицепы"
          action={
            canEdit ? (
              <Button
                size="sm"
                onClick={() => {
                  setShowForm((v) => !v);
                  setMessage(null);
                }}
              >
                {showForm ? "Скрыть форму" : "Добавить шину"}
              </Button>
            ) : null
          }
        />

        {showForm && canEdit ? (
          <form
            onSubmit={onAdd}
            className="m-4 grid gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--bg-window)] p-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Номер шины *
              <input
                className={inputClass}
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="DOT-1234-AB"
                required
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Марка *
              <input
                className={inputClass}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Michelin"
                required
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Размер
              <input
                className={inputClass}
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="315/70 R22.5"
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Сезон
              <select
                className={inputClass}
                value={season}
                onChange={(e) =>
                  setSeason(e.target.value as Tire["season"])
                }
              >
                <option value="summer">Летняя</option>
                <option value="winter">Зимняя</option>
                <option value="allseason">Всесезонная</option>
              </select>
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Цена, ₽
              <input
                className={inputClass}
                type="number"
                min={0}
                step={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="28500"
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Примечание
              <input
                className={inputClass}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Позиция, партия…"
              />
            </label>
            <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
              <Button type="submit" size="sm">
                Сохранить в учёт
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

        <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
          {(
            [
              ["all", "Все"],
              ["registered", "На учёте"],
              ["warehouse", "На складе"],
              ["mounted", "На технике"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-[10px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                filter === id
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-window)] text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {label}
            </button>
          ))}
          <input
            className={`${inputClass} ml-auto mt-0 max-w-xs`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: номер, марка, ТС…"
          />
        </div>

        <DataTable
          headers={[
            "Номер",
            "Марка / размер",
            "Сезон",
            "Статус",
            "Где",
            "Цена",
            "Действия",
          ]}
        >
          {rows.map((tire) => (
            <Tr key={tire.id}>
              <Td className="font-mono text-[12px] font-medium">
                {tire.serial}
              </Td>
              <Td>
                <div className="font-medium">{tire.brand}</div>
                <div className="text-[11px] text-[var(--fg-tertiary)]">
                  {tire.size}
                </div>
              </Td>
              <Td>{tireSeasonLabels[tire.season]}</Td>
              <Td>
                <Badge tone={tireStatusTone[tire.status]}>
                  {tireStatusLabels[tire.status]}
                </Badge>
              </Td>
              <Td>
                {tire.mountedOn ? (
                  <div>
                    <div className="font-medium">{tire.mountedOn.plate}</div>
                    <div className="text-[11px] text-[var(--fg-tertiary)]">
                      {tire.mountedOn.kind === "vehicle" ? "ТС" : "Прицеп"} ·{" "}
                      {tire.mountedOn.label}
                    </div>
                  </div>
                ) : tire.status === "warehouse" ? (
                  "Склад"
                ) : (
                  "—"
                )}
              </Td>
              <Td>{formatCurrency(tire.price)}</Td>
              <Td>
                {canEdit ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tire.status === "registered" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onMove(tire.id)}
                      >
                        На склад
                      </Button>
                    ) : null}
                    {tire.status === "warehouse" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setIssueId(tire.id);
                          setIssueTarget(targets[0]?.value ?? "");
                          setIssueNote("");
                          setMessage(null);
                        }}
                      >
                        Выдать
                      </Button>
                    ) : null}
                    {tire.status === "mounted" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onReturn(tire.id)}
                      >
                        Вернуть на склад
                      </Button>
                    ) : null}
                    {tire.status !== "mounted" ? (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Удалить шину ${tire.serial} из учёта?`,
                            )
                          )
                            return;
                          const res = deleteTire(tire.id);
                          setMessage(
                            res.ok
                              ? { type: "ok", text: "Шина удалена" }
                              : { type: "err", text: res.error },
                          );
                        }}
                      >
                        Удалить
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  "—"
                )}
              </Td>
            </Tr>
          ))}
        </DataTable>
      </Panel>

      {issueId && canEdit ? (
        <Panel>
          <PanelHeader
            title="Выдача шины на технику"
            subtitle="Списание со склада и установка на ТС или прицеп"
          />
          <form
            onSubmit={onIssue}
            className="grid gap-3 p-4 md:grid-cols-[1.2fr_1fr_auto]"
          >
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              ТС / прицеп *
              <select
                className={inputClass}
                value={issueTarget}
                onChange={(e) => setIssueTarget(e.target.value)}
                required
              >
                <option value="">Выберите</option>
                {targets.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Позиция / примечание
              <input
                className={inputClass}
                value={issueNote}
                onChange={(e) => setIssueNote(e.target.value)}
                placeholder="Передняя левая, ось 2…"
              />
            </label>
            <div className="flex items-end gap-2">
              <Button type="submit" size="sm">
                Выдать как запчасть
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIssueId(null)}
              >
                Отмена
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}
    </div>
  );
}
