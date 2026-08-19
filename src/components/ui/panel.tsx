import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--fg-primary)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] text-[var(--fg-secondary)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
