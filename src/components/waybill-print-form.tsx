"use client";

import type { Waybill } from "@/lib/waybills";
import {
  calcFuelUsed,
  calcMileage,
  waybillStatusLabels,
} from "@/lib/waybills";
import { formatNumber } from "@/lib/utils";

function Cell({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[9px] uppercase tracking-wide text-black/55">
        {label}
      </div>
      <div className="min-h-[16px] border-b border-black/40 text-[12px] font-medium leading-tight">
        {value === null || value === undefined || value === ""
          ? "\u00A0"
          : String(value)}
      </div>
    </div>
  );
}

export function WaybillPrintForm({ waybill }: { waybill: Waybill }) {
  const mileage = calcMileage(waybill);
  const fuelUsed = calcFuelUsed(waybill);
  const totalTons = waybill.trips.reduce((s, t) => s + (t.weightTons || 0), 0);
  const totalDistance = waybill.trips.reduce(
    (s, t) => s + (t.distanceKm || 0),
    0,
  );

  return (
    <div className="waybill-print mx-auto max-w-[210mm] bg-white p-4 text-black">
      <div className="mb-2 flex items-start justify-between gap-4 border-b border-black pb-2">
        <div className="text-[10px] leading-tight">
          <div>Типовая межотраслевая форма № 4-с</div>
          <div>Утв. постановлением Госкомстата РФ от 28.11.1997 № 78</div>
          <div className="mt-1">ОКПО: {waybill.okpo || "________"}</div>
        </div>
        <div className="text-center">
          <div className="text-[16px] font-bold tracking-tight">
            ПУТЕВОЙ ЛИСТ
          </div>
          <div className="text-[13px] font-semibold">
            грузового автомобиля (сдельный)
          </div>
          <div className="mt-1 text-[14px] font-bold">
            Серия {waybill.series} № {waybill.number}
          </div>
        </div>
        <div className="w-[140px] text-right text-[11px]">
          <div>Дата: {waybill.date}</div>
          <div>
            Срок: {waybill.validFrom}
            {waybill.validTo && waybill.validTo !== waybill.validFrom
              ? ` — ${waybill.validTo}`
              : ""}
          </div>
          <div className="mt-1">Статус: {waybillStatusLabels[waybill.status]}</div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <Cell label="Организация" value={waybill.organization} className="col-span-2" />
        <Cell label="Телефон" value={waybill.organizationPhone} />
        <Cell
          label="Адрес организации"
          value={waybill.organizationAddress}
          className="col-span-3"
        />
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase">
        Автомобиль и прицеп
      </div>
      <div className="mb-3 grid grid-cols-4 gap-2">
        <Cell label="Марка / модель" value={waybill.vehicleModel} />
        <Cell label="Гос. номер" value={waybill.vehiclePlate} />
        <Cell label="Гаражный №" value={waybill.garageNumber} />
        <Cell label="Колонна / бригада" value={`${waybill.column} / ${waybill.brigade}`} />
        <Cell label="Прицеп (модель)" value={waybill.trailerModel || "—"} />
        <Cell label="Прицеп (номер)" value={waybill.trailerPlate || "—"} />
        <Cell label="Водитель" value={waybill.driverName} className="col-span-2" />
        <Cell label="Удостоверение" value={waybill.driverLicense} />
        <Cell label="Таб. №" value={waybill.driverTabNumber} />
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase">
        Работа водителя и автомобиля
      </div>
      <div className="mb-3 grid grid-cols-4 gap-2">
        <Cell label="Выезд (время)" value={waybill.timeDeparture} />
        <Cell label="Возврат (время)" value={waybill.timeReturn} />
        <Cell label="Спидометр выезд" value={formatNumber(waybill.odometerDeparture, 0)} />
        <Cell label="Спидометр возврат" value={formatNumber(waybill.odometerReturn, 0)} />
        <Cell label="Пробег, км" value={formatNumber(mileage, 0)} />
        <Cell label="Диспетчер (выезд)" value={waybill.dispatcherOut} />
        <Cell label="Механик (выезд)" value={waybill.mechanicOut} />
        <Cell label="Медосмотр" value={waybill.medicOut} />
        <Cell label="Медосмотр (дата/время)" value={waybill.medicOutAt?.replace("T", " ")} />
        <Cell label="Техосмотр (дата/время)" value={waybill.techCheckAt?.replace("T", " ")} />
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase">Движение горючего</div>
      <div className="mb-3 grid grid-cols-6 gap-2">
        <Cell label="Марка ГСМ" value={waybill.fuelBrand} />
        <Cell label="Выдано, л" value={formatNumber(waybill.fuelIssued, 1)} />
        <Cell label="Остаток выезд, л" value={formatNumber(waybill.fuelDeparture, 1)} />
        <Cell label="Остаток возврат, л" value={formatNumber(waybill.fuelReturn, 1)} />
        <Cell label="Норма, л/100км" value={formatNumber(waybill.fuelNorm, 1)} />
        <Cell label="Расход факт, л" value={formatNumber(fuelUsed || waybill.fuelFact, 1)} />
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase">Задание водителю</div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Cell label="Заказчик" value={waybill.taskCustomer} />
        <Cell label="Адрес" value={waybill.taskAddress} className="col-span-2" />
        <Cell label="Груз" value={waybill.taskCargo} />
        <Cell label="Расстояние, км" value={formatNumber(waybill.taskDistanceKm, 0)} />
        <Cell label="Тонн" value={formatNumber(waybill.taskTons, 1)} />
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase">
        Последовательность выполнения задания
      </div>
      <table className="mb-3 w-full border-collapse text-[10px]">
        <thead>
          <tr className="border border-black bg-black/[0.04]">
            <th className="border border-black px-1 py-1 text-left">№</th>
            <th className="border border-black px-1 py-1 text-left">Заказчик</th>
            <th className="border border-black px-1 py-1 text-left">Погрузка</th>
            <th className="border border-black px-1 py-1 text-left">Разгрузка</th>
            <th className="border border-black px-1 py-1 text-left">Груз</th>
            <th className="border border-black px-1 py-1 text-right">Км</th>
            <th className="border border-black px-1 py-1 text-right">Т</th>
            <th className="border border-black px-1 py-1 text-left">Время</th>
          </tr>
        </thead>
        <tbody>
          {(waybill.trips.length ? waybill.trips : [{ id: "empty" } as const]).map(
            (trip, idx) => {
              if (!("customer" in trip)) {
                return (
                  <tr key="empty">
                    <td className="border border-black px-1 py-2" colSpan={8}>
                      &nbsp;
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={trip.id}>
                  <td className="border border-black px-1 py-1">{idx + 1}</td>
                  <td className="border border-black px-1 py-1">{trip.customer}</td>
                  <td className="border border-black px-1 py-1">{trip.loadAddress}</td>
                  <td className="border border-black px-1 py-1">{trip.unloadAddress}</td>
                  <td className="border border-black px-1 py-1">{trip.cargo}</td>
                  <td className="border border-black px-1 py-1 text-right">
                    {formatNumber(trip.distanceKm, 0)}
                  </td>
                  <td className="border border-black px-1 py-1 text-right">
                    {formatNumber(trip.weightTons, 1)}
                  </td>
                  <td className="border border-black px-1 py-1">
                    {trip.departTime}–{trip.arriveTime}
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>

      <div className="mb-2 text-[11px] font-bold uppercase">
        Результаты работы автомобиля и прицепов
      </div>
      <div className="mb-3 grid grid-cols-4 gap-2">
        <Cell label="Пробег общий, км" value={formatNumber(mileage || totalDistance, 0)} />
        <Cell label="Перевезено, т" value={formatNumber(totalTons || waybill.taskTons, 1)} />
        <Cell label="Выполнено, т·км" value={formatNumber((totalTons || waybill.taskTons) * (mileage || totalDistance || waybill.taskDistanceKm), 0)} />
        <Cell label="Расход ГСМ, л" value={formatNumber(fuelUsed || waybill.fuelFact, 1)} />
      </div>

      {waybill.notes ? (
        <div className="mb-3 text-[11px]">
          <span className="font-semibold">Особые отметки: </span>
          {waybill.notes}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-6 text-[11px]">
        <div>
          Сдал водитель ________________
          <div className="mt-1 text-black/50">{waybill.driverName}</div>
        </div>
        <div>
          Принял диспетчер ________________
          <div className="mt-1 text-black/50">{waybill.dispatcherOut}</div>
        </div>
        <div>
          Механик ________________
          <div className="mt-1 text-black/50">{waybill.mechanicOut}</div>
        </div>
      </div>
    </div>
  );
}
