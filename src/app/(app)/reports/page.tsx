import { reports } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { FileBarChart2 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-[var(--fg-secondary)]">
          Готовые шаблоны и конструктор отчётов под ваш автопарк
        </p>
        <Button size="sm">Создать отчёт</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {reports.map((report) => (
          <Panel
            key={report.id}
            className="p-4 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--accent-soft)] text-[var(--accent)]">
                <FileBarChart2 size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold">{report.title}</h3>
                <p className="mt-1 text-[13px] text-[var(--fg-secondary)]">
                  {report.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--fg-tertiary)]">
                    обновлён {report.updated}
                  </span>
                  <Button variant="secondary" size="sm">
                    Открыть
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
