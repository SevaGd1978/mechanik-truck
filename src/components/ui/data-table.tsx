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
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--fg-tertiary)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
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
        "px-4 py-3 text-[13px] text-[var(--fg-primary)]",
        className,
      )}
    >
      {children}
    </td>
  );
}
