import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  tone = "accent",
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "accent" | "success" | "warning" | "danger";
}) {
  const toneColor = {
    accent: "text-[var(--accent)]",
    success: "text-[var(--success)]",
    warning: "text-[var(--warning)]",
    danger: "text-[var(--danger)]",
  }[tone];

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-sm)] transition-transform duration-200 hover:-translate-y-0.5">
      <p className="text-[12px] font-medium text-[var(--fg-secondary)]">
        {label}
      </p>
      <p className="mt-2 text-[28px] font-semibold tracking-tight text-[var(--fg-primary)]">
        {value}
      </p>
      <p className={cn("mt-1 text-[12px] font-medium", toneColor)}>{delta}</p>
    </div>
  );
}
