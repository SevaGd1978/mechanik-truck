"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useDrivers } from "@/components/drivers-provider";
import { useFleet } from "@/components/fleet-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import {
  canManageDrivers,
  Driver,
  DriverInput,
  DriverStatus,
  driverFullName,
  driverStatusLabels,
  driverStatusTone,
  formatLicense,
  formatPassport,
  licenseCategoryOptions,
} from "@/lib/drivers";

const inputClass =
  "mt-1.5 h-10 w-full rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-input)] px-3 text-[13px] outline-none focus:border-[var(--accent)]";

function blankForm(): DriverInput {
  const today = new Date().toISOString().slice(0, 10);
  return {
    lastName: "",
    firstName: "",
    middleName: "",
    phone: "",
    tabNumber: "",
    snils: "",
    status: "active",
    hiredAt: today,
    passportSeries: "",
    passportNumber: "",
    passportIssuedBy: "",
    passportIssuedAt: "",
    passportDeptCode: "",
    birthDate: "",
    birthPlace: "",
    registrationAddress: "",
    licenseSeries: "",
    licenseNumber: "",
    licenseCategories: "C, CE",
    licenseIssuedAt: "",
    licenseExpiresAt: "",
    licenseIssuedBy: "",
    vehicleId: "",
    notes: "",
  };
}

