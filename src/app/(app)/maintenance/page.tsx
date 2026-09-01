"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleet } from "@/components/fleet-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import type { Vehicle } from "@/lib/data";
import { canManageFleet } from "@/lib/fleet";
import {
  formatDateRu,
  getMaintenanceStatus,
  summarizeMaintenance,
} from "@/lib/maintenance";
import { formatNumber } from "@/lib/utils";

const inputClass =
  "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]";

const textareaClass =
  "mt-1.5 min-h-[72px] w-full resize-y rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]";

function KmCell({
  date,
  km,
  note,
}: {
  date: string;
  km: number;
  note: string;
}) {
  return (
    <div className="max-w-[240px]">
      <div className="font-medium">{formatDateRu(date)}</div>
      <div className="mt-0.5 font-mono text-[12px] text-[var(--fg-secondary)]">
        {km ? `${formatNumber(km, 0)} км` : "пробег не указан"}
      </div>
      {note ? (
        <div className="mt-0.5 text-[11px] leading-snug text-[var(--fg-tertiary)]">
          {note}
        </div>
      ) : null}
    </div>
  );
}

export default function MaintenancePage() {
  const { currentUser } = useAuth();
  const { vehicles, updateVehicle } = useFleet();
  const canEdit = currentUser ? canManageFleet(currentUser.role) : false;

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [lastDate, setLastDate] = useState("");
  const [lastKm, setLastKm] = useState("");
  const [lastNote, setLastNote] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextKm, setNextKm] = useState("");
  const [nextNote, setNextNote] = useState("");
  const [odometer, setOdometer] = useState("");

  const summary = useMemo(() => summarizeMaintenance(vehicles), [vehicles]);

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return summary.rows.filter(({ vehicle: v, status }) => {
      const matchFilter =
        filter === "all" ||
        (filter === "overdue" && status.key === "overdue") ||
        (filter === "soon" && status.key === "soon") ||
        (filter === "ok" && status.key === "ok");
      const matchQuery =
        !q ||
        v.plate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q) ||
        v.lastServiceNote.toLowerCase().includes(q) ||
        v.nextServiceNote.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [summary.rows, filter, query]);

  function openEdit(v: Vehicle) {
    setEditing(v);
    setLastDate(v.lastService || "");
    setLastKm(String(v.lastServiceOdometer || ""));
    setLastNote(v.lastServiceNote || "");
    setNextDate(v.nextService || "");
    setNextKm(String(v.nextServiceOdometer || ""));
    setNextNote(v.nextServiceNote || "");
    setOdometer(String(v.odometer || "0"));
    setMessage(null);
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = updateVehicle(editing.id, {
      lastService: lastDate,
      lastServiceOdometer: Number(lastKm) || 0,
      lastServiceNote: lastNote.trim(),
      nextService: nextDate,
      nextServiceOdometer: Number(nextKm) || 0,
      nextServiceNote: nextNote.trim(),
      odometer: Number(odometer) || 0,
    });
    if (!res.ok) {
      setMessage({ type: "err", text: res.error });
      return;
    }
    setMessage({ type: "ok", text: `ТО ${editing.plate} сохранено` });
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[22px] font-semibold tracking-tight">
          Техническое обслуживание
        </h2>
        <p className="mt-1 text-[12px] text-[var(--fg-secondary)]">
          Прошедшее и плановое ТО по дате и пробегу каждой машины
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Просрочено"
          value={String(summary.overdue)}
          delta="по дате или пробегу"
          tone="danger"
        />
        <KpiCard
          label="Скоро ТО"
          value={String(summary.soon)}
          delta="осталось ≤ 2 000 км"
          tone="warning"
        />
        <KpiCard
          label="В норме"
          value={String(summary.ok)}
          delta={`всего ${vehicles.length} ТС`}
          tone="success"
        />
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
          title="График ТО"
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
                  { label: "Просрочено", value: "overdue" },
                  { label: "Скоро", value: "soon" },
                  { label: "В норме", value: "ok" },
                ]}
              />
            </div>
          }
        />

        {editing && canEdit ? (
          <form
            onSubmit={onSave}
            className="m-4 grid gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--bg-window)] p-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <p className="xl:col-span-3 text-[13px] font-semibold">
              {editing.plate} · {editing.model}
            </p>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Текущий пробег, км
              <input
                className={inputClass}
                type="number"
                min={0}
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Дата прошедшего ТО
              <input
                className={inputClass}
                type="date"
                value={lastDate}
                onChange={(e) => setLastDate(e.target.value)}
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Пробег прошедшего ТО, км
              <input
                className={inputClass}
                type="number"
                min={0}
                value={lastKm}
                onChange={(e) => setLastKm(e.target.value)}
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2 xl:col-span-3">
              Описание прошедшего ТО
              <textarea
                className={textareaClass}
                value={lastNote}
                onChange={(e) => setLastNote(e.target.value)}
                placeholder="Что было сделано"
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Дата планового ТО
              <input
                className={inputClass}
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                required
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Пробег планового ТО, км
              <input
                className={inputClass}
                type="number"
                min={0}
                value={nextKm}
                onChange={(e) => setNextKm(e.target.value)}
              />
            </label>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2 xl:col-span-1">
              Описание планового ТО
              <textarea
                className={textareaClass}
                value={nextNote}
                onChange={(e) => setNextNote(e.target.value)}
                placeholder="Что запланировано"
              />
            </label>
            <div className="flex items-end gap-2 xl:col-span-3">
              <Button type="submit" size="sm">
                Сохранить ТО
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditing(null)}
              >
                Отмена
              </Button>
            </div>
          </form>
        ) : null}

        <DataTable
          headers={[
            "ТС",
            "Текущий пробег",
            "Прошедшее ТО",
            "Плановое ТО",
            "Остаток",
            "Статус",
            ...(canEdit ? ["Действия"] : []),
          ]}
        >
          {rows.map(({ vehicle: v, status }) => (
            <Tr key={v.id}>
              <Td>
                <div className="font-medium">{v.plate}</div>
                <div className="text-[12px] text-[var(--fg-secondary)]">
                  {v.model} · {v.driver}
                </div>
              </Td>
              <Td className="font-mono text-[12px]">
                {formatNumber(v.odometer, 0)} км
              </Td>
              <Td>
                <KmCell
                  date={v.lastService}
                  km={v.lastServiceOdometer}
                  note={v.lastServiceNote}
                />
              </Td>
              <Td>
                <KmCell
                  date={v.nextService}
                  km={v.nextServiceOdometer}
                  note={v.nextServiceNote}
                />
              </Td>
              <Td className="font-mono text-[12px]">
                {status.kmLeft === null
                  ? "—"
                  : status.kmLeft <= 0
                    ? `−${formatNumber(Math.abs(status.kmLeft), 0)} км`
                    : `${formatNumber(status.kmLeft, 0)} км`}
              </Td>
              <Td>
                <Badge tone={status.tone}>{status.label}</Badge>
              </Td>
              {canEdit ? (
                <Td>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openEdit(v)}
                  >
                    Править
                  </Button>
                </Td>
              ) : null}
            </Tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
