"use client";

import { cn } from "@/lib/utils";

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex rounded-[10px] bg-[var(--bg-active)] p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all duration-150",
            value === option.value
              ? "bg-[var(--bg-elevated)] text-[var(--fg-primary)] shadow-[var(--shadow-sm)]"
              : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
