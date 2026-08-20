"use client";

import { FormEvent, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useFleet } from "@/components/fleet-provider";
import { useWaybills } from "@/components/waybills-provider";
import { WaybillPrintForm } from "@/components/waybill-print-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import {
  calcFuelUsed,
  calcMileage,
  canManageWaybills,
  Waybill,
  WaybillStatus,
  WaybillTrip,
  waybillStatusLabels,
  waybillStatusTone,
} from "@/lib/waybills";
import { formatNumber } from "@/lib/utils";

const inputClass =
  "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]";

const emptyTrip = (): WaybillTrip => ({
  id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  customer: "",
  loadAddress: "",
  unloadAddress: "",
  cargo: "",
  distanceKm: 0,
  weightTons: 0,
  departTime: "",
  arriveTime: "",
});

function blankForm(defaults?: {
  organization?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  vehicleId?: string;
  driverName?: string;
}): Omit<Waybill, "id" | "formCode" | "createdAt" | "updatedAt"> {
  const today = new Date().toISOString().slice(0, 10);
  return {
    series: "АА",
    number: "",
    status: "draft",
    date: today,
    validFrom: today,
    validTo: today,
    organization: defaults?.organization ?? "ООО «Механик Трак»",
    organizationAddress: "г. Москва, ул. Складская, 12",
    organizationPhone: "+7 (495) 000-00-00",
    okpo: "",
    vehicleId: defaults?.vehicleId ?? "",
    vehiclePlate: defaults?.vehiclePlate ?? "",
    vehicleModel: defaults?.vehicleModel ?? "",
    garageNumber: "",
    trailerId: "",
    trailerPlate: "",
    trailerModel: "",
    driverName: defaults?.driverName ?? "",
    driverLicense: "",
    driverTabNumber: "",
    column: "1",
    brigade: "А",
    fuelBrand: "ДТ",
    fuelIssued: 0,
    fuelDeparture: 0,
    fuelReturn: 0,
    fuelNorm: 0,
    fuelFact: 0,
    odometerDeparture: 0,
    odometerReturn: 0,
    timeDeparture: "08:00",
    timeReturn: "18:00",
    dispatcherOut: "",
    mechanicOut: "",
    medicOut: "",
    medicOutAt: `${today}T07:30`,
    techCheckAt: `${today}T07:40`,
    taskCustomer: "",
    taskAddress: "",
    taskCargo: "",
    taskDistanceKm: 0,
    taskTons: 0,
    trips: [emptyTrip()],
    notes: "",
  };
}

