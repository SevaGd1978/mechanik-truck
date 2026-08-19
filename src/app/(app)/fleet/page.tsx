"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleet } from "@/components/fleet-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import type { VehicleStatus } from "@/lib/data";
import {
  canManageFleet,
  TrailerStatus,
  trailerTypes,
  vehicleTypes,
} from "@/lib/fleet";
import { formatNumber } from "@/lib/utils";

const statusMap = {
  active: { label: "В работе", tone: "success" as const },
  service: { label: "Сервис", tone: "accent" as const },
  idle: { label: "Простой", tone: "neutral" as const },
  alert: { label: "Внимание", tone: "danger" as const },
};

const trailerStatusMap = {
  free: { label: "Свободен", tone: "success" as const },
  coupled: { label: "Сцеплен", tone: "accent" as const },
  service: { label: "Сервис", tone: "warning" as const },
  repair: { label: "Ремонт", tone: "danger" as const },
};

const inputClass =
  "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]";

export default function FleetPage() {
  const { currentUser } = useAuth();
  const {
    vehicles,
    trailers,
    addVehicle,
    deleteVehicle,
    addTrailer,
    deleteTrailer,
  } = useFleet();

  const canEdit = currentUser ? canManageFleet(currentUser.role) : false;
  const [tab, setTab] = useState<"vehicles" | "trailers">("vehicles");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showTrailerForm, setShowTrailerForm] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [vPlate, setVPlate] = useState("");
  const [vModel, setVModel] = useState("");
  const [vType, setVType] = useState<string>(vehicleTypes[0]);
  const [vDriver, setVDriver] = useState("");
  const [vOdometer, setVOdometer] = useState("0");
  const [vCost, setVCost] = useState("25");
  const [vFuel, setVFuel] = useState("20");
  const [vService, setVService] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [vStatus, setVStatus] = useState<VehicleStatus>("active");

  const [tPlate, setTPlate] = useState("");
  const [tModel, setTModel] = useState("");
  const [tType, setTType] = useState<string>(trailerTypes[0]);
  const [tCapacity, setTCapacity] = useState("20");
  const [tCoupled, setTCoupled] = useState("");
  const [tService, setTService] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [tStatus, setTStatus] = useState<TrailerStatus>("free");

  const vehicleRows = useMemo(() => {
    return vehicles.filter((v) => {
      const matchFilter = filter === "all" || v.status === filter;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        v.plate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [vehicles, filter, query]);

  const trailerRows = useMemo(() => {
    return trailers.filter((t) => {
      const q = query.toLowerCase();
      return (
        !q ||
        t.plate.toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.coupledTo.toLowerCase().includes(q)
      );
    });
  }, [trailers, query]);

  function onAddVehicle(e: FormEvent) {
    e.preventDefault();
    const result = addVehicle({
      plate: vPlate,
      model: vModel,
      type: vType,
      driver: vDriver,
      odometer: Number(vOdometer) || 0,
      costPerKm: Number(vCost) || 0,
      fuelNorm: Number(vFuel) || 0,
      nextService: vService,
      status: vStatus,
    });
    if (!result.ok) {
      setMessage({ type: "err", text: result.error });
      return;
    }
    setMessage({
      type: "ok",
      text: `Машина ${result.vehicle.plate} добавлена в автопарк`,
    });
    setVPlate("");
    setVModel("");
    setVDriver("");
    setVOdometer("0");
    setShowVehicleForm(false);
  }

  function onAddTrailer(e: FormEvent) {
    e.preventDefault();
    const result = addTrailer({
      plate: tPlate,
      model: tModel,
      type: tType,
      capacityTons: Number(tCapacity) || 0,
      coupledTo: tCoupled,
      nextService: tService,
      status: tCoupled.trim() ? "coupled" : tStatus,
    });
    if (!result.ok) {
      setMessage({ type: "err", text: result.error });
      return;
    }
    setMessage({
      type: "ok",
      text: `Прицеп ${result.trailer.plate} добавлен в автопарк`,
    });
    setTPlate("");
    setTModel("");
    setTCoupled("");
    setTCapacity("20");
    setShowTrailerForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={tab}
          onChange={(v) => {
            setTab(v as "vehicles" | "trailers");
            setMessage(null);
          }}
          options={[
            { label: `Машины (${vehicles.length})`, value: "vehicles" },
            { label: `Прицепы (${trailers.length})`, value: "trailers" },
          ]}
        />
        {canEdit ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tab === "vehicles" ? "primary" : "secondary"}
              onClick={() => {
                setTab("vehicles");
                setShowVehicleForm(true);
                setShowTrailerForm(false);
              }}
            >
              Добавить машину
            </Button>
            <Button
              size="sm"
              variant={tab === "trailers" ? "primary" : "secondary"}
              onClick={() => {
                setTab("trailers");
                setShowTrailerForm(true);
                setShowVehicleForm(false);
              }}
            >
              Добавить прицеп
            </Button>
          </div>
        ) : (
          <p className="text-[12px] text-[var(--fg-tertiary)]">
            Добавление доступно менеджеру и администратору
          </p>
        )}
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

      {tab === "vehicles" ? (
        <Panel>
          <PanelHeader
            title="Транспортные средства"
            subtitle={`${vehicleRows.length} из ${vehicles.length}`}
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
                    { label: "В работе", value: "active" },
                    { label: "Сервис", value: "service" },
                    { label: "Алерты", value: "alert" },
                  ]}
                />
              </div>
            }
          />

          {showVehicleForm && canEdit ? (
            <form
              onSubmit={onAddVehicle}
              className="m-4 grid gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--bg-window)] p-4 md:grid-cols-2 xl:grid-cols-3"
            >
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Госномер *
                <input
                  className={inputClass}
                  value={vPlate}
                  onChange={(e) => setVPlate(e.target.value)}
                  placeholder="А123ВС 77"
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Модель *
                <input
                  className={inputClass}
                  value={vModel}
                  onChange={(e) => setVModel(e.target.value)}
                  placeholder="КамАЗ 5490"
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Тип
                <select
                  className={inputClass}
                  value={vType}
                  onChange={(e) => setVType(e.target.value)}
                >
                  {vehicleTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Водитель
                <input
                  className={inputClass}
                  value={vDriver}
                  onChange={(e) => setVDriver(e.target.value)}
                  placeholder="Иванов П."
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Пробег, км
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  value={vOdometer}
                  onChange={(e) => setVOdometer(e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Стоимость 1 км, ₽
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step={0.1}
                  value={vCost}
                  onChange={(e) => setVCost(e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Норма расхода, л/100км
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step={0.1}
                  value={vFuel}
                  onChange={(e) => setVFuel(e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Следующее ТО
                <input
                  className={inputClass}
                  type="date"
                  value={vService}
                  onChange={(e) => setVService(e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Статус
                <select
                  className={inputClass}
                  value={vStatus}
                  onChange={(e) => setVStatus(e.target.value as VehicleStatus)}
                >
                  <option value="active">В работе</option>
                  <option value="idle">Простой</option>
                  <option value="service">Сервис</option>
                  <option value="alert">Внимание</option>
                </select>
              </label>
              <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
                <Button type="submit" size="sm">
                  Сохранить машину
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowVehicleForm(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          ) : null}

          <DataTable
            headers={[
              "Госномер",
              "Модель",
              "Тип",
              "Водитель",
              "Пробег",
              "1 км",
              "ТО",
              "Статус",
              ...(canEdit ? ["Действия"] : []),
            ]}
          >
            {vehicleRows.map((v) => (
              <Tr key={v.id}>
                <Td className="font-medium">{v.plate}</Td>
                <Td>{v.model}</Td>
                <Td className="text-[var(--fg-secondary)]">{v.type}</Td>
                <Td>{v.driver}</Td>
                <Td className="font-mono text-[12px]">
                  {formatNumber(v.odometer, 0)} км
                </Td>
                <Td>{formatNumber(v.costPerKm)} ₽</Td>
                <Td className="text-[var(--fg-secondary)]">{v.nextService}</Td>
                <Td>
                  <Badge tone={statusMap[v.status].tone}>
                    {statusMap[v.status].label}
                  </Badge>
                </Td>
                {canEdit ? (
                  <Td>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (!window.confirm(`Удалить ${v.plate}?`)) return;
                        const res = deleteVehicle(v.id);
                        setMessage(
                          res.ok
                            ? { type: "ok", text: "Машина удалена" }
                            : { type: "err", text: res.error },
                        );
                      }}
                    >
                      Удалить
                    </Button>
                  </Td>
                ) : null}
              </Tr>
            ))}
          </DataTable>
        </Panel>
      ) : (
        <Panel>
          <PanelHeader
            title="Прицепы"
            subtitle={`${trailerRows.length} из ${trailers.length}`}
            action={
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск…"
                className="h-8 w-40 rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[12px] outline-none focus:border-[var(--accent)]"
              />
            }
          />

          {showTrailerForm && canEdit ? (
            <form
              onSubmit={onAddTrailer}
              className="m-4 grid gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--bg-window)] p-4 md:grid-cols-2 xl:grid-cols-3"
            >
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Госномер *
                <input
                  className={inputClass}
                  value={tPlate}
                  onChange={(e) => setTPlate(e.target.value)}
                  placeholder="АА1234 77"
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Модель *
                <input
                  className={inputClass}
                  value={tModel}
                  onChange={(e) => setTModel(e.target.value)}
                  placeholder="Schmitz Cargobull"
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Тип
                <select
                  className={inputClass}
                  value={tType}
                  onChange={(e) => setTType(e.target.value)}
                >
                  {trailerTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Грузоподъёмность, т
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step={0.1}
                  value={tCapacity}
                  onChange={(e) => setTCapacity(e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Сцеплен с ТС
                <select
                  className={inputClass}
                  value={tCoupled}
                  onChange={(e) => {
                    setTCoupled(e.target.value);
                    if (e.target.value) setTStatus("coupled");
                    else setTStatus("free");
                  }}
                >
                  <option value="">Не сцеплен</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plate}>
                      {v.plate} · {v.model}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Следующее ТО
                <input
                  className={inputClass}
                  type="date"
                  value={tService}
                  onChange={(e) => setTService(e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Статус
                <select
                  className={inputClass}
                  value={tStatus}
                  onChange={(e) => setTStatus(e.target.value as TrailerStatus)}
                >
                  <option value="free">Свободен</option>
                  <option value="coupled">Сцеплен</option>
                  <option value="service">Сервис</option>
                  <option value="repair">Ремонт</option>
                </select>
              </label>
              <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
                <Button type="submit" size="sm">
                  Сохранить прицеп
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTrailerForm(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          ) : null}

          <DataTable
            headers={[
              "Госномер",
              "Модель",
              "Тип",
              "Грузоподъёмность",
              "Сцеплен с",
              "ТО",
              "Статус",
              ...(canEdit ? ["Действия"] : []),
            ]}
          >
            {trailerRows.map((t) => (
              <Tr key={t.id}>
                <Td className="font-medium">{t.plate}</Td>
                <Td>{t.model}</Td>
                <Td className="text-[var(--fg-secondary)]">{t.type}</Td>
                <Td>{formatNumber(t.capacityTons, 1)} т</Td>
                <Td className="text-[var(--fg-secondary)]">
                  {t.coupledTo || "—"}
                </Td>
                <Td className="text-[var(--fg-secondary)]">{t.nextService}</Td>
                <Td>
                  <Badge tone={trailerStatusMap[t.status].tone}>
                    {trailerStatusMap[t.status].label}
                  </Badge>
                </Td>
                {canEdit ? (
                  <Td>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (!window.confirm(`Удалить прицеп ${t.plate}?`))
                          return;
                        const res = deleteTrailer(t.id);
                        setMessage(
                          res.ok
                            ? { type: "ok", text: "Прицеп удалён" }
                            : { type: "err", text: res.error },
                        );
                      }}
                    >
                      Удалить
                    </Button>
                  </Td>
                ) : null}
              </Tr>
            ))}
          </DataTable>
        </Panel>
      )}
    </div>
  );
}
