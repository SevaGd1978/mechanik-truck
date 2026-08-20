import { cn } from "@/lib/utils";

export function DataTable({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-[var(--bg-elevated)] to-transparent md:hidden" />
      <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 [-webkit-overflow-scrolling:touch]">
        <table className="data-table w-full min-w-[560px] border-collapse text-left md:min-w-[720px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {headers.map((header, index) => (
                <th
                  key={header}
                  className={cn(
                    "px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--fg-tertiary)] md:px-4",
                    index === 0 &&
                      "sticky left-0 z-[1] bg-[var(--bg-elevated)] md:static",
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      <p className="px-4 pb-2 pt-1 text-[11px] text-[var(--fg-tertiary)] md:hidden">
        Листайте таблицу в сторону →
      </p>
    </div>
  );
}

export function Tr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--bg-hover)]",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-3 text-[13px] text-[var(--fg-primary)] md:px-4",
        className,
      )}
    >
      {children}
    </td>
  );
}
