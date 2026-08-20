"use client";

import { useMemo, useState } from "react";
import { FileBarChart2, FileSpreadsheet, FileText } from "lucide-react";
import { useFleet } from "@/components/fleet-provider";
import { useService } from "@/components/service-provider";
import { useWarehouse } from "@/components/warehouse-provider";
import { useTires } from "@/components/tires-provider";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { DataTable, Td, Tr } from "@/components/ui/data-table";
import { downloadExcel, downloadPdf } from "@/lib/export-report";
import {
  buildReport,
  REPORT_DEFINITIONS,
  type ReportId,
} from "@/lib/reports";
import { formatCurrency, formatNumber } from "@/lib/utils";

function formatCell(key: string, value: string | number) {
  if (typeof value !== "number") return String(value);
  if (
    key.toLowerCase().includes("cost") ||
    key === "price" ||
    key === "sum" ||
    key === "totalCost" ||
    key === "laborCost" ||
    key === "partsCost"
  ) {
    return formatCurrency(value);
  }
  if (key === "laborHours" || key === "qty" || key === "min") {
    return formatNumber(value, 1);
  }
  return formatNumber(value, 0);
}

export default function ReportsPage() {
  const { vehicles, trailers } = useFleet();
  const { orders } = useService();
  const { items } = useWarehouse();
  const { tires } = useTires();
  const [activeId, setActiveId] = useState<ReportId>("service");
  const [busy, setBusy] = useState<"xlsx" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const report = useMemo(
    () =>
      buildReport(activeId, {
        vehicles,
        trailers,
        orders,
        items,
        tires,
      }),
    [activeId, vehicles, trailers, orders, items, tires],
  );

  async function onExport(kind: "xlsx" | "pdf") {
    setError(null);
    setBusy(kind);
    try {
      if (kind === "xlsx") {
        await downloadExcel(report);
      } else {
        await downloadPdf(report);
      }
    } catch (e) {
      console.error("Report export failed", e);
      setError(
        e instanceof Error
          ? e.message
          : "Не удалось выгрузить отчёт. Попробуйте другой браузер.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-[var(--fg-secondary)]">
          Живые отчёты по автопарку, сервису и складу — выгрузка в Excel и PDF
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={busy !== null || report.rows.length === 0}
            onClick={() => onExport("xlsx")}
          >
            <FileSpreadsheet size={14} className="mr-1.5" />
            {busy === "xlsx" ? "Excel…" : "Скачать Excel"}
          </Button>
          <Button
            size="sm"
            disabled={busy !== null || report.rows.length === 0}
            onClick={() => onExport("pdf")}
          >
            <FileText size={14} className="mr-1.5" />
            {busy === "pdf" ? "PDF…" : "Скачать PDF"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-[10px] bg-[var(--danger-soft)] px-3 py-2 text-[12px] text-[var(--danger)]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {REPORT_DEFINITIONS.map((def) => {
          const selected = def.id === activeId;
          return (
            <button
              key={def.id}
              type="button"
              onClick={() => {
                setActiveId(def.id);
                setError(null);
              }}
              className={`rounded-[14px] border p-4 text-left transition-all duration-200 ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_0_1px_var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--bg-window)] text-[var(--accent)]">
                  <FileBarChart2 size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold">{def.title}</h3>
                  <p className="mt-1 text-[13px] text-[var(--fg-secondary)]">
                    {def.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Panel>
        <PanelHeader
          title={report.title}
          subtitle={`${report.description} · сформирован ${report.generatedAt}`}
          action={
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={busy !== null || report.rows.length === 0}
                onClick={() => onExport("xlsx")}
              >
                Excel
              </Button>
              <Button
                size="sm"
                disabled={busy !== null || report.rows.length === 0}
                onClick={() => onExport("pdf")}
              >
                PDF
              </Button>
            </div>
          }
        />

        {report.totals?.length ? (
          <div className="flex flex-wrap gap-3 px-4 pb-3">
            {report.totals.map((t) => (
              <div
                key={t.label}
                className="rounded-[12px] border border-[var(--border)] bg-[var(--bg-window)] px-3 py-2"
              >
                <p className="text-[11px] text-[var(--fg-tertiary)]">{t.label}</p>
                <p className="text-[15px] font-semibold">{t.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {report.rows.length > 0 ? (
          <DataTable headers={report.columns.map((c) => c.label)}>
            {report.rows.map((row, idx) => (
              <Tr key={`${report.id}-${idx}`}>
                {report.columns.map((col) => (
                  <Td
                    key={col.key}
                    className={
                      col.align === "right" ? "text-right tabular-nums" : undefined
                    }
                  >
                    {formatCell(col.key, row[col.key] ?? "")}
                  </Td>
                ))}
              </Tr>
            ))}
          </DataTable>
        ) : (
          <p className="px-4 pb-4 text-[13px] text-[var(--fg-secondary)]">
            Нет данных для этого отчёта. Добавьте записи в соответствующих
            разделах.
          </p>
        )}
      </Panel>
    </div>
  );
}