export default function DriversPage() {
  const { currentUser } = useAuth();
  const { drivers, addDriver, updateDriver, deleteDriver } = useDrivers();
  const { vehicles } = useFleet();
  const canEdit = currentUser ? canManageDrivers(currentUser.role) : false;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DriverStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<DriverInput>(blankForm);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drivers.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        driverFullName(d),
        d.phone,
        d.tabNumber,
        d.passportSeries,
        d.passportNumber,
        d.licenseSeries,
        d.licenseNumber,
        d.licenseCategories,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [drivers, query, statusFilter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const in90 = new Date();
    in90.setDate(in90.getDate() + 90);
    const limit = in90.toISOString().slice(0, 10);
    return {
      total: drivers.length,
      active: drivers.filter((d) => d.status === "active").length,
      docsOk: drivers.filter(
        (d) =>
          d.passportNumber &&
          d.licenseNumber &&
          (!d.licenseExpiresAt || d.licenseExpiresAt >= today),
      ).length,
      expiring: drivers.filter(
        (d) =>
          d.licenseExpiresAt &&
          d.licenseExpiresAt >= today &&
          d.licenseExpiresAt < limit,
      ).length,
    };
  }, [drivers]);

  function patch<K extends keyof DriverInput>(key: K, value: DriverInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(cat: string) {
    const parts = form.licenseCategories
      .split(/[,;\s]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    const has = parts.includes(cat);
    const next = has ? parts.filter((x) => x !== cat) : [...parts, cat];
    patch("licenseCategories", next.join(", "));
  }

  function openCreate() {
    setEditingId(null);
    setForm(blankForm());
    setShowForm(true);
    setMessage(null);
  }

  function openEdit(d: Driver) {
    setEditingId(d.id);
    setForm({
      lastName: d.lastName,
      firstName: d.firstName,
      middleName: d.middleName,
      phone: d.phone,
      tabNumber: d.tabNumber,
      snils: d.snils,
      status: d.status,
      hiredAt: d.hiredAt,
      passportSeries: d.passportSeries,
      passportNumber: d.passportNumber,
      passportIssuedBy: d.passportIssuedBy,
      passportIssuedAt: d.passportIssuedAt,
      passportDeptCode: d.passportDeptCode,
      birthDate: d.birthDate,
      birthPlace: d.birthPlace,
      registrationAddress: d.registrationAddress,
      licenseSeries: d.licenseSeries,
      licenseNumber: d.licenseNumber,
      licenseCategories: d.licenseCategories,
      licenseIssuedAt: d.licenseIssuedAt,
      licenseExpiresAt: d.licenseExpiresAt,
      licenseIssuedBy: d.licenseIssuedBy,
      vehicleId: d.vehicleId,
      notes: d.notes,
    });
    setShowForm(true);
    setMessage(null);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (editingId) {
      const res = updateDriver(editingId, form);
      if (!res.ok) {
        setMessage({ type: "err", text: res.error });
        return;
      }
      setMessage({
        type: "ok",
        text: `Данные водителя «${driverFullName(res.driver)}» сохранены`,
      });
      setShowForm(false);
      return;
    }
    const res = addDriver(form);
    if (!res.ok) {
      setMessage({ type: "err", text: res.error });
      return;
    }
    setMessage({
      type: "ok",
      text: `Водитель «${driverFullName(res.driver)}» добавлен`,
    });
    setShowForm(false);
  }

  const expanded = drivers.find((d) => d.id === expandedId) ?? null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">Водителей</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {stats.total}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">В работе</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight text-[var(--success)]">
            {stats.active}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">Документы заполнены</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight">
            {stats.docsOk}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[12px] text-[var(--fg-secondary)]">ВУ скоро истекает</p>
          <p className="mt-1 text-[24px] font-semibold tracking-tight text-[var(--warning)]">
            {stats.expiring}
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
          title="Водители"
          subtitle="Паспорт и водительское удостоверение"
          action={
            canEdit ? (
              <Button size="sm" onClick={openCreate}>
                Добавить водителя
              </Button>
            ) : null
          }
        />

        <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
          {(
            [
              ["all", "Все"],
              ["active", "Работают"],
              ["vacation", "Отпуск"],
              ["sick", "Больничный"],
              ["fired", "Уволены"],
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
            placeholder="Поиск: ФИО, паспорт, ВУ…"
          />
        </div>

        <DataTable
          headers={[
            "ФИО",
            "Таб. №",
            "Телефон",
            "Паспорт",
            "ВУ",
            "Статус",
            "Действия",
          ]}
        >
          {rows.map((d) => (
            <Tr key={d.id}>
              <Td>
                <div className="font-medium">{driverFullName(d)}</div>
                <div className="text-[11px] text-[var(--fg-tertiary)]">
                  {d.birthDate ? `рожд. ${d.birthDate}` : "—"}
                </div>
              </Td>
              <Td className="font-mono text-[12px]">{d.tabNumber || "—"}</Td>
              <Td>{d.phone || "—"}</Td>
              <Td className="font-mono text-[12px]">{formatPassport(d)}</Td>
              <Td>
                <div className="font-mono text-[12px]">
                  {`${d.licenseSeries} ${d.licenseNumber}`.trim() || "—"}
                </div>
                <div className="text-[11px] text-[var(--fg-tertiary)]">
                  кат. {d.licenseCategories || "—"}
                  {d.licenseExpiresAt ? ` · до ${d.licenseExpiresAt}` : ""}
                </div>
              </Td>
              <Td>
                <Badge tone={driverStatusTone[d.status]}>
                  {driverStatusLabels[d.status]}
                </Badge>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setExpandedId((id) => (id === d.id ? null : d.id))
                    }
                  >
                    {expandedId === d.id ? "Скрыть" : "Документы"}
                  </Button>
                  {canEdit ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(d)}
                      >
                        Изменить
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Удалить водителя «${driverFullName(d)}»?`,
                            )
                          )
                            return;
                          const res = deleteDriver(d.id);
                          setMessage(
                            res.ok
                              ? { type: "ok", text: "Водитель удалён" }
                              : { type: "err", text: res.error },
                          );
                          if (expandedId === d.id) setExpandedId(null);
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

      {expanded ? (
        <Panel>
          <PanelHeader
            title={`Документы · ${driverFullName(expanded)}`}
            subtitle="Паспорт РФ и водительское удостоверение"
          />
          <div className="grid gap-3 p-4 md:grid-cols-2">
            <div className="rounded-[14px] border border-[var(--border)] p-4">
              <h3 className="text-[13px] font-semibold">Паспорт</h3>
              <dl className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--fg-secondary)]">Серия / номер</dt>
                  <dd className="font-mono font-medium">
                    {formatPassport(expanded)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--fg-secondary)]">Код подразделения</dt>
                  <dd>{expanded.passportDeptCode || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--fg-secondary)]">Дата выдачи</dt>
                  <dd>{expanded.passportIssuedAt || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--fg-secondary)]">Кем выдан</dt>
                  <dd className="mt-1">{expanded.passportIssuedBy || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--fg-secondary)]">Место рождения</dt>
                  <dd className="mt-1">{expanded.birthPlace || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--fg-secondary)]">Адрес регистрации</dt>
                  <dd className="mt-1">
                    {expanded.registrationAddress || "—"}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-[14px] border border-[var(--border)] p-4">
              <h3 className="text-[13px] font-semibold">
                Водительское удостоверение
              </h3>
              <dl className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--fg-secondary)]">Серия / номер</dt>
                  <dd className="font-mono font-medium">
                    {formatLicense(expanded)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--fg-secondary)]">Категории</dt>
                  <dd className="font-medium">
                    {expanded.licenseCategories || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--fg-secondary)]">Выдано</dt>
                  <dd>{expanded.licenseIssuedAt || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--fg-secondary)]">Действует до</dt>
                  <dd>{expanded.licenseExpiresAt || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--fg-secondary)]">Кем выдано</dt>
                  <dd className="mt-1">{expanded.licenseIssuedBy || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--fg-secondary)]">СНИЛС</dt>
                  <dd>{expanded.snils || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--fg-secondary)]">ТС</dt>
                  <dd>
                    {vehicles.find((v) => v.id === expanded.vehicleId)?.plate ||
                      "Не назначен"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Panel>
      ) : null}

      {showForm && canEdit ? (
        <Panel>
          <PanelHeader
            title={editingId ? "Редактирование водителя" : "Новый водитель"}
            subtitle="Обязательны паспорт и водительское удостоверение"
          />
          <form onSubmit={onSubmit} className="space-y-4 p-4">
            <h3 className="text-[13px] font-semibold">Личные данные</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Фамилия *
                <input
                  className={inputClass}
                  value={form.lastName}
                  onChange={(e) => patch("lastName", e.target.value)}
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Имя *
                <input
                  className={inputClass}
                  value={form.firstName}
                  onChange={(e) => patch("firstName", e.target.value)}
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Отчество
                <input
                  className={inputClass}
                  value={form.middleName}
                  onChange={(e) => patch("middleName", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Телефон
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  placeholder="+7…"
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Табельный №
                <input
                  className={inputClass}
                  value={form.tabNumber}
                  onChange={(e) => patch("tabNumber", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                СНИЛС
                <input
                  className={inputClass}
                  value={form.snils}
                  onChange={(e) => patch("snils", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Дата рождения
                <input
                  className={inputClass}
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => patch("birthDate", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Дата приёма
                <input
                  className={inputClass}
                  type="date"
                  value={form.hiredAt}
                  onChange={(e) => patch("hiredAt", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Статус
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) =>
                    patch("status", e.target.value as DriverStatus)
                  }
                >
                  <option value="active">Работает</option>
                  <option value="vacation">Отпуск</option>
                  <option value="sick">Больничный</option>
                  <option value="fired">Уволен</option>
                </select>
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2">
                Место рождения
                <input
                  className={inputClass}
                  value={form.birthPlace}
                  onChange={(e) => patch("birthPlace", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Назначенное ТС
                <select
                  className={inputClass}
                  value={form.vehicleId}
                  onChange={(e) => patch("vehicleId", e.target.value)}
                >
                  <option value="">Не назначен</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} · {v.model}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <h3 className="text-[13px] font-semibold">Паспорт</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Серия *
                <input
                  className={inputClass}
                  value={form.passportSeries}
                  onChange={(e) => patch("passportSeries", e.target.value)}
                  placeholder="4510"
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Номер *
                <input
                  className={inputClass}
                  value={form.passportNumber}
                  onChange={(e) => patch("passportNumber", e.target.value)}
                  placeholder="123456"
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Код подразделения
                <input
                  className={inputClass}
                  value={form.passportDeptCode}
                  onChange={(e) => patch("passportDeptCode", e.target.value)}
                  placeholder="770-001"
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Дата выдачи
                <input
                  className={inputClass}
                  type="date"
                  value={form.passportIssuedAt}
                  onChange={(e) => patch("passportIssuedAt", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2">
                Кем выдан
                <input
                  className={inputClass}
                  value={form.passportIssuedBy}
                  onChange={(e) => patch("passportIssuedBy", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)] md:col-span-2 xl:col-span-3">
                Адрес регистрации
                <input
                  className={inputClass}
                  value={form.registrationAddress}
                  onChange={(e) =>
                    patch("registrationAddress", e.target.value)
                  }
                />
              </label>
            </div>

            <h3 className="text-[13px] font-semibold">
              Водительское удостоверение
            </h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Серия *
                <input
                  className={inputClass}
                  value={form.licenseSeries}
                  onChange={(e) => patch("licenseSeries", e.target.value)}
                  placeholder="77 АА"
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Номер *
                <input
                  className={inputClass}
                  value={form.licenseNumber}
                  onChange={(e) => patch("licenseNumber", e.target.value)}
                  placeholder="123456"
                  required
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Кем выдано
                <input
                  className={inputClass}
                  value={form.licenseIssuedBy}
                  onChange={(e) => patch("licenseIssuedBy", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Дата выдачи
                <input
                  className={inputClass}
                  type="date"
                  value={form.licenseIssuedAt}
                  onChange={(e) => patch("licenseIssuedAt", e.target.value)}
                />
              </label>
              <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
                Действует до
                <input
                  className={inputClass}
                  type="date"
                  value={form.licenseExpiresAt}
                  onChange={(e) => patch("licenseExpiresAt", e.target.value)}
                />
              </label>
              <div className="md:col-span-2 xl:col-span-3">
                <p className="text-[12px] font-medium text-[var(--fg-secondary)]">
                  Категории *
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {licenseCategoryOptions.map((cat) => {
                    const active = form.licenseCategories
                      .split(/[,;\s]+/)
                      .includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`rounded-[10px] px-3 py-1.5 text-[12px] font-medium ${
                          active
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--bg-window)] text-[var(--fg-secondary)]"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <input
                  className={inputClass}
                  value={form.licenseCategories}
                  onChange={(e) => patch("licenseCategories", e.target.value)}
                  placeholder="C, CE"
                  required
                />
              </div>
            </div>

            <label className="block text-[12px] font-medium text-[var(--fg-secondary)]">
              Примечание
              <textarea
                className={`${inputClass} h-20 py-2`}
                value={form.notes}
                onChange={(e) => patch("notes", e.target.value)}
              />
            </label>

            <div className="flex gap-2">
              <Button type="submit" size="sm">
                {editingId ? "Сохранить" : "Добавить водителя"}
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
    </div>
  );
}