export default function WaybillsPage() {
  const { currentUser } = useAuth();
  const { vehicles, trailers } = useFleet();
  const { waybills, addWaybill, updateWaybill, deleteWaybill } = useWaybills();
  const canEdit = currentUser ? canManageWaybills(currentUser.role) : false;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WaybillStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [printId, setPrintId] = useState<string | null>(null);
  const [form, setForm] = useState(() => blankForm());
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return waybills.filter((w) => {
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (!q) return true;
      return (
        w.number.toLowerCase().includes(q) ||
        w.series.toLowerCase().includes(q) ||
        w.vehiclePlate.toLowerCase().includes(q) ||
        w.driverName.toLowerCase().includes(q) ||
        w.taskCustomer.toLowerCase().includes(q)
      );
    });
  }, [waybills, query, statusFilter]);

  const stats = useMemo(() => {
    const issued = waybills.filter((w) => w.status === "issued").length;
    const closed = waybills.filter((w) => w.status === "closed").length;
    const mileage = waybills.reduce((s, w) => s + calcMileage(w), 0);
    const fuel = waybills.reduce((s, w) => s + calcFuelUsed(w), 0);
    return { issued, closed, mileage, fuel, total: waybills.length };
  }, [waybills]);

  const printWaybill = waybills.find((w) => w.id === printId) ?? null;

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    const first = vehicles[0];
    setEditingId(null);
    setForm(
      blankForm({
        vehicleId: first?.id,
        vehiclePlate: first?.plate,
        vehicleModel: first?.model,
        driverName: first?.driver ?? currentUser?.name ?? "",
        organization: "ООО «Механик Трак»",
      }),
    );
    setShowForm(true);
    setMessage(null);
  }

  function openEdit(wb: Waybill) {
    setEditingId(wb.id);
    setForm({
      series: wb.series,
      number: wb.number,
      status: wb.status,
      date: wb.date,
      validFrom: wb.validFrom,
      validTo: wb.validTo,
      organization: wb.organization,
      organizationAddress: wb.organizationAddress,
      organizationPhone: wb.organizationPhone,
      okpo: wb.okpo,
      vehicleId: wb.vehicleId,
      vehiclePlate: wb.vehiclePlate,
      vehicleModel: wb.vehicleModel,
      garageNumber: wb.garageNumber,
      trailerId: wb.trailerId,
      trailerPlate: wb.trailerPlate,
      trailerModel: wb.trailerModel,
      driverName: wb.driverName,
      driverLicense: wb.driverLicense,
      driverTabNumber: wb.driverTabNumber,
      column: wb.column,
      brigade: wb.brigade,
      fuelBrand: wb.fuelBrand,
      fuelIssued: wb.fuelIssued,
      fuelDeparture: wb.fuelDeparture,
      fuelReturn: wb.fuelReturn,
      fuelNorm: wb.fuelNorm,
      fuelFact: wb.fuelFact,
      odometerDeparture: wb.odometerDeparture,
      odometerReturn: wb.odometerReturn,
      timeDeparture: wb.timeDeparture,
      timeReturn: wb.timeReturn,
      dispatcherOut: wb.dispatcherOut,
      mechanicOut: wb.mechanicOut,
      medicOut: wb.medicOut,
      medicOutAt: wb.medicOutAt,
      techCheckAt: wb.techCheckAt,
      taskCustomer: wb.taskCustomer,
      taskAddress: wb.taskAddress,
      taskCargo: wb.taskCargo,
      taskDistanceKm: wb.taskDistanceKm,
      taskTons: wb.taskTons,
      trips: wb.trips,
      notes: wb.notes,
    });
    setShowForm(true);
    setPrintId(null);
    setMessage(null);
  }

  function onVehicleChange(vehicleId: string) {
    const v = vehicles.find((x) => x.id === vehicleId);
    if (!v) {
      patch("vehicleId", vehicleId);
      return;
    }
    setForm((prev) => ({
      ...prev,
      vehicleId: v.id,
      vehiclePlate: v.plate,
      vehicleModel: v.model,
      driverName: prev.driverName || v.driver,
      fuelNorm: prev.fuelNorm || v.fuelNorm,
      odometerDeparture: prev.odometerDeparture || v.odometer,
    }));
  }

  function onTrailerChange(trailerId: string) {
    if (!trailerId) {
      setForm((prev) => ({
        ...prev,
        trailerId: "",
        trailerPlate: "",
        trailerModel: "",
      }));
      return;
    }
    const t = trailers.find((x) => x.id === trailerId);
    if (!t) return;
    setForm((prev) => ({
      ...prev,
      trailerId: t.id,
      trailerPlate: t.plate,
      trailerModel: t.model,
    }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (editingId) {
      const res = updateWaybill(editingId, form);
      if (!res.ok) {
        setMessage({ type: "err", text: res.error });
        return;
      }
      setMessage({
        type: "ok",
        text: `Путевой лист ${res.waybill.series}-${res.waybill.number} сохранён`,
      });
      setShowForm(false);
      setPrintId(res.waybill.id);
      return;
    }
    const res = addWaybill(form);
    if (!res.ok) {
      setMessage({ type: "err", text: res.error });
      return;
    }
    setMessage({
      type: "ok",
      text: `Путевой лист ${res.waybill.series}-${res.waybill.number} создан`,
    });
    setShowForm(false);
    setPrintId(res.waybill.id);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="no-print grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">Всего ПЛ</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {stats.total}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">Выдано / закрыто</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {stats.issued} / {stats.closed}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">Пробег по ПЛ</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {formatNumber(stats.mileage, 0)} км
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">Расход ГСМ</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {formatNumber(stats.fuel, 0)} л
          </p>
        </Panel>
      </div>

      {message ? (
        <div
          className={`no-print rounded-[10px] px-3 py-2 text-[12px] ${
            message.type === "ok"
              ? "bg-[var(--success-soft)] text-[var(--success)]"
              : "bg-[var(--danger-soft)] text-[var(--danger)]"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <Panel className="no-print">
        <PanelHeader
          title="Путевые листы · форма № 4-с"
          subtitle="Учёт сдельных путевых листов грузового автомобиля, печать бланка"
          action={
            canEdit ? (
              <Button size="sm" onClick={openCreate}>
                Новый путевой лист
              </Button>
            ) : null
          }
        />

        <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
          {(
            [
              ["all", "Все"],
              ["draft", "Черновики"],
              ["issued", "Выданы"],
              ["closed", "Закрыты"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStatusFilter(id)}
              className={`rounded-[10px] px-3 py-1.5 text-[12px] font-medium ${
                statusFilter === id
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-window)] text-[var(--fg-secondary)]"
              }`}
            >
              {label}
            </button>
          ))}
          <input
            className={`${inputClass} ml-auto mt-0 max-w-xs`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: №, ТС, водитель…"
          />
        </div>

        <DataTable
          headers={[
            "№",
            "Дата",
            "ТС",
            "Водитель",
            "Заказчик",
            "Пробег",
            "ГСМ",
            "Статус",
            "Действия",
          ]}
        >
          {rows.map((wb) => (
            <Tr key={wb.id}>
              <Td className="font-mono text-[12px]">
                {wb.series}-{wb.number}
              </Td>
              <Td>{wb.date}</Td>
              <Td>
                <div className="font-medium">{wb.vehiclePlate}</div>
                <div className="text-[11px] text-[var(--fg-tertiary)]">
                  {wb.vehicleModel}
                </div>
              </Td>
              <Td>{wb.driverName}</Td>
              <Td>{wb.taskCustomer || "—"}</Td>
              <Td>{formatNumber(calcMileage(wb), 0)} км</Td>
              <Td>{formatNumber(calcFuelUsed(wb), 1)} л</Td>
              <Td>
                <Badge tone={waybillStatusTone[wb.status]}>
                  {waybillStatusLabels[wb.status]}
                </Badge>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setPrintId(wb.id);
                      setShowForm(false);
                    }}
                  >
                    Печать
                  </Button>
                  {canEdit ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(wb)}
                      >
                        Изменить
                      </Button>
                      {wb.status !== "closed" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const next =
                              wb.status === "draft" ? "issued" : "closed";
                            const res = updateWaybill(wb.id, { status: next });
                            setMessage(
                              res.ok
                                ? {
                                    type: "ok",
                                    text: `Статус → ${waybillStatusLabels[next]}`,
                                  }
                                : { type: "err", text: res.error },
                            );
                          }}
                        >
                          Статус
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Удалить путевой лист ${wb.series}-${wb.number}?`,
                            )
                          )
                            return;
                          const res = deleteWaybill(wb.id);
                          setMessage(
                            res.ok
                              ? { type: "ok", text: "Удалён" }
                              : { type: "err", text: res.error },
                          );
                          if (printId === wb.id) setPrintId(null);
                        }}
                      >
                        Удалить
                      </Button>
                    </>
                  ) : null}
                </div>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </Panel>

      {showForm && canEdit ? (
        <Panel className="no-print">
          <PanelHeader
            title={editingId ? "Редактирование ПЛ № 4-с" : "Новый путевой лист № 4-с"}
            subtitle="Заполните реквизиты для учёта и печати"
          />
          <form onSubmit={onSubmit} className="space-y-4 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Серия
                <input
                  className={inputClass}
                  value={form.series}
                  onChange={(e) => patch("series", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Номер (пусто = авто)
                <input
                  className={inputClass}
                  value={form.number}
                  onChange={(e) => patch("number", e.target.value)}
                  placeholder="авто"
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Дата *
                <input
                  className={inputClass}
                  type="date"
                  value={form.date}
                  onChange={(e) => patch("date", e.target.value)}
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Статус
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) =>
                    patch("status", e.target.value as WaybillStatus)
                  }
                >
                  <option value="draft">Черновик</option>
                  <option value="issued">Выдан</option>
                  <option value="closed">Закрыт</option>
                </select>
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Действует с
                <input
                  className={inputClass}
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => patch("validFrom", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Действует по
                <input
                  className={inputClass}
                  type="date"
                  value={form.validTo}
                  onChange={(e) => patch("validTo", e.target.value)}
                />
              </label>
            </div>

            <h3 className="text-[13px] font-semibold">Организация</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2">
                Наименование *
                <input
                  className={inputClass}
                  value={form.organization}
                  onChange={(e) => patch("organization", e.target.value)}
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                ОКПО
                <input
                  className={inputClass}
                  value={form.okpo}
                  onChange={(e) => patch("okpo", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2">
                Адрес
                <input
                  className={inputClass}
                  value={form.organizationAddress}
                  onChange={(e) => patch("organizationAddress", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Телефон
                <input
                  className={inputClass}
                  value={form.organizationPhone}
                  onChange={(e) => patch("organizationPhone", e.target.value)}
                />
              </label>
            </div>

            <h3 className="text-[13px] font-semibold">ТС, прицеп, водитель</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Автомобиль *
                <select
                  className={inputClass}
                  value={form.vehicleId}
                  onChange={(e) => onVehicleChange(e.target.value)}
                  required
                >
                  <option value="">Выберите ТС</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} · {v.model}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Гаражный №
                <input
                  className={inputClass}
                  value={form.garageNumber}
                  onChange={(e) => patch("garageNumber", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Прицеп
                <select
                  className={inputClass}
                  value={form.trailerId}
                  onChange={(e) => onTrailerChange(e.target.value)}
                >
                  <option value="">Без прицепа</option>
                  {trailers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.plate} · {t.model}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Водитель *
                <input
                  className={inputClass}
                  value={form.driverName}
                  onChange={(e) => patch("driverName", e.target.value)}
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                ВУ
                <input
                  className={inputClass}
                  value={form.driverLicense}
                  onChange={(e) => patch("driverLicense", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Таб. №
                <input
                  className={inputClass}
                  value={form.driverTabNumber}
                  onChange={(e) => patch("driverTabNumber", e.target.value)}
                />
              </label>
            </div>

            <h3 className="text-[13px] font-semibold">Время, пробег, ГСМ</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Выезд
                <input
                  className={inputClass}
                  type="time"
                  value={form.timeDeparture}
                  onChange={(e) => patch("timeDeparture", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Возврат
                <input
                  className={inputClass}
                  type="time"
                  value={form.timeReturn}
                  onChange={(e) => patch("timeReturn", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Спидометр выезд
                <input
                  className={inputClass}
                  type="number"
                  value={form.odometerDeparture}
                  onChange={(e) =>
                    patch("odometerDeparture", Number(e.target.value) || 0)
                  }
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Спидометр возврат
                <input
                  className={inputClass}
                  type="number"
                  value={form.odometerReturn}
                  onChange={(e) =>
                    patch("odometerReturn", Number(e.target.value) || 0)
                  }
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Марка ГСМ
                <input
                  className={inputClass}
                  value={form.fuelBrand}
                  onChange={(e) => patch("fuelBrand", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Выдано, л
                <input
                  className={inputClass}
                  type="number"
                  value={form.fuelIssued}
                  onChange={(e) =>
                    patch("fuelIssued", Number(e.target.value) || 0)
                  }
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Остаток выезд, л
                <input
                  className={inputClass}
                  type="number"
                  value={form.fuelDeparture}
                  onChange={(e) =>
                    patch("fuelDeparture", Number(e.target.value) || 0)
                  }
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Остаток возврат, л
                <input
                  className={inputClass}
                  type="number"
                  value={form.fuelReturn}
                  onChange={(e) =>
                    patch("fuelReturn", Number(e.target.value) || 0)
                  }
                />
              </label>
            </div>

            <h3 className="text-[13px] font-semibold">Допуски и задание</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Диспетчер
                <input
                  className={inputClass}
                  value={form.dispatcherOut}
                  onChange={(e) => patch("dispatcherOut", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Механик
                <input
                  className={inputClass}
                  value={form.mechanicOut}
                  onChange={(e) => patch("mechanicOut", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Медработник
                <input
                  className={inputClass}
                  value={form.medicOut}
                  onChange={(e) => patch("medicOut", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Медосмотр
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={form.medicOutAt}
                  onChange={(e) => patch("medicOutAt", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Техосмотр
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={form.techCheckAt}
                  onChange={(e) => patch("techCheckAt", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Заказчик
                <input
                  className={inputClass}
                  value={form.taskCustomer}
                  onChange={(e) => patch("taskCustomer", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2">
                Адрес задания
                <input
                  className={inputClass}
                  value={form.taskAddress}
                  onChange={(e) => patch("taskAddress", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Груз
                <input
                  className={inputClass}
                  value={form.taskCargo}
                  onChange={(e) => patch("taskCargo", e.target.value)}
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-semibold">Рейсы (последовательность)</h3>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    trips: [...prev.trips, emptyTrip()],
                  }))
                }
              >
                + рейс
              </Button>
            </div>
            <div className="space-y-2">
              {form.trips.map((trip, index) => (
                <div
                  key={trip.id}
                  className="grid gap-2 rounded-[12px] border border-[var(--border)] p-3 md:grid-cols-4"
                >
                  <input
                    className={inputClass + " mt-0"}
                    placeholder="Заказчик"
                    value={trip.customer}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        trips: prev.trips.map((t, i) =>
                          i === index ? { ...t, customer: e.target.value } : t,
                        ),
                      }))
                    }
                  />
                  <input
                    className={inputClass + " mt-0"}
                    placeholder="Погрузка"
                    value={trip.loadAddress}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        trips: prev.trips.map((t, i) =>
                          i === index
                            ? { ...t, loadAddress: e.target.value }
                            : t,
                        ),
                      }))
                    }
                  />
                  <input
                    className={inputClass + " mt-0"}
                    placeholder="Разгрузка"
                    value={trip.unloadAddress}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        trips: prev.trips.map((t, i) =>
                          i === index
                            ? { ...t, unloadAddress: e.target.value }
                            : t,
                        ),
                      }))
                    }
                  />
                  <input
                    className={inputClass + " mt-0"}
                    placeholder="Груз"
                    value={trip.cargo}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        trips: prev.trips.map((t, i) =>
                          i === index ? { ...t, cargo: e.target.value } : t,
                        ),
                      }))
                    }
                  />
                  <input
                    className={inputClass + " mt-0"}
                    type="number"
                    placeholder="Км"
                    value={trip.distanceKm || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        trips: prev.trips.map((t, i) =>
                          i === index
                            ? { ...t, distanceKm: Number(e.target.value) || 0 }
                            : t,
                        ),
                      }))
                    }
                  />
                  <input
                    className={inputClass + " mt-0"}
                    type="number"
                    placeholder="Тонн"
                    value={trip.weightTons || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        trips: prev.trips.map((t, i) =>
                          i === index
                            ? { ...t, weightTons: Number(e.target.value) || 0 }
                            : t,
                        ),
                      }))
                    }
                  />
                  <input
                    className={inputClass + " mt-0"}
                    type="time"
                    value={trip.departTime}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        trips: prev.trips.map((t, i) =>
                          i === index
                            ? { ...t, departTime: e.target.value }
                            : t,
                        ),
                      }))
                    }
                  />
                  <div className="flex gap-2">
                    <input
                      className={inputClass + " mt-0"}
                      type="time"
                      value={trip.arriveTime}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          trips: prev.trips.map((t, i) =>
                            i === index
                              ? { ...t, arriveTime: e.target.value }
                              : t,
                          ),
                        }))
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          trips:
                            prev.trips.length === 1
                              ? [emptyTrip()]
                              : prev.trips.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Особые отметки
              <textarea
                className={`${inputClass} h-20 py-2`}
                value={form.notes}
                onChange={(e) => patch("notes", e.target.value)}
              />
            </label>

            <div className="flex gap-2">
              <Button type="submit" size="sm">
                {editingId ? "Сохранить" : "Создать путевой лист"}
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
        </Panel>
      ) : null}

      {printWaybill ? (
        <div className="space-y-3">
          <Panel className="no-print">
            <PanelHeader
              title={`Печать · ${printWaybill.series}-${printWaybill.number}`}
              subtitle="Форма № 4-с · откроется диалог печати браузера (можно сохранить в PDF)"
              action={
                <div className="flex gap-2">
                  <Button size="sm" onClick={handlePrint}>
                    <Printer size={14} className="mr-1.5" />
                    Печать
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPrintId(null)}
                  >
                    Закрыть
                  </Button>
                </div>
              }
            />
          </Panel>
          <div className="waybill-print-root overflow-auto rounded-[14px] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
            <WaybillPrintForm waybill={printWaybill} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
